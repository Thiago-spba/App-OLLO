import React, { useState, useRef, useEffect } from 'react';
import EyeIcon from './profilePrivacyField'; // já aproveitando seu ícone
// Coloque aqui os imports dos helpers que você já tem, ex: OLLO_COLOR, DEFAULT_AVATAR

// Parâmetros de configuração
const OLLO_COLOR = '#27C36D';
const DEFAULT_AVATAR =
  'https://api.dicebear.com/8.x/identicon/svg?seed=ollo-user';
const MAX_NAME_LENGTH = 32;
const MAX_LOCATION_LENGTH = 32;
const MAX_BIO_LENGTH = 150;
const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

const PROFILE_STORAGE_KEY = 'ollo_profile';

// Função utilitária para persistir perfil
const saveProfileToStorage = (profile) =>
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
const getProfileFromStorage = () => {
  const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
  return saved
    ? JSON.parse(saved)
    : {
        name: '',
        showName: true,
        location: '',
        showLocation: true,
        bio: '',
        showBio: true,
        gallery: [],
        showGallery: true,
      };
};

const ProfileMainContent = () => {
  // Estados do perfil
  const [profile, setProfile] = useState(getProfileFromStorage());
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Galeria
  const galleryInputRef = useRef();
  const [modalMedia, setModalMedia] = useState(null);

  // Sempre que profile mudar, salva no localStorage
  useEffect(() => {
    saveProfileToStorage(profile);
  }, [profile]);

  // Atualiza formulário ao alternar edição
  useEffect(() => {
    if (editing) setForm(profile);
  }, [editing, profile]);

  // Para saber se houve alteração
  useEffect(() => {
    setIsDirty(JSON.stringify(form) !== JSON.stringify(profile));
  }, [form, profile]);

  // Handlers de campo
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleVisibility = (field) => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Galeria
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    let newItems = [];
    files.forEach((file) => {
      const type = ALLOWED_IMAGE_TYPES.includes(file.type)
        ? 'image'
        : ALLOWED_VIDEO_TYPES.includes(file.type)
          ? 'video'
          : null;
      if (type) {
        const url = URL.createObjectURL(file);
        newItems.push({
          id: `${type}-${Date.now()}-${Math.random()}`,
          url,
          type,
          public: true,
        });
      }
    });
    setForm((prev) => ({
      ...prev,
      gallery: [...(prev.gallery || []), ...newItems],
    }));
    e.target.value = null; // limpa input
  };

  const handleRemoveMedia = (id) => {
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((item) => item.id !== id),
    }));
  };

  const toggleMediaVisibility = (id) => {
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.map((item) =>
        item.id === id ? { ...item, public: !item.public } : item
      ),
    }));
  };

  // Salvar alterações
  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setProfile(form);
      setEditing(false);
      setSuccess('Perfil salvo com sucesso! ✨');
      setError('');
      setLoading(false);
      setTimeout(() => setSuccess(''), 2500);
    }, 500); // simula tempo de resposta
  };

  // Cancelar edição
  const handleCancel = () => {
    setForm(profile);
    setEditing(false);
    setError('');
    setSuccess('');
  };

  // Compartilhar perfil (simulado)
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setSuccess('Link do perfil copiado! 🔗');
    setTimeout(() => setSuccess(''), 2000);
  };

  // Modal de visualização
  const closeModal = () => setModalMedia(null);

  // Galeria exibida
  const galleryToShow = editing
    ? form.gallery || []
    : (form.gallery || []).filter((item) => item.public);

  // Visualização dos campos (privacidade)
  const showName = editing ? form.showName : profile.showName;
  const showLocation = editing ? form.showLocation : profile.showLocation;
  const showBio = editing ? form.showBio : profile.showBio;
  const showGallery = editing ? form.showGallery : profile.showGallery;

  return (
    <section className="w-full max-w-xl mx-auto py-8 px-2 sm:px-4">
      {/* Nome e Localização */}
      <div className="text-center mb-4 space-y-2">
        {editing ? (
          <div className="space-y-3">
            {/* Nome */}
            <div>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={MAX_NAME_LENGTH}
                required
                className="w-full text-xl sm:text-2xl font-bold text-center bg-transparent border-b-2 border-gray-300 focus:border-green-500 focus:outline-none transition-colors px-2 py-1"
                placeholder="Seu Nome"
                aria-label="Nome"
                autoFocus
              />
              <div className="text-xs text-gray-500 mt-1">
                {form.name.length}/{MAX_NAME_LENGTH}
              </div>
            </div>
            {/* Localização */}
            <div>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                maxLength={MAX_LOCATION_LENGTH}
                required
                className="w-full text-base sm:text-lg text-gray-600 dark:text-gray-300 text-center bg-transparent border-b border-gray-300 focus:border-green-500 focus:outline-none transition-colors px-2 py-1"
                placeholder="Localização"
                aria-label="Localização"
              />
              <div className="text-xs text-gray-500 mt-1">
                {form.location.length}/{MAX_LOCATION_LENGTH}
              </div>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white break-words">
              {showName ? profile.name : 'Nome oculto'}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 break-words">
              {showLocation ? profile.location : 'Localização oculta'}
            </p>
          </>
        )}
      </div>

      {/* Bio */}
      <div className="mb-6">
        {editing ? (
          <div className="relative">
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              maxLength={MAX_BIO_LENGTH}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none text-sm sm:text-base"
              placeholder="Conte um pouco sobre você..."
              aria-label="Biografia"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {form.bio.length}/{MAX_BIO_LENGTH}
              </span>
              <button
                type="button"
                onClick={() => toggleVisibility('showBio')}
                className="text-gray-500 hover:text-green-600 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label={
                  form.showBio
                    ? 'Ocultar bio do público'
                    : 'Mostrar bio ao público'
                }
                title={
                  form.showBio ? 'Ocultar do público' : 'Mostrar ao público'
                }
              >
                <EyeIcon visible={form.showBio} />
              </button>
            </div>
          </div>
        ) : (
          showBio && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center relative">
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base break-words">
                {profile.bio}
              </p>
              <span
                className="absolute bottom-2 right-2 text-green-600"
                title="Visível ao público"
                aria-label="Biografia visível ao público"
              >
                <EyeIcon visible={true} />
              </span>
            </div>
          )
        )}
      </div>

      {/* Galeria */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Galeria
          </h2>
          {editing && (
            <div className="flex items-center space-x-2 justify-center sm:justify-end">
              <button
                type="button"
                onClick={() => toggleVisibility('showGallery')}
                className="text-gray-500 hover:text-green-600 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label={
                  form.showGallery
                    ? 'Ocultar galeria do público'
                    : 'Mostrar galeria ao público'
                }
                title={
                  form.showGallery ? 'Ocultar do público' : 'Mostrar ao público'
                }
              >
                <EyeIcon visible={form.showGallery} />
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex items-center text-sm px-3 py-2 rounded-lg font-medium transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                style={{ background: OLLO_COLOR, color: '#fff' }}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="#fff"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Adicionar
              </button>
              <input
                ref={galleryInputRef}
                type="file"
                className="sr-only"
                accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(
                  ','
                )}
                multiple
                onChange={handleGalleryChange}
                aria-label="Selecionar arquivos para galeria"
              />
            </div>
          )}
        </div>
        {galleryToShow.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 sm:p-8 text-center">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500 mb-4 text-sm sm:text-base">
              Nenhuma mídia adicionada ainda
            </p>
            {editing && (
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm sm:text-base"
                style={{ background: OLLO_COLOR, color: '#fff' }}
              >
                Adicionar Fotos/Vídeos
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {galleryToShow.map((item) => (
              <div
                key={item.id}
                className="relative rounded-lg overflow-hidden aspect-square bg-gray-100 dark:bg-gray-700 cursor-pointer group"
                onClick={() => setModalMedia(item)}
                role="button"
                tabIndex={0}
                aria-label={`Ver ${item.type === 'image' ? 'imagem' : 'vídeo'} em tela cheia`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setModalMedia(item);
                  }
                }}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt="Mídia da galeria"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = DEFAULT_AVATAR;
                    }}
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    controls={editing}
                    muted
                    playsInline
                  />
                )}
                {editing && (
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMedia(item.id);
                      }}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="Remover mídia"
                      title="Remover"
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMediaVisibility(item.id);
                      }}
                      className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                      aria-label={
                        item.public ? 'Tornar privado' : 'Tornar público'
                      }
                      title={item.public ? 'Tornar privado' : 'Tornar público'}
                    >
                      <EyeIcon visible={item.public} />
                    </button>
                  </div>
                )}
                {!editing && item.public && (
                  <span
                    className="absolute bottom-1 right-1 bg-white/80 dark:bg-gray-800/80 rounded-full p-1"
                    style={{ color: OLLO_COLOR }}
                    title="Visível ao público"
                    aria-label="Mídia visível ao público"
                  >
                    <EyeIcon visible={true} />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Modal de visualização de mídia */}
        {modalMedia && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div
              className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute -top-10 right-0 sm:top-0 sm:-right-12 bg-gray-200/50 dark:bg-gray-700/50 rounded-full p-2 text-white hover:bg-gray-300/70 dark:hover:bg-gray-600/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white z-10"
                aria-label="Fechar modal"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2 id="modal-title" className="sr-only">
                Visualização de{' '}
                {modalMedia.type === 'image' ? 'imagem' : 'vídeo'}
              </h2>
              {modalMedia.type === 'image' ? (
                <img
                  src={modalMedia.url}
                  alt="Preview em tela cheia"
                  className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-lg"
                  onError={(e) => {
                    e.target.src = DEFAULT_AVATAR;
                  }}
                />
              ) : (
                <video
                  src={modalMedia.url}
                  controls
                  autoPlay
                  className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-lg"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mensagens de erro e sucesso */}
      {(error || success) && (
        <div className="mb-4">
          {error && (
            <div
              className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow text-sm flex items-start gap-2"
              role="alert"
            >
              <svg
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="whitespace-pre-line">{error}</span>
            </div>
          )}
          {success && (
            <div
              className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg shadow text-sm flex items-center gap-2"
              role="alert"
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {success}
            </div>
          )}
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
        {!editing ? (
          <>
            <button
              onClick={() => setEditing(true)}
              className="px-6 sm:px-8 py-3 rounded-lg font-bold transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm sm:text-base"
              style={{ background: OLLO_COLOR, color: '#fff' }}
            >
              Editar Perfil
            </button>
            <button
              onClick={handleShare}
              className="px-6 sm:px-8 py-3 rounded-lg font-bold transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm sm:text-base"
              style={{
                background: '#fff',
                color: OLLO_COLOR,
                border: `1.5px solid ${OLLO_COLOR}`,
              }}
            >
              Compartilhar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-6 sm:px-8 py-3 rounded-lg transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              style={{ background: '#eee', color: '#333' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={
                !isDirty ||
                loading ||
                !form.name.trim() ||
                !form.location.trim()
              }
              className="px-6 sm:px-8 py-3 rounded-lg font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:cursor-not-allowed text-sm sm:text-base"
              style={{
                background:
                  !isDirty ||
                  loading ||
                  !form.name.trim() ||
                  !form.location.trim()
                    ? '#A0E1D6'
                    : OLLO_COLOR,
                color: '#fff',
              }}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </>
        )}
      </div>

      {/* Rodapé */}
      <div className="mt-8 w-full flex flex-col items-center gap-2 text-xs text-gray-400 text-center border-t border-green-100 dark:border-gray-700 pt-4">
        <div className="flex gap-4 justify-center">
          <a
            href="/privacidade"
            className="hover:underline focus:outline-none focus:underline"
            tabIndex={0}
          >
            Privacidade
          </a>
          <a
            href="/regulamento"
            className="hover:underline focus:outline-none focus:underline"
            tabIndex={0}
          >
            Regulamento
          </a>
        </div>
        <div className="max-w-md">
          Perfil OLLO — Todos os campos são editáveis, privacidade sob controle
          do usuário.
        </div>
      </div>
    </section>
  );
};

export default ProfileMainContent;
