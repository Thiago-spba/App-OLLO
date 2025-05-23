// src/pages/ExplorePage.jsx
import { useState } from 'react';
import PostCard from '../components/PostCard';
// Importe aqui quaisquer ícones que possa querer usar para os filtros/ordenação no futuro
// import { FunnelIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

function ExplorePage({ allPosts, onCommentSubmit, darkMode }) { // Adicionada a prop darkMode
  const [activeFilter, setActiveFilter] = useState('recentes');

  const handleFilterClick = (filterName) => {
    setActiveFilter(filterName);
    console.log("Filtro ativo:", filterName); 
  };

  // Ajustando as classes dos botões de filtro para o novo fundo claro da página
  const commonFilterButtonClasses = "px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-150 ease-in-out";
  
  // Estilo para o botão de filtro ATIVO sobre fundo claro
  const activeFilterClasses = darkMode 
    ? "bg-ollo-deep/70 text-ollo-accent-light border border-ollo-accent-light/50 shadow-md" 
    : "bg-ollo-accent-light text-ollo-deep border border-transparent shadow-md";
  
  // Estilo para botões de filtro INATIVOS sobre fundo claro
  const inactiveFilterClasses = darkMode
    ? "bg-gray-700/50 text-gray-300 border border-gray-600/70 hover:bg-gray-600/80 hover:text-gray-100 hover:border-gray-500/70"
    : "bg-white/70 text-gray-500 border border-gray-300/70 hover:bg-gray-200/70 hover:text-ollo-deep hover:border-gray-400/70";

  // Estilo para o select de ordenação sobre fundo claro
  const selectClasses = darkMode
    ? "text-xs bg-gray-800 border border-gray-600 text-gray-200 rounded-md py-1.5 px-2.5 focus:ring-1 focus:ring-ollo-accent-light focus:border-ollo-accent-light appearance-none custom-select-arrow"
    : "text-xs bg-white border border-gray-300 text-gray-700 rounded-md py-1.5 px-2.5 focus:ring-1 focus:ring-ollo-deep focus:border-ollo-deep appearance-none custom-select-arrow-light";


  return (
    <div>
      <h1 className={`text-3xl font-bold mb-6 sm:mb-8 text-center ${darkMode ? 'text-ollo-accent-light' : 'text-ollo-deep'}`}>
        Explorar OLLO
      </h1>

      {/* --- SEÇÃO DE FILTROS SEM FUNDO PRÓPRIO --- */}
      <div className="mb-8 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:gap-6">
        {/* Filtros */}
        <div className="flex flex-col items-start space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          <label htmlFor="filter-category" className={`text-sm font-medium whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Filtrar por:</label>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handleFilterClick('recentes')}
              className={`${commonFilterButtonClasses} ${activeFilter === 'recentes' ? activeFilterClasses : inactiveFilterClasses}`}
            >
              Recentes
            </button>
            <button 
              onClick={() => handleFilterClick('populares')}
              className={`${commonFilterButtonClasses} ${activeFilter === 'populares' ? activeFilterClasses : inactiveFilterClasses}`}
            >
              Populares
            </button>
            <button 
              onClick={() => handleFilterClick('seguindo')}
              className={`${commonFilterButtonClasses} ${activeFilter === 'seguindo' ? activeFilterClasses : inactiveFilterClasses}`}
            >
              Seguindo
            </button>
          </div>
        </div>
        
        {/* Ordenação */}
        <div className="flex items-center space-x-3">
          <label htmlFor="sort-order" className={`text-sm font-medium whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Ordenar por:</label>
          <select 
            id="sort-order"
            className={selectClasses}
          >
            <option>Mais Recentes</option>
            <option>Mais Antigos</option>
            <option>Mais Curtidos</option>
          </select>
        </div>
      </div>
      {/* --- FIM DA SEÇÃO DE FILTROS --- */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {allPosts && allPosts.length > 0 ? (
          allPosts.map((post) => (
            <PostCard
              key={post.id}
              postData={post}
              onCommentSubmit={onCommentSubmit}
              variant="explore"
              darkMode={darkMode} // Passando darkMode para o PostCard
            />
          ))
        ) : (
          // Mensagem "Nenhum post" adaptada para tema claro/escuro
          <div className={`sm:col-span-2 lg:col-span-3 xl:col-span-4 rounded-xl p-8 sm:p-12 text-center 
            ${darkMode 
              ? 'bg-gray-800/50 border border-gray-700/50' 
              : 'bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/80'
            }`}
          >
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-base sm:text-lg`}>
              Oops! Parece que não há posts para explorar no momento.
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>Por que não criar o primeiro?</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default ExplorePage;

// Adicione ao seu CSS global (ex: src/index.css) para estilizar a seta do select, se desejar uma customizada:
/*
.custom-select-arrow { // Para tema escuro
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23A0D2DB' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); // Cor da seta ollo-accent-light
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem; 
}
.custom-select-arrow-light { // Para tema claro
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23005A4B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); // Cor da seta ollo-deep
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
*/