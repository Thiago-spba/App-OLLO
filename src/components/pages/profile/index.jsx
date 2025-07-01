import { useState, useRef, useEffect, useMemo } from 'react';
import ProfileHeader from './profileHeader';
import ProfileBio from './profileBio';
import ProfileGallery from './profileGallery';
import ProfileActions from './profileActions';

const DEFAULT_AVATAR = '/default-avatar.png';
const DEFAULT_COVER = '/default-cover.png'; // Coloque uma imagem padrão na pasta public

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

const defaultProfile = {
  avatar: DEFAULT_AVATAR, // Foto de perfil
  cover: DEFAULT_COVER, // Capa/banner do perfil
  name: '', // Nome público (obrigatório)
  username: '', // Usuário (obrigatório, ex: @seunome)
  location: '', // Cidade, País
  showLocation: true, // Permite mostrar ou esconder localização
  age: '', // Idade
  showAge: true, // Permite mostrar ou esconder idade
  statusOnline: true, // Online/offline
  emojis: [], // Array de emojis favoritos
  bio: '', // Bio do usuário
  showBio: true, // Permite mostrar ou esconder bio
  gallery: [], // Galeria de imagens e vídeos
  showGallery: true, // Permite mostrar ou esconder galeria
};

export default function Profile() {
  const [profile, setProfile] = useState(defaultProfile);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(defaultProfile);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const avatarInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Load profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ollo_profile');
    if (saved) {
      try {
        setProfile({ ...defaultProfile, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse saved profile', e);
      }
    }
  }, []);

  // Save profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ollo_profile', JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  }, [profile]);

  const handleEdit = () => {
    setForm(profile);
    setAvatarPreview(profile.avatar);
    setEditing(true);
    setSuccess('');
    setError('');
  };

  const handleCancel = () => {
    setEditing(false);
    setAvatarPreview('');
    setError('');
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.username.trim()) {
      setError('Nome e usuário são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProfile(form);
      setEditing(false);
      setSuccess('Perfil atualizado com sucesso!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target.result);
      setForm((f) => ({ ...f, avatar: ev.target.result }));
    };
    reader.onerror = () => setError('Erro ao carregar imagem');
    reader.readAsDataURL(file);
  };

  // NOVO: Handler para troca de capa/banner
  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem de capa válida');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, cover: ev.target.result }));
    };
    reader.onerror = () => setError('Erro ao carregar imagem de capa');
    reader.readAsDataURL(file);
  };

  const toggleVisibility = (field) => {
    setForm((f) => ({ ...f, [field]: !f[field] }));
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm',
    ];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setError(
        `Tipo de arquivo não suportado: ${invalidFiles.map((f) => f.name).join(', ')}`
      );
      e.target.value = '';
      return;
    }

    const newMedia = files.map((file) => {
      const isImage = file.type.startsWith('image/');
      return {
        id: generateId(),
        url: URL.createObjectURL(file),
        type: isImage ? 'image' : 'video',
        public: true,
        file, // Mantém referência para upload futuro
      };
    });

    if (editing) {
      // Se estiver editando, adiciona ao form
      setForm((f) => ({
        ...f,
        gallery: [...(f.gallery || []), ...newMedia],
      }));
    } else {
      // Se NÃO estiver editando, adiciona direto ao perfil
      setProfile((p) => ({
        ...p,
        gallery: [...(p.gallery || []), ...newMedia],
      }));
    }
    e.target.value = '';
  };
  
  const handleRemoveMedia = (id) => {
    setForm((f) => ({
      ...f,
      gallery: f.gallery.filter((item) => item.id !== id),
    }));
  };

  const toggleMediaVisibility = (id) => {
    setForm((f) => ({
      ...f,
      gallery: f.gallery.map((item) =>
        item.id === id ? { ...item, public: !item.public } : item
      ),
    }));
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setSuccess('Link do perfil copiado!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Não foi possível copiar o link');
    }
  };

  const isDirty = useMemo(
    () => editing && JSON.stringify(form) !== JSON.stringify(profile),
    [form, profile, editing]
  );

  const handlers = {
    handleAvatarChange,
    handleCoverChange, // Adicionado aqui!
    handleChange: (e) => {
      const { name, value } = e.target;
      setForm((f) => ({ ...f, [name]: value }));
    },
    toggleVisibility,
    handleGalleryChange,
    handleRemoveMedia,
    toggleMediaVisibility,
  };

  return (
    <main className="max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-3xl my-4 md:my-8 p-4 md:p-6 transition-all">
      <ProfileHeader
        profile={profile}
        editing={editing}
        form={form}
        handlers={handlers}
        avatarPreview={avatarPreview}
        avatarInputRef={avatarInputRef}
      />

      <ProfileBio
        profile={profile}
        editing={editing}
        form={form}
        handlers={handlers}
      />

      <ProfileGallery
        profile={profile}
        editing={editing}
        form={form}
        handlers={handlers}
        galleryInputRef={galleryInputRef}
      />

      {(error || success) && (
        <div className="mb-4">
          {error && (
            <div
              className="text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg flex items-start gap-2"
              role="alert"
            >
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div
              className="text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 p-3 rounded-lg flex items-center gap-2"
              role="alert"
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{success}</span>
            </div>
          )}
        </div>
      )}

      <ProfileActions
        editing={editing}
        loading={loading}
        isDirty={isDirty}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onSave={handleSave}
        onShare={handleShare}
      />
    </main>
  );
}
