// ARQUIVO FINALIZADO E CORRIGIDO: src/pages/ProfilePage.jsx

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '../context/AuthContext';

// MUDANÇA CRÍTICA: Corrigimos o nome da importação para corresponder ao nosso store.
import { useProfileStore } from '../hooks/useProfileStore';

import AuthWrapper from '../components/AuthWrapper';
import Profile from '../components/pages/profile'; // O componente de apresentação
import LoadingSpinner from '../components/ui/LoadingSpinner';
import NotFoundPage from './NotFoundPage';

// ARQUITETURA: Este componente agora atua como um "Container Inteligente" ou "Orquestrador".
// Sua única responsabilidade é:
// 1. Buscar os dados do perfil com base na URL.
// 2. Inicializar o estado global (Zustand store) com esses dados.
// 3. Renderizar o componente de apresentação ou os estados de erro/loading.
export default function ProfilePage() {
  const { username } = useParams();
  const { currentUser } = useAuth();

  // MUDANÇA: Usamos o nome correto do store para pegar a ação `initialize`.
  const { initialize, setCurrentUser } = useProfileStore(
    (state) => state.actions
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) return;

      setLoading(true);
      setError(false);

      try {
        const usersRef = collection(db, 'users_public');
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
          const profileData = { id: userDoc.id, ...userDoc.data() };
          const isOwner = currentUser?.uid === profileData.id;

          // CORREÇÃO: Ponto central da refatoração.
          // Em vez de passar dados via props, nós inicializamos o store global.
          // Agora, qualquer componente dentro de <Profile /> pode acessar esses dados.
          initialize(profileData);
          setCurrentUser({ ...currentUser, isOwner }); // Também informamos ao store quem é o dono.
        }
      } catch (err) {
        console.error('[OLLO] Erro ao buscar perfil do usuário:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username, currentUser, initialize, setCurrentUser]);

  if (loading) {
    return <LoadingSpinner text="Carregando perfil..." />;
  }

  if (error) {
    return <NotFoundPage />;
  }

  // ARQUITETURA: O componente <Profile /> não recebe mais props.
  // Ele se tornou autossuficiente, lendo tudo o que precisa diretamente do
  // store `useProfileStore`.
  return (
    <AuthWrapper>
      <Profile />
    </AuthWrapper>
  );
}
