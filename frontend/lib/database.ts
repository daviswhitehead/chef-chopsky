import { supabase, supabaseAdmin } from './supabase'
import { AxiosDatabaseService } from './axios-database'

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

// Mock database for testing
class MockDatabaseService {
  private conversations: Map<string, Conversation> = new Map()
  private messages: Map<string, Message[]> = new Map()
  private feedback: Map<string, Feedback[]> = new Map()

  async createConversation(userId: string, title: string, metadata?: any): Promise<Conversation> {
    console.log('MockDB: Creating conversation with:', { userId, title, metadata });
    // Generate a proper UUID v4
    const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    const now = new Date().toISOString()
    const conversation: Conversation = {
      id,
      user_id: userId,
      title,
      created_at: now,
      updated_at: now,
      status: 'active',
      metadata
    }
    this.conversations.set(id, conversation)
    console.log('MockDB: Created conversation:', conversation);
    return conversation
  }

  async getConversation(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) || null
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.user_id === userId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }

  async updateConversationStatus(id: string, status: Conversation['status']): Promise<void> {
    const conversation = this.conversations.get(id)
    if (conversation) {
      conversation.status = status
      conversation.updated_at = new Date().toISOString()
    }
  }

  async addMessage(conversationId: string, role: 'user' | 'assistant', content: string, metadata?: any): Promise<Message> {
    // Generate a proper UUID v4
    const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    const message: Message = {
      id,
      conversation_id: conversationId,
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata
    }
    
    const messages = this.messages.get(conversationId) || []
    messages.push(message)
    this.messages.set(conversationId, messages)
    
    return message
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return this.messages.get(conversationId) || []
  }

  async submitFeedback(conversationId: string, userId: string, satisfaction: number, feedback?: string, tags?: string[]): Promise<Feedback> {
    const id = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fb: Feedback = {
      id,
      conversation_id: conversationId,
      user_id: userId,
      satisfaction,
      feedback,
      created_at: new Date().toISOString(),
      tags
    }
    
    const feedbacks = this.feedback.get(conversationId) || []
    feedbacks.push(fb)
    this.feedback.set(conversationId, feedbacks)
    
    return fb
  }

  async getFeedbackStats(userId?: string): Promise<{
    averageSatisfaction: number
    totalConversations: number
    totalFeedback: number
  }> {
    const allFeedback = Array.from(this.feedback.values()).flat()
    const filteredFeedback = userId ? allFeedback.filter(f => f.user_id === userId) : allFeedback
    
    const totalFeedback = filteredFeedback.length
    const totalConversations = new Set(filteredFeedback.map(f => f.conversation_id)).size
    const averageSatisfaction = totalFeedback > 0 
      ? filteredFeedback.reduce((sum, f) => sum + f.satisfaction, 0) / totalFeedback 
      : 0

    return {
      averageSatisfaction,
      totalConversations,
      totalFeedback
    }
  }

  subscribeToConversation(conversationId: string, callback: (payload: any) => void) {
    // Mock subscription - just return a no-op unsubscribe function
    return {
      unsubscribe: () => {}
    }
  }
}

export class DatabaseService {
  // Conversations
  async createConversation(userId: string, title: string, metadata?: any): Promise<Conversation> {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert({
        user_id: userId,
        title,
        metadata
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async updateConversationStatus(id: string, status: Conversation['status']): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({ status })
      .eq('id', id)

    if (error) throw error
  }

  // Messages
  async addMessage(conversationId: string, role: 'user' | 'assistant', content: string, metadata?: any): Promise<Message> {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        metadata
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Feedback
  async submitFeedback(conversationId: string, userId: string, satisfaction: number, feedback?: string, tags?: string[]): Promise<Feedback> {
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        satisfaction,
        feedback,
        tags
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getFeedbackStats(userId?: string): Promise<{
    averageSatisfaction: number
    totalConversations: number
    totalFeedback: number
  }> {
    let query = supabase
      .from('feedback')
      .select('satisfaction, conversation_id')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error

    const feedbacks = data || []
    const totalFeedback = feedbacks.length
    const totalConversations = new Set(feedbacks.map(f => f.conversation_id)).size
    const averageSatisfaction = totalFeedback > 0 
      ? feedbacks.reduce((sum, f) => sum + f.satisfaction, 0) / totalFeedback 
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
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, 
        callback
      )
      .subscribe()
  }
}

// Use mock database for testing when Supabase is not properly configured
// Temporarily force mock database due to network connectivity issues
const isTestMode = false; // Use real Supabase database

console.log('Database: Using mock database for testing (isTestMode =', isTestMode, ')');

// Use global variable to persist mock database across requests
declare global {
  var __mockDb: MockDatabaseService | undefined;
}

export const db = (() => {
  if (isTestMode) {
    if (!global.__mockDb) {
      global.__mockDb = new MockDatabaseService();
    }
    return global.__mockDb;
  }
  return new AxiosDatabaseService();
})()
