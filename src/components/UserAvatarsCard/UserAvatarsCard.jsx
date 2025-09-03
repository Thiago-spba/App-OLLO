// ARQUIVO: src/components/UserAvatarsCard/UserAvatarsCard.jsx

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../Avatar'; // MUDANÇA: Importando nosso componente Avatar
import './UserAvatarsCard.css';

const UserAvatarsCard = ({
  title = 'Comunidade OLLO',
  description = '',
  limit: maxUsers = 24,
  orderBy: orderByField = 'createdAt',
  orderDirection = 'desc',
  showDisplayName = false,
  className = '',
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let usersCollection = collection(db, 'users_public');

        let usersQuery = query(
          usersCollection,
          orderBy(orderByField, orderDirection),
          limit(maxUsers)
        );

        const querySnapshot = await getDocs(usersQuery);
        let fetchedUsers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(fetchedUsers);
      } catch (err) {
        console.error('[OLLO] Erro ao buscar usuários:', err);
        setError('Não foi possível carregar os usuários');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [orderByField, orderDirection, maxUsers]);

  return (
    <div
      className={`w-full rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-md ${className}`}
    >
      {/* Cabeçalho do card */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>

      {/* Corpo do card */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            Nenhum usuário encontrado
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {users.map((user, index) => (
              <Link
                to={`/profile/${user.username || user.id}`}
                key={user.id}
                className="block"
                title={
                  user.name ||
                  user.displayName ||
                  user.username ||
                  'Usuário OLLO'
                }
                aria-label={`Ver perfil de ${user.name || user.displayName || user.username || 'Usuário'}`}
              >
                <div className="flex flex-col items-center group">
                  <div
                    className="
                    relative transition-transform duration-300 
                    group-hover:scale-110
                    group-hover:ring-2 group-hover:ring-blue-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    rounded-full
                  "
                  >
                    {/* CORREÇÃO PRINCIPAL: Usando nosso componente Avatar e filtrando URLs do logo */}
                    <Avatar
                      src={
                        user.avatarUrl &&
                        !user.avatarUrl.includes('logo') &&
                        !user.avatarUrl.includes('ollo') &&
                        user.avatarUrl !== '/images/logo-ollo.png'
                          ? user.avatarUrl || user.photoURL
                          : null
                      }
                      alt={`Avatar de ${user.name || user.displayName || user.username || 'Usuário'}`}
                      className="w-12 h-12 rounded-full object-cover text-gray-400 dark:text-gray-600"
                    />

                    {/* Indicador de status online (opcional) */}
                    {user.isOnline && (
                      <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                    )}
                  </div>

                  {/* Nome do usuário (condicional) */}
                  {showDisplayName && (
                    <span className="mt-1 text-xs text-center truncate w-full">
                      {user.name || user.displayName ? (
                        <span className="font-medium">
                          {(user.name || user.displayName).split(' ')[0]}
                        </span>
                      ) : (
                        <span className="italic text-gray-500 dark:text-gray-400">
                          @{user.username || 'user'}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Rodapé do card */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-right">
        <Link
          to="/users"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          Ver todos →
        </Link>
      </div>
    </div>
  );
};

UserAvatarsCard.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  limit: PropTypes.number,
  orderBy: PropTypes.string,
  orderDirection: PropTypes.oneOf(['asc', 'desc']),
  showDisplayName: PropTypes.bool,
  className: PropTypes.string,
};

export default UserAvatarsCard;
