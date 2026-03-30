import { useState, useEffect, useContext, createContext } from 'react';
import { onAuthChange, logIn as authLogIn, logOut as authLogOut } from '../services/authService';
import { getUserRole } from '../services/firestoreService';

const AdminAuthContext = createContext(null);
const ROLE_CACHE_KEY = 'admin_role_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedRole = (userId) => {
  try {
    const cached = localStorage.getItem(`${ROLE_CACHE_KEY}_${userId}`);
    if (cached) {
      const { role, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return role;
      }
      localStorage.removeItem(`${ROLE_CACHE_KEY}_${userId}`);
    }
  } catch (err) {
    console.error('Cache read error:', err);
  }
  return null;
};

const setCachedRole = (userId, role) => {
  try {
    localStorage.setItem(
      `${ROLE_CACHE_KEY}_${userId}`,
      JSON.stringify({ role, timestamp: Date.now() })
    );
  } catch (err) {
    console.error('Cache write error:', err);
  }
};

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      console.log('Auth state changed:', { firebaseUser: firebaseUser?.uid, email: firebaseUser?.email });
      
      if (firebaseUser) {
        // Try cache first for instant response
        let role = getCachedRole(firebaseUser.uid);
        console.log('Cached role:', role);
        
        try {
          // Fetch role in background if not cached
          if (!role) {
            console.log('Fetching role from Firestore for user:', firebaseUser.uid);
            role = await getUserRole(firebaseUser.uid);
            console.log('Role from Firestore:', role);
            setCachedRole(firebaseUser.uid, role);
          }
          
          if (role === 'admin') {
            console.log('✅ Admin role confirmed');
            setUser(firebaseUser);
            setIsAdmin(true);
          } else {
            console.log('❌ User is not admin, role:', role);
            setUser(null);
            setIsAdmin(false);
          }
        } catch (err) {
          console.error('Error checking admin status:', err);
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        console.log('No user logged in');
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logIn = async (email, password) => {
    const result = await authLogIn(email, password);
    // Role check happens in the auth state listener
    return result;
  };

  const logOut = () => {
    return authLogOut();
  };

  const value = {
    user,
    loading,
    logIn,
    logOut,
    isAuthenticated: !!user && isAdmin,
    isAdmin,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {/* Render children even while loading so login page appears instantly */}
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
