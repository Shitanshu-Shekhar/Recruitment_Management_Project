import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
const demoUsersKey = 'talentsync-demo-users-v1';
const demoSessionKey = 'talentsync-demo-session-v1';
const demoAccounts = [
  { _id: 'demo-applicant', name: 'Aarav Sharma', email: 'applicant@example.com', password: 'Applicant@123', role: 'applicant', isActive: true },
  { _id: 'demo-recruiter', name: 'Vikram Malhotra', email: 'recruiter@example.com', password: 'Recruiter@123', role: 'recruiter', isActive: true },
  { _id: 'demo-admin', name: 'Rajesh Verma', email: 'admin@example.com', password: 'Admin@123456', role: 'admin', isActive: true },
];

const readDemoSession = () => {
  try {
    return JSON.parse(localStorage.getItem(demoSessionKey) || 'null');
  } catch {
    return null;
  }
};

const readDemoUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem(demoUsersKey) || '[]');
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
};

const hashDemoPassword = async (password) => {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (isDemoMode) return readDemoSession()?.user || null;
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => (
    isDemoMode ? readDemoSession()?.token || null : localStorage.getItem('token') || null
  ));
  const [loading, setLoading] = useState(true);

  // Sync token to api & localStorage
  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    if (isDemoMode) {
      localStorage.setItem(demoSessionKey, JSON.stringify({ token: newToken, user: newUser }));
    } else {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    if (isDemoMode) {
      localStorage.removeItem(demoSessionKey);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []);

  // Verify and fetch current user on reload
  const refreshUser = useCallback(async () => {
    if (isDemoMode) {
      setLoading(false);
      return;
    }
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    if (isDemoMode) {
      const normalizedEmail = email.trim().toLowerCase();
      const savedUsers = readDemoUsers();
      const demoUser = [...demoAccounts, ...savedUsers].find((account) => account.email === normalizedEmail);
      const passwordIsValid = demoUser && (
        demoUser.password
          ? demoUser.password === password
          : demoUser.passwordHash === await hashDemoPassword(password)
      );
      if (!passwordIsValid) throw new Error('Invalid demo email or password.');
      const { password: _password, passwordHash: _passwordHash, ...safeUser } = demoUser;
      const demoToken = `demo-${crypto.randomUUID?.() || Date.now().toString(36)}`;
      handleAuthSuccess(demoToken, safeUser);
      return { success: true, token: demoToken, user: safeUser };
    }
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      handleAuthSuccess(res.data.token, res.data.user);
    }
    return res.data;
  };

  const register = async (name, email, password, role) => {
    if (isDemoMode) {
      const normalizedEmail = email.trim().toLowerCase();
      const existingAccount = [...demoAccounts, ...readDemoUsers()].some(
        (account) => account.email === normalizedEmail
      );
      if (existingAccount) throw new Error('An account with this email already exists.');
      const demoUser = {
        _id: `demo-${crypto.randomUUID?.() || Date.now().toString(36)}`,
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: await hashDemoPassword(password),
        role: role === 'recruiter' ? 'recruiter' : 'applicant',
        isActive: true,
      };
      localStorage.setItem(demoUsersKey, JSON.stringify([...readDemoUsers(), demoUser]));
      const { passwordHash: _passwordHash, ...safeUser } = demoUser;
      const demoToken = `demo-${crypto.randomUUID?.() || Date.now().toString(36)}`;
      handleAuthSuccess(demoToken, safeUser);
      return { success: true, token: demoToken, user: safeUser };
    }
    const res = await api.post('/auth/register', { name, email, password, role });
    if (res.data?.success) {
      handleAuthSuccess(res.data.token, res.data.user);
    }
    return res.data;
  };

  const updateLocalUser = (updatedData) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    role: user?.role || null,
    login,
    register,
    logout,
    refreshUser,
    updateLocalUser,
    isDemoMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
