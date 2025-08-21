// ARQUIVO CORRIGIDO: src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '../context/AuthContext';
import AuthWrapper from '../components/AuthWrapper';

// CORREÇÃO 1: O caminho foi ajustado para o local correto do nosso componente de UI.
import Profile from '../components/pages/profile';

import LoadingSpinner from '../components/ui/LoadingSpinner';

// CORREÇÃO 2: O caminho agora aponta para o arquivo que acabamos de criar.
import NotFoundPage from './NotFoundPage';

export default function ProfilePage() {
  const { username } = useParams();
  const { currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) return;

      setLoading(true);
      setError(false);
      setProfileUser(null);

      try {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('username', '==', username.toLowerCase())
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.error('[OLLO] Nenhum usuário encontrado com esse username.');
          setError(true);
        } else {
          const userDoc = querySnapshot.docs[0];
          setProfileUser({ id: userDoc.id, ...userDoc.data() });
        }
      } catch (err) {
        console.error('[OLLO] Erro ao buscar perfil do usuário:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  if (loading) {
    return <LoadingSpinner text="Carregando perfil..." />;
  }

  if (error || !profileUser) {
    return <NotFoundPage />;
  }

  const isOwner = currentUser?.uid === profileUser.id;

  return (
    <AuthWrapper>
      <Profile profileData={profileUser} isOwner={isOwner} />
    </AuthWrapper>
  );
}
