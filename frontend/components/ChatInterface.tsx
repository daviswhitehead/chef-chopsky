'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RefreshCw } from 'lucide-react';
import { db, Message } from '../lib/database';
import { useToast } from '../hooks/useToast';
import { getEnvironmentTimeouts } from '../lib/timeouts';

interface ChatInterfaceProps {
  conversationId: string;
  userId: string;
  initialMessages?: Message[];
  onMessageSent?: (message: Message) => void;
}

export default function ChatInterface({ conversationId, userId, initialMessages = [], onMessageSent }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFailedMessage, setLastFailedMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showError, showSuccess, showWarning } = useToast();

  // Update messages when initialMessages prop changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (retryAttempt = 0, messageContent?: string) => {
    const content = messageContent || inputValue.trim();
    console.log('🚀 sendMessage called with:', { content, isLoading, retryAttempt, conversationId });
    
    if (!content || isLoading) {
      console.log('⏹️ sendMessage early return:', { hasContent: !!content, isLoading });
      return;
    }

    console.log('Sending message:', content);
    
    // Only clear input and set loading on first attempt
    if (retryAttempt === 0) {
      setInputValue('');
      setIsLoading(true);
      setLoadingStartTime(Date.now());
    }

    try {
      // Create user message object (not persisted yet)
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        metadata: {}
      };

      // Only add user message to UI on first attempt to avoid duplicates
      if (retryAttempt === 0) {
        setMessages(prev => [...prev, userMessage]);
        onMessageSent?.(userMessage);
      }

      // Call the API route which handles both user and assistant message persistence
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), getEnvironmentTimeouts().FRONTEND_COMPONENT);
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          userId,
          messages: [...messages, userMessage],
          retryAttempt,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if it's a retryable error (5xx server errors)
        if (response.status >= 500 && retryAttempt < 2) {
          setLastFailedMessage(userMessage);
          setRetryCount(retryAttempt + 1);
          console.log('Setting retryCount to:', retryAttempt + 1);
          showWarning(
            'Connection Issue', 
            `Retrying... (${retryAttempt + 1}/2)`
          );
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryAttempt) * 1000));
          
          // Recursively retry without changing loading state
          return sendMessage(retryAttempt + 1, content);
        }
        
        // Add error message to chat if provided (only on final attempt)
        if (errorData.errorMessage && retryAttempt >= 2) {
          const errorChatMessage: Message = {
            id: `error-${Date.now()}`,
            conversation_id: conversationId,
            role: 'assistant',
            content: errorData.errorMessage,
            timestamp: new Date().toISOString(),
            metadata: { error: true }
          };
          setMessages(prev => [...prev, errorChatMessage]);
          setLastFailedMessage(userMessage);
        }
        
        throw new Error(errorData.message || 'Failed to get AI response');
      }

      const data = await response.json();
      
      // Create assistant message object
      const assistantMessage: Message = {
        id: data.id || `assistant-${Date.now()}`,
        conversation_id: conversationId,
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString(),
        metadata: {
          model: data.model,
          usage: data.usage,
          ...data.metadata
        }
      };

      // Add assistant message to UI
      setMessages(prev => [...prev, assistantMessage]);
      onMessageSent?.(assistantMessage);
      
      // Reset retry state on success
      setRetryCount(0);
      setLastFailedMessage(null);
      // Removed success toast to reduce spam - success is indicated by the response appearing

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Set lastFailedMessage for retry functionality
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        role: 'user',
        content: content,
        timestamp: new Date().toISOString(),
        metadata: {}
      };
      setLastFailedMessage(userMessage);
      
      // Determine error type and show appropriate toast
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        showError(
          'Request Timeout', 
          'The request took too long to complete. Please try again.'
        );
      } else if (retryAttempt >= 2) {
        showError(
          'Failed to send message', 
          'Chef Chopsky is temporarily unavailable. Please try again in a few moments.'
        );
      } else {
        showError(
          'Connection Error', 
          'Unable to connect to Chef Chopsky. Please check your internet connection.'
        );
      }
      
      // Show user-friendly error message in chat (only on final attempt)
      if (retryAttempt >= 2) {
        const chatErrorMessage: Message = {
          id: `error-${Date.now()}`,
          conversation_id: conversationId,
          role: 'assistant',
          content: 'Sorry, I\'m having trouble connecting right now. This might be due to API limits or a temporary issue. Please try again later or check your OpenAI billing status.',
          timestamp: new Date().toISOString(),
          metadata: { error: true }
        };
        
        setMessages(prev => [...prev, chatErrorMessage]);
        onMessageSent?.(chatErrorMessage);
      }
    } finally {
      setIsLoading(false);
      setLoadingStartTime(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          .map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-chef-500 text-white'
                  : message.metadata?.error
                  ? 'bg-red-50 text-red-900 border border-red-200'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
                {message.metadata?.error && message.role === 'assistant' && (
                  <button
                    onClick={() => {
                      if (lastFailedMessage) {
                        const newRetryAttempt = retryCount + 1;
                        console.log('Retry button clicked:', { 
                          retryCount, 
                          newRetryAttempt, 
                          content: lastFailedMessage.content,
                          lastFailedMessageId: lastFailedMessage.id
                        });
                        sendMessage(newRetryAttempt, lastFailedMessage.content);
                      }
                    }}
                    className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-800 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-gray-600">
                  {loadingStartTime && Math.floor((Date.now() - loadingStartTime) / 1000) > 30
                    ? "Chef Chopsky is working on a complex request... This may take up to a minute."
                    : "Chef Chopsky is thinking..."}
                  {loadingStartTime && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({Math.floor((Date.now() - loadingStartTime) / 1000)}s)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Chef Chopsky about meal planning..."
            className="flex-1 input-field resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={() => {
              console.log('🔘 Send button clicked!', { inputValue: inputValue.trim(), isLoading });
              sendMessage();
            }}
            disabled={!inputValue.trim() || isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
