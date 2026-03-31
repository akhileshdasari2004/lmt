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
    <aside className="w-64 bg-[#131e30] border-r border-[#1e3a5f] min-h-screen">
      <div className="p-6 border-b border-[#1e3a5f]">
        <h2 className="text-slate-100 text-2xl font-semibold tracking-tight">LMT Admin</h2>
        <p className="text-slate-400 text-xs mt-1">Management Panel</p>
      </div>

      <nav className="mt-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-300 hover:bg-[#1f3352] hover:text-white border border-transparent hover:border-[#2563a8]'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 w-64 border-t border-[#1e3a5f] bg-[#0c1220] p-4">
        <p className="text-xs text-slate-500">© 2026 LMT Admin</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
