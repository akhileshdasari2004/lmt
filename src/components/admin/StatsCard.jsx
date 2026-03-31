import React from 'react';

/**
 * StatsCard Component
 * Displays a single stat with icon, label, value, and optional trend
 */
const StatsCard = ({ icon, label, value, trend = null, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
    green: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    purple: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
    orange: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  };

  const bgColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`border rounded-2xl p-6 transition-all duration-200 hover:border-[#2563a8] ${bgColor}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <p className="text-slate-100 text-3xl font-semibold mt-2 tracking-tight">{value}</p>
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
