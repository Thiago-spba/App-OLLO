// src/components/AuthWrapper.jsx
// VERSÃO COMPATÍVEL COM SUA ESTRUTURA ATUAL

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

export default function AuthWrapper({ children }) {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se não está carregando e não há usuário, redireciona para login
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [loading, currentUser, navigate]);

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  // Se não há usuário, não renderiza nada (vai redirecionar)
  if (!currentUser) return null;

  // Se há usuário, renderiza os children
  return children;
}
