'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { db, Message } from '../lib/database';
import { ai } from '../lib/ai';

interface ChatInterfaceProps {
  conversationId: string;
  userId: string;
  onMessageSent?: (message: Message) => void;
}

export default function ChatInterface({ conversationId, userId, onMessageSent }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const existingMessages = await db.getMessagesByConversation(conversationId);
        setMessages(existingMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    loadMessages();
  }, [conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const content = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      // Add user message to database
      const userMessage = await db.addMessage(conversationId, 'user', content);
      setMessages(prev => [...prev, userMessage]);
      onMessageSent?.(userMessage);

      // Generate AI response
      const aiResponse = await ai.generateResponse([...messages, userMessage], userId, conversationId);
      
      // Add AI message to database
      const assistantMessage = await db.addMessage(
        conversationId, 
        'assistant', 
        aiResponse.content, 
        aiResponse.metadata
      );
      
      setMessages(prev => [...prev, assistantMessage]);
      onMessageSent?.(assistantMessage);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show user-friendly error message
      const errorMessage = await db.addMessage(
        conversationId, 
        'assistant', 
        'Sorry, I\'m having trouble connecting right now. This might be due to API limits or a temporary issue. Please try again later or check your OpenAI billing status.',
        { error: true }
      );
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-chef-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-gray-600">Chef Chopsky is thinking...</span>
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
            data-testid="message-input"
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="send-button"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
