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
  // Conversations
  async createConversation(userId: string, title: string, metadata?: any): Promise<Conversation> {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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

export const db = new DatabaseService()
