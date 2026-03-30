// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AdminAuthProvider, useAdminAuth } from './hooks/useAdminAuth';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import AdminSetup from './pages/AdminSetup';
import QuickAdminSetup from './pages/QuickAdminSetup';
import GrantAdminAccess from './pages/GrantAdminAccess';
import Dashboard from './pages/Dashboard';
import Course from './pages/Course';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminManagement from './pages/AdminManagement';
import CourseManage from './pages/CourseManage';
import Navbar from './components/Navbar';
import AdminNavbar from './components/admin/AdminNavbar';
import './index.css';

// ===== STUDENT AUTH ROUTES =====

// Protected Route component for students
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Layout with Navbar for protected student routes
const ProtectedLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Outlet />
    </div>
  );
};

// Public Route component - redirects to dashboard if authenticated
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show login page while loading (faster perceived performance)
  // Only redirect if definitively authenticated
  return isAuthenticated && !loading ? <Navigate to="/dashboard" replace /> : children;
};

// ===== ADMIN AUTH ROUTES =====

// Protected Route component for admins
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

// Layout with Admin Navbar for protected admin routes
const AdminProtectedLayout = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNavbar />
      <Outlet />
    </div>
  );
};

// Public Admin Route - redirects to admin dashboard if authenticated
const AdminPublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  // Show login page while loading (faster perceived performance)
  // Only redirect if definitively authenticated
  return isAuthenticated && !loading ? <Navigate to="/admin" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <Routes>
            {/* ===== STUDENT ROUTES ===== */}
            <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
            
            <Route element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/course/:id" element={<Course />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* ===== ADMIN ROUTES ===== */}
            <Route path="/admin/setup" element={<AdminSetup />} />
            <Route path="/admin/quick-setup" element={<QuickAdminSetup />} />
            <Route path="/admin/grant-access" element={<GrantAdminAccess />} />
            <Route path="/admin/login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />
            <Route path="/admin/signup" element={<AdminPublicRoute><AdminSignup /></AdminPublicRoute>} />
            
            <Route element={<AdminProtectedRoute><AdminProtectedLayout /></AdminProtectedRoute>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/management" element={<AdminManagement />} />
              <Route path="/admin/courses/:id" element={<CourseManage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
