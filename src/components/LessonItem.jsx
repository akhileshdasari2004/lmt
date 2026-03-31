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

  return (
    <>
      <div className="lesson-item">
        <div className="lesson-item-checkbox-wrapper">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={handleToggle}
            disabled={loading}
            className="lesson-item-checkbox"
            title={error ? error : 'Mark lesson as complete'}
          />
          {loading && (
            <div className="lesson-item-loading-spinner">
              <div className="lesson-item-spinner"></div>
            </div>
          )}
        </div>

        <span
          className={`lesson-item-title ${
            isCompleted ? 'lesson-item-title-completed' : ''
          }`}
        >
          {lesson.title}
        </span>

        {isCompleted && (
          <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
            Completed
          </span>
        )}

        {error && (
          <span className="text-xs font-medium text-red-600 ml-2 bg-red-100 px-2 py-1 rounded">
            {error}
          </span>
        )}
      </div>
    </>
  );
};

export default LessonItem;

