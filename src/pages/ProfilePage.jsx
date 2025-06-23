import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const OLLO_COLOR = '#06b6a3';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const MAX_NAME_LENGTH = 32;
const MAX_LOCATION_LENGTH = 40;
const MAX_BIO_LENGTH = 150;

const generateId = () => Math.random().toString(36).substr(2, 8);

const validateFile = (file) => {
  const errors = [];
  if (file.size > MAX_FILE_SIZE) {
    errors.push('Arquivo muito grande. Máximo 10MB.');
  }
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  if (!isImage && !isVideo) {
    errors.push('Tipo de arquivo não suportado.');
  }
  return {
    isValid: errors.length === 0,
    errors,
    type: isImage ? 'image' : 'video',
  };
};

export default function ProfilePage() {
  const { currentUser, updateUserProfile, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalMedia, setModalMedia] = useState(null);
  const fileRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [objectUrls, setObjectUrls] = useState(new Set());

  useEffect(() => {
    if (currentUser) {
      setProfile({
        avatar: currentUser.avatarUrl || '/default-avatar.png',
        name: currentUser.name || 'Seu Nome',
        location: currentUser.location || 'Sua cidade, país',
        bio: currentUser.bio || 'Fale sobre você...',
        showBio:
          typeof currentUser.showBio === 'boolean' ? currentUser.showBio : true,
        gallery: currentUser.gallery || [],
        showGallery:
          typeof currentUser.showGallery === 'boolean'
            ? currentUser.showGallery
            : true,
      });
      setAvatarPreview(currentUser.avatarUrl || '/default-avatar.png');
      setEditing(false);
      setForm(null);
      setSuccess('');
      setError('');
    }
  }, [currentUser]);

  useEffect(() => {
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [objectUrls]);

  const processFile = useCallback((file, onSuccess, onError) => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      onError(validation.errors.join(' '));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => onSuccess(ev.target.result, validation.type);
    reader.onerror = () => onError('Erro ao processar arquivo.');
    reader.readAsDataURL(file);
  }, []);

  const handleImageUpload = useCallback(
    (file) => {
      if (!file) return;
      processFile(
        file,
        (result) => {
          setAvatarPreview(result);
          setForm((f) => ({ ...f, avatar: result }));
          setError('');
        },
        (errorMessage) => {
          setError(errorMessage);
          setTimeout(() => setError(''), 3000);
        }
      );
    },
    [processFile]
  );

  const handleAvatarChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      handleImageUpload(file);
    },
    [handleImageUpload]
  );

  const handleAvatarDrop = useCallback(
    (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      handleImageUpload(file);
    },
    [handleImageUpload]
  );

  const handleGalleryChange = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = [];
    const errors = [];
    files.forEach((file) => {
      const validation = validateFile(file);
      if (validation.isValid) {
        const url = URL.createObjectURL(file);
        setObjectUrls((prev) => new Set(prev).add(url));
        validFiles.push({
          id: generateId(),
          url,
          type: validation.type,
          public: true,
        });
      } else {
        errors.push(`${file.name}: ${validation.errors.join(' ')}`);
      }
    });
    if (validFiles.length > 0) {
      setForm((f) => ({ ...f, gallery: [...f.gallery, ...validFiles] }));
    }
    if (errors.length > 0) {
      setError(errors.join('\n'));
      setTimeout(() => setError(''), 5000);
    }
    e.target.value = '';
  }, []);

  const handleRemoveMedia = useCallback((id) => {
    setForm((f) => {
      const itemToRemove = f.gallery.find((item) => item.id === id);
      if (itemToRemove?.url.startsWith('blob:')) {
        URL.revokeObjectURL(itemToRemove.url);
        setObjectUrls((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemToRemove.url);
          return newSet;
        });
      }
      return {
        ...f,
        gallery: f.gallery.filter((item) => item.id !== id),
      };
    });
  }, []);

  const toggleMediaVisibility = useCallback((id) => {
    setForm((f) => ({
      ...f,
      gallery: f.gallery.map((item) =>
        item.id === id ? { ...item, public: !item.public } : item
      ),
    }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError('');
  }, []);

  const toggleVisibility = useCallback((field) => {
    setForm((f) => ({ ...f, [field]: !f[field] }));
  }, []);

  const handleEdit = useCallback(() => {
    setForm(profile);
    setAvatarPreview(profile.avatar);
    setEditing(true);
    setSuccess('');
    setError('');
  }, [profile]);

  const handleCancel = useCallback(() => {
    setEditing(false);
    setSuccess('');
    setError('');
    if (form) {
      form.gallery.forEach((item) => {
        if (
          item.url.startsWith('blob:') &&
          !profile.gallery.some((p) => p.url === item.url)
        ) {
          URL.revokeObjectURL(item.url);
        }
      });
    }
    setForm(profile);
    setAvatarPreview(profile.avatar);
  }, [form, profile]);

  const handleSave = useCallback(async () => {
    if (!form.name.trim() || !form.location.trim()) {
      setError('Nome e Localização são obrigatórios.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await updateUserProfile({
        avatarUrl: avatarPreview,
        name: form.name,
        location: form.location,
        bio: form.bio,
        showBio: form.showBio,
        gallery: form.gallery,
        showGallery: form.showGallery,
      });
      setEditing(false);
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erro ao salvar perfil.');
    } finally {
      setLoading(false);
    }
  }, [form, avatarPreview, updateUserProfile]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setSuccess('Link copiado para a área de transferência!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Erro ao copiar link.');
    }
  }, []);

  const isDirty = useMemo(
    () =>
      editing &&
      form &&
      profile &&
      (JSON.stringify(form) !== JSON.stringify(profile) ||
        avatarPreview !== profile.avatar),
    [form, profile, avatarPreview, editing]
  );

  const galleryToShow = useMemo(
    () =>
      editing && form
        ? form.gallery
        : profile && profile.showGallery
          ? profile.gallery.filter((item) => item.public)
          : [],
    [editing, form, profile]
  );

  const EyeIcon = useMemo(
    () =>
      ({ visible = true, className = '' }) =>
        visible ? (
          <svg
            width="22"
            height="22"
            fill="none"
            stroke={OLLO_COLOR}
            strokeWidth="2"
            viewBox="0 0 24 24"
            className={className}
            aria-hidden="true"
          >
            <ellipse cx="12" cy="12" rx="9" ry="5" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
        ) : (
          <svg
            width="22"
            height="22"
            fill="none"
            stroke={OLLO_COLOR}
            strokeWidth="2"
            viewBox="0 0 24 24"
            className={className}
            aria-hidden="true"
          >
            <ellipse cx="12" cy="12" rx="9" ry="5" />
            <circle cx="12" cy="12" r="2.5" />
            <line x1="4" y1="20" x2="20" y2="4" />
          </svg>
        ),
    []
  );

  const closeModal = useCallback(() => setModalMedia(null), []);

  const handleDragOver = useCallback(
    (e) => {
      if (editing) e.preventDefault();
    },
    [editing]
  );

  if (authLoading || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="text-gray-600 dark:text-gray-300">
          Carregando perfil...
        </span>
      </div>
    );
  }

  // =================== JSX INTEGRADO ABAIXO ===================

  return (
    <section className="max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden my-4 sm:my-8">
      <div className="w-full">
        <div className="px-4 sm:px-6 md:px-8 pt-12 pb-6 relative">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div
              className="relative group"
              onDrop={handleAvatarDrop}
              onDragOver={handleDragOver}
              tabIndex={editing ? 0 : -1}
              role="button"
              aria-label={
                editing
                  ? 'Área para upload de avatar - clique ou arraste uma imagem'
                  : undefined
              }
            >
              <div
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-8 bg-white"
                style={{ borderColor: OLLO_COLOR }}
              >
                <img
                  src={editing ? avatarPreview : profile.avatar}
                  alt="Avatar do usuário"
                  className="w-full h-full object-cover rounded-full"
                  draggable={false}
                  loading="lazy"
                />
              </div>
              {editing && (
                <>
                  <button
                    className="absolute bottom-0 right-0 bg-white border-2 border-green-500 text-green-500 p-2 rounded-full shadow-lg hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={() => fileRef.current?.click()}
                    aria-label="Alterar foto do perfil"
                    type="button"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke={OLLO_COLOR}
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <rect x="3" y="7" width="18" height="13" rx="2" />
                      <circle cx="12" cy="13.5" r="4" />
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    </svg>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    className="sr-only"
                    accept={ALLOWED_IMAGE_TYPES.join(',')}
                    onChange={handleAvatarChange}
                    aria-label="Selecionar foto do perfil"
                  />
                </>
              )}
            </div>
          </div>

          {/* Nome e Localização */}
          <div className="text-center mb-4 space-y-2">
            {editing ? (
              <div className="space-y-3">
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
                  {profile.name}
                </h1>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 break-words">
                  {profile.location}
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
              profile.showBio && (
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
                      form.showGallery
                        ? 'Ocultar do público'
                        : 'Mostrar ao público'
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
                    accept={[
                      ...ALLOWED_IMAGE_TYPES,
                      ...ALLOWED_VIDEO_TYPES,
                    ].join(',')}
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
                          title={
                            item.public ? 'Tornar privado' : 'Tornar público'
                          }
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
                  onClick={handleEdit}
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
              Perfil OLLO — Todos os campos são editáveis, privacidade sob
              controle do usuário.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
