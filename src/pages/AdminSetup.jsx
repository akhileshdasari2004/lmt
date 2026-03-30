import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { createUser, getAllUsers } from '../services/firestoreService';

const AdminSetup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(null);
  const navigate = useNavigate();

  // Check if any admin already exists
  useEffect(() => {
    checkIfAdminExists();
  }, []);

  const checkIfAdminExists = async () => {
    try {
      const users = await getAllUsers();
      const adminExists = users.some(user => user.role === 'admin');
      setAdminExists(adminExists);
      
      if (adminExists) {
        console.log('Admin already exists, redirecting to login');
        navigate('/admin/login');
      }
    } catch (err) {
      console.error('Error checking admin existence:', err);
      setAdminExists(false);
    }
  };

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
      console.log('Creating first admin account...');
      
      // Check again if admin exists (in case another request created one)
      const users = await getAllUsers();
      const adminExists = users.some(user => user.role === 'admin');
      
      if (adminExists) {
        setError('An admin account already exists. Please login instead.');
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }

      // Create admin account using Firebase SDK
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      console.log('Firebase user created:', userId);

      // Create admin role in Firestore
      try {
        await createUser(userId, { email, role: 'admin' }, 'admin');
        console.log('✅ First admin account created successfully!');
        
        setError('✅ Admin account created! Redirecting to dashboard...');
        
        // Redirect to admin dashboard after successful setup
        setTimeout(() => window.location.href = '/admin/login', 1500);
      } catch (firestoreError) {
        console.error('Error creating admin in Firestore:', firestoreError);
        throw new Error(`Setup error: ${firestoreError.message}`);
      }
    } catch (err) {
      console.error('Admin setup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Use Quick Setup to finalize admin access.');
      } else {
        setError(err.message || 'Setup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (adminExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-white">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4">Checking setup status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-2xl border border-gray-700">
        <div>
          <h1 className="text-center text-3xl font-bold text-red-500">Admin Setup</h1>
          <h2 className="text-center text-lg font-semibold text-gray-300 mt-2">
            Initialize Admin Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Create the first admin account for your system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className={`${
              error.includes('✅') 
                ? 'bg-green-900 border-green-700 text-green-200' 
                : 'bg-red-900 bg-opacity-50 border-red-700 text-red-200'
            } bg-opacity-50 p-3 rounded-md text-sm border`}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Admin Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
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
                autoComplete="new-password"
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="••••••••"
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
                autoComplete="new-password"
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
          >
            {loading ? 'Setting up...' : 'Create Admin Account'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-600 space-y-4">
          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link
              to="/admin/quick-setup"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Quick Setup
            </Link>
          </p>
          
          <p className="text-center text-xs text-gray-500">
            This setup page is only available if no admin exists yet
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
