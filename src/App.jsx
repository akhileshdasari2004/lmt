import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AdminAuthProvider, useAdminAuth } from './hooks/useAdminAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Course from './pages/Course';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminDashboardNew from './pages/AdminDashboardNew';
import AdminCoursesPage from './pages/AdminCoursesPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminCourseForm from './pages/AdminCourseForm';
import AdminManagement from './pages/AdminManagement';
import CourseManage from './pages/CourseManage';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import AdminSetup from './pages/AdminSetup';
import QuickAdminSetup from './pages/QuickAdminSetup';
import GrantAdminAccess from './pages/GrantAdminAccess';
import PendingApproval from './pages/PendingApproval';
import Navbar from './components/Navbar';
import AdminNavbar from './components/admin/AdminNavbar';
import './index.css';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  if (user.role === 'student' && user.status === 'approved') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/pending" replace />;
};

const StudentProtectedRoute = ({ children, allowedStatus = 'approved' }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;

  if (!user) return <Navigate to="/" replace />;

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (allowedStatus && user?.status !== allowedStatus) {
    return <Navigate to={user.status === 'approved' ? '/dashboard' : '/pending'} replace />;
  }

  return children;
};

const StudentLayout = () => (
  <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
    <Navbar />
    <Outlet />
  </div>
);

const AdminLayout = () => (
  <div className="min-h-screen" style={{ backgroundColor: 'var(--color-admin-base)' }}>
    <AdminNavbar />
    <Outlet />
  </div>
);

const LoginRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to={user.status === 'approved' ? '/dashboard' : '/pending'} replace />;
  }
  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

const AdminPublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/admin" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <Routes>
            {/* Student routes */}
            <Route path="/" element={<LoginRoute><Login /></LoginRoute>} />

            <Route
              path="/pending"
              element={
                <StudentProtectedRoute allowedStatus="pending">
                  <PendingApproval />
                </StudentProtectedRoute>
              }
            />

            <Route
              element={
                <StudentProtectedRoute allowedStatus="approved">
                  <StudentLayout />
                </StudentProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/course/:id" element={<Course />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Admin auth routes restored */}
            <Route path="/admin/setup" element={<AdminSetup />} />
            <Route path="/admin/quick-setup" element={<QuickAdminSetup />} />
            <Route path="/admin/grant-access" element={<GrantAdminAccess />} />
            <Route path="/admin/login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />
            <Route path="/admin/signup" element={<AdminPublicRoute><AdminSignup /></AdminPublicRoute>} />

            {/* Admin protected routes restored + new assignments route */}
            <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
              <Route path="/admin" element={<AdminDashboardNew />} />
              <Route path="/admin/dashboard" element={<AdminDashboardNew />} />
              <Route path="/admin/courses" element={<AdminCoursesPage />} />
              <Route path="/admin/courses/new" element={<AdminCourseForm />} />
              <Route path="/admin/courses/edit/:courseId" element={<AdminCourseForm />} />
              <Route path="/admin/bookings" element={<AdminBookingsPage />} />
              <Route path="/admin/management" element={<AdminManagement />} />
              <Route path="/admin/courses/:id" element={<CourseManage />} />

              {/* Newly developed feature preserved */}
              <Route path="/admin/assignments" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
