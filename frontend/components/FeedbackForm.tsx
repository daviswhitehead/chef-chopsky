'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { db } from '../lib/database';

interface FeedbackFormProps {
  conversationId: string;
  userId: string;
  onClose: () => void;
  onSubmit: () => void;
}

export default function FeedbackForm({ conversationId, userId, onClose, onSubmit }: FeedbackFormProps) {
  const [satisfaction, setSatisfaction] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const availableTags = [
    'recipe_quality',
    'response_time', 
    'helpfulness',
    'meal_variety',
    'prep_efficiency',
    'nutritional_balance'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (satisfaction === 0) return;

    setLoading(true);
    try {
      await db.submitFeedback(conversationId, userId, satisfaction, feedback, tags);
      onSubmit();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Rate Your Experience</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Satisfaction Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How satisfied were you with this conversation?
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setSatisfaction(rating)}
                  className={`p-2 rounded-lg transition-colors ${
                    satisfaction >= rating
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                >
                  <Star className="h-8 w-8 fill-current" />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {satisfaction === 0 && 'Click a star to rate'}
              {satisfaction === 1 && 'Poor - Not helpful at all'}
              {satisfaction === 2 && 'Fair - Somewhat helpful'}
              {satisfaction === 3 && 'Good - Generally helpful'}
              {satisfaction === 4 && 'Very Good - Very helpful'}
              {satisfaction === 5 && 'Excellent - Extremely helpful'}
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What aspects were most important? (optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tags.includes(tag)
                      ? 'bg-chef-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
              Additional comments (optional)
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What went well? What could be improved?"
              className="input-field resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
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
              disabled={satisfaction === 0 || loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
