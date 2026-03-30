import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { createUser, getUser } from '../services/firestoreService';

const QuickAdminSetup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('=== QUICK ADMIN SETUP START ===');
      console.log('Email:', email);

      // Step 1: Authenticate with Firebase
      console.log('\n📍 STEP 1: Authenticating with Firebase...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      console.log('✅ Firebase auth successful. UID:', userId);

      // Step 2: Check if user document exists
      console.log('\n📍 STEP 2: Checking Firestore for existing user document...');
      const existingUser = await getUser(userId);
      console.log('Existing user found:', existingUser);

      // Step 3: Create/update admin role
      console.log('\n📍 STEP 3: Creating admin role in Firestore...');
      console.log('Attempting to write to /users/' + userId);
      
      await createUser(userId, { 
        email, 
        role: 'admin',
        name: existingUser?.name || email.split('@')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, 'admin');
      
      console.log('✅ Admin role created successfully!');
      console.log('=== QUICK ADMIN SETUP SUCCESS ===\n');
      
      setSuccess('✅ Admin account setup completed! Redirecting to dashboard...');
      
      // Redirect to admin dashboard
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 2000);
    } catch (err) {
      console.error('\n❌ ERROR:', err);
      console.error('Error Code:', err.code);
      console.error('Error Message:', err.message);
      console.log('=== QUICK ADMIN SETUP FAILED ===\n');
      
      if (err.code === 'auth/user-not-found') {
        setError('❌ Email not found in Firebase. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('❌ Incorrect password.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('❌ Invalid email or password.');
      } else if (err.message && err.message.includes('permission-denied')) {
        setError('❌ Permission denied. Your Firestore rules may need to be updated. Check the console for details.');
      } else {
        setError(`❌ Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-2xl border border-gray-700">
        <div>
          <h1 className="text-center text-3xl font-bold text-red-500">Admin Setup</h1>
          <h2 className="text-center text-lg font-semibold text-gray-300 mt-2">
            Finalize Admin Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Use your existing account credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-900 bg-opacity-50 text-red-200 p-3 rounded-md text-sm border border-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900 bg-opacity-50 text-green-200 p-3 rounded-md text-sm border border-green-700">
              {success}
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
                autoComplete="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="akhileshdasari24@gmail.com"
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
                autoComplete="current-password"
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
            {loading ? 'Setting up...' : 'Setup Admin Access'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-600 space-y-4">
          <p className="text-center text-sm text-gray-400">
            Already an admin?{' '}
            <Link
              to="/admin/login"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Login
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

export default QuickAdminSetup;
