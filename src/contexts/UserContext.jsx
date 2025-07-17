// Compatibility wrapper for components still using useUser
import { useAuth } from './AuthContext';

export const useUser = () => {
  const auth = useAuth();
  
  return {
    user: auth.user,
    loading: auth.loading,
    refreshUser: auth.refreshUser,
    needsEmailVerification: auth.needsEmailVerification
  };
};

export const UserProvider = ({ children }) => {
  // This is now just a pass-through since AuthProvider handles everything
  return children;
};

export default { useUser, UserProvider };
