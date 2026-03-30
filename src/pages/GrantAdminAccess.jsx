import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const GrantAdminAccess = () => {
  const [email, setEmail] = useState('akhileshdasari24@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGrantAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('Granting admin access to:', email);

      // Verify credentials
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      
      console.log('User authenticated:', userId);

      // Add admin role to user document (create if doesn't exist)
      console.log('Creating/updating user document with admin role...');
      await setDoc(doc(db, 'users', userId), {
        email: email,
        role: 'admin',
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
      }, { merge: true }); // merge: true keeps existing fields if document exists

      console.log('✅ Admin role granted!');
      setSuccess('✅ Admin access granted! You can now login at /admin/login');
      
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 2000);

    } catch (err) {
      console.error('Error:', err);
      if (err.code === 'auth/wrong-password') {
        setError('❌ Wrong password');
      } else if (err.code === 'auth/user-not-found') {
        setError('❌ User not found');
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
          <h1 className="text-center text-3xl font-bold text-red-500">Grant Admin Access</h1>
          <p className="mt-4 text-center text-sm text-gray-400">
            This will add admin role to your account
          </p>
        </div>

        <form onSubmit={handleGrantAdmin} className="mt-8 space-y-6">
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
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Granting...' : 'Grant Admin Access'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-600 text-center text-xs text-gray-500">
          Password is verified but not stored
        </div>
      </div>
    </div>
  );
};

export default GrantAdminAccess;
