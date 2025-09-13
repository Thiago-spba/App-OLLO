// ARQUIVO CORRIGIDO: src/pages/ProfilePage.jsx
// Versão com importação corrigida e integração do reloadAuthUser

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useProfileStore } from '../hooks/useProfileStore';
import ProfileHeader from '../components/pages/profile/ProfileHeader';
import ProfileBio from '../components/pages/profile/ProfileBio';
import ProfileGallery from '../components/pages/profile/ProfileGallery';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import NotFoundPage from './NotFoundPage';

// Componente de erro otimizado
const ErrorDisplay = ({ message, onRetry, type = 'error' }) => (
  <div className="flex flex-col items-center justify-center text-center my-16 p-6">
    <div className="text-6xl mb-4">{type === 'not-found' ? '👤' : '⚠️'}</div>
    <h2 className="text-xl font-bold mb-2 text-gray-800">
      {type === 'not-found' ? 'Usuário não encontrado' : 'Ops! Algo deu errado'}
    </h2>
    <p className="text-gray-600 mb-6 max-w-md">
      {type === 'not-found'
        ? 'O perfil que você está procurando não existe ou foi removido.'
        : message}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
      >
        Tentar Novamente
      </button>
    )}
  </div>
);

// Componente de redirecionamento para setup de perfil
const ProfileSetupRedirect = () => (
  <div className="flex flex-col items-center justify-center text-center my-16 p-6">
    <div className="text-6xl mb-4">🔄</div>
    <h2 className="text-xl font-bold mb-2 text-gray-800">
      Configurando seu perfil...
    </h2>
    <p className="text-gray-600 mb-6 max-w-md">
      Estamos preparando seu perfil. Isso pode levar alguns segundos.
    </p>
    <LoadingSpinner />
  </div>
);

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading, forceReloadUser } = useAuth(); // CORRIGIDO: adicionar forceReloadUser

  // Estados locais otimizados
  const [pageState, setPageState] = useState({
    loading: true,
    error: null,
    profileData: null,
    setupInProgress: false,
  });

  // Refs para controle de loops
  const fetchAttempts = useRef(0);
  const lastFetchedUsername = useRef(null);
  const isMounted = useRef(true);
  const setupCheckTimeout = useRef(null);

  // Hook do profile store
  const {
    initialize,
    setCurrentUser,
    setReloadAuthUser, // ADICIONADO: função para configurar reload
    form,
    editing,
    loading: storeLoading,
    handleChange,
    handleFileChange,
    handleEdit,
    handleSave,
    handleCancel,
    handleMediaUpload,
    reset,
  } = useProfileStore();

  // CRITICAL: Configurar função de reload quando hook carregar
  useEffect(() => {
    if (forceReloadUser) {
      console.log(
        '[ProfilePage] Configurando função de reload no ProfileStore'
      );
      setReloadAuthUser(forceReloadUser);
    }
  }, [forceReloadUser, setReloadAuthUser]);

  // Verificar se o usuário logado é o dono do perfil
  const isOwner = useMemo(() => {
    return currentUser?.uid === form?.id;
  }, [currentUser?.uid, form?.id]);

  // Função para verificar se o perfil está sendo criado
  const checkProfileSetup = useCallback(async (userId, attemptCount = 0) => {
    const maxAttempts = 5;
    const delayMs = 2000;

    if (attemptCount >= maxAttempts) {
      console.log('[ProfilePage] Max tentativas de setup excedidas');
      setPageState({
        loading: false,
        error: {
          type: 'setup-failed',
          message:
            'Não foi possível criar seu perfil. Por favor, tente fazer login novamente.',
        },
        profileData: null,
        setupInProgress: false,
      });
      return null;
    }

    try {
      const userDocRef = doc(db, 'users_public', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = { id: userDocSnap.id, ...userDocSnap.data() };
        console.log('[ProfilePage] Perfil criado com sucesso:', userData);
        return userData;
      }

      console.log(
        `[ProfilePage] Perfil ainda não criado, tentativa ${attemptCount + 1}/${maxAttempts}`
      );

      if (isMounted.current) {
        setPageState((prev) => ({
          ...prev,
          setupInProgress: true,
        }));

        return new Promise((resolve) => {
          setupCheckTimeout.current = setTimeout(async () => {
            if (isMounted.current) {
              const result = await checkProfileSetup(userId, attemptCount + 1);
              resolve(result);
            } else {
              resolve(null);
            }
          }, delayMs);
        });
      }
    } catch (error) {
      console.error('[ProfilePage] Erro ao verificar setup do perfil:', error);
      return null;
    }
  }, []);

  // Função otimizada para buscar perfil do usuário
  const fetchUserProfile = useCallback(
    async (targetUsername) => {
      if (
        lastFetchedUsername.current === targetUsername &&
        fetchAttempts.current > 0
      ) {
        console.log('[ProfilePage] Username já foi buscado:', targetUsername);
        return;
      }

      if (fetchAttempts.current >= 3) {
        console.log(
          '[ProfilePage] Limite de tentativas excedido para:',
          targetUsername
        );
        setPageState({
          loading: false,
          error: {
            type: 'too-many-attempts',
            message: 'Muitas tentativas. Por favor, recarregue a página.',
          },
          profileData: null,
          setupInProgress: false,
        });
        return;
      }

      console.log('[ProfilePage] Buscando perfil para:', targetUsername);
      lastFetchedUsername.current = targetUsername;
      fetchAttempts.current += 1;

      setPageState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        setupInProgress: false,
      }));
      reset();

      if (
        !targetUsername ||
        targetUsername === 'undefined' ||
        targetUsername === 'null'
      ) {
        setPageState({
          loading: false,
          error: { type: 'not-found', message: 'Username inválido' },
          profileData: null,
          setupInProgress: false,
        });
        return;
      }

      try {
        // Buscar por username
        const usersRef = collection(db, 'users_public');
        const q = query(
          usersRef,
          where('username', '==', targetUsername.toLowerCase()),
          limit(1)
        );

        console.log(
          '[ProfilePage] Executando query para username:',
          targetUsername.toLowerCase()
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = { id: userDoc.id, ...userDoc.data() };

          console.log(
            '[ProfilePage] Usuário encontrado por username:',
            userData
          );

          initialize(userData);
          if (currentUser) {
            setCurrentUser(currentUser);
          }

          setPageState({
            loading: false,
            error: null,
            profileData: userData,
            setupInProgress: false,
          });
          return;
        }

        console.log(
          '[ProfilePage] Nenhum usuário encontrado com username:',
          targetUsername
        );

        // Verificar se é um UID válido
        const isValidUid = /^[a-zA-Z0-9]{20,}$/.test(targetUsername);

        if (isValidUid) {
          console.log(
            '[ProfilePage] Tentando buscar por userId:',
            targetUsername
          );
          const userDocRef = doc(db, 'users_public', targetUsername);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = { id: userDocSnap.id, ...userDocSnap.data() };
            console.log('[ProfilePage] Usuário encontrado por ID:', userData);

            if (userData.username && userData.username !== targetUsername) {
              console.log(
                '[ProfilePage] Redirecionando para username correto:',
                userData.username
              );
              navigate(`/profile/${userData.username}`, { replace: true });
              return;
            }

            initialize(userData);
            if (currentUser) {
              setCurrentUser(currentUser);
            }

            setPageState({
              loading: false,
              error: null,
              profileData: userData,
              setupInProgress: false,
            });
            return;
          }
        }

        // Se é o usuário atual tentando acessar próprio perfil
        if (
          currentUser &&
          (targetUsername === currentUser.uid ||
            targetUsername === currentUser.email?.split('@')[0])
        ) {
          console.log(
            '[ProfilePage] Usuário atual tentando acessar próprio perfil não criado'
          );

          const profileData = await checkProfileSetup(currentUser.uid);

          if (profileData) {
            if (profileData.username) {
              navigate(`/profile/${profileData.username}`, { replace: true });
            } else {
              initialize(profileData);
              setCurrentUser(currentUser);
              setPageState({
                loading: false,
                error: null,
                profileData: profileData,
                setupInProgress: false,
              });
            }
            return;
          }
        }

        // Perfil não encontrado
        setPageState({
          loading: false,
          error: { type: 'not-found', message: 'Perfil não encontrado' },
          profileData: null,
          setupInProgress: false,
        });
      } catch (error) {
        console.error('[ProfilePage] Erro ao buscar perfil:', error);

        setPageState({
          loading: false,
          error: {
            type: 'network-error',
            message: `Erro de conexão: ${error.message}`,
          },
          profileData: null,
          setupInProgress: false,
        });
      }
    },
    [
      initialize,
      setCurrentUser,
      reset,
      currentUser,
      navigate,
      checkProfileSetup,
    ]
  );

  // Effect principal
  useEffect(() => {
    if (username !== lastFetchedUsername.current) {
      fetchAttempts.current = 0;
    }

    if (username && username !== 'undefined' && username !== 'null') {
      console.log('[ProfilePage] Username mudou para:', username);
      fetchUserProfile(username);
    } else {
      console.log('[ProfilePage] Username inválido:', username);
      setPageState({
        loading: false,
        error: { type: 'not-found', message: 'Username não fornecido' },
        profileData: null,
        setupInProgress: false,
      });
    }

    return () => {
      if (setupCheckTimeout.current) {
        clearTimeout(setupCheckTimeout.current);
      }
    };
  }, [username, fetchUserProfile]);

  // Cleanup ao desmontar
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      if (setupCheckTimeout.current) {
        clearTimeout(setupCheckTimeout.current);
      }
    };
  }, []);

  // Função para retry
  const handleRetry = useCallback(() => {
    fetchAttempts.current = 0;
    if (username) {
      fetchUserProfile(username);
    }
  }, [username, fetchUserProfile]);

  // Loading states
  if (authLoading) {
    return <LoadingSpinner text="Verificando autenticação..." />;
  }

  if (pageState.setupInProgress) {
    return <ProfileSetupRedirect />;
  }

  if (pageState.loading) {
    return <LoadingSpinner text="Carregando perfil..." />;
  }

  // Error states
  if (pageState.error) {
    if (pageState.error.type === 'not-found') {
      return (
        <ErrorDisplay message={pageState.error.message} type="not-found" />
      );
    }
    return (
      <ErrorDisplay
        message={pageState.error.message}
        onRetry={handleRetry}
        type="error"
      />
    );
  }

  // Verificação adicional de dados
  if (!form || !form.id) {
    console.log('[ProfilePage] Form ou form.id não disponível:', { form });
    return (
      <ErrorDisplay
        message="Dados do perfil não disponíveis"
        type="not-found"
      />
    );
  }

  // Render principal
  return (
    <main className="max-w-2xl mx-auto my-4 md:my-8 px-4">
      <div className="space-y-4">
        <ProfileHeader
          profileData={form}
          editing={editing}
          isOwner={isOwner}
          loading={storeLoading}
          onHandleChange={handleChange}
          onHandleFileChange={handleFileChange}
          onHandleEdit={handleEdit}
          onHandleSave={handleSave}
          onHandleCancel={handleCancel}
        />

        <ProfileBio
          profileData={form}
          editing={editing}
          onHandleChange={handleChange}
        />

        <ProfileGallery
          profileData={form}
          editing={editing}
          isOwner={isOwner}
          loading={storeLoading}
          onMediaUpload={handleMediaUpload}
        />
      </div>
    </main>
  );
}
