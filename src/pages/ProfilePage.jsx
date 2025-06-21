import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, auth, storage } from '../firebase/config';
import AuthWrapper from '../components/AuthWrapper';
import {
  PencilSquareIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  ChatBubbleLeftEllipsisIcon,
  UserPlusIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Camera, Trash } from '@phosphor-icons/react';

const AVATAR_DEFAULT =
  'https://ui-avatars.com/api/?name=OLLO+User&background=0D1B2A&color=fff&size=128';
const COVER_DEFAULT =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1350&q=80';

function ProfilePage() {
  const { profileId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [galleryUpload, setGalleryUpload] = useState(null);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [publicFields, setPublicFields] = useState({
    name: true,
    location: true,
    bio: true,
    video: true,
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({ defaultValues: { name: '', bio: '', location: '' } });

  // Carrega dados de perfil, galeria, posts e comentários
  useEffect(() => {
    setCurrentUser(auth.currentUser);
    async function fetchProfile() {
      const uid = profileId || (auth.currentUser ? auth.currentUser.uid : null);
      const empty = {
        id: uid,
        name: '',
        bio: '',
        location: '',
        avatarUrl: '',
        coverUrl: '',
        videoUrl: '',
        gallery: [],
        stats: { views: 0, followers: 0, posts: 0 },
      };
      if (!uid) {
        setProfile(empty);
        reset({ name: '', bio: '', location: '' });
        setAvatarPreview('');
        setCoverPreview('');
        setVideoPreview('');
        setGallery([]);
        setPosts([]);
        setComments([]);
        return;
      }
      // Perfil
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({ ...data, id: uid });
        reset({
          name: data.name ?? '',
          bio: data.bio ?? '',
          location: data.location ?? '',
        });
        setAvatarPreview(data.avatarUrl || '');
        setCoverPreview(data.coverUrl || '');
        setVideoPreview(data.videoUrl || '');
        setGallery(data.gallery || []);
      } else {
        setProfile(empty);
        reset({ name: '', bio: '', location: '' });
        setGallery([]);
      }
      // Posts
      const postQ = query(collection(db, 'posts'), where('userId', '==', uid));
      const postSnap = await getDocs(postQ);
      setPosts(postSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      // Comentários
      const commentQ = query(
        collection(db, 'comments'),
        where('userId', '==', uid)
      );
      const commentSnap = await getDocs(commentQ);
      setComments(commentSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    fetchProfile();
  }, [profileId, reset]);

  // Preview local de imagens/avatar/cover
  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'avatar') setAvatarPreview(reader.result);
      if (type === 'cover') setCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Preview local de vídeo
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    const reader = new FileReader();
    reader.onload = () => setVideoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Preview local de mídia da galeria
  const handleGallerySelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setGalleryUpload(file);

    const reader = new FileReader();
    reader.onload = () => {
      setGallery((prev) => [
        ...prev,
        {
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url: reader.result,
          name: file.name,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  // Salvar no Firestore + Storage
  const onSubmit = async (data) => {
    if (!currentUser) return;
    const uid = profile.id || currentUser.uid;
    let videoUrl = profile.videoUrl || '';
    // Upload do vídeo (se selecionado)
    if (videoFile) {
      const vidRef = storageRef(
        storage,
        `users/${uid}/videos/${videoFile.name}`
      );
      await uploadBytes(vidRef, videoFile);
      videoUrl = await getDownloadURL(vidRef);
    }
    // Upload de mídia da galeria
    let updatedGallery = [...gallery];
    if (galleryUpload) {
      const file = galleryUpload;
      const galRef = storageRef(storage, `users/${uid}/gallery/${file.name}`);
      await uploadBytes(galRef, file);
      const galUrl = await getDownloadURL(galRef);
      updatedGallery = [
        ...gallery,
        {
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url: galUrl,
          name: file.name,
        },
      ];
      setGallery(updatedGallery);
    }
    await setDoc(
      doc(db, 'users', uid),
      {
        name: data.name,
        bio: data.bio,
        location: data.location,
        avatarUrl: avatarPreview || '',
        coverUrl: coverPreview || '',
        videoUrl,
        gallery: updatedGallery,
        stats: profile.stats || { views: 0, followers: 0, posts: 0 },
      },
      { merge: true }
    );
    setEditing(false);
    alert('Perfil salvo!');
    setProfile((prev) => ({
      ...prev,
      ...data,
      avatarUrl: avatarPreview || '',
      coverUrl: coverPreview || '',
      videoUrl,
      gallery: updatedGallery,
    }));
  };

  // Excluir mídia da galeria
  const handleDeleteMedia = async (media) => {
    if (!window.confirm('Excluir essa mídia da galeria?')) return;
    // Remove do Storage
    try {
      const ref = storageRef(
        storage,
        `users/${profile.id}/gallery/${media.name}`
      );
      await deleteObject(ref);
    } catch (err) {
      // Caso seja só preview local
    }
    // Remove do state/local
    const updatedGallery = gallery.filter((g) => g.url !== media.url);
    setGallery(updatedGallery);
    // Atualiza no Firestore
    await setDoc(
      doc(db, 'users', profile.id),
      { gallery: updatedGallery },
      { merge: true }
    );
  };

  // Excluir perfil
  const handleDeleteProfile = async () => {
    if (!window.confirm('Tem certeza? Esta ação é irreversível!')) return;
    await deleteDoc(doc(db, 'users', currentUser.uid));
    // Se quiser, remova do Auth (auth.currentUser.delete())
    alert('Perfil excluído.');
    navigate('/');
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        Carregando...
      </div>
    );
  }

  const nameField = watch('name');
  const bioField = watch('bio');
  const locationField = watch('location');

  return (
    <main className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-16">
      {/* Cover */}
      <section className="relative h-48 md:h-64 w-full">
        <img
          src={coverPreview || profile.coverUrl || COVER_DEFAULT}
          alt="Imagem de capa"
          className="w-full h-full object-cover"
        />
        {currentUser && (!profileId || currentUser.uid === profileId) && (
          <>
            <button
              aria-label="Alterar capa"
              className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white rounded-full p-2 hover:bg-opacity-80 transition"
              onClick={() => coverInputRef.current.click()}
            >
              <Camera size={20} weight="bold" />
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, 'cover')}
            />
          </>
        )}
      </section>

      {/* Avatar, Nome, Bio, Localização */}
      <section className="relative max-w-3xl mx-auto px-4 flex flex-col items-center">
        <div className="relative -mt-20 w-32 h-32 md:w-40 md:h-40">
          <img
            src={avatarPreview || profile.avatarUrl || AVATAR_DEFAULT}
            alt="Foto de perfil"
            className="w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-900 shadow-lg"
          />
          {currentUser && (!profileId || currentUser.uid === profileId) && (
            <>
              <button
                aria-label="Alterar avatar"
                className="absolute bottom-2 right-2 bg-ollo-deep text-white rounded-full p-2 hover:bg-ollo transition"
                onClick={() => avatarInputRef.current.click()}
              >
                <Camera size={18} weight="bold" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'avatar')}
              />
            </>
          )}
        </div>
        {/* Formulário de edição */}
        <div className="mt-3 w-full text-center md:text-left">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                {/* Nome */}
                <h1 className="text-2xl md:text-3xl font-bold">
                  {editing ? (
                    <>
                      <input
                        type="text"
                        {...register('name', { required: true })}
                        className="border-b px-2 py-1 rounded w-full bg-gray-100 dark:bg-gray-900"
                        placeholder="Nome"
                      />
                      {errors.name && (
                        <span className="text-red-500 text-xs block">
                          Nome obrigatório
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {nameField}
                      <button
                        type="button"
                        className="ml-2 align-middle"
                        onClick={() =>
                          setPublicFields((f) => ({
                            ...f,
                            name: !f.name,
                          }))
                        }
                        aria-label={
                          publicFields.name ? 'Nome público' : 'Nome privado'
                        }
                      >
                        {publicFields.name ? (
                          <EyeIcon className="h-5 w-5 inline text-green-600" />
                        ) : (
                          <EyeSlashIcon className="h-5 w-5 inline text-red-500" />
                        )}
                      </button>
                    </>
                  )}
                </h1>

                {/* Bio */}
                <p className="text-gray-500 mt-1 max-w-xl">
                  {editing ? (
                    <>
                      <textarea
                        {...register('bio', { maxLength: 180 })}
                        className="border rounded px-2 py-1 w-full bg-gray-100 dark:bg-gray-900"
                        placeholder="Bio"
                        rows={2}
                      />
                      {errors.bio && (
                        <span className="text-red-500 text-xs block">
                          Bio muito longa
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {bioField}
                      <button
                        type="button"
                        className="ml-2 align-middle"
                        onClick={() =>
                          setPublicFields((f) => ({
                            ...f,
                            bio: !f.bio,
                          }))
                        }
                        aria-label={
                          publicFields.bio ? 'Bio pública' : 'Bio privada'
                        }
                      >
                        {publicFields.bio ? (
                          <EyeIcon className="h-4 w-4 inline text-green-600" />
                        ) : (
                          <EyeSlashIcon className="h-4 w-4 inline text-red-500" />
                        )}
                      </button>
                    </>
                  )}
                </p>

                {/* Localização */}
                <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
                  <span>
                    <svg width="16" height="16" fill="none" className="inline">
                      <path
                        d="M8 1.333a5.667 5.667 0 100 11.334A5.667 5.667 0 008 1.333zm0 10A4.333 4.333 0 118 2.667a4.333 4.333 0 010 8.666z"
                        fill="currentColor"
                      />
                      <circle cx="8" cy="7" r="2" fill="currentColor" />
                    </svg>
                  </span>
                  {editing ? (
                    <input
                      type="text"
                      {...register('location')}
                      className="border-b px-2 bg-gray-100 dark:bg-gray-900 rounded"
                      placeholder="Localização"
                    />
                  ) : (
                    <>
                      {locationField}
                      <button
                        type="button"
                        className="ml-2 align-middle"
                        onClick={() =>
                          setPublicFields((f) => ({
                            ...f,
                            location: !f.location,
                          }))
                        }
                        aria-label={
                          publicFields.location
                            ? 'Localização pública'
                            : 'Localização privada'
                        }
                      >
                        {publicFields.location ? (
                          <EyeIcon className="h-4 w-4 inline text-green-600" />
                        ) : (
                          <EyeSlashIcon className="h-4 w-4 inline text-red-500" />
                        )}
                      </button>
                    </>
                  )}
                </p>
              </div>
              {/* Botões */}
              <div className="flex gap-2 justify-center md:justify-end">
                {currentUser &&
                (!profileId || currentUser.uid === profileId) ? (
                  editing ? (
                    <>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        onClick={() => setEditing(false)}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      onClick={() => setEditing(true)}
                      aria-label="Editar perfil"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                  )
                ) : (
                  <>
                    <button
                      type="button"
                      className="px-3 py-2 bg-ollo-deep text-white rounded-lg flex items-center gap-1 hover:bg-ollo transition"
                    >
                      <UserPlusIcon className="h-5 w-5" />
                      Seguir
                    </button>
                    <button
                      type="button"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-1"
                    >
                      <EnvelopeIcon className="h-5 w-5" />
                      Mensagem
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Card de Vídeo */}
      <section className="max-w-md mx-auto mt-8 px-4">
        <h2 className="text-lg font-semibold mb-2">Vídeo</h2>
        <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden aspect-video max-w-md mx-auto">
          {videoPreview || profile.videoUrl ? (
            <video
              src={videoPreview || profile.videoUrl}
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-500">
              Sem vídeo
            </div>
          )}
          {currentUser && (!profileId || currentUser.uid === profileId) && (
            <>
              <button
                aria-label="Editar vídeo"
                className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-2 hover:bg-opacity-80 transition"
                onClick={() => videoInputRef.current.click()}
              >
                <Camera size={18} weight="bold" />
              </button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoSelect}
              />
            </>
          )}
        </div>
      </section>

      {/* Galeria */}
      <section className="max-w-3xl mx-auto mt-8 px-4">
        <h2 className="text-lg font-semibold mb-2">Galeria</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(!gallery || gallery.length === 0) && (
            <div className="col-span-full text-gray-500 text-center p-6">
              Galeria vazia
            </div>
          )}
          {gallery?.map((media, idx) => (
            <div key={media.url} className="relative group">
              {media.type === 'image' ? (
                <img
                  src={media.url}
                  alt={`Galeria ${idx + 1}`}
                  className="object-cover rounded-lg aspect-video cursor-pointer shadow hover:scale-105 transition"
                  onClick={() => window.open(media.url, '_blank')}
                />
              ) : (
                <video
                  src={media.url}
                  controls
                  className="object-cover rounded-lg aspect-video cursor-pointer shadow hover:scale-105 transition"
                />
              )}
              {currentUser && (!profileId || currentUser.uid === profileId) && (
                <button
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition"
                  onClick={() => handleDeleteMedia(media)}
                  title="Excluir mídia"
                >
                  <Trash size={16} />
                </button>
              )}
            </div>
          ))}
          {currentUser && (!profileId || currentUser.uid === profileId) && (
            <div
              onClick={() => galleryInputRef.current.click()}
              className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer h-24"
            >
              <span>Adicionar mídia</span>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleGallerySelect}
              />
            </div>
          )}
        </div>
      </section>

      {/* Posts */}
      <section className="max-w-3xl mx-auto mt-8 px-4">
        <h2 className="text-lg font-semibold mb-2">Posts</h2>
        <div className="grid gap-3">
          {posts.length === 0 && (
            <div className="text-gray-500">Nenhum post.</div>
          )}
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-3 rounded shadow bg-white dark:bg-gray-900"
            >
              <div className="font-semibold">{post.title}</div>
              <div>{post.content}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Comentários */}
      <section className="max-w-3xl mx-auto mt-8 px-4">
        <h2 className="text-lg font-semibold mb-2">Comentários</h2>
        <div className="grid gap-3">
          {comments.length === 0 && (
            <div className="text-gray-500">Nenhum comentário.</div>
          )}
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 rounded shadow bg-white dark:bg-gray-900"
            >
              <div>{comment.content}</div>
              <div className="text-xs text-gray-400">
                {comment.createdAt &&
                  new Date(comment.createdAt.seconds * 1000).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Estatísticas */}
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
        </div>
      </section>

      {/* Privacidade e Personalização */}
      <section className="max-w-3xl mx-auto mt-8 px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <Cog6ToothIcon className="h-5 w-5" /> Configurações de Privacidade
          </h3>
          <div className="flex flex-col gap-2">
            {['name', 'location', 'bio', 'video'].map((field) => (
              <label key={field} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={publicFields[field]}
                  onChange={() =>
                    setPublicFields((f) => ({
                      ...f,
                      [field]: !f[field],
                    }))
                  }
                />
                {field === 'video'
                  ? 'Vídeo é público'
                  : `${field.charAt(0).toUpperCase() + field.slice(1)} é público`}
              </label>
            ))}
            <div className="mt-2 text-xs text-gray-400">
              Defina quem pode ver suas informações.{' '}
              <InformationCircleIcon className="h-4 w-4 inline" /> Só você vê o
              que está privado.
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <Cog6ToothIcon className="h-5 w-5" /> Personalização
          </h3>
          <div className="flex flex-col gap-2 text-gray-500">
            <span>
              Em breve: cores, layout, modo dark/light, reordenar seções...
            </span>
            <button
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-medium text-xs mt-2"
              disabled
            >
              Editar tema (em breve)
            </button>
          </div>
        </div>
      </section>

      {/* Suporte & FAQ */}
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
            <form className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Seu feedback"
                className="flex-1 border rounded px-2 py-1 text-sm bg-gray-100 dark:bg-gray-900"
              />
              <button className="bg-ollo-deep text-white px-4 py-1 rounded">
                Enviar
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Excluir Perfil */}
      {currentUser && (!profileId || currentUser.uid === profileId) && (
        <section className="max-w-3xl mx-auto mt-10 px-4 text-center">
          <button
            className="px-5 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-800 transition"
            onClick={handleDeleteProfile}
          >
            Excluir meu perfil
          </button>
        </section>
      )}
    </main>
  );
}

export default function ProfilePageWithAuth(props) {
  return (
    <AuthWrapper>
      <ProfilePage {...props} />
    </AuthWrapper>
  );
}
