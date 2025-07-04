import React, { createContext, useContext, useState, useEffect } from 'react';
import apiUrl from '../apiUrls';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${apiUrl}user/me`, {
        headers: {
          authorization: localStorage.getItem('jwt')
        }
      });
      const reply = await response.json();
      
      if (reply.status === 'success') {
        setUser(reply.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    refreshUser: fetchUser,
    needsEmailVerification: user && (!user.email || !user.emailVerified)
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
