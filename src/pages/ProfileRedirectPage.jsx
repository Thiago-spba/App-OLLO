// NOVO ARQUIVO: src/pages/ProfileRedirectPage.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ProfileRedirectPage() {
  const { currentUser, loadingAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se ainda estamos verificando a autenticação, não faça nada.
    if (loadingAuth) {
      return;
    }

    // Se temos um usuário logado e ele tem um username, redireciona para o perfil dele.
    if (currentUser && currentUser.username) {
      navigate(`/profile/${currentUser.username}`, { replace: true });
    }
    // Se não há usuário, redireciona para o login.
    else {
      navigate('/login', { replace: true });
    }
  }, [currentUser, loadingAuth, navigate]);

  // EXPLICAÇÃO: O `replace: true` é importante. Ele substitui a entrada `/profile` no histórico
  // do navegador pela URL correta (ex: `/profile/thiago-soba`). Isso evita que o usuário
  // fique preso em um loop de redirecionamento se clicar no botão "voltar".

  return <LoadingSpinner text="Redirecionando para o seu perfil..." />;
}
