// src/components/ListagemCard.jsx

import React from 'react';

function ListingCard({ listing }) {
  if (!listing) {
    return null;
  }

  // CORRIGIDO PARA USAR OS NOMES EXATOS DO SEU FIREBASE
  const nomeCampoImagem = 'URLs de imagem'; // Nome exato do campo no Firebase
  const nomeCampoTitulo = 'título'; // Nome exato
  const nomeCampoPreco = 'De preço'; // Nome exato
  const nomeCampoCategoria = 'categoria'; // Nome exato

  const imageUrl =
    listing[nomeCampoImagem] && listing[nomeCampoImagem].length > 0
      ? listing[nomeCampoImagem][0]
      : `https://placehold.co/400x300/E0E1DD/0D1B2A?text=${encodeURIComponent(listing[nomeCampoTitulo] || 'Sem Imagem')}`;

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(listing[nomeCampoPreco] || 0);

  return (
    <div className="group block overflow-hidden rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-ollo-slate shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative h-48 sm:h-56">
        <img
          src={imageUrl}
          alt={`Imagem de ${listing[nomeCampoTitulo]}`}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {listing[nomeCampoCategoria] && (
          <span className="absolute top-3 right-3 bg-ollo-accent dark:bg-ollo-accent-light text-white dark:text-ollo-deep text-xs font-semibold px-2.5 py-1 rounded-full">
            {listing[nomeCampoCategoria].charAt(0).toUpperCase() +
              listing[nomeCampoCategoria].slice(1)}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3
          className="text-lg font-bold text-ollo-deep dark:text-ollo-light truncate"
          title={listing[nomeCampoTitulo]}
        >
          {listing[nomeCampoTitulo]}
        </h3>

        <p className="mt-2 text-xl font-black text-ollo-accent dark:text-ollo-accent-light">
          {formattedPrice}
        </p>
      </div>
    </div>
  );
}

export default ListingCard;
