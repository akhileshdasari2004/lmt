import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { logIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await logIn(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-violet-25 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-violet-100 rounded-3xl p-8 shadow-card">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center mb-3">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <h1 className="text-xl font-semibold text-violet-900">LMT</h1>
          <p className="text-xs text-violet-400 mt-0.5">Learning Management</p>
        </div>

        <div className="flex bg-violet-50 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
              !isSignUp
                ? 'bg-white text-violet-700 shadow-card'
                : 'text-violet-400 hover:text-violet-600'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
              isSignUp
                ? 'bg-white text-violet-700 shadow-card'
                : 'text-violet-400 hover:text-violet-600'
            }`}
          >
            Sign up
          </button>
        </div>

        {error && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-4 py-1.5 text-[11px] font-medium text-red-600">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            <span className="truncate">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-violet-700 mb-1.5">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
                autoComplete="name"
                className="s-input"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-violet-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="s-input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-violet-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
              className="s-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="s-button w-full py-2.5 mt-2 inline-flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>
              {loading
                ? isSignUp
                  ? 'Creating account...'
                  : 'Signing in...'
                : isSignUp
                ? 'Create account'
                : 'Sign in'}
            </span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-violet-100 text-[11px] text-violet-400">
          <p className="text-center">
            Admin access?{' '}
            <Link to="/admin/login" className="font-semibold text-violet-600 hover:text-violet-700">
              Admin Login
            </Link>
            {' '}|{' '}
            <Link to="/admin/signup" className="font-semibold text-violet-600 hover:text-violet-700">
              Admin Signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
