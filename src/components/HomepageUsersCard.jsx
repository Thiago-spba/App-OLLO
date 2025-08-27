import React, { useEffect, useState } from "react";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import './HomepageUsersCard.css';

export default function HomepageUsersCard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // CORREÇÃO: Buscar da coleção users_public em vez de users
        // Essa coleção tem acesso público conforme firestore.rules
        const usersQuery = query(
          collection(db, "users_public"),
          orderBy("createdAt", "desc"),
          limit(24)
        );
        const querySnapshot = await getDocs(usersQuery);
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("[OLLO] Erro ao buscar usuários:", error);
        // Mesmo com erro, definimos um array vazio para evitar problemas de renderização
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Função para obter a inicial do nome do usuário para o fallback do avatar
  const getInitial = (name) => {
    return name && typeof name === 'string' 
      ? name.charAt(0).toUpperCase()
      : '?';
  };
  
  // Gera cor de fundo para avatar sem foto baseado no userId
  const getAvatarBgColor = (userId) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
      'bg-red-500', 'bg-orange-500', 'bg-teal-500'
    ];
    
    // Usa o ID do usuário para escolher uma cor consistente
    const charSum = userId.split('').reduce(
      (sum, char) => sum + char.charCodeAt(0), 0
    );
    
    return colors[charSum % colors.length];
  };

  return (
    <div className={`w-full shadow-lg rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Comunidade OLLO</h2>
        <Link 
          to="/users" 
          className="text-sm text-ollo-accent hover:underline"
        >
          Ver todos
        </Link>
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-8 h-8 border-4 border-ollo-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8 justify-items-center">
            {users.map((user, index) => (
              <Link
                to={`/profile/${user.username || user.id}`}
                key={user.id}
                className="transition-transform hover:scale-110 avatar-animate"
                style={{"--avatar-index": index}}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-ollo-accent dark:hover:border-ollo-accent-light">
                  {user.avatarUrl || user.photoURL ? (
                    <img 
                      src={user.avatarUrl || user.photoURL} 
                      alt={user.name || "Usuário"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/default-avatar.png";
                      }}
                    />
                  ) : (
                    <div className={`
                      w-full h-full flex items-center justify-center
                      text-white font-medium
                      ${getAvatarBgColor(user.id)}
                    `}>
                      {getInitial(user.name || user.displayName)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
