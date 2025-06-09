// src/components/ListingCard.jsx

import React from 'react';
import { Link } from 'react-router-dom'; // Para tornar o card clicável no futuro

function ListingCard({ listing }) {
  if (!listing) {
    return null;
  }

  // Extrai a primeira imagem do array, ou usa um placeholder se não houver imagem
  const imageUrl =
    listing.imageUrls && listing.imageUrls.length > 0
      ? listing.imageUrls[0]
      : `https://placehold.co/400x300/E0E1DD/0D1B2A?text=${encodeURIComponent(listing.título || 'Sem Imagem')}`;
  // Formata o preço para o padrão brasileiro (ex: 750 -> "750,00")
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(listing.preço || 0);

  return (
    // Link futuro para a página de detalhes do produto
    // <Link to={`/item/${listing.id}`} className="group block">
    <div className="group block overflow-hidden rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-ollo-slate shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative h-48 sm:h-56">
        <img
          src={imageUrl}
          alt={`Imagem de ${listing.título}`}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Tag de categoria */}
        {listing.categoria && (
          <span className="absolute top-3 right-3 bg-ollo-accent dark:bg-ollo-accent-light text-white dark:text-ollo-deep text-xs font-semibold px-2.5 py-1 rounded-full">
            {listing.categoria.charAt(0).toUpperCase() +
              listing.categoria.slice(1)}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3
          className="text-lg font-bold text-ollo-deep dark:text-ollo-light truncate"
          title={listing.título}
        >
          {listing.título}
        </h3>

        <p className="mt-2 text-xl font-black text-ollo-accent dark:text-ollo-accent-light">
          R$ {formattedPrice}
        </p>
      </div>
    </div>
    // </Link>
  );
}

export default ListingCard;
