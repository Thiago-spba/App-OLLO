// src/components/AuthWrapper.jsx
// VERSÃO CORRIGIDA - Remove renderização condicional que causava desmontagem

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthWrapper({ children }) {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Só redireciona se terminou de carregar E não tem usuário
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [loading, currentUser, navigate]);

  // MUDANÇA CRÍTICA: Sempre renderiza os children
  // O loading é tratado no App.jsx com overlay, não aqui
  // Isso evita a desmontagem/remontagem dos componentes filhos

  return children;
}
