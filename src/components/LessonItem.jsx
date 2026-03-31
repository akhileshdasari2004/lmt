import { useState } from 'react';

const LessonItem = ({ lesson, isCompleted, onToggle }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleToggle = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Toggling lesson: ${lesson.id}`);
      await onToggle(lesson.id);
      console.log(`Successfully toggled lesson: ${lesson.id}`);
    } catch (err) {
      console.error(`Error toggling lesson ${lesson.id}:`, err);
      setError(err.message || 'Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const lessonNumber = (lesson.order ?? 0) + 1;
  const formattedNumber = lessonNumber.toString().padStart(2, '0');

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 cursor-pointer w-full disabled:opacity-70 disabled:cursor-not-allowed ${
        isCompleted
          ? 'bg-violet-50 border-violet-200'
          : 'bg-white border-violet-100 hover:border-violet-200'
      }`}
      title={error ? error : 'Mark lesson as complete'}
    >
      <div className="relative">
        <span
          className={[
            'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
            isCompleted
              ? 'bg-violet-600 border-violet-600'
              : 'border-violet-200',
          ].join(' ')}
        >
          {isCompleted && (
            <svg
              className="w-3 h-3 text-white"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 8.5L6.5 12L13 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="h-4 w-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-xs text-violet-300 bg-violet-50 px-2 py-0.5 rounded-md">
          {formattedNumber}
        </span>
        <span
          className={[
            'text-sm flex-1 truncate',
            isCompleted ? 'text-violet-400 line-through' : 'text-violet-800',
          ].join(' ')}
        >
          {lesson.title}
        </span>
      </div>

      {isCompleted && (
        <span className="s-badge-approved">
          Done
        </span>
      )}

      {error && (
        <span className="ml-2 text-[11px] font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
          {error}
        </span>
      )}
    </button>
  );
};

export default LessonItem;

