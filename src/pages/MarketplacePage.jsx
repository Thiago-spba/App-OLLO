// src/pages/MarketplacePage.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config.js';
import { collection, getDocs } from 'firebase/firestore';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import ListagemCard from '../components/ListagemCard.jsx';

function MarketplacePage() {
  console.log('1. Componente MarketplacePage MONTADO.');

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('2. useEffect INICIADO.');

    const fetchListings = async () => {
      console.log('3. Função fetchListings CHAMADA.');
      try {
        console.log("4. Acessando a coleção 'listagens'...");
        const listingsCollectionRef = collection(db, 'listagens');
        const data = await getDocs(listingsCollectionRef);

        console.log(
          '5. DADOS RECEBIDOS! Total de documentos:',
          data.docs.length
        );

        const listingsData = data.docs.map((doc) => {
          console.log(` - Mapeando documento ID: ${doc.id}`, doc.data());
          return {
            ...doc.data(),
            id: doc.id,
          };
        });

        console.log('6. Dados finais mapeados para o estado:', listingsData);
        setListings(listingsData);
        setError(null);
      } catch (err) {
        console.error('ERRO FATAL AO BUSCAR OS ANÚNCIOS:', err);
        setError('Não foi possível carregar os produtos. Verifique o console.');
      } finally {
        console.log("7. 'finally' alcançado, setLoading será 'false'.");
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  console.log(
    '8. RENDERIZANDO com loading:',
    loading,
    '| listings:',
    listings.length
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-ollo-deep dark:text-ollo-accent-light">
        Marketplace OLLO
      </h1>
      <div>
        {loading && (
          <div className="flex justify-center items-center py-20">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-ollo-accent dark:text-ollo-accent-light" />
            <p className="ml-3 text-lg text-gray-500 dark:text-gray-400">
              Carregando produtos...
            </p>
          </div>
        )}

        {error && (
          <p className="sm:col-span-full text-center text-red-500 dark:text-red-400 py-20">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.length > 0 ? (
              listings.map((item) => (
                <ListagemCard key={item.id} listing={item} />
              ))
            ) : (
              <p className="sm:col-span-full text-center text-gray-500 dark:text-gray-400 py-20">
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
