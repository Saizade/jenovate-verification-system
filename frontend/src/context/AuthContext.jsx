import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jenovate_token'));
  const [loading, setLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('jenovate_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        const userData = response.data.data?.user || response.data.user || response.data;
        setUser(userData);
        setToken(storedToken);
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('jenovate_token');
        localStorage.removeItem('jenovate_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data.data || response.data;

      localStorage.setItem('jenovate_token', newToken);
      localStorage.setItem('jenovate_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);

      toast.success(`Welcome back, ${userData.name || userData.email}!`);
      return userData;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      throw error;
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      toast.success('Registration successful!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      toast.error(message);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jenovate_token');
    localStorage.removeItem('jenovate_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect based on user role
    const roleRedirects = {
      admin: '/admin/dashboard',
      employee: '/employee/dashboard',
      student: '/student/register',
    };
    return <Navigate to={roleRedirects[user?.role] || '/login'} replace />;
  }

  return children;
}

export default AuthContext;
