// src/components/ListagemCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

function ListingCard({ listing, onDelete }) {
  if (!listing) {
    return null;
  }

  const { id, title, price, category, imageUrls } = listing;

  const displayImageUrl =
    imageUrls && imageUrls.length > 0
      ? imageUrls[0]
      : `https://placehold.co/400x300/E0E1DD/0D1B2A?text=${encodeURIComponent(title || 'Sem Imagem')}`;

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price || 0);

  const formattedCategory = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : '';

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDelete) {
      onDelete(id);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    // No futuro, isso pode abrir um modal de edição ou navegar
    // Por enquanto, vamos apenas navegar para a página de edição
    // Importante: use o hook useNavigate se for fazer a navegação programaticamente
    alert(
      `Navegando para a página de edição de ${id} (funcionalidade a ser implementada)`
    );
  };

  return (
    // O componente <Link> agora envolve todo o card
    <Link
      to={`/marketplace/detalhes/${id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-ollo-slate shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="relative h-48 sm:h-56">
        <img
          src={displayImageUrl}
          alt={`Imagem de ${title}`}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {formattedCategory && (
          <span className="absolute top-3 right-3 bg-ollo-accent dark:bg-ollo-accent-light text-white dark:text-ollo-deep text-xs font-semibold px-2.5 py-1 rounded-full z-10">
            {formattedCategory}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3
            className="text-lg font-bold text-ollo-deep dark:text-ollo-light truncate"
            title={title}
          >
            {title || 'Anúncio sem título'}
          </h3>

          <p className="mt-2 text-xl font-black text-ollo-accent dark:text-ollo-accent-light">
            {formattedPrice}
          </p>
        </div>

        {/* Os botões de ação agora ficam por cima, mas não fazem parte do link principal */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50 flex justify-end space-x-2">
          <button
            onClick={handleEditClick} // Usamos um handler para impedir a navegação
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="Editar Anúncio"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>

          <button
            onClick={handleDeleteClick} // Handler que já impede a navegação
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="Excluir Anúncio"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Link>
  );
}

export default ListingCard;
