// src/components/admin/LessonForm.jsx
import { useState } from 'react';

const LessonForm = ({ onSubmit, onCancel, initialData = null, lessonCount = 0 }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Lesson title is required');
      return;
    }

    setLoading(true);
    const result = await onSubmit({
      title: title.trim(),
      content: content.trim(),
      order: initialData?.order ?? lessonCount,
    });
    setLoading(false);

    if (result?.success && !initialData) {
      // Clear form for new lesson
      setTitle('');
      setContent('');
    } else if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 className="text-md font-medium text-gray-900 mb-4">
        {initialData ? 'Edit Lesson' : 'Add New Lesson'}
      </h4>

      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lesson Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Introduction to Components"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Lesson content, description, or notes..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {loading
            ? 'Saving...'
            : initialData
            ? 'Update Lesson'
            : 'Add Lesson'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="py-2 px-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default LessonForm;
