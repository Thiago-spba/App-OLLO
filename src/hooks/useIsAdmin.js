// src/hooks/useIsAdmin.js (VERSÃO CORRETA E UNIFICADA)

import { useAuth } from '../context/AuthContext';

/**
 * Hook customizado que verifica, a partir do estado JÁ CARREGADO na memória,
 * se o usuário atual é um administrador.
 * 
 * Esta versão NÃO FAZ NENHUMA CHAMADA AO BANCO DE DADOS, tornando-a
 * instantânea e prevenindo o erro de permissão.
 */
export function useIsAdmin() {
  const { currentUser, loading: authLoading } = useAuth();

  // A informação 'isAdmin' já foi carregada pelo nosso AuthContext.
  // Se o usuário não estiver carregado ou não tiver o campo, ele não é admin.
  const isAdmin = currentUser?.isAdmin === true;

  return {
    isAdmin,
    // O status de "carregando" é o mesmo do AuthContext. Não precisamos de um loading próprio.
    loading: authLoading, 
  };
}