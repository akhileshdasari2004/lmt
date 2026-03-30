import React from 'react';

/**
 * CourseAnalyticsTable Component
 * Display course stats in table format
 */
const CourseAnalyticsTable = ({ courses }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-gray-300 font-semibold">Course Name</th>
              <th className="px-6 py-3 text-left text-gray-300 font-semibold">Instructor</th>
              <th className="px-6 py-3 text-left text-gray-300 font-semibold">Price</th>
              <th className="px-6 py-3 text-left text-gray-300 font-semibold">Students</th>
              <th className="px-6 py-3 text-left text-gray-300 font-semibold">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {courses.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No courses yet
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-700 transition">
                  <td className="px-6 py-4 text-white">{course.courseName || course.title || 'Untitled'}</td>
                  <td className="px-6 py-4 text-gray-300">{course.instructor || 'N/A'}</td>
                  <td className="px-6 py-4 text-white">
                    {course.pricingType === 'paid' && course.price ? (
                      formatCurrency(course.price)
                    ) : (
                      <span className="text-green-400">Free</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-white">{course.totalEnrolled || 0}</td>
                  <td className="px-6 py-4 text-green-400">{formatCurrency(course.totalRevenue || 0)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseAnalyticsTable;
