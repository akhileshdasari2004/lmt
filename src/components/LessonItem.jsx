import { useState } from 'react';

const LessonItem = ({ lesson, isCompleted, onToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggle(lesson.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="relative">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleToggle}
          disabled={loading}
          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:opacity-50"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <span
        className={`flex-1 ${
          isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
        }`}
      >
        {lesson.title}
      </span>

      {isCompleted && (
        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
          Completed
        </span>
      )}
    </div>
  );
};

export default LessonItem;
