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
      let errorMsg = err.response?.data?.message || err.message || 'Invalid Credentials';
      setError(errorMsg);
      setLoading(false);
      return { success: false, message: errorMsg };
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