// src/pages/CreateListingPage.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext'; // MUDANÇA 1: Importa o useAuth
import {
  TagIcon,
  CurrencyDollarIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  PhotoIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'uuid';

const CreateListingPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // MUDANÇA 2: Pega o usuário logado do contexto
  const [serverError, setServerError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newFiles = filesArray.slice(0, 5 - imageFiles.length);
      setImageFiles((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      e.target.value = null;
    }
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (!currentUser) {
      setServerError('Você precisa estar logado para criar um anúncio.');
      return;
    }
    if (imageFiles.length === 0) {
      setServerError('Por favor, adicione pelo menos uma imagem.');
      return;
    }
    setServerError('');

    try {
      const imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const imageRef = ref(
            storage,
            `listings/${currentUser.uid}/${uuidv4()}-${file.name}`
          );
          await uploadBytes(imageRef, file);
          return getDownloadURL(imageRef);
        })
      );

      // MUDANÇA 3: Usa os dados do currentUser em vez de valores fixos
      await addDoc(collection(db, 'listagens'), {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category.toLowerCase(),
        imageUrls: imageUrls,
        sellerId: currentUser.uid, // <-- CORRIGIDO
        sellerName: currentUser.name, // <-- CORRIGIDO
        status: 'active',
        isPromoted: false,
        createdAt: serverTimestamp(),
      });

      console.log('Anúncio e imagens salvos com sucesso!');
      navigate('/marketplace');
    } catch (error) {
      console.error('Erro ao criar anúncio:', error);
      // Aqui você pode verificar se o erro é de permissão do Firestore
      if (error.code === 'permission-denied') {
        setServerError(
          'Você não tem permissão para criar anúncios. Verifique suas regras de segurança no Firebase.'
        );
      } else {
        setServerError(
          'Ocorreu um erro ao criar seu anúncio. Tente novamente.'
        );
      }
    }
  };

  const getInputClasses = (fieldName) => {
    const base =
      'mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 shadow-sm focus:ring-opacity-50 pl-10';
    const error =
      'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500';
    const normal =
      'focus:border-ollo-deep dark:focus:border-ollo-accent-light focus:ring-ollo-deep dark:focus:ring-ollo-accent-light';
    return `${base} ${errors[fieldName] ? error : normal}`;
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-center text-ollo-deep dark:text-ollo-accent-light mb-8">
        Anunciar Novo Item
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 bg-white dark:bg-ollo-slate p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Imagens do Produto (até 5)
          </label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 dark:border-gray-100/25 px-6 py-10">
            <div className="text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-500" />
              <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-transparent font-semibold text-ollo-accent dark:text-ollo-accent-light focus-within:outline-none focus-within:ring-2 focus-within:ring-ollo-accent focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900 hover:text-ollo-deep dark:hover:text-white"
                >
                  <span>Carregue os arquivos</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                    disabled={imageFiles.length >= 5}
                  />
                </label>
                <p className="pl-1">ou arraste e solte</p>
              </div>
              <p className="text-xs leading-5 text-gray-600 dark:text-gray-500">
                PNG, JPG, GIF até 5MB
              </p>
            </div>
          </div>
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Título do Anúncio
          </label>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pt-6 pointer-events-none">
            <PencilSquareIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            id="title"
            type="text"
            {...register('title', { required: 'O título é obrigatório' })}
            className={getInputClasses('title')}
            placeholder="Ex: Bicicleta Caloi Aro 29"
          />
          {errors.title && (
            <p className="mt-2 text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>
        <div className="relative">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Descrição
          </label>
          <div className="absolute top-9 left-0 flex items-center pl-3 pointer-events-none">
            <PencilSquareIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <textarea
            id="description"
            rows="5"
            {...register('description', {
              required: 'A descrição é obrigatória',
            })}
            className={getInputClasses('description')}
            placeholder="Detalhe seu produto..."
          />
          {errors.description && (
            <p className="mt-2 text-sm text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Preço (R$)
            </label>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pt-6 pointer-events-none">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              id="price"
              type="number"
              step="0.01"
              {...register('price', {
                required: 'O preço é obrigatório',
                valueAsNumber: true,
                min: {
                  value: 0.01,
                  message: 'O preço deve ser maior que zero.',
                },
              })}
              className={getInputClasses('price')}
              placeholder="0,00"
            />
            {errors.price && (
              <p className="mt-2 text-sm text-red-500">
                {errors.price.message}
              </p>
            )}
          </div>
          <div className="relative">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Categoria
            </label>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pt-6 pointer-events-none">
              <TagIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <select
              id="category"
              {...register('category', {
                required: 'A categoria é obrigatória',
              })}
              className={getInputClasses('category')}
            >
              <option value="">Selecione...</option>
              <option value="tecnologia">Tecnologia</option>
              <option value="casa">Casa e Jardim</option>
              <option value="esportes">Esportes e Lazer</option>
              <option value="veiculos">Veículos</option>
              <option value="moda">Moda e Beleza</option>
            </select>
            {errors.category && (
              <p className="mt-2 text-sm text-red-500">
                {errors.category.message}
              </p>
            )}
          </div>
        </div>

        {serverError && (
          <p className="text-center text-sm text-red-500 py-2">{serverError}</p>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white dark:text-ollo-deep bg-ollo-accent dark:bg-ollo-accent-light hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-ollo-slate focus:ring-ollo-accent-light"
          >
            {isSubmitting ? (
              <>
                <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />{' '}
                Publicando...
              </>
            ) : (
              'Criar Anúncio'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateListingPage;
