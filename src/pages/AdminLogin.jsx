import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { logIn } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Admin login attempt:', { email });

    try {
      console.log('Calling logIn function...');
      await logIn(email, password);
      console.log('LogIn successful');
      navigate('/admin');
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.message || 'Admin login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c1220] px-4">
      <div className="max-w-md w-full space-y-8 bg-[#131e30] p-8 rounded-2xl shadow-[0_0_20px_rgba(14,165,233,0.15)] border border-[#1e3a5f]">
        <div>
          <h1 className="text-center text-3xl font-bold text-sky-400">Admin Panel</h1>
          <h2 className="text-center text-lg font-semibold text-slate-300 mt-2">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Only admins can access this area
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 text-red-300 p-3 rounded-xl text-sm border border-red-500/30">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autocomplete="email"
                className="mt-1 block w-full bg-[#1a2842] border border-[#1e3a5f] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all duration-200"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autocomplete="current-password"
                className="mt-1 block w-full bg-[#1a2842] border border-[#1e3a5f] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all duration-200"
                placeholder="•••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Admin Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#1e3a5f] space-y-4">
          <p className="text-center text-sm text-slate-400">
            Don't have an admin account?{' '}
            <Link
              to="/admin/signup"
              className="text-sky-400 hover:text-sky-300 font-medium"
            >
              Create One
            </Link>
          </p>

          <p className="text-center text-sm text-slate-400">
            Looking for the student dashboard?{' '}
            <Link
              to="/"
              className="text-sky-400 hover:text-sky-300 font-medium"
            >
              Student Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
