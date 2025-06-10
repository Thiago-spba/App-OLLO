import React from 'react';

function ListingCard({ listing }) {
  if (!listing) {
    return null;
  }

  const { title, price, category, imageUrls } = listing;

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

  return (
    <div className="group block overflow-hidden rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-ollo-slate shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
      <div className="relative h-48 sm:h-56">
        <img
          src={displayImageUrl}
          alt={`Imagem de ${title}`}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {formattedCategory && (
          <span className="absolute top-3 right-3 bg-ollo-accent dark:bg-ollo-accent-light text-white dark:text-ollo-deep text-xs font-semibold px-2.5 py-1 rounded-full">
            {formattedCategory}
          </span>
        )}
      </div>

      <div className="p-4">
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
    </div>
  );
}

export default ListingCard;
