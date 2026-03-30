import { useState, useEffect } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { getAllUsers, setUserRole } from '../services/firestoreService';

const AdminManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [grandingAdminForUser, setGrantingAdminForUser] = useState(null);
  const [email, setEmail] = useState('');
  const [grantingRole, setGrantingRole] = useState(false);
  
  const { isAuthenticated, loading: authLoading } = useAdminAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchUsers();
    }
  }, [authLoading, isAuthenticated]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching all users...');
      const allUsers = await getAllUsers();
      console.log('Users fetched:', allUsers);
      setUsers(allUsers);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAdmin = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    
    try {
      setGrantingAdminForUser(userId);
      console.log(`Changing role for user ${userId} to ${newRole}`);
      
      await setUserRole(userId, newRole);
      
      console.log(`✅ Role changed to ${newRole}`);
      setSuccess(`Role updated to ${newRole}!`);
      
      // Refresh users list
      await fetchUsers();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update role: ' + err.message);
    } finally {
      setGrantingAdminForUser(null);
    }
  };

  const handleGrantRoleByEmail = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    try {
      setGrantingRole(true);
      console.log(`Granting admin role to email: ${email}`);
      
      // Find user by email
      const user = users.find(u => u.email === email);
      
      if (!user) {
        setError(`No user found with email: ${email}`);
        return;
      }

      if (user.role === 'admin') {
        setError(`${email} is already an admin`);
        return;
      }

      // Grant admin role
      await setUserRole(user.uid, 'admin');
      
      console.log(`✅ Admin role granted to ${email}`);
      setSuccess(`Admin role granted to ${email}!`);
      setEmail('');
      
      // Refresh users list
      await fetchUsers();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error granting admin:', err);
      setError('Failed to grant admin role: ' + err.message);
    } finally {
      setGrantingRole(false);
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center text-red-600">
        You don't have permission to access this page
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Management</h1>
        <p className="text-gray-600">Grant or revoke admin roles for users</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
          {error}
          <button 
            onClick={() => setError('')}
            className="ml-4 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-200">
          ✅ {success}
        </div>
      )}

      {/* Quick Grant Admin Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Grant Admin Role</h2>
        <form onSubmit={handleGrantRoleByEmail} className="flex gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={grantingRole}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {grantingRole ? 'Granting...' : 'Grant Admin'}
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">All Users</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.uid} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.name || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role || 'student'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleGrantAdmin(user.uid, user.role)}
                        disabled={grandingAdminForUser === user.uid}
                        className={`px-4 py-2 rounded font-medium text-white transition ${
                          user.role === 'admin'
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : 'bg-green-600 hover:bg-green-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {grandingAdminForUser === user.uid 
                          ? 'Processing...' 
                          : user.role === 'admin' 
                            ? 'Remove Admin' 
                            : 'Make Admin'
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
