// ARQUIVO CORRIGIDO: src/pages/ProfileRedirectPage.jsx
// Versão que busca o username do Firestore corretamente

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ProfileRedirectPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const redirectToProfile = async () => {
      // Se ainda estamos verificando a autenticação, aguardar
      if (authLoading) {
        return;
      }

      // Se não há usuário logado, redirecionar para login
      if (!currentUser) {
        console.log(
          '[ProfileRedirect] Nenhum usuário logado, redirecionando para login'
        );
        navigate('/login', { replace: true });
        return;
      }

      try {
        setCheckingProfile(true);
        setError(null);

        // Buscar o perfil público do usuário no Firestore
        console.log(
          '[ProfileRedirect] Buscando perfil para usuário:',
          currentUser.uid
        );
        const userPublicRef = doc(db, 'users_public', currentUser.uid);
        const userPublicSnap = await getDoc(userPublicRef);

        if (!isMounted) return;

        if (userPublicSnap.exists()) {
          const userData = userPublicSnap.data();

          if (userData.username) {
            // Username encontrado, redirecionar para o perfil
            console.log(
              '[ProfileRedirect] Username encontrado:',
              userData.username
            );
            navigate(`/profile/${userData.username}`, { replace: true });
          } else {
            // Perfil existe mas sem username, redirecionar para configurações
            console.log(
              '[ProfileRedirect] Perfil sem username, redirecionando para configurações'
            );
            setError('Por favor, configure seu nome de usuário');
            setTimeout(() => {
              if (isMounted) {
                navigate('/settings/profile', { replace: true });
              }
            }, 2000);
          }
        } else {
          // Perfil não existe ainda, pode estar sendo criado
          console.log(
            '[ProfileRedirect] Perfil não encontrado, aguardando criação...'
          );

          // Aguardar 3 segundos e tentar novamente
          setTimeout(async () => {
            if (!isMounted) return;

            const retrySnap = await getDoc(userPublicRef);

            if (retrySnap.exists()) {
              const userData = retrySnap.data();
              if (userData.username) {
                navigate(`/profile/${userData.username}`, { replace: true });
              } else {
                navigate('/settings/profile', { replace: true });
              }
            } else {
              // Perfil ainda não foi criado após retry
              console.error(
                '[ProfileRedirect] Perfil não foi criado após aguardar'
              );
              setError('Erro ao carregar perfil. Por favor, tente novamente.');
              setTimeout(() => {
                if (isMounted) {
                  // Tentar redirecionar usando o UID como fallback
                  navigate(`/profile/${currentUser.uid}`, { replace: true });
                }
              }, 2000);
            }
          }, 3000);
        }
      } catch (error) {
        console.error('[ProfileRedirect] Erro ao buscar perfil:', error);
        setError('Erro ao carregar perfil');

        // Em caso de erro, usar UID como fallback após 2 segundos
        setTimeout(() => {
          if (isMounted) {
            navigate(`/profile/${currentUser.uid}`, { replace: true });
          }
        }, 2000);
      } finally {
        if (isMounted) {
          setCheckingProfile(false);
        }
      }
    };

    redirectToProfile();

    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [currentUser, authLoading, navigate]);

  // Estados de loading
  if (authLoading || checkingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <LoadingSpinner text="Redirecionando para o seu perfil..." />
        {checkingProfile && !authLoading && (
          <p className="text-sm text-gray-500 mt-4">Preparando seu perfil...</p>
        )}
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p className="text-gray-700 text-lg font-medium">{error}</p>
        <p className="text-sm text-gray-500 mt-2">Redirecionando...</p>
      </div>
    );
  }

  // Fallback enquanto processa
  return <LoadingSpinner text="Processando..." />;
}
