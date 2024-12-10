import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/authService';

const network = import.meta.env.VITE_DFX_NETWORK || "ic";
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
      console.log("Starting auth initialization");
      const isAuthenticated = await AuthService.init();
      console.log("Is authenticated:", isAuthenticated);
      if (isAuthenticated) {
        const principal = await AuthService.getPrincipal();
        console.log("Principal:", principal.toString());
        const agent = await AuthService.getAgent();
        setUser({ 
          principal: principal.toString(),
          agent
        });

        // Check if the user is an admin using AuthService
        const isAdminUser = await AuthService.checkIsAdmin(principal);
        console.log("Admin check result:", isAdminUser);
        setIsAdmin(isAdminUser);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      console.log("Starting login process");
      const success = await AuthService.login();
      console.log("Login success:", success);
      
      if (success) {
        const principal = await AuthService.getPrincipal();
        console.log("Got principal:", principal.toString());
        
        const agent = await AuthService.getAgent();
        console.log("Got agent:", agent);
        
        const newUser = { 
          principal: principal.toString(),
          agent
        };
        console.log("Setting user to:", newUser);
        setUser(newUser);
        
        // Retrieve credentials and confirm if user is admin
        const isAdminUser = await AuthService.checkIsAdmin(principal);
        console.log("Setting isAdmin to:", isAdminUser);
        setIsAdmin(isAdminUser);
        
        // Verify the state was updated
        console.log("Final user state:", newUser);
        console.log("Final isAdmin state:", isAdminUser);
        
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

  const value = {
    user,
    isAdmin,
    loading,
    login,
    logout,
  };
  console.log("AuthProvider - User:", user);
  console.log("AuthProvider - IsAdmin:", isAdmin);
  console.log("AuthProvider - Loading:", loading);

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