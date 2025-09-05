// ARQUIVO: src/pages/ProfilePage.jsx

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useProfileStore } from '../hooks/useProfileStore';
import ProfileHeader from '../components/pages/profile/ProfileHeader';
import ProfileBio from '../components/pages/profile/ProfileBio';
import ProfileGallery from '../components/pages/profile/ProfileGallery';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import NotFoundPage from './NotFoundPage';

const ErrorDisplay = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center text-center my-16">
    <h2 className="text-xl font-bold mb-2">Ops! Algo deu errado.</h2>
    <p className="text-gray-600 mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Tentar Novamente
    </button>
  </div>
);

export default function ProfilePage() {
  const { username } = useParams();
  const { currentUser, loading: authLoading, reloadCurrentUser } = useAuth();

  // Estados locais simplificados para debug
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);

  // Estados do store
  const initialize = useProfileStore((state) => state.initialize);
  const setCurrentUser = useProfileStore((state) => state.setCurrentUser);
  const form = useProfileStore((state) => state.form);
  const editing = useProfileStore((state) => state.editing);
  const storeLoading = useProfileStore((state) => state.loading);
  const handleChange = useProfileStore((state) => state.handleChange);
  const handleFileChange = useProfileStore((state) => state.handleFileChange);
  const handleEdit = useProfileStore((state) => state.handleEdit);
  const handleSave = useProfileStore((state) => state.handleSave);
  const handleCancel = useProfileStore((state) => state.handleCancel);
  const handleMediaUpload = useProfileStore((state) => state.handleMediaUpload);
  const setReloadAuthUser = useProfileStore((state) => state.setReloadAuthUser);

  // CORREÇÃO: Conecta o AuthContext ao ProfileStore.
  // Este useEffect injeta a função de recarregar o usuário (do AuthContext)
  // dentro do nosso store. Isso completa a "ponte" que permite ao store
  // forçar uma atualização do estado de autenticação global após salvar o perfil.
  useEffect(() => {
    if (reloadCurrentUser) {
      setReloadAuthUser(reloadCurrentUser);
    }
  }, [reloadCurrentUser, setReloadAuthUser]);

  const fetchUserProfile = useCallback(async () => {
    if (!username) {
      console.log('[ProfilePage] Username não encontrado:', username);
      setError({ type: 'not-found' });
      setPageLoading(false);
      return;
    }

    console.log('[ProfilePage] Buscando perfil para:', username);
    setPageLoading(true);
    setError(null);

    // Verificação mais robusta do cache
    if (
      form &&
      form.username &&
      form.username.toLowerCase() === username.toLowerCase()
    ) {
      console.log('[ProfilePage] Perfil já carregado no cache');
      setPageLoading(false);
      return;
    }

    try {
      console.log('[ProfilePage] Fazendo consulta ao Firestore...');
      const usersRef = collection(db, 'users_public');
      const q = query(
        usersRef,
        where('username', '==', username.toLowerCase())
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('[ProfilePage] Usuário não encontrado no Firestore');
        setError({ type: 'not-found' });
      } else {
        const userDoc = querySnapshot.docs[0];
        const userData = { id: userDoc.id, ...userDoc.data() };

        console.log('[ProfilePage] Perfil encontrado:', userData);

        // Definir os dados localmente também para debug
        setProfileData(userData);

        // Inicializar o store
        initialize(userData);

        if (currentUser) {
          setCurrentUser(currentUser);
        }
      }
    } catch (err) {
      console.error('[ProfilePage] Erro ao buscar perfil:', err);
      setError({
        type: 'network-error',
        message: `Erro de rede: ${err.message}`,
      });
    } finally {
      console.log('[ProfilePage] Finalizando carregamento');
      setPageLoading(false);
    }
  }, [username, currentUser, initialize, setCurrentUser, form]);

  useEffect(() => {
    console.log('[ProfilePage] useEffect disparado, username:', username);
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Log do estado atual para debug
  useEffect(() => {
    console.log('[ProfilePage] Estado atual:', {
      pageLoading,
      error,
      authLoading,
      username,
      currentUser: currentUser?.uid,
      form: form?.username,
      profileData: profileData?.username,
    });
  }, [
    pageLoading,
    error,
    authLoading,
    username,
    currentUser,
    form,
    profileData,
  ]);

  const isOwner =
    !authLoading && !!currentUser && form && currentUser.uid === form.id;

  // Renderização condicional com logs
  if (authLoading) {
    console.log('[ProfilePage] Aguardando autenticação...');
    return <LoadingSpinner text="Verificando autenticação..." />;
  }

  if (pageLoading) {
    console.log('[ProfilePage] Carregando perfil...');
    return <LoadingSpinner text="Carregando perfil..." />;
  }

  if (error) {
    console.log('[ProfilePage] Erro detectado:', error);
    if (error.type === 'not-found') return <NotFoundPage />;
    if (error.type === 'network-error') {
      return (
        <ErrorDisplay message={error.message} onRetry={fetchUserProfile} />
      );
    }
  }

  if (!form) {
    console.log('[ProfilePage] Form não encontrado');
    return <LoadingSpinner text="Preparando dados do perfil..." />;
  }

  if (form.username !== username.toLowerCase()) {
    console.log(
      '[ProfilePage] Username mismatch:',
      form.username,
      'vs',
      username.toLowerCase()
    );
    return <NotFoundPage />;
  }

  console.log('[ProfilePage] Renderizando perfil para:', form.username);

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
