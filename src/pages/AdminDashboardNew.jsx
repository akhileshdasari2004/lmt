import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import StatsCard from '../components/admin/StatsCard';
import CourseAnalyticsTable from '../components/admin/CourseAnalyticsTable';
import { getDashboardStats, getCourseAnalytics } from '../services/adminService';

/**
 * Admin Dashboard Page
 * Performance dashboard with stats and course analytics
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [courseAnalytics, setCourseAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardStats, courses] = await Promise.all([
          getDashboardStats(),
          getCourseAnalytics(),
        ]);
        setStats(dashboardStats);
        setCourseAnalytics(courses);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
                <h2 className="text-xl font-bold text-white mb-4">Course Performance</h2>
                <CourseAnalyticsTable courses={courseAnalytics} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
