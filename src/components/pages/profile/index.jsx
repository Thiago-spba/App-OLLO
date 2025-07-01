// src/pages/profile/index.jsx (VERSÃO CORRIGIDA)

import { useState, useRef, useEffect, useMemo, useContext } from 'react';
import ProfileHeader from './profileHeader';
import ProfileBio from './profileBio';
import ProfileGallery from './profileGallery';
import ProfileActions from './profileActions';
import { db, storage } from '../../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { AuthContext } from '../../../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_AVATAR = '/images/default-avatar.png';
const DEFAULT_COVER = '/images/default-cover.png';

const defaultProfile = {
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

export default function Profile() {
  const { currentUser, loading: authLoading } = useContext(AuthContext);
  const [profile, setProfile] = useState(defaultProfile);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(defaultProfile);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    if (!currentUser || authLoading) return;
    setLoading(true);
    async function fetchProfile() {
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(docRef);
        const dataToSet = snap.exists()
          ? { ...defaultProfile, ...snap.data() }
          : {
              ...defaultProfile,
              name: currentUser.displayName || '',
              avatar: currentUser.photoURL || DEFAULT_AVATAR,
            };
        if (!snap.exists()) {
          await setDoc(docRef, dataToSet);
        }
        setProfile(dataToSet);
        setForm(dataToSet);
      } catch (e) {
        console.error('Erro ao carregar perfil:', e);
        setError('Erro ao carregar perfil!');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [currentUser, authLoading]);

  const handleEdit = () => {
    setEditing(true);
    setForm(profile);
  };
  const handleCancel = () => {
    setEditing(false);
    setForm(profile);
  };
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(file);
      setForm((f) => ({ ...f, avatar: URL.createObjectURL(file) }));
    }
  };
  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPreview(file);
      setForm((f) => ({ ...f, cover: URL.createObjectURL(file) }));
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const toggleVisibility = (field) => {
    setForm((f) => ({ ...f, [field]: !f[field] }));
  };

  const handleInstantUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !currentUser) return;

    setLoading(true);
    setError('');

    const uploadPromises = files.map(async (file) => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/'))
        return null;
      const fileId = uuidv4();
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      const filePath = `gallery/${currentUser.uid}/${fileId}_${file.name}`;
      const mediaRef = ref(storage, filePath);
      try {
        await uploadBytes(mediaRef, file);
        const downloadUrl = await getDownloadURL(mediaRef);
        return {
          id: fileId,
          url: downloadUrl,
          type: fileType,
          public: true,
          createdAt: new Date(),
        };
      } catch (uploadError) {
        console.error('Erro no upload:', uploadError);
        return null;
      }
    });

    try {
      const uploadedItems = (await Promise.all(uploadPromises)).filter(Boolean);
      if (uploadedItems.length > 0) {
        const currentGallery = profile.gallery || [];
        const updatedGallery = [...currentGallery, ...uploadedItems];
        await setDoc(
          doc(db, 'users', currentUser.uid),
          { gallery: updatedGallery },
          { merge: true }
        );
        const updatedProfile = { ...profile, gallery: updatedGallery };
        setProfile(updatedProfile);
        setForm(updatedProfile);
        setSuccess(`${uploadedItems.length} mídia(s) adicionada(s)!`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (dbError) {
      console.error('Erro ao salvar no DB:', dbError);
      setError('Erro ao salvar as mídias.');
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  const handleRemoveMedia = (idToRemove) => {
    const updatedGallery = form.gallery.filter(
      (item) => item.id !== idToRemove
    );
    setForm((f) => ({ ...f, gallery: updatedGallery }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      let avatarUrl = form.avatar;
      let coverUrl = form.cover;
      if (avatarPreview) {
        const avatarRef = ref(
          storage,
          `avatars/${currentUser.uid}_${Date.now()}`
        );
        await uploadBytes(avatarRef, avatarPreview);
        avatarUrl = await getDownloadURL(avatarRef);
      }
      if (coverPreview) {
        const coverRef = ref(
          storage,
          `covers/${currentUser.uid}_${Date.now()}`
        );
        await uploadBytes(coverRef, coverPreview);
        coverUrl = await getDownloadURL(coverRef);
      }
      const finalGallery = form.gallery;
      const dataToSave = {
        ...form,
        avatar: avatarUrl,
        cover: coverUrl,
        gallery: finalGallery,
      };
      delete dataToSave.avatarPreview;
      delete dataToSave.coverPreview;
      await setDoc(doc(db, 'users', currentUser.uid), dataToSave, {
        merge: true,
      });
      setProfile(dataToSave);
      setEditing(false);
      setSuccess('Perfil salvo com sucesso!');
    } catch (err) {
      setError('Erro ao salvar perfil.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlers = {
    handleAvatarChange,
    handleCoverChange,
    handleChange,
    toggleVisibility,
    handleInstantUpload,
    handleRemoveMedia,
  };
  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(profile),
    [form, profile]
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-lg animate-pulse">Carregando perfil...</span>
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
        avatarPreview={form.avatar}
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
        loading={loading}
      />
      {(error || success) && (
        <div className="my-4">
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
