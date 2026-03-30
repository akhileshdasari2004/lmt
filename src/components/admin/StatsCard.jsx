import React from 'react';

/**
 * StatsCard Component
 * Displays a single stat with icon, label, value, and optional trend
 */
const StatsCard = ({ icon, label, value, trend = null, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-900 bg-opacity-20 border-blue-700 text-blue-400',
    green: 'bg-green-900 bg-opacity-20 border-green-700 text-green-400',
    purple: 'bg-purple-900 bg-opacity-20 border-purple-700 text-purple-400',
    orange: 'bg-orange-900 bg-opacity-20 border-orange-700 text-orange-400',
  };

  const bgColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`border rounded-lg p-6 ${bgColor}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{label}</p>
          <p className="text-white text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.percentage}% from last week
            </p>
          )}
        </div>
        <div className="text-3xl opacity-50">{icon}</div>
      </div>
    </div>
  );
};

export default StatsCard;
