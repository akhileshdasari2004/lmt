import { useState, useEffect, useContext, createContext } from 'react';
import { onAuthChange, signUp as authSignUp, logIn as authLogIn, logOut as authLogOut } from '../services/authService';
import { initializeNewUser } from '../services/firestoreService';
import { db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserDoc = null;

    const unsubscribe = onAuthChange((firebaseUser) => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userRef = doc(db, 'users', firebaseUser.uid);
      unsubscribeUserDoc = onSnapshot(
        userRef,
        (snap) => {
          const profile = snap.exists() ? snap.data() : {};
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: profile.name || firebaseUser.displayName || '',
            role: profile.role || 'student',
            status: profile.status || 'pending',
          });
          setLoading(false);
        },
        () => {
          // Fallback to auth identity if profile listener fails.
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            role: 'student',
            status: 'pending',
          });
          setLoading(false);
        },
      );
    });

    return () => {
      if (unsubscribeUserDoc) unsubscribeUserDoc();
      unsubscribe();
    };
  }, []);

  const signUp = async (email, password, name) => {
    const result = await authSignUp(email, password);
    await initializeNewUser(result.user.uid, email, name);
    return result;
  };

  const logIn = (email, password) => {
    return authLogIn(email, password);
  };

  const logOut = () => {
    return authLogOut();
  };

  const value = {
    user,
    loading,
    signUp,
    logIn,
    logOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children even while loading so login page appears instantly */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
