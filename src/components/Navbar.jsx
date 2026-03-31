// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logOut } from '../services/authService';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get user display info
  const displayName = user?.displayName || user?.email || 'User';
  const photoURL = user?.photoURL;
  const emailInitial = user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <nav className="bg-[#16162a]/95 backdrop-blur border-b border-[#1e1e35]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - App name */}
          <div className="flex-shrink-0">
            <Link to="/dashboard" className="text-xl font-bold text-slate-100">
              Course Dashboard
            </Link>
          </div>

          {/* Right side - User info */}
          {user && (
            <div className="flex items-center gap-4">
              {/* User avatar and name */}
              <div className="flex items-center gap-2">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                    {emailInitial}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-300 hidden sm:block">
                  {displayName}
                </span>
              </div>

              {/* Profile link */}
              <Link
                to="/profile"
                className="text-sm text-slate-400 hover:text-slate-100 px-3 py-2 rounded-xl hover:bg-[#252540] border border-transparent hover:border-[#2d2d50] transition-all duration-200"
              >
                Profile
              </Link>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="text-sm text-slate-300 hover:text-white px-3 py-2 rounded-xl border border-[#2d2d50] hover:border-[#4d4d80] hover:bg-[#252540] transition-all duration-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
