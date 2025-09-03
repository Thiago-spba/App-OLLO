// ARQUIVO: src/components/HomepageUsersCard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import Avatar from './Avatar'; // MUDANÇA: Importando nosso novo componente Avatar
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

// MELHORIA: Simplificamos o UserRow para usar o componente Avatar.
const UserRow = ({ user, index }) => {
  const { currentUser } = useAuth();

  return (
    <Link
      to={currentUser ? `/profile/${user.username}` : '/login'}
      className="flex items-center gap-4 p-2 -m-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 avatar-link"
    >
      {/* CORREÇÃO: A lógica complexa foi substituída pelo nosso componente centralizado <Avatar /> */}
      <Avatar
        src={user.avatarUrl}
        alt={`Avatar de ${user.name}`}
        className="h-12 w-12 rounded-full object-cover avatar-animate text-gray-300 dark:text-gray-600"
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
  );
};

const HomepageUsersCard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersCollectionRef = collection(db, 'users_public');
        const q = query(usersCollectionRef, limit(6));
        const querySnapshot = await getDocs(q);

        const usersList = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.id !== currentUser?.uid)
          .slice(0, 5);

        setUsers(usersList);
      } catch (error) {
        console.error('Erro ao buscar usuários públicos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  return (
    <div className="bg-white dark:bg-ollo-deep/80 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/60">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
        Conecte-se na OLLO
      </h2>
      <div className="space-y-4">
        {loading
          ? Array.from({ length: 5 }).map((_, index) => (
              <UserCardSkeleton key={index} />
            ))
          : users.map((user, index) => (
              <UserRow key={user.id} user={user} index={index} />
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
