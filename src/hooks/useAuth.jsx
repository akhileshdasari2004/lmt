import { useState, useEffect, useContext, createContext } from 'react';
import { onAuthChange, signUp as authSignUp, logIn as authLogIn, logOut as authLogOut } from '../services/authService';
import { createUser } from '../services/firestoreService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email, password, name) => {
    const result = await authSignUp(email, password);
    await createUser(result.user.uid, { email, name });
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
      {!loading && children}
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
