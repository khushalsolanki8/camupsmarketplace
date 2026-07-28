import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ active: false, message: '', type: 'success' });

  // Get API Base URL dynamically
  const API_BASE = (window.location.port && window.location.port !== '3000') || window.location.protocol === 'file:'
    ? 'http://localhost:3000'
    : '';

  const triggerToast = (message, type = 'success') => {
    setToast({ active: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, active: false }));
    }, 3000);
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('cs_token');
    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('cs_user', JSON.stringify(data.user));
        }
      } else {
        localStorage.removeItem('cs_token');
        localStorage.removeItem('cs_user');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error verifying auth status:', error);
      // Fallback offline verification using localStorage to avoid flicker
      const savedUser = localStorage.getItem('cs_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          setCurrentUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('cs_token', data.token);
    localStorage.setItem('cs_user', JSON.stringify(data.user));
    setCurrentUser(data.user);
    triggerToast('Signed in successfully!', 'success');
    return data.user;
  };

  const register = async (userData) => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    localStorage.setItem('cs_token', data.token);
    localStorage.setItem('cs_user', JSON.stringify(data.user));
    setCurrentUser(data.user);
    triggerToast('Registration successful! Accessing marketplace...', 'success');
    return data.user;
  };

  const logout = async () => {
    const token = localStorage.getItem('cs_token');
    if (token) {
      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {
        console.warn('Logout endpoint unreachable:', e);
      }
    }

    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
    setCurrentUser(null);
    triggerToast('Signed out successfully!', 'success');
  };

  const updateProfile = async (profileData) => {
    const token = localStorage.getItem('cs_token');
    if (!token) throw new Error('Unauthorized');

    const response = await fetch(`${API_BASE}/api/auth/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }

    setCurrentUser(data.user);
    localStorage.setItem('cs_user', JSON.stringify(data.user));
    triggerToast('Profile updated successfully!', 'success');
    return data.user;
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      login,
      register,
      logout,
      updateProfile,
      toast,
      triggerToast,
      API_BASE
    }}>
      {children}
      {toast.active && (
        <div id="toast-banner" className={`toast-notif active ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </AuthContext.Provider>
  );
};
