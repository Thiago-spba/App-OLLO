// src/pages/MarketplacePage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
// 👇 ADICIONADO: 'doc' e 'deleteDoc' para a funcionalidade de exclusão
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import ListagemCard from '../components/ListagemCard.jsx';

function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const listingsCollectionRef = collection(db, 'listagens');
        const q = query(listingsCollectionRef, orderBy('createdAt', 'desc'));
        const data = await getDocs(q);
        const listingsData = data.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setListings(listingsData);
        setError(null);
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
  }, []);

  // 👇 PASSO 1: CRIAR A FUNÇÃO DE EXCLUSÃO
  const handleDeleteListing = async (listingId) => {
    // Confirmação para evitar exclusão acidental
    if (
      !window.confirm(
        'Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.'
      )
    ) {
      return;
    }

    try {
      // Cria uma referência para o documento específico que queremos deletar
      const listingDocRef = doc(db, 'listagens', listingId);
      // Deleta o documento no Firestore
      await deleteDoc(listingDocRef);

      // Atualiza o estado local para remover o item da tela imediatamente (UI Otimista)
      setListings((currentListings) =>
        currentListings.filter((item) => item.id !== listingId)
      );

      console.log(`Anúncio ${listingId} excluído com sucesso!`);
    } catch (err) {
      console.error('Erro ao excluir anúncio:', err);
      alert('Ocorreu um erro ao tentar excluir o anúncio. Tente novamente.');
    }
  };

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
          // 👇 PASSO 2: PASSAR A FUNÇÃO COMO PROP
          <ListagemCard
            key={item.id}
            listing={item}
            onDelete={handleDeleteListing} // Passando a função de exclusão
          />
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
