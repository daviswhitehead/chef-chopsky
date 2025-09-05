'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star } from 'lucide-react';
import { db, Conversation, Message } from '../../../lib/database';
import ChatInterface from '../../../components/ChatInterface';
import FeedbackForm from '../../../components/FeedbackForm';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

  const userId = 'davis'; // Hardcoded for now

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const [convData, messagesData] = await Promise.all([
          db.getConversation(conversationId),
          db.getMessagesByConversation(conversationId)
        ]);
        
        setConversation(convData);
        setMessages(messagesData);
      } catch (error) {
        console.error('Error loading conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      loadConversation();
    }
  }, [conversationId]);

  const handleMessageSent = async (newMessage: Message) => {
    setMessages(prev => [...prev, newMessage]);
  };

  const handleConversationComplete = async () => {
    try {
      // Update conversation status to completed in database
      await db.updateConversationStatus(conversationId, 'completed');
      
      // Update local state
      setConversation(prev => prev ? { ...prev, status: 'completed' } : null);
      
      // Show feedback form
      setShowFeedback(true);
    } catch (error) {
      console.error('Error completing conversation:', error);
      alert('Failed to complete conversation. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chef-500"></div>
          <span className="ml-2 text-gray-600">Loading conversation...</span>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Conversation not found</h2>
          <p className="text-gray-600 mb-4">The conversation you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="btn-secondary flex items-center mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{conversation.title}</h1>
            <p className="text-gray-600">
              Created {new Date(conversation.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              conversation.status === 'active' ? 'bg-blue-100 text-blue-800' :
              conversation.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {conversation.status}
            </span>
            
            {conversation.status === 'active' && (
              <button
                onClick={handleConversationComplete}
                className="btn-primary flex items-center"
              >
                <Star className="h-4 w-4 mr-2" />
                Complete
              </button>
            )}
          </div>
        </div>

        {/* Metadata */}
        {conversation.metadata && (
          <div className="mt-4 flex flex-wrap gap-2">
            {conversation.metadata.csaBox && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                CSA: {conversation.metadata.csaBox.length} items
              </span>
            )}
            {conversation.metadata.mealCount && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {conversation.metadata.mealCount} meals
              </span>
            )}
            {conversation.metadata.prepTime && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {conversation.metadata.prepTime}min prep
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <div className="card h-[600px]">
        <ChatInterface 
          conversationId={conversationId}
          userId={userId}
          onMessageSent={handleMessageSent}
        />
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackForm
          conversationId={conversationId}
          userId={userId}
          onClose={() => setShowFeedback(false)}
          onSubmit={() => {
            setShowFeedback(false);
            router.push('/');
          }}
        />
      )}
    </div>
  );
}
