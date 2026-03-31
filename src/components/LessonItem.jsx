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
      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-surface-muted/30 cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      title={error ? error : 'Mark lesson as complete'}
    >
      <div className="relative">
        <span
          className={[
            'flex h-5 w-5 items-center justify-center rounded-md border transition-colors',
            isCompleted
              ? 'bg-brand-500 border-brand-500'
              : 'border-surface-muted bg-surface',
          ].join(' ')}
        >
          {isCompleted && (
            <svg
              className="h-3 w-3 text-white"
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
            <span className="h-4 w-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-text-muted bg-surface-muted/60 px-2 py-0.5 rounded-full">
          {formattedNumber}
        </span>
        <span
          className={[
            'text-sm font-medium truncate',
            isCompleted ? 'text-text-muted line-through' : 'text-text-primary',
          ].join(' ')}
        >
          {lesson.title}
        </span>
      </div>

      {isCompleted && (
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-[11px] font-semibold text-success">
          <span className="h-3 w-3 rounded-full bg-success" />
          Completed
        </span>
      )}

      {error && (
        <span className="ml-2 text-[11px] font-medium text-danger bg-danger/10 px-2.5 py-1 rounded-full">
          {error}
        </span>
      )}
    </button>
  );
};

export default LessonItem;

