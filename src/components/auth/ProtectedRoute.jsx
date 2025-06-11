// src/components/auth/ProtectedRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  // MUDANÇA: Pega também o estado de 'loading' do contexto
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Se ainda estivermos verificando o usuário, mostra uma tela de carregamento.
  // ISSO EVITA O REDIRECIONAMENTO PREMATURO.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregando...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

export default ProtectedRoute;
