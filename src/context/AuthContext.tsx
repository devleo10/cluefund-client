import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const initializeAuth = async () => {
      const savedToken = Cookies.get('cluefund_token') || localStorage.getItem('cluefund_token');
      if (savedToken) {
        try {
          // Verify token with backend (send raw token, not Bearer)
          const response = await authAPI.verifyToken(savedToken);
          if (response.success && response.user) {
            setToken(savedToken);
            setUser({
              id: response.user.id || response.user._id,
              name: response.user.name,
              email: response.user.email
            });
            // Store user in storage for next reload
            Cookies.set('cluefund_user', JSON.stringify(response.user), { expires: 7 });
            localStorage.setItem('cluefund_user', JSON.stringify(response.user));
          } else {
            Cookies.remove('cluefund_token');
            Cookies.remove('cluefund_user');
            localStorage.removeItem('cluefund_token');
            localStorage.removeItem('cluefund_user');
          }
        } catch (error) {
          Cookies.remove('cluefund_token');
          Cookies.remove('cluefund_user');
          localStorage.removeItem('cluefund_token');
          localStorage.removeItem('cluefund_user');
        }
      }
      setIsLoading(false);
      setInitializing(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      if (response) {
        const userData = response.user || response.data?.user || response.data?.userData || response.userData;
        const authToken = response.token || response.data?.token || response.data?.authToken || response.authToken;
        if (userData && authToken) {
          const userInfo = {
            id: userData.id || userData._id,
            name: userData.name,
            email: userData.email
          };
          setUser(userInfo);
          setToken(authToken);
          Cookies.set('cluefund_token', authToken, { expires: 7 });
          Cookies.set('cluefund_user', JSON.stringify(userInfo), { expires: 7 });
          localStorage.setItem('cluefund_token', authToken);
          localStorage.setItem('cluefund_user', JSON.stringify(userInfo));
          return { success: true };
        }
      }
      // If we get here, something went wrong but no exception was thrown
      const errorMsg = response?.message || 'Login failed';
      console.error('Login error in AuthContext (no exception):', errorMsg);
      return { success: false, error: errorMsg };
    } catch (error: any) {
      // Handle thrown exceptions
      console.error('Login error in AuthContext (exception):', error);
      // Make sure to extract the message from the error
      const errorMessage = error.message || 'Network error occurred. Please check your connection and try again.';
      console.log('Returning error from login:', errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setTimeout(() => setIsLoading(false), 500); // Small delay to ensure UI updates
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(name, email, password);
      if (response && (response.success || response.token)) {
        const userData = response.user || response.data?.user;
        const authToken = response.token || response.data?.token;
        if (userData && authToken) {
          const userInfo = {
            id: userData.id || userData._id,
            name: userData.name,
            email: userData.email
          };
          setUser(userInfo);
          setToken(authToken);
          Cookies.set('cluefund_token', authToken, { expires: 7 });
          Cookies.set('cluefund_user', JSON.stringify(userInfo), { expires: 7 });
          localStorage.setItem('cluefund_token', authToken);
          localStorage.setItem('cluefund_user', JSON.stringify(userInfo));
          return { success: true };
        }
      }
      // If we get here, something went wrong but no exception was thrown
      const errorMsg = response?.message || 'Registration failed';
      console.error('Register error in AuthContext (no exception):', errorMsg);
      return { success: false, error: errorMsg };
    } catch (error: any) {
      // Handle thrown exceptions
      console.error('Register error in AuthContext (exception):', error);
      // Make sure to extract the message from the error
      const errorMessage = error.message || 'Network error occurred. Please check your connection and try again.';
      console.log('Returning error from register:', errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setTimeout(() => setIsLoading(false), 500); // Small delay to ensure UI updates
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove('cluefund_token');
    Cookies.remove('cluefund_user');
    localStorage.removeItem('cluefund_token');
    localStorage.removeItem('cluefund_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {initializing ? (
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-[99999]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
            <div className="text-white text-lg">Loading Cluefund...</div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};