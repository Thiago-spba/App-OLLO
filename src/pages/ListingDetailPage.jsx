// src/pages/ListingDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase/config.js';
import { doc, getDoc } from 'firebase/firestore';
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

function ListingDetailPage() {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) {
        setError('ID do anúncio não encontrado.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const docRef = doc(db, 'listagens', listingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setListing(data);
          if (data.imageUrls && data.imageUrls.length > 0) {
            setSelectedImage(data.imageUrls[0]);
          }
        } else {
          setError('Anúncio não encontrado.');
        }
      } catch (err) {
        setError('Ocorreu um erro ao carregar o anúncio.');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [listingId]);

  // ... (Seu código de loading e error permanece aqui)
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ArrowPathIcon className="h-10 w-10 animate-spin text-ollo-accent" />
        <span className="ml-4 text-xl text-gray-600 dark:text-gray-400">
          Carregando detalhes...
        </span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-ollo-deep dark:text-ollo-light mb-2">
          Erro ao Carregar
        </h2>
        <p className="text-red-500 dark:text-red-400 mb-6">{error}</p>
        <Link
          to="/marketplace"
          className="px-4 py-2 bg-ollo-accent text-white rounded-lg hover:bg-opacity-90"
        >
          Voltar para o Marketplace
        </Link>
      </div>
    );
  }
  if (!listing) return null;

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(listing.price || 0);

  return (
    // O max-width e padding garantem que o conteúdo não fique colado nas bordas
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* 
              MUDANÇA PRINCIPAL: O grid só se torna de 5 colunas em telas grandes (lg).
              Em telas menores, ele é um grid de 1 coluna (o padrão), empilhando os itens.
            */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* --- COLUNA DAS IMAGENS (GALERIA) --- */}
        <div className="lg:col-span-3">
          <div className="aspect-w-16 aspect-h-12 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden mb-4 shadow-lg">
            <img
              src={
                selectedImage ||
                'https://placehold.co/800x600/E0E1DD/0D1B2A?text=Sem+Imagem'
              }
              alt={`Imagem principal de ${listing.title}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          </div>

          {listing.imageUrls && listing.imageUrls.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {listing.imageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(url)}
                  className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden transition-all duration-200
                                                border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-ollo-deep
                                                ${
                                                  selectedImage === url
                                                    ? 'border-ollo-accent dark:border-ollo-accent-light ring-2 ring-ollo-accent dark:ring-ollo-accent-light'
                                                    : 'border-transparent hover:border-gray-400 dark:hover:border-gray-500'
                                                }`}
                >
                  <img
                    src={url}
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- COLUNA DAS INFORMAÇÕES --- */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-ollo-slate p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ollo-deep dark:text-ollo-light mb-2">
              {listing.title}
            </h1>
            <p className="text-3xl lg:text-4xl font-black text-ollo-accent dark:text-ollo-accent-light mb-4">
              {formattedPrice}
            </p>

            <div className="border-t border-gray-200 dark:border-gray-700/50 my-4"></div>

            <h2 className="text-lg font-semibold text-ollo-deep dark:text-ollo-light mb-2">
              Descrição
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-6">
              {listing.description}
            </p>

            <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-ollo-deep dark:text-ollo-light mb-3">
                Informações do Vendedor
              </h3>
              <div className="flex items-center space-x-3">
                <UserCircleIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {listing.sellerName || 'Vendedor OLLO'}
                  </p>
                  <Link
                    to={`/profile/${listing.sellerId}`}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Ver perfil
                  </Link>
                </div>
              </div>
            </div>

            <button className="mt-6 w-full py-3 px-6 bg-ollo-accent hover:bg-opacity-90 text-white font-bold rounded-lg shadow-lg transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ollo-accent-light">
              Entrar em Contato
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingDetailPage;
