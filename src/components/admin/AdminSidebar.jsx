import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * AdminSidebar Component
 * Navigation sidebar for admin panel
 */
const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Courses', path: '/admin/courses', icon: '📚' },
    { label: 'Bookings', path: '/admin/bookings', icon: '📋' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-white text-2xl font-bold">LMT Admin</h2>
        <p className="text-gray-400 text-xs mt-1">Management Panel</p>
      </div>

      <nav className="mt-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive(item.path)
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 w-64 border-t border-gray-700 bg-gray-900 p-4">
        <p className="text-xs text-gray-400">© 2026 LMT Admin</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
