import { Client } from 'langsmith';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Types for our conversation data
export interface ConversationRun {
  id: string;
  userId?: string;
  sessionId: string;
  status: 'active' | 'completed' | 'error';
  startedAt: Date;
  completedAt?: Date;
  totalMessages: number;
  totalTokensUsed: number;
  totalCost: number;
  averageResponseTime: number;
  userSatisfactionScore?: number;
  metadata: Record<string, any>;
}

export interface ConversationMessage {
  id: string;
  conversationRunId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokenCount: number;
  responseTimeMs?: number;
  cost: number;
  metadata: Record<string, any>;
}

export interface ConversationAnalytics {
  id: string;
  conversationRunId: string;
  completionRate: number;
  userEngagementScore: number;
  conversationQualityScore: number;
  errorCount: number;
  retryCount: number;
  analyticsMetadata: Record<string, any>;
}

// Initialize clients
const langsmithClient = new Client({
  apiUrl: process.env.LANGSMITH_ENDPOINT,
  apiKey: process.env.LANGSMITH_API_KEY,
});

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export class ConversationLogger {
  private runId: string;
  private sessionId: string;
  private userId?: string;
  private startTime: number;
  private messages: ConversationMessage[] = [];
  private totalTokens = 0;
  private totalCost = 0;
  private responseTimes: number[] = [];

  constructor(sessionId: string, userId?: string) {
    this.runId = randomUUID();
    this.sessionId = sessionId;
    // Convert string user IDs to UUIDs or use null for anonymous users
    this.userId = userId && userId !== 'anonymous' ? this.generateUserId(userId) : null;
    this.startTime = Date.now();
  }

  /**
   * Generate a consistent UUID from a string user ID
   */
  private generateUserId(userId: string): string {
    // For now, we'll use null for non-UUID user IDs to avoid database errors
    // In production, you'd want to map string IDs to actual UUIDs
    return null as any;
  }

  /**
   * Find existing run or create new one
   */
  async findOrCreateRun(sessionId: string, inputs: Record<string, any>): Promise<string> {
    try {
      // Try to find existing active run for this session
      const { data: existingRun, error } = await supabaseClient
        .from('conversation_runs')
        .select('id')
        .eq('session_id', sessionId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (existingRun && !error) {
        // Use existing run
        this.runId = existingRun.id
        console.log(`Reusing existing run: ${this.runId}`)
        return this.runId
      }

      // No existing run found, create new one
      return await this.startRun(inputs)
    } catch (error) {
      console.error('Failed to find or create run:', error)
      // Fallback to creating new run
      return await this.startRun(inputs)
    }
  }

  /**
   * Start a new conversation run
   */
  async startRun(inputs: Record<string, any>): Promise<string> {
    try {
      // Log to LangSmith
      await langsmithClient.createRun({
        id: this.runId,
        name: 'chef-chopsky-conversation',
        run_type: 'llm',
        project_name: process.env.LANGSMITH_PROJECT,
        inputs: {
          ...inputs,
          session_id: this.sessionId,
          user_id: this.userId,
        },
      });

      // Log to Supabase
      const { error } = await supabaseClient
        .from('conversation_runs')
        .insert({
          id: this.runId,
          user_id: this.userId, // This will be null for non-UUID users
          session_id: this.sessionId,
          status: 'active',
          started_at: new Date().toISOString(),
          total_messages: 0,
          total_tokens_used: 0,
          total_cost: 0.0,
          average_response_time: 0.0,
          metadata: inputs,
        });

      if (error) {
        console.error('Failed to log run start to Supabase:', error);
        console.log('LangSmith logging succeeded, but Supabase failed');
        // Don't throw here - we want LangSmith to still work even if Supabase fails
      } else {
        console.log(`Successfully logged run start to Supabase: ${this.runId}`);
      }

      return this.runId;
    } catch (error) {
      console.error('Failed to start conversation run:', error);
      throw error;
    }
  }

  /**
   * Log a message (user or assistant)
   */
  async logMessage(
    role: 'user' | 'assistant' | 'system',
    content: string,
    tokenCount: number = 0,
    responseTimeMs?: number,
    cost: number = 0,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const messageId = randomUUID();
    const message: ConversationMessage = {
      id: messageId,
      conversationRunId: this.runId,
      role,
      content,
      tokenCount,
      responseTimeMs,
      cost,
      metadata,
    };

    this.messages.push(message);
    this.totalTokens += Math.round(tokenCount); // Ensure token count is an integer
    this.totalCost += cost;

    if (responseTimeMs) {
      this.responseTimes.push(responseTimeMs);
    }

    try {
      // Log to Supabase
      const { error } = await supabaseClient
        .from('conversation_messages')
        .insert({
          id: messageId,
          conversation_run_id: this.runId,
          role,
          content,
          token_count: Math.round(tokenCount), // Ensure integer
          response_time_ms: responseTimeMs,
          cost,
          metadata,
        });

      if (error) {
        console.error('Failed to log message to Supabase:', error);
      }
    } catch (error) {
      console.error('Failed to log message:', error);
    }
  }

  /**
   * Complete the conversation run
   */
  async completeRun(
    outputs: Record<string, any>,
    userSatisfactionScore?: number
  ): Promise<void> {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;
    const averageResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
      : 0;

    try {
      // Update LangSmith
      await langsmithClient.updateRun(this.runId, {
        outputs: {
          ...outputs,
          total_messages: this.messages.length,
          total_tokens: this.totalTokens,
          total_cost: this.totalCost,
          average_response_time: averageResponseTime,
          user_satisfaction_score: userSatisfactionScore,
        },
        end_time: new Date(endTime).toISOString(),
      });

      // Update Supabase
      const { error } = await supabaseClient
        .from('conversation_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          total_messages: this.messages.length,
          total_tokens_used: this.totalTokens,
          total_cost: this.totalCost,
          average_response_time: averageResponseTime,
          user_satisfaction_score: userSatisfactionScore,
          metadata: outputs,
        })
        .eq('id', this.runId);

      if (error) {
        console.error('Failed to update run completion in Supabase:', error);
      }

      // Create analytics record
      await this.createAnalytics();

    } catch (error) {
      console.error('Failed to complete conversation run:', error);
      throw error;
    }
  }

  /**
   * Log an error
   */
  async logError(error: Error, context: Record<string, any> = {}): Promise<void> {
    try {
      // Update LangSmith
      await langsmithClient.updateRun(this.runId, {
        error: error.message,
        end_time: new Date().toISOString(),
      });

      // Update Supabase
      const { error: supabaseError } = await supabaseClient
        .from('conversation_runs')
        .update({
          status: 'error',
          completed_at: new Date().toISOString(),
          metadata: {
            error: error.message,
            error_stack: error.stack,
            ...context,
          },
        })
        .eq('id', this.runId);

      if (supabaseError) {
        console.error('Failed to log error to Supabase:', supabaseError);
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  /**
   * Create analytics record
   */
  private async createAnalytics(): Promise<void> {
    try {
      const completionRate = this.messages.length > 0 ? 100 : 0;
      const userEngagementScore = this.calculateEngagementScore();
      const conversationQualityScore = this.calculateQualityScore();

      const analytics: ConversationAnalytics = {
        id: randomUUID(),
        conversationRunId: this.runId,
        completionRate,
        userEngagementScore,
        conversationQualityScore,
        errorCount: 0, // TODO: Track errors
        retryCount: 0, // TODO: Track retries
        analyticsMetadata: {
          message_count: this.messages.length,
          total_tokens: this.totalTokens,
          total_cost: this.totalCost,
        },
      };

      const { error } = await supabaseClient
        .from('conversation_analytics')
        .insert({
          id: analytics.id,
          conversation_run_id: this.runId,
          completion_rate: completionRate,
          user_engagement_score: userEngagementScore,
          conversation_quality_score: conversationQualityScore,
          error_count: analytics.errorCount,
          retry_count: analytics.retryCount,
          analytics_metadata: analytics.analyticsMetadata,
        });

      if (error) {
        console.error('Failed to create analytics record:', error);
      }
    } catch (error) {
      console.error('Failed to create analytics:', error);
    }
  }

  /**
   * Calculate user engagement score based on conversation patterns
   */
  private calculateEngagementScore(): number {
    if (this.messages.length === 0) return 0;
    
    const userMessages = this.messages.filter(m => m.role === 'user');
    const assistantMessages = this.messages.filter(m => m.role === 'assistant');
    
    // Simple engagement scoring based on message count and response times
    const messageRatio = userMessages.length / Math.max(assistantMessages.length, 1);
    const avgResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
      : 0;
    
    // Score between 0-100
    const engagementScore = Math.min(100, (messageRatio * 30) + (Math.max(0, 1000 - avgResponseTime) / 10));
    return Math.round(engagementScore * 100) / 100;
  }

  /**
   * Calculate conversation quality score
   */
  private calculateQualityScore(): number {
    if (this.messages.length === 0) return 0;
    
    // Simple quality scoring based on conversation length and token usage
    const messageCount = this.messages.length;
    const tokenEfficiency = this.totalTokens / Math.max(messageCount, 1);
    
    // Score between 0-100
    const qualityScore = Math.min(100, (messageCount * 10) + (tokenEfficiency * 2));
    return Math.round(qualityScore * 100) / 100;
  }

  /**
   * Get the current run ID
   */
  getRunId(): string {
    return this.runId;
  }

  /**
   * Get the current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}
