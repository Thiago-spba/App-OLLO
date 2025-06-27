import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';

function ExplorePage({ allPosts, onCommentSubmit }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('recentes');
  const [sortOrder, setSortOrder] = useState('recentes');
  const [displayedPosts, setDisplayedPosts] = useState([]);

  const handleFilterClick = (filterName) => {
    setActiveFilter(filterName);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  useEffect(() => {
    if (!allPosts) {
      setDisplayedPosts([]);
      return;
    }

    let postsParaProcessar = [...allPosts];

    if (activeFilter === 'seguindo') {
      postsParaProcessar = postsParaProcessar.filter(
        (post) => post.userName === 'Usuário OLLO'
      );
    } else if (activeFilter === 'populares') {
      postsParaProcessar.sort(
        (a, b) => (b.likeCount || 0) - (a.likeCount || 0)
      );
    }

    if (sortOrder === 'recentes') {
      postsParaProcessar.sort((a, b) => b.id - a.id);
    } else if (sortOrder === 'antigos') {
      postsParaProcessar.sort((a, b) => a.id - b.id);
    } else if (sortOrder === 'curtidos') {
      postsParaProcessar.sort(
        (a, b) => (b.likeCount || 0) - (a.likeCount || 0)
      );
    }

    setDisplayedPosts(postsParaProcessar);
  }, [allPosts, activeFilter, sortOrder]);

  // Função para checar login antes de interagir
  const handleInteraction = () => {
    if (!currentUser) {
      navigate('/login', { state: { message: 'Faça login para interagir!' } });
      return false;
    }
    return true;
  };

  // Botão de filtro
  const getFilterButtonClasses = (filterName) => {
    const isActive = activeFilter === filterName;
    const baseClasses =
      'px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-150 ease-in-out';

    if (isActive) {
      return `${baseClasses} bg-ollo-deep dark:bg-ollo-accent-light text-white dark:text-ollo-deep border border-transparent shadow-md`;
    }
    return `${baseClasses} bg-white/70 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 border border-gray-300/70 dark:border-gray-600/70 hover:bg-gray-200/70 dark:hover:bg-gray-600/80 hover:text-ollo-deep dark:hover:text-gray-100 hover:border-gray-400/70 dark:hover:border-gray-500/70`;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 sm:mb-8 text-center text-ollo-deep dark:text-ollo-accent-light">
        Explorar OLLO
      </h1>

      <div className="mb-8 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:gap-6">
        <div className="flex flex-col items-start space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          <label className="text-sm font-medium whitespace-nowrap text-gray-600 dark:text-gray-300">
            Filtrar por:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterClick('recentes')}
              className={getFilterButtonClasses('recentes')}
            >
              Recentes
            </button>
            <button
              onClick={() => handleFilterClick('populares')}
              className={getFilterButtonClasses('populares')}
            >
              Populares
            </button>
            <button
              onClick={() => handleFilterClick('seguindo')}
              className={getFilterButtonClasses('seguindo')}
            >
              Seguindo
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <label
            htmlFor="sort-order"
            className="text-sm font-medium whitespace-nowrap text-gray-600 dark:text-gray-300"
          >
            Ordenar por:
          </label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={handleSortChange}
            className="text-xs rounded-md py-1.5 px-2.5 focus:ring-1 appearance-none custom-select-arrow
                                   bg-white dark:bg-gray-800 
                                   border border-gray-300 dark:border-gray-600 
                                   text-gray-700 dark:text-gray-200 
                                   focus:ring-ollo-deep dark:focus:ring-ollo-accent-light 
                                   focus:border-ollo-deep dark:focus:border-ollo-accent-light"
          >
            <option value="recentes">Mais Recentes</option>
            <option value="antigos">Mais Antigos</option>
            <option value="curtidos">Mais Curtidos</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {displayedPosts.length > 0 ? (
          displayedPosts.map((post) => (
            <PostCard
              key={post.id}
              postData={post}
              currentUserId={currentUser?.uid}
              // Bloqueia toda interação para não logado!
              onCommentSubmit={(commentData) => {
                if (!handleInteraction()) return;
                if (onCommentSubmit) onCommentSubmit(commentData);
              }}
              onLike={() => {
                if (!handleInteraction()) return;
                // Adapte a lógica de curtir aqui
              }}
              onShare={() => {
                if (!handleInteraction()) return;
                // Adapte a lógica de compartilhar aqui
              }}
              variant="explore"
            />
          ))
        ) : (
          <div
            className="sm:col-span-full rounded-xl p-8 sm:p-12 text-center
              bg-gray-100 dark:bg-gray-800
              shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200">
              Oops! Parece que não há posts para explorar com os filtros atuais.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-2">
              {activeFilter !== 'recentes' || sortOrder !== 'recentes'
                ? 'Tente outros filtros ou opções de ordenação!'
                : 'Por que não criar o primeiro post?'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExplorePage;
