import { supabase } from './supabase'

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  status: 'active' | 'completed' | 'archived'
  metadata?: any
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: any
}

export interface Feedback {
  id: string
  conversation_id: string
  user_id: string
  satisfaction: number
  feedback?: string
  created_at: string
  tags?: string[]
}

export class DatabaseService {
  // Conversations (now using conversation_runs)
  async createConversation(userId: string, title: string, metadata?: any): Promise<Conversation> {
    console.log('Creating conversation:', { userId, title, metadata });
    
    const { data, error } = await supabase
      .from('conversation_runs')
      .insert({
        user_id: null, // Convert to null for non-UUID users
        session_id: crypto.randomUUID(),
        status: 'active',
        metadata: {
          title,
          original_user_id: userId,
          frontend_metadata: metadata
        }
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
    
    console.log('Conversation created successfully:', data);
    
    // Transform to match the expected Conversation interface
    return {
      id: data.id,
      user_id: userId,
      title: title,
      created_at: data.created_at,
      updated_at: data.updated_at,
      status: data.status as 'active' | 'completed' | 'archived',
      metadata: metadata
    }
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversation_runs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    
    if (!data) return null
    
    // Transform to match the expected Conversation interface
    return {
      id: data.id,
      user_id: data.metadata?.original_user_id || 'anonymous',
      title: data.metadata?.title || 'Untitled Conversation',
      created_at: data.created_at,
      updated_at: data.updated_at,
      status: data.status as 'active' | 'completed' | 'archived',
      metadata: data.metadata?.frontend_metadata || {}
    }
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversation_runs')
      .select('*')
      .or(`metadata->original_user_id.eq.${userId},user_id.is.null`)
      .order('updated_at', { ascending: false })

    if (error) throw error
    
    // Transform to match the expected Conversation interface
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.metadata?.original_user_id || 'anonymous',
      title: item.metadata?.title || 'Untitled Conversation',
      created_at: item.created_at,
      updated_at: item.updated_at,
      status: item.status as 'active' | 'completed' | 'archived',
      metadata: item.metadata?.frontend_metadata || {}
    }))
  }

  async updateConversationStatus(id: string, status: Conversation['status']): Promise<void> {
    const { error } = await supabase
      .from('conversation_runs')
      .update({ 
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', id)

    if (error) throw error
  }

  // Messages (now using conversation_messages)
  async addMessage(conversationId: string, role: 'user' | 'assistant', content: string, metadata?: any): Promise<Message> {
    const { data, error } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_run_id: conversationId,
        role,
        content,
        token_count: Math.round(content.length / 4), // Rough estimate
        response_time_ms: role === 'assistant' ? 1000 : null, // Default estimate
        cost: 0.0,
        metadata: {
          frontend_metadata: metadata
        }
      })
      .select()
      .single()

    if (error) throw error
    
    // Transform to match the expected Message interface
    return {
      id: data.id,
      conversation_id: conversationId,
      role: data.role as 'user' | 'assistant',
      content: data.content,
      timestamp: data.created_at,
      metadata: data.metadata?.frontend_metadata || {}
    }
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_run_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    
    // Transform to match the expected Message interface
    return (data || []).map(item => ({
      id: item.id,
      conversation_id: conversationId,
      role: item.role as 'user' | 'assistant',
      content: item.content,
      timestamp: item.created_at,
      metadata: item.metadata?.frontend_metadata || {}
    }))
  }

  // Feedback (now using conversation_analytics)
  async submitFeedback(conversationId: string, userId: string, satisfaction: number, feedback?: string, tags?: string[]): Promise<Feedback> {
    // Update the conversation_analytics record with user satisfaction
    const { data, error } = await supabase
      .from('conversation_analytics')
      .upsert({
        conversation_run_id: conversationId,
        user_engagement_score: satisfaction * 20, // Convert 1-5 to 0-100 scale
        analytics_metadata: {
          user_feedback: feedback,
          user_tags: tags,
          feedback_submitted_at: new Date().toISOString(),
          original_user_id: userId
        }
      })
      .select()
      .single()

    if (error) throw error
    
    // Also update the conversation_runs table with satisfaction score
    await supabase
      .from('conversation_runs')
      .update({ user_satisfaction_score: satisfaction })
      .eq('id', conversationId)
    
    // Return in the expected Feedback format
    return {
      id: data.id,
      conversation_id: conversationId,
      user_id: userId,
      satisfaction: satisfaction,
      feedback: feedback,
      tags: tags,
      created_at: data.created_at
    }
  }

  async getFeedbackStats(userId?: string): Promise<{
    averageSatisfaction: number
    totalConversations: number
    totalFeedback: number
  }> {
    // Get stats from conversation_runs and conversation_analytics
    let query = supabase
      .from('conversation_runs')
      .select('id, user_satisfaction_score, metadata')

    if (userId) {
      query = query.or(`metadata->original_user_id.eq.${userId},user_id.is.null`)
    }

    const { data, error } = await query

    if (error) throw error

    const conversations = data || []
    const conversationsWithFeedback = conversations.filter(c => c.user_satisfaction_score !== null)
    
    const totalConversations = conversations.length
    const totalFeedback = conversationsWithFeedback.length
    const averageSatisfaction = totalFeedback > 0 
      ? conversationsWithFeedback.reduce((sum, c) => sum + (c.user_satisfaction_score || 0), 0) / totalFeedback 
      : 0

    return {
      averageSatisfaction,
      totalConversations,
      totalFeedback
    }
  }

  // Real-time subscriptions
  subscribeToConversation(conversationId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'conversation_messages',
          filter: `conversation_run_id=eq.${conversationId}`
        }, 
        callback
      )
      .subscribe()
  }
}

export const db = new DatabaseService()
