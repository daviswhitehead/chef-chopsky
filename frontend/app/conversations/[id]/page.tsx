'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star } from 'lucide-react';
import { Conversation, Message } from '../../../lib/database';
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
  const [mounted, setMounted] = useState(false);

  const userId = 'davis'; // Hardcoded for now

  // Ensure we're on the client side
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return; // Don't run on server side

    const loadConversation = async () => {
      console.log('Loading conversation via API:', conversationId);

      // Add a timeout to prevent hanging
      let timeoutTriggered = false;
      const timeoutId = setTimeout(() => {
        console.log('API call timeout, creating mock conversation');
        timeoutTriggered = true;
        setLoading(false);
        setConversation({
          id: conversationId,
          user_id: 'test-user',
          title: 'Test Conversation',
          status: 'active',
          metadata: { test: true },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setMessages([]);
      }, 3000);

      try {
        const controller = new AbortController();
        const abortOnTimeout = setTimeout(() => controller.abort(), 2800);

        // Fetch conversation from internal API
        const convRes = await fetch(`/api/conversations/${conversationId}`, {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(abortOnTimeout);

        if (timeoutTriggered) {
          console.log('Timeout already triggered, ignoring API result');
          clearTimeout(timeoutId);
          return;
        }

        if (!convRes.ok) {
          console.warn('Conversation fetch failed:', convRes.status);
          clearTimeout(timeoutId);
          setConversation(null);
          setMessages([]);
          setLoading(false);
          return;
        }
        const convData: Conversation = await convRes.json();

        // Fetch messages
        const msgsRes = await fetch(`/api/conversations/${conversationId}/messages`, {
          method: 'GET'
        });
        let messagesData: Message[] = [];
        if (msgsRes.ok) {
          messagesData = await msgsRes.json();
        } else {
          console.warn('Messages fetch failed:', msgsRes.status);
        }

        clearTimeout(timeoutId);
        setConversation(convData);
        setMessages(messagesData || []);
      } catch (error) {
        console.error('Error loading conversation via API:', error);
        if (!timeoutTriggered) {
          setConversation(null);
          setMessages([]);
        }
      } finally {
        if (!timeoutTriggered) {
          setLoading(false);
        }
      }
    };

    if (conversationId) {
      loadConversation();
    }
  }, [conversationId, mounted]);

  const handleMessageSent = async (newMessage: Message) => {
    setMessages(prev => [...prev, newMessage]);
  };

  const handleConversationComplete = () => {
    setShowFeedback(true);
  };

  // Don't render anything until we're on the client side
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chef-500"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

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
          initialMessages={messages}
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
