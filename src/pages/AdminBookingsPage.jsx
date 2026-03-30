import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import EnrollmentTable from '../components/admin/CourseEnrollmentTable';
import { getAllEnrollments } from '../services/adminService';

/**
 * Admin Bookings Page
 * Display and manage all enrollments/bookings
 */
const AdminBookings = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await getAllEnrollments();
        setEnrollments(data);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  // Filter and sort enrollments
  const filteredEnrollments = enrollments
    .filter(
      (enrollment) =>
        enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.enrollmentDate) - new Date(a.enrollmentDate);
      } else if (sortBy === 'student') {
        return a.studentName.localeCompare(b.studentName);
      } else if (sortBy === 'course') {
        return a.courseName.localeCompare(b.courseName);
      }
      return 0;
    });

  const totalRevenue = enrollments.reduce((sum, enrollment) => sum + enrollment.price, 0);

  return (
    <div className="flex min-h-screen bg-gray-900">
      <AdminSidebar />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Bookings & Enrollments</h1>
            <p className="text-gray-400 mt-2">Manage all student enrollments</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm">Total Enrollments</p>
              <p className="text-3xl font-bold text-white mt-2">{enrollments.length}</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-green-400 mt-2">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm">Average Price</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">
                ${(enrollments.length > 0 ? totalRevenue / enrollments.length : 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by student or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-red-600 outline-none"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-red-600 outline-none"
            >
              <option value="date">Sort by Date</option>
              <option value="student">Sort by Student</option>
              <option value="course">Sort by Course</option>
            </select>
          </div>

          {/* Enrollments Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <EnrollmentTable enrollments={filteredEnrollments} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
