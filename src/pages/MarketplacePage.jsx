// src/pages/MarketplacePage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase/config.js'; // A importação já estava correta
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; // Importando query e orderBy
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import ListagemCard from '../components/ListagemCard.jsx';

function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // REFINAMENTO 1: Envolvemos a função assíncrona dentro do useEffect
    // para deixar claro que ela só pertence a este efeito.
    const fetchListings = async () => {
      setLoading(true); // Garante que o loading seja reativado se a página recarregar
      try {
        // REFINAMENTO 2: Adicionamos uma query para ordenar os produtos pelo mais recente
        const listingsCollectionRef = collection(db, 'listagens');
        const q = query(listingsCollectionRef, orderBy('createdAt', 'desc')); // Ordena por data de criação, do mais novo para o mais antigo

        const data = await getDocs(q); // Executa a query

        const listingsData = data.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setListings(listingsData);
        setError(null); // Limpa qualquer erro anterior
      } catch (err) {
        console.error('Erro ao buscar anúncios:', err);
        setError(
          'Não foi possível carregar os produtos. Tente novamente mais tarde.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListings();

    // O array de dependências vazio [] garante que o useEffect rode apenas uma vez,
    // quando o componente é montado. Isso está correto.
  }, []);

  // Função para renderizar o conteúdo principal
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-ollo-accent dark:text-ollo-accent-light" />
          <p className="ml-3 text-lg text-gray-500 dark:text-gray-400">
            Carregando produtos...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-20">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      );
    }

    if (listings.length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum produto encontrado no momento.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((item) => (
          <ListagemCard key={item.id} listing={item} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-ollo-deep dark:text-ollo-accent-light">
          Marketplace OLLO
        </h1>
        <Link
          to="/marketplace/criar"
          className="w-full sm:w-auto flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ollo-accent hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ollo-accent-light transition-transform active:scale-95"
        >
          Anunciar Produto
        </Link>
      </header>

      <main>{renderContent()}</main>
    </div>
  );
}

export default MarketplacePage;
