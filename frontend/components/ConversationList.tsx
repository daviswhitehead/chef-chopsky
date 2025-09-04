'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, Clock, CheckCircle, Archive, Eye, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'completed' | 'archived';
  metadata?: any;
}

interface ConversationListProps {
  conversations: Conversation[];
  onRefresh: () => void;
}

const statusConfig = {
  active: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  archived: { icon: Archive, color: 'text-gray-600', bg: 'bg-gray-100' },
};

export default function ConversationList({ conversations, onRefresh }: ConversationListProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  if (conversations.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-500 mb-4">
            Start your first conversation with Chef Chopsky to get meal planning help.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {conversations.map((conversation) => {
          const status = statusConfig[conversation.status];
          const StatusIcon = status.icon;

          return (
            <div key={conversation.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${status.bg}`}>
                    <StatusIcon className={`h-5 w-5 ${status.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{conversation.title}</h4>
                    <p className="text-sm text-gray-500">
                      Updated {format(new Date(conversation.updated_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    href={`/conversations/${conversation.id}`}
                    className="btn-secondary flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </div>
              </div>

              {conversation.metadata && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
