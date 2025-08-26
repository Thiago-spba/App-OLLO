// ARQUIVO FINAL E SINTATICAMENTE CORRIGIDO: src/pages/ProfilePage.jsx

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

// Componente de UI para exibição de erro de rede.
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
  const { currentUser, loading: authLoading } = useAuth();

  // Selecionando todo o estado e ações necessárias no componente container.
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

  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  // O useCallback está correto, ele memoriza a função fetchUserProfile.
  const fetchUserProfile = useCallback(async () => {
    if (!username) {
      setError({ type: 'not-found' });
      setPageLoading(false);
      return;
    }
    setPageLoading(true);
    setError(null);

    if (form && form.username === username.toLowerCase()) {
      setPageLoading(false);
      return;
    }

    try {
      const usersRef = collection(db, 'users_public');
      const q = query(
        usersRef,
        where('username', '==', username.toLowerCase())
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setError({ type: 'not-found' });
      } else {
        const userDoc = querySnapshot.docs[0];
        const profileData = { id: userDoc.id, ...userDoc.data() };
        initialize(profileData);
        if (currentUser) {
          setCurrentUser(currentUser);
        }
      }
    } catch (err) {
      console.error('[OLLO] Erro ao buscar perfil do usuário:', err);
      setError({
        type: 'network-error',
        message: 'Não foi possível carregar o perfil. Verifique sua conexão.',
      });
    } finally {
      setPageLoading(false);
    }
  }, [username, currentUser, initialize, setCurrentUser, form]);

  // O useEffect chama a função memorizada. A sintaxe está correta.
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Centralizando a lógica de "dono do perfil"
  const isOwner =
    !authLoading && !!currentUser && form && currentUser.uid === form.id;

  // As guardas de renderização devem estar na ordem correta:
  // 1. Carregamento da página
  // 2. Erro
  // 3. Dados não encontrados
  if (pageLoading) {
    return <LoadingSpinner text="Carregando perfil..." />;
  }

  if (error) {
    if (error.type === 'not-found') {
      return <NotFoundPage />;
    }
    if (error.type === 'network-error') {
      return (
        <ErrorDisplay message={error.message} onRetry={fetchUserProfile} />
      );
    }
  }

  if (!form || form.username !== username.toLowerCase()) {
    return <NotFoundPage />;
  }

  // Renderização de sucesso com todas as props sendo passadas.
  return (
    <main className="max-w-2xl mx-auto my-4 md:my-8 px-4">
      {/* Usamos um div ou Fragment para agrupar e aplicar o espaçamento */}
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
