// src/components/ListagemCard.jsx

import React from 'react';
import { Link } from 'react-router-dom'; // Importar Link para o botão de editar
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'; // Ícones para os botões

// 👇 RECEBENDO A PROP 'onDelete'
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

  // 👇 FUNÇÃO CHAMADA QUANDO O BOTÃO DE LIXEIRA É CLICADO
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Impede que o clique no botão também "clique" no card inteiro
    e.preventDefault(); // Impede qualquer comportamento padrão do link/botão
    if (onDelete) {
      onDelete(id); // Chama a função que recebemos do pai, passando o ID deste anúncio
    }
  };

  return (
    // Removido 'group block' e 'cursor-pointer' para que o clique seja apenas nos botões
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-ollo-slate shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative h-48 sm:h-56">
        <img
          src={displayImageUrl}
          alt={`Imagem de ${title}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {formattedCategory && (
          <span className="absolute top-3 right-3 bg-ollo-accent dark:bg-ollo-accent-light text-white dark:text-ollo-deep text-xs font-semibold px-2.5 py-1 rounded-full">
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

        {/* 👇 PASSO 3: ADICIONAR OS BOTÕES DE AÇÃO */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50 flex justify-end space-x-2">
          {/* BOTÃO DE EDITAR (por enquanto, apenas um link) */}
          <Link
            to={`/marketplace/editar/${id}`} // Link para uma futura página de edição
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="Editar Anúncio"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </Link>

          {/* BOTÃO DE EXCLUIR */}
          <button
            onClick={handleDeleteClick}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="Excluir Anúncio"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ListingCard;
