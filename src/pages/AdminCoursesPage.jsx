import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import { getAllCoursesAdmin, deleteCourse } from '../services/adminCourseService';

/**
 * Admin Courses Page
 * Comprehensive course management with CRUD operations
 */
const AdminCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllCoursesAdmin();
        setCourses(data);
        setFilteredCourses(data);
        console.log('Courses loaded:', data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);;

  // Handle search
  useEffect(() => {
    const filtered = courses.filter(
      (course) =>
        (course.title || course.courseName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      setLoading(true);
      await deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      showNotification('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      showNotification('Error deleting course', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <AdminSidebar />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Courses</h1>
              <p className="text-gray-400 mt-2">Manage all courses and content</p>
            </div>
            <button
              onClick={() => navigate('/admin/courses/new')}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
            >
              + New Course
            </button>
          </div>

          {/* Notification */}
          {notification && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                notification.type === 'error'
                  ? 'bg-red-900 bg-opacity-50 border border-red-700 text-red-200'
                  : 'bg-green-900 bg-opacity-50 border border-green-700 text-green-200'
              }`}
            >
              {notification.message}
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search courses by name, instructor, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-red-600 outline-none transition"
            />
          </div>

          {/* Courses Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-300 font-semibold">Course Name</th>
                      <th className="px-6 py-3 text-left text-gray-300 font-semibold">Instructor</th>
                      <th className="px-6 py-3 text-left text-gray-300 font-semibold">Category</th>
                      <th className="px-6 py-3 text-left text-gray-300 font-semibold">Lectures</th>
                      <th className="px-6 py-3 text-left text-gray-300 font-semibold">Price</th>
                      <th className="px-6 py-3 text-left text-gray-300 font-semibold">Enrolled</th>
                      <th className="px-6 py-3 text-left text-gray-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredCourses.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                          No courses found
                        </td>
                      </tr>
                    ) : (
                      filteredCourses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-700 transition">
                          <td className="px-6 py-4 text-white font-medium">{course.title || course.courseName || 'Untitled'}</td>
                          <td className="px-6 py-4 text-gray-300">{course.instructor || 'N/A'}</td>
                          <td className="px-6 py-4 text-gray-300">{course.category || 'N/A'}</td>
                          <td className="px-6 py-4 text-gray-300">{course.lessonCount || course.totalLectures || 0}</td>
                          <td className="px-6 py-4 text-white">
                            {course.pricingType === 'free' || !course.pricingType ? (
                              <span className="text-green-400">Free</span>
                            ) : (
                              `$${parseFloat(course.price || 0).toFixed(2)}`
                            )}
                          </td>
                          <td className="px-6 py-4 text-white">{course.totalEnrolled || 0}</td>
                          <td className="px-6 py-4 space-x-2 flex flex-wrap gap-2">
                            <button
                              onClick={() => navigate(`/admin/courses/${course.id}`)}
                              className="text-green-400 hover:text-green-300 text-sm font-medium transition"
                              title="Manage lessons and content for this course"
                            >
                              Manage
                            </button>
                            <button
                              onClick={() => navigate(`/admin/courses/edit/${course.id}`, { state: { course } })}
                              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="text-red-400 hover:text-red-300 text-sm font-medium transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;
