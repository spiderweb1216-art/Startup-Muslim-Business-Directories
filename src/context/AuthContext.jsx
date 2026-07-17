import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearSession, getCachedUser, getToken, storeSession } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getCachedUser());
  const [isInitializing, setIsInitializing] = useState(Boolean(getToken()));

  useEffect(() => {
    let active = true;
    const restore = async () => {
      if (!getToken()) { setIsInitializing(false); return; }
      try {
        const result = await api('/auth/me');
        if (!active) return;
        setCurrentUser(result.user);
        storeSession(getToken(), result.user, Boolean(localStorage.getItem('csl_mysql_auth_token_v3')));
      } catch {
        clearSession();
        if (active) setCurrentUser(null);
      } finally {
        if (active) setIsInitializing(false);
      }
    };
    restore();
    return () => { active = false; };
  }, []);

  const login = async ({ email, password, remember = true }) => {
    try {
      const result = await api('/auth/login', { method:'POST', body:{ email, password }, auth:false });
      storeSession(result.token, result.user, remember);
      setCurrentUser(result.user);
      return { ok:true, user:result.user };
    } catch (error) {
      return { ok:false, message:error.message };
    }
  };

  const register = async ({ name, email, password, role = 'Founder', country = '' }) => {
    try {
      const result = await api('/auth/register', { method:'POST', body:{ name, email, password, role, country }, auth:false });
      storeSession(result.token, result.user, true);
      setCurrentUser(result.user);
      return { ok:true, user:result.user };
    } catch (error) {
      return { ok:false, message:error.message };
    }
  };

  const logout = () => { clearSession(); setCurrentUser(null); };

  const updateProfile = async (changes) => {
    try {
      const result = await api('/auth/profile', { method:'PUT', body:changes });
      storeSession(result.token || getToken(), result.user, Boolean(localStorage.getItem('csl_mysql_auth_token_v3')));
      setCurrentUser(result.user);
      return { ok:true, user:result.user };
    } catch (error) {
      return { ok:false, message:error.message };
    }
  };

  const value = useMemo(() => ({
    currentUser,
    isAuthenticated:Boolean(currentUser),
    isAdmin:currentUser?.role === 'Admin',
    isInitializing,
    login,
    register,
    logout,
    updateProfile,
  }), [currentUser, isInitializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
