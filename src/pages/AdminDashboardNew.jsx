import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import StatsCard from '../components/admin/StatsCard';
import CourseAnalyticsTable from '../components/admin/CourseAnalyticsTable';
import { getAllCoursesAdmin } from '../services/adminCourseService';
import { getAllEnrollments } from '../services/adminService';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchData();
  }, []);


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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
