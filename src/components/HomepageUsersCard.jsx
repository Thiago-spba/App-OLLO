// src/components/HomepageUsersCard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, limit, query } from 'firebase/firestore';

// CORREÇÃO: O caminho relativo foi trocado pelo alias do projeto ('@/').
// Isso garante que o sistema de build da Vercel consiga localizar o arquivo.
import { db } from '@/config/firebase';

// CORREÇÃO: O caminho do AuthContext também foi padronizado para manter a consistência.
import { useAuth } from '@/context/AuthContext';

import './HomepageUsersCard.css'; // Importando o CSS que você já criou!

// ARQUITETURA: Componente de esqueleto (Skeleton) para uma melhor UX durante o carregamento.
const UserCardSkeleton = () => (
  <div className="flex items-center gap-4 animate-pulse">
    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>
  </div>
);

const HomepageUsersCard = () => {
  // ARQUITETURA: Estado local para gerenciar a lista de usuários e o status de carregamento.
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth(); // Nossa fonte da verdade para saber se o visitante está logado.

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // MUDANÇA: Buscando da coleção 'users_public', que é permitida pelas nossas regras de segurança.
        const usersCollectionRef = collection(db, 'users_public');

        // PERFORMANCE: Usando limit() para buscar apenas os 5 primeiros usuários.
        // Isso evita buscar milhares de registros em uma página inicial.
        const q = query(usersCollectionRef, limit(5));

        const querySnapshot = await getDocs(q);
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error('Erro ao buscar usuários públicos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // O array de dependências vazio `[]` garante que isso rode apenas uma vez.

  return (
    <div className="bg-white dark:bg-ollo-deep/80 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/60">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
        Conecte-se na OLLO
      </h2>
      <div className="space-y-4">
        {loading
          ? // MUDANÇA: Exibe os skeletons enquanto os dados carregam.
            Array.from({ length: 4 }).map((_, index) => (
              <UserCardSkeleton key={index} />
            ))
          : users.map((user, index) => (
              // ARQUITETURA: O componente Link do react-router-dom lida com a navegação.
              // A lógica condicional `currentUser ? ... : ...` troca o destino do link.
              <Link
                key={user.id}
                to={currentUser ? `/profile/${user.username}` : '/login'}
                className="flex items-center gap-4 p-2 -m-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 avatar-link"
              >
                <img
                  src={user.avatarUrl || '/images/default-avatar.png'}
                  alt={`Avatar de ${user.name}`}
                  className="h-12 w-12 rounded-full object-cover avatar-animate"
                  style={{ '--avatar-index': index }} // Para o delay da animação CSS
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-50">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{user.username}
                  </p>
                </div>
              </Link>
            ))}
        {!loading && users.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nenhum usuário para mostrar ainda.
          </p>
        )}
      </div>
    </div>
  );
};

export default HomepageUsersCard;
