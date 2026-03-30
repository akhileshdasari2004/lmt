// src/pages/AdminDashboard.jsx
import { useState } from 'react';
import { useAdminCourses } from '../hooks/useAdminCourses';
import CourseForm from '../components/admin/CourseForm';
import CourseList from '../components/admin/CourseList';

const AdminDashboard = () => {
  const { courses, loading, error, addCourse, editCourse, removeCourse } =
    useAdminCourses();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateCourse = async (courseData) => {
    const result = await addCourse(courseData);
    if (result.success) {
      showNotification('Course created successfully!');
      setShowCreateForm(false);
    } else {
      showNotification(result.error, 'error');
    }
    return result;
  };

  const handleEditCourse = async (courseData) => {
    if (!editingCourse) return { success: false };
    const result = await editCourse(editingCourse.id, courseData);
    if (result.success) {
      showNotification('Course updated successfully!');
      setEditingCourse(null);
    } else {
      showNotification(result.error, 'error');
    }
    return result;
  };

  const handleDeleteCourse = async (courseId) => {
    const result = await removeCourse(courseId);
    if (result.success) {
      showNotification('Course deleted successfully!');
    } else {
      showNotification(result.error, 'error');
    }
    return result;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Manage courses and lessons</p>
          </div>
          <div className="flex gap-3">
            {!showCreateForm && !editingCourse && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                + New Course
              </button>
            )}
          </div>
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

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-md text-red-200">
            Error: {error}
          </div>
        )}

        {/* Create/Edit Form */}
        {(showCreateForm || editingCourse) && (
          <div className="mb-6">
            <CourseForm
              onSubmit={editingCourse ? handleEditCourse : handleCreateCourse}
              initialData={editingCourse}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingCourse(null);
              }}
            />
          </div>
        )}

        {/* Course List */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">All Courses</h2>
          <CourseList
            courses={courses}
            onEdit={setEditingCourse}
            onDelete={handleDeleteCourse}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
