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
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      {/* Left panel (kept in DOM but hidden to keep layout options open) */}
      <div className="hidden px-12 py-10 bg-gradient-to-br from-brand-900 via-surface to-surface relative overflow-hidden">
        <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-10 h-80 w-80 rounded-full bg-brand-700/30 blur-3xl" />

        <div className="relative flex items-center gap-3 mb-16">
          <div className="h-11 w-11 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-extrabold text-xl">
            L
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary tracking-tight">
              LMT
            </p>
            <p className="text-xs text-text-muted">
              Learning Management Tool
            </p>
          </div>
        </div>

        <div className="relative mt-auto mb-auto max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted mb-4">
            Learn. Track. Grow.
          </p>
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-text-primary mb-4">
            A focused space for your learning journey.
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-md">
            Stay on top of every lesson, understand your progress across courses, and
            come back exactly where you left off — every single time.
          </p>
        </div>

        <div className="relative mt-auto text-[11px] text-text-muted">
          Built with React, Firebase & Tailwind CSS
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full flex items-center justify-center px-4 sm:px-8">
        <div className="w-full max-w-md bg-surface-card border border-surface-border rounded-3xl px-6 py-7 sm:px-8 sm:py-9 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-text-primary tracking-tight">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <span className="text-[11px] text-text-muted">
                LMT • Student access
              </span>
            </div>
            <div className="inline-flex items-center rounded-full bg-surface-muted/50 px-1 py-1 text-[11px]">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${
                  !isSignUp
                    ? 'bg-brand-500 text-white'
                    : 'text-text-secondary'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${
                  isSignUp
                    ? 'bg-brand-500 text-white'
                    : 'text-text-secondary'
                }`}
              >
                Sign up
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-danger/10 border border-danger/40 px-4 py-1.5 text-[11px] font-medium text-danger">
              <span className="h-1.5 w-1.5 rounded-full bg-danger" />
              <span className="truncate">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold uppercase tracking-[0.18em] text-text-muted mb-1.5"
                >
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
                  className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-shadow"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-[0.18em] text-text-muted mb-1.5"
              >
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
                className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-shadow"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-[0.18em] text-text-muted mb-1.5"
              >
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
                className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-shadow"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full inline-flex justify-center items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading && (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>
                {loading
                  ? isSignUp
                    ? 'Creating account…'
                    : 'Signing in…'
                  : isSignUp
                  ? 'Create account'
                  : 'Sign in'}
              </span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-surface-border text-[11px] text-text-muted">
            <p className="text-center">
              Admin access?{' '}
              <Link
                to="/admin/login"
                className="font-semibold text-brand-500 hover:text-brand-600"
              >
                Go to admin login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
