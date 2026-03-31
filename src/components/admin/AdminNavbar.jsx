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
    <nav className="bg-white border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Admin title and menu */}
          <div className="flex items-center gap-8">
            <Link to="/admin" className="text-xl font-bold text-blue-900">
              Admin Dashboard
            </Link>
            
            {/* Admin Menu Links */}
            <div className="hidden md:flex gap-6">
              <Link 
                to="/admin" 
                className="text-blue-400 hover:text-blue-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-blue-50 transition-all duration-150"
              >
                Courses
              </Link>
              <Link 
                to="/admin/management" 
                className="text-blue-400 hover:text-blue-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-blue-50 transition-all duration-150"
              >
                Users & Roles
              </Link>
            </div>
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
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {emailInitial}
                  </div>
                )}
                <span className="text-sm font-medium text-blue-900 hidden sm:block">
                  {displayName}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="a-button-ghost"
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
