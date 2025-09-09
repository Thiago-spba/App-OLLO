// ARQUIVO CORRIGIDO E OTIMIZADO: src/pages/ProfilePage.jsx

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
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

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  // Estados locais otimizados
  const [pageState, setPageState] = useState({
    loading: true,
    error: null,
    profileData: null,
  });

  // Hook do profile store
  const {
    initialize,
    setCurrentUser,
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

  // Função otimizada para buscar perfil do usuário
  const fetchUserProfile = useCallback(
    async (targetUsername) => {
      console.log('[ProfilePage] Buscando perfil para:', targetUsername);

      // Reset do estado
      setPageState((prev) => ({ ...prev, loading: true, error: null }));
      reset();

      if (!targetUsername) {
        setPageState({
          loading: false,
          error: { type: 'not-found', message: 'Username não fornecido' },
          profileData: null,
        });
        return;
      }

      try {
        const usersRef = collection(db, 'users_public');
        const q = query(
          usersRef,
          where('username', '==', targetUsername.toLowerCase())
        );

        console.log(
          '[ProfilePage] Executando query para username:',
          targetUsername.toLowerCase()
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log(
            '[ProfilePage] Nenhum usuário encontrado com username:',
            targetUsername
          );

          // Tentativa alternativa: buscar por userId se o username for um ID
          if (targetUsername.length > 20) {
            // UIDs do Firebase têm ~28 caracteres
            console.log(
              '[ProfilePage] Tentando buscar por userId:',
              targetUsername
            );
            const userDocRef = doc(db, 'users_public', targetUsername);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const userData = { id: userDocSnap.id, ...userDocSnap.data() };
              console.log('[ProfilePage] Usuário encontrado por ID:', userData);

              initialize(userData);
              setPageState({
                loading: false,
                error: null,
                profileData: userData,
              });
              return;
            }
          }

          setPageState({
            loading: false,
            error: { type: 'not-found', message: 'Perfil não encontrado' },
            profileData: null,
          });
          return;
        }

        // Usuário encontrado
        const userDoc = querySnapshot.docs[0];
        const userData = { id: userDoc.id, ...userDoc.data() };

        console.log('[ProfilePage] Usuário encontrado:', userData);

        // Inicializar store
        initialize(userData);

        // Definir usuário atual se logado
        if (currentUser) {
          setCurrentUser(currentUser);
        }

        setPageState({
          loading: false,
          error: null,
          profileData: userData,
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
        });
      }
    },
    [initialize, setCurrentUser, reset, currentUser]
  );

  // Effect principal - executado quando username muda
  useEffect(() => {
    if (username) {
      console.log('[ProfilePage] Username mudou para:', username);
      fetchUserProfile(username);
    } else {
      console.log('[ProfilePage] Username não definido');
      setPageState({
        loading: false,
        error: { type: 'not-found', message: 'Username não fornecido' },
        profileData: null,
      });
    }
  }, [username, fetchUserProfile]);

  // Verificar se o usuário logado é o dono do perfil
  const isOwner = useMemo(() => {
    return currentUser?.uid === form?.id;
  }, [currentUser?.uid, form?.id]);

  // Função para retry
  const handleRetry = useCallback(() => {
    if (username) {
      fetchUserProfile(username);
    }
  }, [username, fetchUserProfile]);

  // Loading states
  if (authLoading) {
    return <LoadingSpinner text="Verificando autenticação..." />;
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
        {/* Header do perfil */}
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

        {/* Bio do perfil */}
        <ProfileBio
          profileData={form}
          editing={editing}
          onHandleChange={handleChange}
        />

        {/* Galeria do perfil */}
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
