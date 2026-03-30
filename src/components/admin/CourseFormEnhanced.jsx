// src/components/admin/CourseFormEnhanced.jsx
import { useState, useCallback } from 'react';

const CourseFormEnhanced = ({ onSubmit, initialData = null, onCancel = null }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [lessons, setLessons] = useState(initialData?.lessons || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lessonErrors, setLessonErrors] = useState({});

  const isEditing = !!initialData;

  // Add a new empty lesson
  const handleAddLesson = () => {
    setLessons((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, title: '', content: '', isNew: true },
    ]);
  };

  // Remove a lesson (by temp id or real id)
  const handleRemoveLesson = (lessonId) => {
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    setLessonErrors((prev) => {
      const next = { ...prev };
      delete next[lessonId];
      return next;
    });
  };

  // Update lesson field
  const handleLessonChange = (lessonId, field, value) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, [field]: value } : l))
    );
    // Clear error for this field
    if (lessonErrors[lessonId]) {
      setLessonErrors((prev) => ({ ...prev, [lessonId]: null }));
    }
  };

  // Validate form
  const validate = () => {
    const errors = {};

    if (!title.trim()) {
      errors.title = 'Course title is required';
    }

    // Validate lessons - must have title if content exists
    const lessonValidation = {};
    lessons.forEach((lesson) => {
      if (!lesson.title.trim() && lesson.content.trim()) {
        lessonValidation[lesson.id] = 'Lesson title is required if content exists';
      }
    });

    if (Object.keys(lessonValidation).length > 0) {
      errors.lessons = lessonValidation;
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLessonErrors({});

    const validationErrors = validate();
    if (validationErrors.title) {
      setError(validationErrors.title);
      return;
    }
    if (validationErrors.lessons) {
      setLessonErrors(validationErrors.lessons);
      return;
    }

    // Prepare lessons - filter out empty ones and remove temp ids
    const validLessons = lessons
      .filter((l) => l.title.trim())
      .map(({ id, isNew, ...rest }) => rest);

    setLoading(true);
    try {
      const result = await onSubmit({
        title: title.trim(),
        description: description.trim(),
        lessons: validLessons,
      });

      if (result?.success && !isEditing) {
        // Reset form on successful create
        setTitle('');
        setDescription('');
        setLessons([]);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveLesson = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === lessons.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newLessons = [...lessons];
    [newLessons[index], newLessons[newIndex]] = [newLessons[newIndex], newLessons[index]];
    setLessons(newLessons);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Course Details Section */}
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="courseTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Course Title <span className="text-red-500">*</span>
          </label>
          <input
            id="courseTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Introduction to React"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="courseDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the course..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
            disabled={loading}
          />
        </div>
      </div>

      {/* Lessons Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-900">
            Lessons ({lessons.length})
          </h4>
          <button
            type="button"
            onClick={handleAddLesson}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Lesson
          </button>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No lessons yet. Click "Add Lesson" to create your first lesson.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="bg-gray-50 rounded-lg border border-gray-200 p-4 group hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => handleMoveLesson(index, 'up')}
                      disabled={index === 0}
                      className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <span className="text-xs font-medium text-gray-400">{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleMoveLesson(index, 'down')}
                      disabled={index === lessons.length - 1}
                      className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(lesson.id, 'title', e.target.value)}
                        placeholder={`Lesson ${index + 1} title`}
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          lessonErrors[lesson.id] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        disabled={loading}
                      />
                      {lessonErrors[lesson.id] && (
                        <p className="mt-1 text-xs text-red-600">{lessonErrors[lesson.id]}</p>
                      )}
                    </div>

                    <textarea
                      value={lesson.content}
                      onChange={(e) => handleLessonChange(lesson.id, 'content', e.target.value)}
                      placeholder="Lesson content..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveLesson(lesson.id)}
                    disabled={loading}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove lesson"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isEditing ? 'Update Course' : 'Create Course'}
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default CourseFormEnhanced;
