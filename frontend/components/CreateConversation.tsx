'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { db } from '../lib/database';

interface CreateConversationProps {
  userId: string;
  onClose: () => void;
  onCreated: (conversationId: string) => void;
}

export default function CreateConversation({ userId, onClose, onCreated }: CreateConversationProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState({
    csaBox: [] as string[],
    dietaryPreferences: [] as string[],
    mealCount: 10,
    prepTime: 120,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    console.log('Submitting conversation form:', { userId, title: title.trim(), metadata });
    setLoading(true);
    try {
      const result = await db.createConversation(userId, title.trim(), metadata);
      console.log('Conversation created successfully:', result);
      onCreated(result.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert(`Failed to create conversation: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const addCsaItem = () => {
    const item = prompt('Enter CSA item:');
    if (item) {
      setMetadata(prev => ({
        ...prev,
        csaBox: [...prev.csaBox, item],
      }));
    }
  };

  const removeCsaItem = (index: number) => {
    setMetadata(prev => ({
      ...prev,
      csaBox: prev.csaBox.filter((_, i) => i !== index),
    }));
  };

  const addDietaryPreference = () => {
    const preference = prompt('Enter dietary preference:');
    if (preference) {
      setMetadata(prev => ({
        ...prev,
        dietaryPreferences: [...prev.dietaryPreferences, preference],
      }));
    }
  };

  const removeDietaryPreference = (index: number) => {
    setMetadata(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Start New Conversation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Conversation Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekly CSA Meal Planning"
              className="input-field"
              data-testid="conversation-title-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSA Box Items
            </label>
            <div className="space-y-2">
              {metadata.csaBox.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeCsaItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCsaItem}
                className="btn-secondary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add CSA Item
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Preferences
            </label>
            <div className="space-y-2">
              {metadata.dietaryPreferences.map((preference, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm">{preference}</span>
                  <button
                    type="button"
                    onClick={() => removeDietaryPreference(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addDietaryPreference}
                className="btn-secondary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Preference
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="mealCount" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Meals
              </label>
              <input
                type="number"
                id="mealCount"
                value={metadata.mealCount}
                onChange={(e) => setMetadata(prev => ({ ...prev, mealCount: parseInt(e.target.value) || 0 }))}
                min="1"
                max="20"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700 mb-2">
                Prep Time (minutes)
              </label>
              <input
                type="number"
                id="prepTime"
                value={metadata.prepTime}
                onChange={(e) => setMetadata(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
                min="30"
                max="300"
                className="input-field"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="start-conversation-button"
            >
              {loading ? 'Creating...' : 'Start Conversation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
