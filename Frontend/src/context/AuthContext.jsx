import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // To check auth status on initial load
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchLatestRole = useCallback(async () => {
    const currentUser = authService.getCurrentUser();
    if (isAuthenticated && currentUser && currentUser.role && currentUser.role._id) {
      try {
        const response = await api.get(`/roles/${currentUser.role._id}`);
        if (response.data && response.data.success) {
          const updatedRole = response.data.data;
          const updatedUser = { ...currentUser, role: updatedRole };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (err) {
        console.error("Failed to sync latest role permissions", err);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchLatestRole().finally(() => setLoading(false));
  }, [fetchLatestRole]);

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
        fetchLatestRole,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};