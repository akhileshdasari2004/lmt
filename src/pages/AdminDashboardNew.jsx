import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import StatsCard from '../components/admin/StatsCard';
import CourseAnalyticsTable from '../components/admin/CourseAnalyticsTable';
import { getAllCoursesAdmin } from '../services/adminCourseService';
import { getAllEnrollments } from '../services/adminService';
import {
  approveStudent,
  assignSubjectToStudent,
  getAllPendingRequests,
  setLessonRequestStatus,
} from '../services/firestoreService';
import { Link } from 'react-router-dom';

/**
 * Admin Dashboard Page
 * Performance dashboard with stats and course analytics
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    enrollmentsLast7Days: 0,
  });
  const [courses, setCourses] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingRequestId, setProcessingRequestId] = useState('');

  useEffect(() => {
    let unsubscribeRequests = null;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch courses and enrollments
        const [allCourses, allEnrollments] = await Promise.all([
          getAllCoursesAdmin(),
          getAllEnrollments(),
        ]);

        setCourses(allCourses);

        // Calculate dashboard stats from actual data
        const totalCourses = allCourses.length;
        const totalEnrollments = allEnrollments.length;
        const totalRevenue = allEnrollments.reduce(
          (sum, enrollment) => sum + (enrollment.price || 0),
          0
        );

        // Get enrollments from last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const enrollmentsLast7Days = allEnrollments.filter((enrollment) => {
          const enrollDate =
            enrollment.enrollmentDate?.toDate?.() ||
            new Date(enrollment.enrollmentDate);
          return enrollDate >= sevenDaysAgo;
        }).length;

        setStats({
          totalCourses,
          totalEnrollments,
          totalRevenue: totalRevenue.toFixed(2),
          enrollmentsLast7Days,
        });

        console.log('Dashboard stats loaded:', {
          totalCourses,
          totalEnrollments,
          totalRevenue: totalRevenue.toFixed(2),
          enrollmentsLast7Days,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    unsubscribeRequests = getAllPendingRequests((requests) => {
      setPendingRequests(requests || []);
    });

    fetchData();

    return () => {
      if (unsubscribeRequests) unsubscribeRequests();
    };
  }, []);

  const handleAcceptRequest = async (request) => {
    if (!request?.requestId || !request?.studentId || !request?.courseId) return;

    try {
      setProcessingRequestId(request.requestId);

      // Ensure student is approved before mapping subject.
      await approveStudent(request.studentId);

      await assignSubjectToStudent(request.studentId, {
        courseId: request.courseId,
        courseTitle: request.courseTitle || 'Untitled Subject',
      });

      await setLessonRequestStatus(request.requestId, 'approved');
    } catch (err) {
      console.error('Failed to accept student request:', err);
      setError(err.message || 'Failed to accept request');
    } finally {
      setProcessingRequestId('');
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-900">
      <AdminSidebar />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-2">Performance overview and analytics</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200">
              Error loading dashboard: {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  icon="📚"
                  label="Total Courses"
                  value={stats?.totalCourses || 0}
                  color="blue"
                />
                <StatsCard
                  icon="👥"
                  label="Total Enrollments"
                  value={stats?.totalEnrollments || 0}
                  color="green"
                />
                <StatsCard
                  icon="💰"
                  label="Total Revenue"
                  value={`$${stats?.totalRevenue || 0}`}
                  color="purple"
                />
                <StatsCard
                  icon="📈"
                  label="Last 7 Days"
                  value={stats?.enrollmentsLast7Days || 0}
                  color="orange"
                />
              </div>

              {/* Course Analytics Table */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">All Courses</h2>
                {courses.length > 0 ? (
                  <CourseAnalyticsTable courses={courses} />
                ) : (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                    <p className="text-gray-400">No courses found</p>
                  </div>
                )}
              </div>

              {/* Student Requests (visible on main admin dashboard) */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">
                    Student Requests ({pendingRequests.length})
                  </h2>
                  <Link
                    to="/admin/assignments"
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Open Assignment Board
                  </Link>
                </div>

                {pendingRequests.length === 0 ? (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                    <p className="text-gray-400">No pending student requests</p>
                  </div>
                ) : (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg divide-y divide-gray-700">
                    {pendingRequests.slice(0, 8).map((request) => (
                      <div
                        key={request.requestId}
                        className="px-5 py-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-white font-medium">
                            {request.courseTitle || 'Untitled Subject'}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            {request.studentName || request.studentEmail} requested access
                          </p>
                        </div>
                        <button
                          onClick={() => handleAcceptRequest(request)}
                          disabled={processingRequestId === request.requestId}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-green-600 text-white hover:bg-green-500 disabled:opacity-60"
                        >
                          {processingRequestId === request.requestId
                            ? 'Accepting...'
                            : 'Accept'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
