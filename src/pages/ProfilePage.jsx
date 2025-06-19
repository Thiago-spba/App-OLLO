// ARQUIVO PARA SUBSTITUIR: src/pages/ProfilePage.jsx
// Versão Final: UI Completa + Lógica do Firebase

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import toast from 'react-hot-toast';

import AuthWrapper from '../components/AuthWrapper';
import {
  CameraIcon,
  PencilSquareIcon,
  LinkIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  ChatBubbleLeftEllipsisIcon,
  UserPlusIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// --- Constantes de UI ---
const SOCIAL_ICONS = {
  website: GlobeAltIcon,
  linkedin: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.98 3.5c-1.64 0-2.98 1.34-2.98 2.98s1.34 2.98 2.98 2.98 2.98-1.34 2.98-2.98-1.34-2.98-2.98-2.98zm.02 14.5H2V9h3v9zm7.5 0h-3V9h3v9zm7.5 0h-3v-4.5c0-1.2-.02-2.73-1.66-2.73-1.66 0-1.92 1.3-1.92 2.64V18h-3V9h2.88v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59V18z" />
    </svg>
  ),
  github: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.429 2.865 8.185 6.839 9.504.5.09.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.621.069-.609.069-.609 1.003.07 1.53 1.031 1.53 1.031.892 1.53 2.341 1.088 2.91.832.091-.646.35-1.089.636-1.34-2.221-.252-4.555-1.112-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.025a9.563 9.563 0 012.5-.336c.849.004 1.705.115 2.5.336 1.908-1.294 2.747-1.025 2.747-1.025.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.849-2.337 4.696-4.566 4.943.359.309.679.92.679 1.855 0 1.34-.012 2.422-.012 2.753 0 .267.18.576.688.478A10.012 10.012 0 0022 12.021C22 6.484 17.523 2 12 2z" />
    </svg>
  ),
  instagram: (props) => (
    <svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeLinecap="round" />
    </svg>
  ),
};
const AVATAR_DEFAULT =
  'https://ui-avatars.com/api/?name=OLLO&background=0D1B2A&color=fff&size=128&bold=true';
const COVER_DEFAULT =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1350&q=80';

function ProfilePage() {
  const { profileId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState({});
  const [publicFields, setPublicFields] = useState({
    name: true,
    location: true,
    bio: true,
  });

  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchProfile = async () => {
      const targetId = profileId || (currentUser ? currentUser.uid : null);
      if (!targetId) {
        setLoading(false);
        setProfile(null);
        return;
      }

      setLoading(true);
      const docRef = doc(db, 'users', targetId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setProfile(data);
        setEditableProfile(data);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [profileId, currentUser]);

  const handleEditToggle = () => {
    if (!editing) {
      setEditableProfile(profile);
    }
    setEditing(!editing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'avatar') setAvatarPreview(reader.result);
      if (type === 'cover') setCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);
    toast.error('Upload de imagem ainda não implementado.');
  };

  const handleSave = async () => {
    if (!profile) return;
    const docRef = doc(db, 'users', profile.id);
    const dataToSave = {
      name: editableProfile.name,
      bio: editableProfile.bio,
      location: editableProfile.location,
    };

    const saveToast = toast.loading('Salvando...');
    try {
      await updateDoc(docRef, dataToSave);
      setProfile((prev) => ({ ...prev, ...dataToSave }));
      toast.success('Perfil salvo!', { id: saveToast });
      setEditing(false);
    } catch (e) {
      toast.error('Erro ao salvar.', { id: saveToast });
    }
  };

  if (loading) {
    return (
      <main className="flex justify-center items-center h-screen">
        <ArrowPathIcon className="h-10 w-10 animate-spin text-ollo-deep" />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="text-center p-10">
        <h2>Perfil não encontrado</h2>
        <p>O usuário que você procura não existe ou não está logado.</p>
      </main>
    );
  }

  const isMyProfile = currentUser?.uid === profile.id;
  const displayProfile = editing ? editableProfile : profile;

  return (
    <HelmetProvider>
      <Helmet>
        <title>{displayProfile.name} | Perfil OLLO</title>
        <meta name="description" content={displayProfile.bio} />
      </Helmet>
      <main
        aria-label="Página de Perfil"
        className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-16"
      >
        <section className="relative h-48 md:h-64 w-full">
          <img
            src={coverPreview || displayProfile.coverUrl || COVER_DEFAULT}
            alt="Imagem de capa"
            className="w-full h-full object-cover"
          />
          {isMyProfile && (
            <>
              <div className="absolute top-3 left-3 text-xs bg-black bg-opacity-30 rounded px-2 py-1 text-white pointer-events-none">
                Recomenda-se: 1350x300px+
              </div>
              <button
                aria-label="Alterar imagem de capa"
                className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white rounded-full p-2 hover:bg-opacity-80 transition group"
                onClick={() => coverInputRef.current.click()}
              >
                <CameraIcon className="h-5 w-5 group-hover:scale-110" />
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'cover')}
                aria-label="Fazer upload de imagem de capa"
              />
            </>
          )}
        </section>

        <section className="relative max-w-3xl mx-auto px-4 flex flex-col items-center">
          <div className="relative -mt-20 w-32 h-32 md:w-40 md:h-40 group">
            <img
              src={avatarPreview || displayProfile.avatarUrl || AVATAR_DEFAULT}
              alt="Foto de perfil"
              className="w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-900 shadow-lg"
              style={{ background: '#eee' }}
            />
            {isMyProfile && (
              <>
                <button
                  aria-label="Alterar foto de perfil"
                  className="absolute bottom-2 right-2 bg-ollo-deep text-white rounded-full p-2 hover:bg-ollo text-xs transition group"
                  onClick={() => avatarInputRef.current.click()}
                >
                  <CameraIcon className="h-5 w-5 group-hover:scale-110" />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'avatar')}
                  aria-label="Fazer upload de foto de perfil"
                />
              </>
            )}
          </div>

          <div className="mt-3 w-full text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold leading-snug">
                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={editableProfile.name}
                      onChange={handleInputChange}
                      className="text-xl border-b px-2 py-1 rounded outline-none bg-gray-100 dark:bg-gray-900"
                      aria-label="Editar nome"
                    />
                  ) : (
                    <>
                      {profile.name}
                      {isMyProfile && (
                        <button
                          className="ml-2 align-middle"
                          aria-label={
                            publicFields.name ? 'Nome público' : 'Nome privado'
                          }
                          onClick={() =>
                            setPublicFields((f) => ({ ...f, name: !f.name }))
                          }
                        >
                          {publicFields.name ? (
                            <EyeIcon className="h-5 w-5 inline text-green-600" />
                          ) : (
                            <EyeSlashIcon className="h-5 w-5 inline text-red-500" />
                          )}
                        </button>
                      )}
                    </>
                  )}
                </h1>
                <p className="text-gray-500 mt-1 max-w-xl">
                  {editing ? (
                    <textarea
                      name="bio"
                      value={editableProfile.bio}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 w-full bg-gray-100 dark:bg-gray-900"
                      maxLength={180}
                      aria-label="Editar bio"
                    />
                  ) : (
                    <>
                      {profile.bio}
                      {isMyProfile && (
                        <button
                          className="ml-2 align-middle"
                          aria-label={
                            publicFields.bio ? 'Bio pública' : 'Bio privada'
                          }
                          onClick={() =>
                            setPublicFields((f) => ({ ...f, bio: !f.bio }))
                          }
                        >
                          {publicFields.bio ? (
                            <EyeIcon className="h-4 w-4 inline text-green-600" />
                          ) : (
                            <EyeSlashIcon className="h-4 w-4 inline text-red-500" />
                          )}
                        </button>
                      )}
                    </>
                  )}
                </p>
                <p className="text-gray-400 text-sm mt-2 flex items-center justify-center md:justify-start gap-2">
                  <span>
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="inline"
                    >
                      <path d="M8 1.333a5.667 5.667 0 100 11.334A5.667 5.667 0 008 1.333zm0 10A4.333 4.333 0 118 2.667a4.333 4.333 0 010 8.666z" />
                      <circle cx="8" cy="7" r="2" />
                    </svg>
                  </span>
                  {editing ? (
                    <input
                      type="text"
                      name="location"
                      value={editableProfile.location}
                      onChange={handleInputChange}
                      className="border-b px-2 bg-gray-100 dark:bg-gray-900 rounded outline-none"
                      aria-label="Editar localização"
                    />
                  ) : (
                    <>
                      {profile.location}
                      {isMyProfile && (
                        <button
                          className="ml-2 align-middle"
                          aria-label={
                            publicFields.location
                              ? 'Localização pública'
                              : 'Localização privada'
                          }
                          onClick={() =>
                            setPublicFields((f) => ({
                              ...f,
                              location: !f.location,
                            }))
                          }
                        >
                          {publicFields.location ? (
                            <EyeIcon className="h-4 w-4 inline text-green-600" />
                          ) : (
                            <EyeSlashIcon className="h-4 w-4 inline text-red-500" />
                          )}
                        </button>
                      )}
                    </>
                  )}
                </p>
              </div>
              <div className="flex gap-2 justify-center md:justify-end">
                {isMyProfile ? (
                  editing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium shadow hover:bg-green-700 transition"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={handleEditToggle}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEditToggle}
                      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      aria-label="Editar perfil"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                  )
                ) : (
                  <>
                    <button
                      className="px-3 py-2 bg-ollo-deep text-white rounded-lg flex items-center gap-1 font-medium hover:bg-ollo transition"
                      aria-label="Seguir usuário"
                    >
                      <UserPlusIcon className="h-5 w-5" /> Seguir
                    </button>
                    <button
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-1 font-medium"
                      aria-label="Enviar mensagem"
                    >
                      <EnvelopeIcon className="h-5 w-5" /> Mensagem
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mt-6 px-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(profile.links || []).map((link) => {
            const Icon = SOCIAL_ICONS[link.type] || LinkIcon;
            return (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-2 py-2 rounded-lg bg-white dark:bg-gray-800 shadow hover:shadow-md hover:underline transition group focus:outline-ollo-deep"
                tabIndex={0}
                aria-label={`Abrir link para ${link.type}`}
              >
                <Icon className="h-6 w-6 text-ollo group-hover:text-blue-700" />
                <span className="truncate text-sm">{link.type}</span>
              </a>
            );
          })}
        </section>

        <section className="max-w-3xl mx-auto mt-8 px-4">
          <h2 className="text-lg font-semibold mb-2">Galeria</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(profile.gallery || []).length === 0 && (
              <div className="col-span-full text-gray-500 text-center p-6">
                Galeria vazia
              </div>
            )}
            {(profile.gallery || []).map((media, idx) =>
              media.type === 'image' ? (
                <img
                  key={media.url}
                  src={media.url}
                  alt={`Galeria ${idx + 1}`}
                  className="object-cover rounded-lg aspect-video cursor-pointer shadow hover:scale-105 transition"
                  tabIndex={0}
                  aria-label={`Abrir imagem ${idx + 1}`}
                  onClick={() => window.open(media.url, '_blank')}
                />
              ) : (
                <div
                  key={media.url}
                  className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center text-gray-400"
                >
                  {media.type}
                </div>
              )
            )}
          </div>
        </section>

        <section className="max-w-3xl mx-auto mt-8 px-4">
          <div className="flex gap-4 flex-wrap justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex flex-col items-center flex-1 min-w-[90px]">
              <span className="text-lg font-semibold">
                {profile.stats?.followers ?? 0}
              </span>
              <span className="text-xs text-gray-500">Seguidores</span>
            </div>
            <div className="flex flex-col items-center flex-1 min-w-[90px]">
              <span className="text-lg font-semibold">
                {profile.stats?.views ?? 0}
              </span>
              <span className="text-xs text-gray-500">Visualizações</span>
            </div>
            <div className="flex flex-col items-center flex-1 min-w-[90px]">
              <span className="text-lg font-semibold">
                {profile.stats?.posts ?? 0}
              </span>
              <span className="text-xs text-gray-500">Posts</span>
            </div>
            {isMyProfile && (
              <button
                className="flex items-center gap-2 px-3 py-1 text-sm bg-ollo-deep text-white rounded-lg shadow hover:bg-ollo transition ml-auto"
                aria-label="Ver analítica"
              >
                <ChartBarIcon className="h-5 w-5" /> Analítica
              </button>
            )}
          </div>
        </section>

        <section className="max-w-3xl mx-auto mt-8 px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {isMyProfile && (
            <>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Cog6ToothIcon className="h-5 w-5" /> Configurações de
                  Privacidade
                </h3>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={publicFields.name}
                      onChange={() =>
                        setPublicFields((f) => ({ ...f, name: !f.name }))
                      }
                    />{' '}
                    Nome é público
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={publicFields.location}
                      onChange={() =>
                        setPublicFields((f) => ({
                          ...f,
                          location: !f.location,
                        }))
                      }
                    />{' '}
                    Localização é pública
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={publicFields.bio}
                      onChange={() =>
                        setPublicFields((f) => ({ ...f, bio: !f.bio }))
                      }
                    />{' '}
                    Bio é pública
                  </label>
                  <div className="mt-2 text-xs text-gray-400">
                    <InformationCircleIcon className="h-4 w-4 inline" /> Só você
                    vê o que está privado.
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Cog6ToothIcon className="h-5 w-5" /> Personalização
                </h3>
                <div className="flex flex-col gap-2 text-gray-500">
                  <span>
                    Em breve: escolher cores, layout, modo dark/light...
                  </span>
                  <button
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-medium text-xs mt-2"
                    disabled
                  >
                    Editar tema (em breve)
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="max-w-3xl mx-auto mt-8 px-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <ChatBubbleLeftEllipsisIcon className="h-5 w-5" /> Suporte & FAQ
            </h3>
            <div className="flex flex-col gap-2">
              <a href="/faq" className="text-blue-600 hover:underline text-sm">
                Perguntas Frequentes
              </a>
              <a
                href="/contato"
                className="text-blue-600 hover:underline text-sm"
              >
                Falar com Suporte
              </a>
              <form
                className="mt-2 flex gap-2"
                aria-label="Formulário de feedback"
              >
                <input
                  type="text"
                  placeholder="Seu feedback"
                  className="flex-1 border rounded px-2 py-1 text-sm bg-gray-100 dark:bg-gray-900"
                  aria-label="Digite seu feedback"
                />
                <button className="bg-ollo-deep text-white px-4 py-1 rounded">
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </HelmetProvider>
  );
}

export default function ProfilePageWithAuth(props) {
  return (
    <AuthWrapper>
      <ProfilePage {...props} />
    </AuthWrapper>
  );
}
