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
    <aside className="hidden md:flex md:flex-col w-64 bg-surface-card border-r border-surface-border">
      <div className="px-6 py-6 border-b border-surface-border flex items-center gap-3">
        <div className="h-9 w-9 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-extrabold text-lg">
          L
        </div>
        <div>
          <div className="text-sm font-semibold text-text-primary tracking-tight">
            LMT
          </div>
          <div className="text-xs text-text-muted">
            Learning Management
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border-l-2',
                isActive
                  ? 'bg-brand-500/10 text-brand-500 border-brand-500'
                  : 'text-text-secondary border-transparent hover:bg-surface-muted/40 hover:text-text-primary',
              ].join(' ')
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-surface-border flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-500 font-semibold text-sm">
          {emailInitial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-text-primary truncate">
            {user?.email || 'Guest'}
          </p>
          <p className="text-[11px] text-text-muted truncate">
            Student
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-[11px] font-semibold text-danger px-2 py-1 rounded-lg hover:bg-danger/10 transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

