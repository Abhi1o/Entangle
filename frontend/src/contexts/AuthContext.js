import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

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
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await authAPI.verify();
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        logout();
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const loginWithParaTwitter = async (paraAccessToken, twitterCode, codeVerifier) => {
    try {
      const response = await authAPI.paraTwitterLogin({
        paraAccessToken,
        twitterCode,
        codeVerifier
      });

      if (response.data.success) {
        const { token: authToken, user: userData } = response.data;
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('authToken', authToken);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Authentication failed' 
      };
    }
  };

  const loginWithWallet = async (walletAddress, signature, message) => {
    try {
      const response = await authAPI.walletLogin({
        walletAddress,
        signature,
        message
      });

      if (response.data.success) {
        const { token: authToken, user: userData } = response.data;
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('authToken', authToken);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Authentication failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const value = {
    user,
    token,
    loading,
    loginWithParaTwitter,
    loginWithWallet,
    logout,
    isAuthenticated: !!user,
    isCreator: user?.role === 'creator',
    isBidder: user?.role === 'bidder'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
