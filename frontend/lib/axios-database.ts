import axios from 'axios';
import https from 'https';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || supabasePublishableKey;

// Create axios instance with SSL verification disabled for development
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

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

export class AxiosDatabaseService {
  private getHeaders() {
    return {
      'apikey': supabaseSecretKey,
      'Authorization': `Bearer ${supabaseSecretKey}`,
      'Content-Type': 'application/json'
    };
  }

  async createConversation(userId: string, title: string, metadata?: any): Promise<Conversation> {
    const response = await axiosInstance.post(
      `${supabaseUrl}/rest/v1/conversations`,
      {
        user_id: userId,
        title,
        metadata
      },
      { 
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=representation'
        }
      }
    );
    
    console.log('📊 Supabase create response:', response.data);
    
    // Supabase returns an array, so we need to get the first element
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0];
    }
    
    // If it's not an array, return the data directly
    return response.data;
  }

  async getConversation(id: string): Promise<Conversation | null> {
    try {
      const response = await axiosInstance.get(
        `${supabaseUrl}/rest/v1/conversations?id=eq.${id}&select=*`,
        { headers: this.getHeaders() }
      );
      
      if (response.data && response.data.length > 0) {
        return response.data[0];
      }
      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    const response = await axiosInstance.get(
      `${supabaseUrl}/rest/v1/conversations?user_id=eq.${userId}&select=*&order=updated_at.desc`,
      { headers: this.getHeaders() }
    );
    return response.data || [];
  }

  async updateConversationStatus(id: string, status: Conversation['status']): Promise<void> {
    await axiosInstance.patch(
      `${supabaseUrl}/rest/v1/conversations?id=eq.${id}`,
      { status },
      { headers: this.getHeaders() }
    );
  }

  async addMessage(conversationId: string, role: 'user' | 'assistant', content: string, metadata?: any): Promise<Message> {
    const response = await axiosInstance.post(
      `${supabaseUrl}/rest/v1/messages`,
      {
        conversation_id: conversationId,
        role,
        content,
        metadata
      },
      { 
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=representation'
        }
      }
    );
    
    console.log('📊 Supabase addMessage response:', response.data);
    
    // Supabase returns an array, so we need to get the first element
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0];
    }
    
    // If it's not an array, return the data directly
    return response.data;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    const response = await axiosInstance.get(
      `${supabaseUrl}/rest/v1/messages?conversation_id=eq.${conversationId}&select=*&order=timestamp.asc`,
      { headers: this.getHeaders() }
    );
    return response.data || [];
  }

  async createFeedback(conversationId: string, userId: string, satisfaction: number, feedback?: string, tags?: string[]): Promise<Feedback> {
    const response = await axiosInstance.post(
      `${supabaseUrl}/rest/v1/feedback`,
      {
        conversation_id: conversationId,
        user_id: userId,
        satisfaction,
        feedback,
        tags
      },
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // Alias for addFeedback to match test expectations
  async addFeedback(conversationId: string, userId: string, satisfaction: number, feedback?: string, tags?: string[]): Promise<Feedback> {
    return this.createFeedback(conversationId, userId, satisfaction, feedback, tags);
  }

  async submitFeedback(conversationId: string, userId: string, satisfaction: number, feedback?: string, tags?: string[]): Promise<Feedback> {
    return this.createFeedback(conversationId, userId, satisfaction, feedback, tags);
  }

  async getFeedbackByConversation(conversationId: string): Promise<Feedback[]> {
    const response = await axiosInstance.get(
      `${supabaseUrl}/rest/v1/feedback?conversation_id=eq.${conversationId}&select=*`,
      { headers: this.getHeaders() }
    );
    return response.data || [];
  }

  async getFeedbackStats(userId?: string): Promise<{
    averageSatisfaction: number
    totalConversations: number
    totalFeedback: number
  }> {
    let query = `${supabaseUrl}/rest/v1/feedback?select=satisfaction,conversation_id`;
    
    if (userId) {
      query += `&user_id=eq.${userId}`;
    }

    const response = await axiosInstance.get(query, { headers: this.getHeaders() });
    const feedback = response.data || [];
    
    const totalFeedback = feedback.length;
    const totalConversations = new Set(feedback.map((f: any) => f.conversation_id)).size;
    const averageSatisfaction = totalFeedback > 0 
      ? feedback.reduce((sum: number, f: any) => sum + f.satisfaction, 0) / totalFeedback 
      : 0;

    return {
      averageSatisfaction,
      totalConversations,
      totalFeedback
    };
  }
}

export const db = new AxiosDatabaseService();
