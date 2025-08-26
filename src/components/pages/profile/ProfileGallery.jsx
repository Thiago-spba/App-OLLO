// src/components/pages/profile/ProfileGallery.jsx - VERSÃO COMPLETA REFATORADA

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  XMarkIcon, 
  PlusCircleIcon, 
  PhotoIcon, 
  VideoCameraIcon,
  EllipsisVerticalIcon,
  TrashIcon 
} from '@heroicons/react/24/solid';
import { 
  EyeIcon, 
  EyeSlashIcon 
} from '@heroicons/react/24/outline';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  doc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { toast } from 'react-hot-toast';

// Componente de esqueleto para carregamento
const GallerySkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-pulse">
    {[...Array(8)].map((_, i) => (
      <div 
        key={i} 
        className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"
      />
    ))}
  </div>
);

// Componente individual para cada item de mídia
const MediaItem = ({ item, onSelect, isOwner, onDelete, onTogglePrivacy }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isVideo = item.type?.startsWith('video');
  const isPrivate = item.privacy === 'private';

  const handleImageError = () => {
    setImageError(true);
    console.warn('Erro ao carregar mídia:', item.url);
  };

  return (
    <div className="relative group aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
      {/* Conteúdo da mídia */}
      <div 
        className="w-full h-full cursor-pointer"
        onClick={() => onSelect(item)}
      >
        {imageError ? (
          // Fallback em caso de erro
          <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 dark:text-gray-500">
            <PhotoIcon className="h-8 w-8 mb-2" />
            <span className="text-xs">Erro ao carregar</span>
          </div>
        ) : isVideo ? (
          // Preview de vídeo
          <div className="relative w-full h-full">
            <video
              src={item.url}
              className="w-full h-full object-cover"
              muted
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <VideoCameraIcon className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
          </div>
        ) : (
          // Preview de imagem
          <img
            src={item.url}
            alt="Mídia da galeria"
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
            onError={handleImageError}
          />
        )}
      </div>

      {/* Indicadores de status */}
      <div className="absolute top-2 left-2 flex gap-1">
        {isPrivate && (
          <div className="bg-black bg-opacity-60 rounded-full p-1.5" title="Conteúdo privado">
            <EyeSlashIcon className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* Menu de opções (apenas para o dono) */}
      {isOwner && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="bg-black bg-opacity-60 rounded-full p-1.5 text-white hover:bg-opacity-80 transition-colors"
              title="Opções"
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
            </button>

            {/* Dropdown do menu */}
            {showMenu && (
              <div className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePrivacy(item);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  {isPrivate ? (
                    <>
                      <EyeIcon className="h-4 w-4" />
                      Tornar público
                    </>
                  ) : (
                    <>
                      <EyeSlashIcon className="h-4 w-4" />
                      Tornar privado
                    </>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                >
                  <TrashIcon className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay para clique */}
      <div 
        className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
      />
    </div>
  );
};

// Modal para visualização em tela cheia
const MediaModal = ({ media, onClose }) => {
  const isVideo = media.type?.startsWith('video');

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full">
        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
        >
          <XMarkIcon className="h-8 w-8" />
        </button>

        {/* Conteúdo da mídia */}
        <div
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          {isVideo ? (
            <video
              src={media.url}
              controls
              autoPlay
              className="max-w-[90vw] max-h-[80vh] rounded-lg"
            />
          ) : (
            <img
              src={media.url}
              alt="Mídia em tela cheia"
              className="max-w-[90vw] max-h-[80vh] rounded-lg object-contain"
            />
          )}
        </div>

        {/* Informações da mídia */}
        {media.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-4 rounded-b-lg">
            <p className="text-sm">{media.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente principal da galeria
export default function ProfileGallery({
  profileData,
  editing = false,
  isOwner = false,
  loading = false,
  onMediaUpload,
}) {
  const [media, setMedia] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Carrega as mídias do Firestore
  useEffect(() => {
    if (!profileData?.id && !profileData?.uid) {
      setLoadingMedia(false);
      setMedia([]);
      return;
    }

    const userId = profileData.id || profileData.uid;
    setLoadingMedia(true);

    try {
      const mediaCollectionRef = collection(db, 'users', userId, 'media');

      // Query diferente dependendo se é o dono ou não
      let q;
      if (isOwner) {
        // Dono vê todas as mídias (públicas e privadas)
        q = query(mediaCollectionRef, orderBy('createdAt', 'desc'));
      } else {
        // Visitantes veem apenas mídias públicas
        q = query(
          mediaCollectionRef,
          where('privacy', '==', 'public'),
          orderBy('createdAt', 'desc')
        );
      }

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const mediaData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          console.log('Mídias carregadas da galeria:', mediaData.length);
          setMedia(mediaData);
          setLoadingMedia(false);
        },
        (error) => {
          console.error('Erro ao buscar mídias da galeria:', error);
          setLoadingMedia(false);
          toast.error('Erro ao carregar a galeria');
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Erro ao configurar listener da galeria:', error);
      setLoadingMedia(false);
      toast.error('Erro ao configurar galeria');
    }
  }, [profileData?.id, profileData?.uid, isOwner]);

  // Handle para seleção de arquivo
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Máximo 50MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado.');
      return;
    }

    setUploadingMedia(true);
    
    try {
      if (onMediaUpload) {
        await onMediaUpload(file);
        toast.success('Mídia adicionada com sucesso!');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao fazer upload da mídia');
    } finally {
      setUploadingMedia(false);
      event.target.value = ''; // Limpa o input
    }
  };

  // Handle para excluir mídia
  const handleDeleteMedia = async (mediaItem) => {
    if (!window.confirm('Tem certeza que deseja excluir esta mídia?')) {
      return;
    }

    try {
      const userId = profileData.id || profileData.uid;
      const mediaDocRef = doc(db, 'users', userId, 'media', mediaItem.id);
      await deleteDoc(mediaDocRef);
      toast.success('Mídia excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir mídia:', error);
      toast.error('Erro ao excluir mídia');
    }
  };

  // Handle para alternar privacidade
  const handleTogglePrivacy = async (mediaItem) => {
    try {
      const userId = profileData.id || profileData.uid;
      const mediaDocRef = doc(db, 'users', userId, 'media', mediaItem.id);
      const newPrivacy = mediaItem.privacy === 'private' ? 'public' : 'private';
      
      await updateDoc(mediaDocRef, {
        privacy: newPrivacy,
        updatedAt: new Date()
      });

      toast.success(`Mídia tornada ${newPrivacy === 'private' ? 'privada' : 'pública'}`);
    } catch (error) {
      console.error('Erro ao alterar privacidade:', error);
      toast.error('Erro ao alterar privacidade');
    }
  };

  // Se não há dados do perfil
  if (!profileData) {
    return null;
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      {/* Cabeçalho da galeria */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <PhotoIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Galeria
          </h2>
          {media.length > 0 && (
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm px-2 py-1 rounded-full">
              {media.length}
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo da galeria */}
      {loadingMedia ? (
        <GallerySkeleton />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Botão de adicionar mídia (apenas para o dono em modo edição) */}
          {isOwner && editing && (
            <label
              className={`aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-ollo-accent hover:bg-ollo-accent/5 ${
                (loading || uploadingMedia) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                {uploadingMedia ? (
                  <>
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-ollo-accent mb-2"></div>
                    <span className="text-sm font-medium">Enviando...</span>
                  </>
                ) : (
                  <>
                    <PlusCircleIcon className="h-10 w-10 mb-2" />
                    <span className="text-sm font-medium">Adicionar</span>
                    <span className="text-xs text-gray-400">Foto ou vídeo</span>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={loading || uploadingMedia}
              />
            </label>
          )}

          {/* Grid das mídias */}
                    {media.map((item) => (
                      <MediaItem
                        key={item.id}
                        item={item}
                        onSelect={setSelectedMedia}
                        isOwner={isOwner}
                        onDelete={handleDeleteMedia}
                        onTogglePrivacy={handleTogglePrivacy}
                      />
                    ))}
                  </div>
                )}
          
                {/* Modal para visualização de mídia */}
                {selectedMedia && (
                  <MediaModal
                    media={selectedMedia}
                    onClose={() => setSelectedMedia(null)}
                  />
                )}
              </section>
            );
          }