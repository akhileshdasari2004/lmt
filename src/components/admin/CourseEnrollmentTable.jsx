import React from 'react';

/**
 * EnrollmentTable Component
 * Display enrollments/bookings in table format
 */
const EnrollmentTable = ({ enrollments, onDelete = null }) => {
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-gray-300 font-semibold">Student Name</th>
              <th className="px-6 py-3 text-left text-gray-300 font-semibold">Course Name</th>
              <th className="px-6 py-3 text-left text-gray-300 font-semibold">Price</th>
              <th className="px-6 py-3 text-left text-gray-300 font-semibold">Date</th>
              <th className="px-6 py-3 text-left text-gray-300 font-semibold">Status</th>
              {onDelete && <th className="px-6 py-3 text-left text-gray-300 font-semibold">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {enrollments.length === 0 ? (
              <tr>
                <td colSpan={onDelete ? 6 : 5} className="px-6 py-4 text-center text-gray-500">
                  No enrollments yet
                </td>
              </tr>
            ) : (
              enrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-gray-700 transition">
                  <td className="px-6 py-4 text-white">{enrollment.studentName}</td>
                  <td className="px-6 py-4 text-gray-300">{enrollment.courseName}</td>
                  <td className="px-6 py-4 text-white">
                    {enrollment.price > 0 ? `$${enrollment.price.toFixed(2)}` : 'Free'}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{formatDate(enrollment.enrollmentDate)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-900 text-green-400 rounded text-xs font-semibold">
                      {enrollment.status}
                    </span>
                  </td>
                  {onDelete && (
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onDelete(enrollment.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition"
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnrollmentTable;
