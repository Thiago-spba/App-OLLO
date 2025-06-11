// src/components/auth/ProtectedRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // DEBUG: Vamos ver o que está acontecendo
  console.log('🔍 ProtectedRoute Debug:', {
    loading,
    currentUser: currentUser
      ? {
          email: currentUser.email,
          emailVerified: currentUser.emailVerified,
          uid: currentUser.uid,
        }
      : null,
    pathname: location.pathname,
  });

  if (loading) {
    console.log('⏳ ProtectedRoute: Ainda carregando...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregando...
      </div>
    );
  }

  if (!currentUser) {
    console.log(
      '❌ ProtectedRoute: Usuário não autenticado, redirecionando para /login'
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!currentUser.emailVerified) {
    console.log(
      '📧 ProtectedRoute: Email não verificado, redirecionando para /verify-email'
    );
    return <Navigate to="/verify-email" replace />;
  }

  console.log(
    '✅ ProtectedRoute: Usuário autenticado e verificado, permitindo acesso'
  );
  return children;
};

export default ProtectedRoute;
