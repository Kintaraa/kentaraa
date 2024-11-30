import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/authService';

const network = import.meta.env.VITE_DFX_NETWORK;
console.log('Environment Using Import:', network);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const isAuthenticated = await AuthService.init();
      if (isAuthenticated) {
        const principal = await AuthService.getPrincipal();
        const agent = await AuthService.getAgent();
        setUser({ 
          principal: principal.toString(),
          agent
        });
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      
      const success = await AuthService.login();
      console.log("checking Login", success);
      if (success) {
        console.log("Login Success ");
        const principal = await AuthService.getPrincipal();
        const agent = await AuthService.getAgent();
        const isAdminUser = await checkIsAdmin(principal);
        setUser({ 
          principal: principal.toString(),
          agent
        });
        console.log("isAdminUser", isAdminUser);
        setIsAdmin(isAdminUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const checkIsAdmin = async (principal) => {
    // Implement your admin check logic here
    // You should check against your backend canister
    return true; // Default to false for now
  };

  const value = {
    user,
    isAdmin,
    loading,
    login,
    logout,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};