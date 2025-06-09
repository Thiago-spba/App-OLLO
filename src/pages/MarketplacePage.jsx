// src/pages/MarketplacePage.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // CORRIGIDO: Nome da coleção bate com o do seu Firebase.
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
        // Garante que o loading termine, com ou sem erro.
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-ollo-deep dark:text-ollo-accent-light">
        Marketplace
      </h1>

      <div>
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">
            Carregando produtos...
          </p>
        ) : (
          <div className="space-y-4">
            {listings.length > 0 ? (
              listings.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white dark:bg-ollo-slate rounded-lg shadow text-left" // Adicionado text-left para alinhar
                >
                  {/* CORRIGIDO: Nomes dos campos batem com os do seu Firebase. */}
                  <h2 className="text-xl font-bold text-ollo-deep dark:text-ollo-light">
                    {item.título}
                  </h2>
                  <p className="text-lg text-ollo-accent dark:text-ollo-accent-light">
                    R$ {item.preço}
                  </p>
                  {/* Vamos adicionar a descrição também para ver mais dados */}
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {item.descrição}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum produto encontrado.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MarketplacePage;
