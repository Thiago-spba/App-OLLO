// src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // MUDANÇA: Pegamos tudo pronto do Contexto. Sem useEffect, sem reload extra.
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // 1. Enquanto o AuthContext carrega (loading inicial), mostramos um loader simples
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. Se não tem usuário logado, manda para Login
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Verificação de E-mail
  // Se o e-mail NÃO está verificado...
  if (!currentUser.emailVerified) {
    // ...e ele NÃO está nas páginas permitidas de verificação...
    if (
      location.pathname !== '/verify-email' &&
      location.pathname !== '/verify-success' // Mantive sua exceção de segurança
    ) {
      // ...manda ele verificar.
      return <Navigate to="/verify-email" replace />;
    }
  }

  // 4. Se o e-mail JÁ ESTÁ verificado e ele tenta acessar a página de verificação...
  if (currentUser.emailVerified && location.pathname === '/verify-email') {
    // ...manda para a Home (ou Dashboard)
    return <Navigate to="/" replace />;
  }

  // 5. Se passou por tudo, renderiza a página protegida
  return children || <Outlet />;
}
