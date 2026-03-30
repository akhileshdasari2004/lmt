// src/components/admin/CourseList.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

const CourseList = ({ courses, onEdit, onDelete, loading }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteClick = (courseId) => {
    setDeleteConfirm(courseId);
  };

  const handleConfirmDelete = async (courseId) => {
    setDeletingId(courseId);
    const result = await onDelete(courseId);
    setDeletingId(null);
    setDeleteConfirm(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading courses...</span>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new course.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Course
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lessons
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {courses.map((course) => (
            <tr key={course.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {course.title}
                  </span>
                  {course.description && (
                    <span className="text-sm text-gray-500 truncate max-w-xs">
                      {course.description}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {course.lessonCount || 0} lessons
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {course.createdAt
                  ? new Date(course.createdAt).toLocaleDateString()
                  : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {deleteConfirm === course.id ? (
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-red-600">Delete?</span>
                    <button
                      onClick={() => handleConfirmDelete(course.id)}
                      disabled={deletingId === course.id}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      {deletingId === course.id ? '...' : 'Yes'}
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      disabled={deletingId === course.id}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      to={`/admin/courses/${course.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Manage
                    </Link>
                    <button
                      onClick={() => onEdit(course)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(course.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseList;
