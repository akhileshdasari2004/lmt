// src/pages/CourseManage.jsx
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAdminCourse } from '../hooks/useAdminCourses';
import { useAdminLessons } from '../hooks/useAdminLessons';
import CourseForm from '../components/admin/CourseForm';
import LessonForm from '../components/admin/LessonForm';
import LessonList from '../components/admin/LessonList';

const CourseManage = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'lessons'
  const [notification, setNotification] = useState(null);

  const {
    course,
    loading: courseLoading,
    refreshCourse,
  } = useAdminCourse(courseId);

  const {
    lessons,
    loading: lessonsLoading,
    addLesson,
    editLesson,
    removeLesson,
    reorder,
  } = useAdminLessons(courseId);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateCourse = async (courseData) => {
    // Use the service directly or implement in hook
    const { updateCourse } = await import('../services/adminCourseService');
    try {
      await updateCourse(courseId, courseData);
      await refreshCourse();
      showNotification('Course updated successfully!');
      return { success: true };
    } catch (err) {
      showNotification(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const handleAddLesson = async (lessonData) => {
    const result = await addLesson(lessonData);
    if (result.success) {
      showNotification('Lesson added successfully!');
    } else {
      showNotification(result.error, 'error');
    }
    return result;
  };

  const handleEditLesson = async (lessonId, updates) => {
    const result = await editLesson(lessonId, updates);
    if (result.success) {
      showNotification('Lesson updated successfully!');
    } else {
      showNotification(result.error, 'error');
    }
    return result;
  };

  const handleDeleteLesson = async (lessonId) => {
    const result = await removeLesson(lessonId);
    if (result.success) {
      showNotification('Lesson deleted successfully!');
    } else {
      showNotification(result.error, 'error');
    }
    return result;
  };

  const handleReorder = async (orderedIds) => {
    const result = await reorder(orderedIds);
    if (!result.success) {
      showNotification(result.error, 'error');
    }
    return result;
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">Course not found</h2>
          <Link
            to="/admin"
            className="mt-4 text-red-400 hover:text-red-300"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin"
            className="text-sm text-gray-400 hover:text-gray-200 mb-2 inline-flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white mt-2">{course.title}</h1>
          {course.description && (
            <p className="text-gray-400 mt-1">{course.description}</p>
          )}
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-4 p-4 rounded-md ${
              notification.type === 'error'
                ? 'bg-red-900 bg-opacity-50 border border-red-700 text-red-200'
                : 'bg-green-900 bg-opacity-50 border border-green-700 text-green-200'
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg shadow-lg mb-6 border border-gray-700">
          <div className="border-b border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Course Details
              </button>
              <button
                onClick={() => setActiveTab('lessons')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'lessons'
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Lessons ({lessons.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'details' ? (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Edit Course Details
                </h3>
                <CourseForm
                  onSubmit={handleUpdateCourse}
                  initialData={course}
                />
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Add New Lesson
                  </h3>
                  <LessonForm
                    onSubmit={handleAddLesson}
                    lessonCount={lessons.length}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-4">
                    Course Lessons
                  </h3>
                  <LessonList
                    lessons={lessons}
                    onEdit={handleEditLesson}
                    onDelete={handleDeleteLesson}
                    onReorder={handleReorder}
                    loading={lessonsLoading}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManage;
