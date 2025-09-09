// ARQUIVO FINAL E CORRIGIDO: src/pages/ProfilePage.jsx

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
  const { currentUser, loading: authLoading } = useAuth();

  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchUserProfile = useCallback(async () => {
    reset();

    if (!username) {
      setError({ type: 'not-found' });
      setPageLoading(false);
      return;
    }

    setPageLoading(true);
    setError(null);

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
        const userData = { id: userDoc.id, ...userDoc.data() };
        
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
      setPageLoading(false);
    }
  }, [username, currentUser, initialize, setCurrentUser, reset]);

  useEffect(() => {
    fetchUserProfile();
  }, [username]); // <<< MUDANÇA SUTIL: A dependência agora é `username` diretamente

  const isOwner = currentUser?.uid === form?.id;

  if (authLoading || pageLoading) {
    return <LoadingSpinner text="Carregando..." />;
  }

  if (error) {
    if (error.type === 'not-found') return <NotFoundPage />;
    return <ErrorDisplay message={error.message} onRetry={fetchUserProfile} />;
  }

  if (!form || !form.id) {
    return <NotFoundPage />;
  }

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
