import { createContext, useContext, useEffect, useState } from 'react';
import apiUrl from '../apiUrls';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const checkAuth = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      // Check basic user auth and get user data
      const userResponse = await fetch(`${apiUrl}login/check`, {
        headers: { authorization: token }
      });
      const userData = await userResponse.json();

      if (!userData.verified) {
        localStorage.removeItem('jwt');
        setUser(null);
        setIsAdmin(false);
      } else {
        // Get detailed user data
        const userDetailResponse = await fetch(`${apiUrl}user/me`, {
          headers: { authorization: token }
        });
        const userDetailData = await userDetailResponse.json();
        
        if (userDetailData.status === 'success') {
          setUser(userDetailData.data);
        } else {
          setUser(userData); // fallback to basic user data
        }
        
        // Check admin status
        try {
          const adminResponse = await fetch(`${apiUrl}login/checkAdmin`, {
            headers: { authorization: token }
          });
          const adminData = await adminResponse.json();
          setIsAdmin(adminData.verified);
        } catch (adminError) {
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('jwt');
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('jwt', token);
    setUser(userData);
    setIsAdmin(false); // Will be checked on next page load if needed
    setLoading(false);
    setInitialized(true);
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setUser(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    isAdmin,
    loading,
    initialized,
    login,
    logout,
    recheckAuth: checkAuth,
    // UserProvider compatibility
    refreshUser: checkAuth,
    needsEmailVerification: user && (!user.email || !user.emailVerified)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
