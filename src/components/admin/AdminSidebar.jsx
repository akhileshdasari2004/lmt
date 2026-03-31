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
    <aside className="a-sidebar">
      <div className="p-6 border-b border-blue-100">
        <h2 className="text-blue-900 text-2xl font-semibold tracking-tight">LMT Admin</h2>
        <p className="text-blue-400 text-xs mt-1">Management Panel</p>
      </div>

      <nav className="mt-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={isActive(item.path) ? 'a-nav-item active' : 'a-nav-item'}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 w-60 border-t border-blue-100 bg-white p-4">
        <p className="text-xs text-blue-300">© 2026 LMT Admin</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
