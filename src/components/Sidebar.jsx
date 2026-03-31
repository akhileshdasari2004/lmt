import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/dashboard', label: 'My Courses', icon: '📚' },
  { to: '/dashboard', label: 'Progress', icon: '📈' },
  { to: '/profile', label: 'Settings', icon: '⚙️' },
];

const Sidebar = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const emailInitial = user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <aside className="hidden md:flex md:flex-col s-sidebar">
      <div className="px-4 py-5 border-b border-violet-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-semibold text-violet-900">LMT</span>
        </div>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) => [isActive ? 's-nav-item active' : 's-nav-item'].join(' ')}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-violet-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-violet-600">{emailInitial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-violet-900 truncate">{user?.email || 'Guest'}</p>
            <p className="text-xs text-violet-400 truncate">Student</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-violet-300 hover:text-red-400 transition-colors"
          >
            Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

