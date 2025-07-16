// src/pages/profile/index.jsx

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useAuth } from '../../../context/AuthContext'; // Altere o caminho se seu contexto estiver em outro local
import { db, storage } from '../../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Componentes internos do perfil
import ProfileHeader from './ProfileHeader.jsx';
import ProfileBio from './ProfileBio.jsx';
import ProfileGallery from './ProfileGallery.jsx';
import ProfileActions from './ProfileActions.jsx';

const DEFAULT_AVATAR = '/images/default-avatar.png';
const DEFAULT_COVER = '/images/default-cover.png';

const initialProfileState = {
  avatar: DEFAULT_AVATAR,
  cover: DEFAULT_COVER,
  name: '',
  username: '',
  location: '',
  bio: '',
  age: '',
  gallery: [],
  emojis: [],
  showName: true,
  showLocation: true,
  showBio: true,
  showAge: true,
  showGallery: true,
  statusOnline: true,
};

export default function ProfilePage() {
  const { currentUser, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState(initialProfileState);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(initialProfileState);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const galleryInputRef = useRef(null);

  // Carregar dados do perfil
  useEffect(() => {
    if (!currentUser || authLoading) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);

        let dataToSet;
        if (docSnap.exists()) {
          dataToSet = { ...initialProfileState, ...docSnap.data() };
        } else {
          dataToSet = {
            ...initialProfileState,
            name: currentUser.displayName || '',
            avatar: currentUser.photoURL || DEFAULT_AVATAR,
            uid: currentUser.uid,
            email: currentUser.email || '',
          };
          await setDoc(userDocRef, dataToSet);
        }

        setProfile(dataToSet);
        setForm(dataToSet);
      } catch (e) {
        console.error('Erro ao carregar perfil:', e);
        setError('Não foi possível carregar as informações do perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, authLoading]);

  // Handlers
  const handleEdit = useCallback(() => {
    setEditing(true);
    setForm(profile);
  }, [profile]);

  const handleCancel = useCallback(() => {
    setEditing(false);
    setForm(profile);
    setAvatarFile(null);
    setCoverFile(null);
  }, [profile]);

  const handleFileChange = (e, fileSetter, previewKey) => {
    const file = e.target.files?.[0];
    if (file) {
      fileSetter(file);
      setForm((prevForm) => ({
        ...prevForm,
        [previewKey]: URL.createObjectURL(file),
      }));
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const toggleVisibility = useCallback((field) => {
    setForm((prevForm) => ({ ...prevForm, [field]: !prevForm[field] }));
  }, []);

  // --- SALVAR PERFIL (COM UID GARANTIDO) ---
  const handleSave = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');

    try {
      let avatarUrl = form.avatar;
      let coverUrl = form.cover;

      if (avatarFile) {
        const avatarRef = ref(
          storage,
          `avatars/${currentUser.uid}_${Date.now()}`
        );
        await uploadBytes(avatarRef, avatarFile);
        avatarUrl = await getDownloadURL(avatarRef);
      }

      if (coverFile) {
        const coverRef = ref(
          storage,
          `covers/${currentUser.uid}_${Date.now()}`
        );
        await uploadBytes(coverRef, coverFile);
        coverUrl = await getDownloadURL(coverRef);
      }

      // Garante sempre o campo uid correto!
      const dataToSave = {
        ...form,
        avatar: avatarUrl,
        cover: coverUrl,
        uid: currentUser.uid,
        email: currentUser.email || '',
      };

      await setDoc(doc(db, 'users', currentUser.uid), dataToSave, {
        merge: true,
      });

      setProfile(dataToSave);
      setEditing(false);
      setAvatarFile(null);
      setCoverFile(null);
      setSuccess('Perfil salvo com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erro ao salvar o perfil: ' + (err.message || err.code || err));
      console.error('Erro completo ao salvar perfil:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, form, avatarFile, coverFile]);

  // Agrupa handlers para repassar aos subcomponentes
  const handlers = {
    handleChange,
    toggleVisibility,
    handleAvatarChange: (e) => handleFileChange(e, setAvatarFile, 'avatar'),
    handleCoverChange: (e) => handleFileChange(e, setCoverFile, 'cover'),
    // ... outros handlers
  };

  const isDirty = useMemo(
    () =>
      JSON.stringify(form) !== JSON.stringify(profile) ||
      !!avatarFile ||
      !!coverFile,
    [form, profile, avatarFile, coverFile]
  );

  if (authLoading || (!profile.name && loading)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-ollo-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center p-8">Faça login para ver seu perfil.</div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-3xl my-4 md:my-8 p-4 md:p-6">
      <ProfileHeader
        profile={profile}
        editing={editing}
        form={form}
        handlers={handlers}
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
        loading={loading}
      />

      {(error || success) && (
        <div className="my-4 text-center">
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
        </div>
      )}

      <ProfileActions
        editing={editing}
        loading={loading}
        isDirty={isDirty}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </main>
  );
}
