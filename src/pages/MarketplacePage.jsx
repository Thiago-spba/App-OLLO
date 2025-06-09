// src/pages/MarketplacePage.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import ListagemCard from '../components/ListagemCard.jsx';
function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsCollectionRef = collection(db, 'listagens');
        const data = await getDocs(listingsCollectionRef);

        const listingsData = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setListings(listingsData);
      } catch (error) {
        console.error('Erro ao buscar os anúncios: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-ollo-deep dark:text-ollo-accent-light">
        Marketplace OLLO
      </h1>

      <div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-ollo-accent dark:text-ollo-accent-light" />
            <p className="ml-3 text-lg text-gray-500 dark:text-gray-400">
              Carregando produtos...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.length > 0 ? (
              listings.map((item) => (
                <ListagemCard key={item.id} listing={item} />
              ))
            ) : (
              <p className="sm:col-span-2 lg:col-span-3 xl:col-span-4 text-center text-gray-500 dark:text-gray-400 py-20">
                Nenhum produto encontrado no momento.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MarketplacePage;
