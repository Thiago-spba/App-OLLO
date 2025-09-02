// ARQUIVO FINAL E DEFINITIVO: src/components/HomepageUsersCard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, limit, query } from 'firebase/firestore';

// CORREÇÃO FINAL E DEFINITIVA: O erro 'EISDIR' provou que 'firebase' é uma pasta.
// O caminho correto deve apontar para o arquivo DENTRO dela (provavelmente 'config.js' ou 'index.js').
// Se não funcionar, o nome do arquivo dentro da pasta firebase é diferente.
// Exemplo: se for firebase/core.js, o caminho seria '@/firebase/core'.
import { db } from '@/firebase/config';

import { useAuth } from '@/context/AuthContext';
import './HomepageUsersCard.css';

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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollectionRef = collection(db, 'users_public');
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
  }, []);

  return (
    <div className="bg-white dark:bg-ollo-deep/80 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/60">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
        Conecte-se na OLLO
      </h2>
      <div className="space-y-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <UserCardSkeleton key={index} />
            ))
          : users.map((user, index) => (
              <Link
                key={user.id}
                to={currentUser ? `/profile/${user.username}` : '/login'}
                className="flex items-center gap-4 p-2 -m-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 avatar-link"
              >
                <img
                  src={user.avatarUrl || '/images/default-avatar.png'}
                  alt={`Avatar de ${user.name}`}
                  className="h-12 w-12 rounded-full object-cover avatar-animate"
                  style={{ '--avatar-index': index }}
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
