import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { createUser } from '../services/firestoreService';

const AdminSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { logIn } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Create admin account using Firebase SDK
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      console.log('Firebase user created:', userId);

      // Create admin role in Firestore
      try {
        await createUser(userId, { email, role: 'admin' }, 'admin');
        console.log('Admin role created in Firestore');
      } catch (firestoreError) {
        console.error('Error creating admin role in Firestore:', firestoreError);
        throw new Error(`Firestore error: ${firestoreError.message}`);
      }

      // Log in to trigger admin role check
      await logIn(email, password);
      
      setError('Signup successful! Redirecting to admin dashboard...');
      
      // Redirect to admin dashboard after successful login
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      console.error('Admin signup error:', err);
      setError(err.message || 'Admin signup failed. This email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-2xl border border-gray-700">
        <div>
          <h1 className="text-center text-3xl font-bold text-red-500">Admin Panel</h1>
          <h2 className="text-center text-lg font-semibold text-gray-300 mt-2">
            Create Admin Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Only for administrators
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className={`${
              error.includes('successful') 
                ? 'bg-green-900 border-green-700 text-green-200' 
                : 'bg-red-900 bg-opacity-50 border-red-700 text-red-200'
            } bg-opacity-50 p-3 rounded-md text-sm border`}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
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
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
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
                autocomplete="new-password"
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="•••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autocomplete="new-password"
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="•••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
          >
            {loading ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-600 space-y-4">
          <p className="text-center text-sm text-gray-400">
            Already have an admin account?{' '}
            <Link
              to="/admin/login"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Sign In
            </Link>
          </p>

          <p className="text-center text-sm text-gray-400">
            Are you a student?{' '}
            <Link
              to="/"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Student Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
