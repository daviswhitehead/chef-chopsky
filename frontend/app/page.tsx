'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Star, TrendingUp, Clock } from 'lucide-react';
import ConversationList from '../components/ConversationList';
import FeedbackStats from '../components/FeedbackStats';
import CreateConversation from '../components/CreateConversation';
import { db } from '../lib/database';

interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'completed' | 'archived';
  metadata?: any;
}

interface FeedbackStats {
  averageSatisfaction: number;
  totalConversations: number;
  totalFeedback: number;
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const userId = 'davis'; // Hardcoded for now, would be from auth in production

  useEffect(() => {
    fetchConversations();
    fetchStats();
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await db.getConversationsByUser(userId);
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await db.getFeedbackStats(userId);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleConversationCreated = () => {
    setShowCreateModal(false);
    fetchConversations();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Chef Chopsky Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor your AI sous chef conversations and feedback
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConversations}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageSatisfaction.toFixed(1)}/5</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Feedback Received</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFeedback}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recent Conversations</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          New Conversation
        </button>
      </div>

      {/* Conversation List */}
      {loading ? (
        <div className="card">
          <div className="flex items-center justify-center py-8">
            <Clock className="h-6 w-6 text-gray-400 animate-spin mr-2" />
            <span className="text-gray-500">Loading conversations...</span>
          </div>
        </div>
      ) : (
        <ConversationList 
          conversations={conversations} 
          onRefresh={fetchConversations}
        />
      )}

      {/* Create Conversation Modal */}
      {showCreateModal && (
        <CreateConversation
          userId={userId}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleConversationCreated}
        />
      )}
    </div>
  );
}
