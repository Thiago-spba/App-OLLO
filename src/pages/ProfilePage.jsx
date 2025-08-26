// ARQUIVO FINAL E CORRIGIDO: src/pages/ProfilePage.jsx

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';

// CORREÇÃO FINAL: O caminho foi ajustado para a localização exata do arquivo, descoberta via terminal.
import { db } from '../firebase/config'; // <--- ESTA É A LINHA CORRIGIDA

import { useAuth } from '../context/AuthContext';
import { useProfileStore } from '../hooks/useProfileStore';
import { shallow } from 'zustand/shallow';

import ProfileHeader from '../components/pages/profile/ProfileHeader';
import ProfileBio from '../components/pages/profile/ProfileBio';
import ProfileGallery from '../components/pages/profile/ProfileGallery';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import NotFoundPage from './NotFoundPage';

export default function ProfilePage() {
  const { username } = useParams();
  const { currentUser } = useAuth();

  const { initialize, setCurrentUser } = useProfileStore(
    (state) => ({
      initialize: state.initialize,
      setCurrentUser: state.setCurrentUser,
    }),
    shallow
  );

  const form = useProfileStore((state) => state.form);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) {
        setLoading(false);
        setError(true);
        return;
      }

      setLoading(true);
      setError(false);

      if (form && form.username === username.toLowerCase()) {
        console.log(
          '[OLLO] Perfil encontrado no cache do store. Exibindo dados.'
        );
        setLoading(false);
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
          setError(true);
        } else {
          const userDoc = querySnapshot.docs[0];
          const profileData = { id: userDoc.id, ...userDoc.data() };

          initialize(profileData);
          setCurrentUser(currentUser);
        }
      } catch (err) {
        console.error('[OLLO] Erro ao buscar perfil do usuário:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username, currentUser, initialize, setCurrentUser, form]);

  if (loading) {
    return <LoadingSpinner text="Carregando perfil..." />;
  }

  if (error) {
    return <NotFoundPage />;
  }

  return (
    <main className="max-w-2xl mx-auto my-4 md:my-8 px-4">
      <ProfileHeader />
      <ProfileBio />
      <ProfileGallery />
    </main>
  );
}
