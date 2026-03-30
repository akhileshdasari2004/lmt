import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { logOut } from '../../services/authService';

const AdminNavbar = () => {
  const { user } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get user display info
  const displayName = user?.displayName || user?.email || 'Admin';
  const photoURL = user?.photoURL;
  const emailInitial = user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <nav className="bg-gray-900 shadow-lg border-b border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Admin title */}
          <div className="flex-shrink-0">
            <Link to="/admin" className="text-xl font-bold text-red-500">
              Admin Dashboard
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
                    alt="Admin Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-medium">
                    {emailInitial}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-200 hidden sm:block">
                  {displayName}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="text-sm text-red-400 hover:text-red-300 px-3 py-2 rounded-md hover:bg-red-900 transition"
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

export default AdminNavbar;
