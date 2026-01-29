import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // To check auth status on initial load
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // This effect simply ensures the initial state is set correctly.
    // The main check happens with the initial state values above.
    setLoading(false);
  }, []);

  const clearError = () => setError(null);
  const clearMessage = () => setMessage(null);

  // Register Action
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.registerUser(userData);
      setLoading(false);
      setMessage('Registration Successful! Please Login.');
      return { success: true, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      setLoading(false);
      return { success: false, message };
    }
  };

  // Login Action
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      setLoading(false);
      setMessage('Login Successful!');
      return { success: true, user: data.user };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Invalid Credentials';
      setError(message);
      setLoading(false);
      return { success: false, message };
    }
  };

  // Logout Action
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        message,
        register,
        login,
        logout,
        clearError,
        setMessage,
        clearMessage,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};