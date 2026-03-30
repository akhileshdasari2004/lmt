// src/components/admin/LessonList.jsx
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const LessonList = ({
  lessons,
  onEdit,
  onDelete,
  onReorder,
  loading,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result) => {
    setIsDragging(false);
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    // Reorder lessons
    const reorderedLessons = Array.from(lessons);
    const [movedLesson] = reorderedLessons.splice(sourceIndex, 1);
    reorderedLessons.splice(destinationIndex, 0, movedLesson);

    // Get new order IDs
    const orderedIds = reorderedLessons.map((l) => l.id);
    onReorder(orderedIds);
  };

  const handleEditClick = (lesson) => {
    setEditingId(lesson.id);
  };

  const handleEditSubmit = async (lessonId, updatedData) => {
    const result = await onEdit(lessonId, updatedData);
    if (result?.success) {
      setEditingId(null);
    }
    return result;
  };

  const handleDeleteClick = (lessonId) => {
    setDeleteConfirm(lessonId);
  };

  const handleConfirmDelete = async (lessonId) => {
    await onDelete(lessonId);
    setDeleteConfirm(null);
  };

  if (lessons.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
        <p className="text-gray-500">No lessons yet. Add your first lesson above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">
          {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
        </h4>
        <p className="text-xs text-gray-500">Drag to reorder</p>
      </div>

      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Droppable droppableId="lessons">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-2 ${isDragging ? 'opacity-80' : ''}`}
            >
              {lessons.map((lesson, index) => (
                <Draggable
                  key={lesson.id}
                  draggableId={lesson.id}
                  index={index}
                  isDragDisabled={editingId === lesson.id}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`bg-white rounded-lg border transition-shadow ${
                        snapshot.isDragging
                          ? 'border-blue-400 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={provided.draggableProps.style}
                    >
                      {editingId === lesson.id ? (
                        // Edit Mode
                        <div className="p-4">
                          <LessonEditForm
                            lesson={lesson}
                            onSubmit={handleEditSubmit}
                            onCancel={() => setEditingId(null)}
                          />
                        </div>
                      ) : (
                        // View Mode
                        <div className="p-4 flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <svg
                                className="w-4 h-4 text-gray-400 cursor-grab"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 8h16M4 16h16"
                                />
                              </svg>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-400">
                                  #{index + 1}
                                </span>
                                <h5 className="text-sm font-medium text-gray-900">
                                  {lesson.title}
                                </h5>
                              </div>                              {lesson.content && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {lesson.content}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-2">
                            {deleteConfirm === lesson.id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-red-600">Delete?</span>
                                <button
                                  onClick={() => handleConfirmDelete(lesson.id)}
                                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditClick(lesson)}
                                  className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(lesson.id)}
                                  className="text-xs text-red-600 hover:text-red-800 px-2 py-1"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

// Inline edit form component
const LessonEditForm = ({ lesson, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(lesson.title || '');
  const [content, setContent] = useState(lesson.content || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    const result = await onSubmit(lesson.id, {
      title: title.trim(),
      content: content.trim(),
    });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lesson title"
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          disabled={saving}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Lesson content"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none"
          disabled={saving}
        />
      </div>
      <div className="flex gap-2 mt-3">
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="py-1 px-3 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="py-1 px-3 border border-gray-300 text-gray-700 rounded text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default LessonList;
