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
    <div className="max-w-6xl mx-auto p-6 text-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-100 tracking-tight mb-2">Admin Management</h1>
        <p className="text-slate-400">Grant or revoke admin roles for users</p>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-300 p-4 rounded-xl mb-6 border border-red-500/30">
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
        <div className="bg-emerald-500/10 text-emerald-300 p-4 rounded-xl mb-6 border border-emerald-500/30">
          ✅ {success}
        </div>
      )}

      {/* Quick Grant Admin Form */}
      <div className="bg-[#131e30] p-6 rounded-2xl mb-8 border border-[#1e3a5f]">
        <h2 className="text-lg font-medium mb-4 text-slate-200">Quick Grant Admin Role</h2>
        <form onSubmit={handleGrantRoleByEmail} className="flex gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 bg-[#1a2842] border border-[#1e3a5f] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={grantingRole}
            className="px-6 py-2.5 bg-sky-500 text-white text-sm font-medium rounded-xl hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]"
          >
            {grantingRole ? 'Granting...' : 'Grant Admin'}
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-[#131e30] rounded-2xl overflow-hidden border border-[#1e3a5f]">
        <div className="px-6 py-4 bg-[#1a2842] border-b border-[#1e3a5f]">
          <h2 className="text-lg font-medium text-slate-200">All Users</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">
            <div className="w-6 h-6 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a2842] border-b border-[#1e3a5f]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.uid} className="border-b border-[#1e3a5f] hover:bg-[#1f3352]">
                    <td className="px-6 py-4 text-sm text-slate-200">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{user.name || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                          : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
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
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : 'bg-sky-500 hover:bg-sky-600'
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
