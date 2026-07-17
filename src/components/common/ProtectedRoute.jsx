import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, isInitializing } = useAuth();
  const location = useLocation();
  if (isInitializing) return <div className="min-h-[60vh] flex items-center justify-center text-slate2">Checking your secure session…</div>;
  if (!isAuthenticated) return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}
