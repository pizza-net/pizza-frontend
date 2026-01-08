import { createContext, useContext, useState, useEffect } from 'react';
import { 
  login as loginService, 
  logout as logoutService, 
  isAuthenticated as checkAuth,
  getCurrentUsername,
  getCurrentUserRole,
  verifyToken
} from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sprawdź czy użytkownik jest zalogowany przy ładowaniu aplikacji
    const initAuth = async () => {
      if (checkAuth()) {
        const username = getCurrentUsername();
        const role = getCurrentUserRole();
        const isValid = await verifyToken();
        
        if (isValid && username) {
          setUser({ username, role });
        } else {
          // Token wygasł lub jest nieprawidłowy
          logoutService();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const data = await loginService(username, password);
      setUser({ username: data.username, role: data.role });
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error };
    }
  };

  const logout = () => {
    logoutService();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isUser: user?.role === 'USER',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
