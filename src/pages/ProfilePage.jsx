// --- Imports Corrigidos e Validados ---
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../API/axios';

// Ícones da Heroicons
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CameraIcon,
  PencilSquareIcon,
  CheckIcon,
  UserPlusIcon,
  ChatBubbleLeftEllipsisIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

// Componentes filhos com caminhos corrigidos
import AuthWrapper from '../components/AuthWrapper';
import PostCard from '../components/PostCard';

// --- DADOS SIMULADOS (Mantidos) ---
const usersProfileData = {
  'usuario-ollo': {
    id: 'usuario-ollo',
    name: 'Usuário OLLO',
    userNameForPosts: 'Usuário OLLO',
    bio: 'Este é o perfil do Usuário OLLO. Explorando o universo OLLO e compartilhando ideias!',
    avatarName: 'Usuário OLLO',
    coverUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    stats: { followers: 153, following: 88 },
  },
  'gemini-aux': {
    id: 'gemini-aux',
    name: 'Gemini Auxiliar',
    userNameForPosts: 'Gemini Auxiliar',
    bio: 'Assistente AI, sempre pronto para ajudar e conectar!',
    avatarName: 'Gemini Aux',
    coverUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    stats: { followers: 250, following: 10 },
  },
  'dev-entusiasta': {
    id: 'dev-entusiasta',
    name: 'Dev Entusiasta',
    userNameForPosts: 'Dev Entusiasta',
    bio: 'Apaixonado por código, React e novas tecnologias. #ReactDev',
    avatarName: 'Dev Entusiasta',
    coverUrl:
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    stats: { followers: 120, following: 75 },
  },
};
const likedPostsMap = {
  'usuario-ollo': ['bem-vindo-ollo', 'usando-useState'],
  'gemini-aux': ['componentizacao-react', 'meu-outro-post', 'bem-vindo-ollo'],
  'dev-entusiasta': ['usando-useState'],
};

const generateAvatarUrl = (name, isDark) => {
  if (!name) return '';
  const bgColor = isDark ? '00A896' : '0D1B2A';
  const textColor = isDark ? '0D1B2A' : 'E0E1DD';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=${textColor}&size=128&bold=true&format=svg`;
};

// --- COMPONENTE PRINCIPAL (ÚNICA DEFINIÇÃO) ---
function ProfilePage({
  allPosts = [],
  onCommentSubmit,
  sessionFollowStatus = {},
  setSessionFollowStatus,
}) {
  const { profileId: profileIdFromUrl } = useParams();
  const navigate = useNavigate();
  const loggedInUserId = 'usuario-ollo';
  const effectiveProfileId = profileIdFromUrl || loggedInUserId;

  // Estados
  const [profileData, setProfileData] = useState(null);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState('');
  const [editableBio, setEditableBio] = useState('');
  const [editableAvatarPreview, setEditableAvatarPreview] = useState('');
  const [editableCoverPreview, setEditableCoverPreview] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [baseFollowersCount, setBaseFollowersCount] = useState(0);
  const [activeTab, setActiveTab] = useState('posts');
  const [userComments, setUserComments] = useState([]);

  // Refs
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // --- LÓGICA DE ESTADO E EFEITOS ---
  useEffect(() => {
    const currentProfileToLoad = usersProfileData[effectiveProfileId];
    if (currentProfileToLoad) {
      const isDarkModeInitially =
        document.documentElement.classList.contains('dark');
      setProfileData({
        ...currentProfileToLoad,
        avatarUrl: generateAvatarUrl(
          currentProfileToLoad.avatarName,
          isDarkModeInitially
        ),
      });
      setProfileNotFound(false);
      setIsEditing(false);

      if (editableAvatarPreview.startsWith('blob:'))
        URL.revokeObjectURL(editableAvatarPreview);
      if (editableCoverPreview.startsWith('blob:'))
        URL.revokeObjectURL(editableCoverPreview);
      setEditableAvatarPreview('');
      setEditableCoverPreview('');

      const initialStaticFollowers = currentProfileToLoad.stats.followers;
      setBaseFollowersCount(initialStaticFollowers);
      const isCurrentlyFollowingInitial =
        effectiveProfileId !== loggedInUserId
          ? sessionFollowStatus[effectiveProfileId] || false
          : false;
      setIsFollowing(isCurrentlyFollowingInitial);
      setFollowersCount(
        initialStaticFollowers + (isCurrentlyFollowingInitial ? 1 : 0)
      );
      setIsFollowLoading(false);
    } else {
      setProfileData(null);
      setProfileNotFound(true);
    }
  }, [effectiveProfileId, loggedInUserId, sessionFollowStatus]);

  useEffect(() => {
    const updateAvatarTheme = () => {
      if (
        profileData &&
        !editableAvatarPreview &&
        profileData.avatarUrl.includes('ui-avatars.com')
      ) {
        const isDarkMode = document.documentElement.classList.contains('dark');
        const newAvatarUrl = generateAvatarUrl(
          profileData.avatarName,
          isDarkMode
        );
        if (newAvatarUrl !== profileData.avatarUrl) {
          setProfileData((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
        }
      }
    };
    updateAvatarTheme();
    const observer = new MutationObserver(updateAvatarTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [profileData, editableAvatarPreview]);

  useEffect(() => {
    if (allPosts && profileData?.userNameForPosts) {
      const commentsByThisUser = allPosts.flatMap((post) =>
        (post.comments || [])
          .filter((comment) => comment.user === profileData.userNameForPosts)
          .map((comment) => ({
            ...comment,
            id: comment.commentId || `c-${Math.random()}`,
            originalPost: {
              id: post.postId,
              contentPreview: post.content.substring(0, 100) + '...',
            },
          }))
      );
      setUserComments(commentsByThisUser);
    } else {
      setUserComments([]);
    }
  }, [allPosts, profileData?.userNameForPosts]);

  useEffect(() => {
    return () => {
      if (editableAvatarPreview.startsWith('blob:'))
        URL.revokeObjectURL(editableAvatarPreview);
      if (editableCoverPreview.startsWith('blob:'))
        URL.revokeObjectURL(editableCoverPreview);
    };
  }, [editableAvatarPreview, editableCoverPreview]);

  // --- FUNÇÕES DE MANIPULAÇÃO ---
  const handleImageChange = useCallback(
    (event, imageType) => {
      const file = event.target.files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        if (imageType === 'avatar') {
          if (editableAvatarPreview.startsWith('blob:'))
            URL.revokeObjectURL(editableAvatarPreview);
          setEditableAvatarPreview(previewUrl);
        } else if (imageType === 'cover') {
          if (editableCoverPreview.startsWith('blob:'))
            URL.revokeObjectURL(editableCoverPreview);
          setEditableCoverPreview(previewUrl);
        }
        event.target.value = null;
      }
    },
    [editableAvatarPreview, editableCoverPreview]
  );

  const handleEditToggle = useCallback(() => {
    if (!profileData) return;
    if (!isEditing) {
      setEditableName(profileData.name);
      setEditableBio(profileData.bio);
      if (editableAvatarPreview.startsWith('blob:'))
        URL.revokeObjectURL(editableAvatarPreview);
      if (editableCoverPreview.startsWith('blob:'))
        URL.revokeObjectURL(editableCoverPreview);
      setEditableAvatarPreview('');
      setEditableCoverPreview('');
    }
    setIsEditing(!isEditing);
  }, [isEditing, profileData, editableAvatarPreview, editableCoverPreview]);

  const handleSave = useCallback(() => {
    if (!profileData) return;
    const isDarkMode = document.documentElement.classList.contains('dark');
    let newAvatarUrl = profileData.avatarUrl;

    if (editableAvatarPreview) {
      newAvatarUrl = editableAvatarPreview;
    } else if (
      editableName !== profileData.name ||
      (profileData.avatarName && editableName !== profileData.avatarName)
    ) {
      newAvatarUrl = generateAvatarUrl(editableName, isDarkMode);
    }

    setProfileData((prevData) => ({
      ...prevData,
      name: editableName,
      avatarName: editableName,
      bio: editableBio,
      avatarUrl: newAvatarUrl,
      coverUrl: editableCoverPreview || prevData.coverUrl,
    }));
    setIsEditing(false);
  }, [
    profileData,
    editableName,
    editableBio,
    editableAvatarPreview,
    editableCoverPreview,
  ]);

  const handleCancel = useCallback(() => {
    if (editableAvatarPreview.startsWith('blob:'))
      URL.revokeObjectURL(editableAvatarPreview);
    if (editableCoverPreview.startsWith('blob:'))
      URL.revokeObjectURL(editableCoverPreview);
    setEditableAvatarPreview('');
    setEditableCoverPreview('');
    setIsEditing(false);
  }, [editableAvatarPreview, editableCoverPreview]);

  const handleFollowToggle = useCallback(() => {
    if (
      isFollowLoading ||
      (profileData && profileData.id === loggedInUserId) ||
      typeof setSessionFollowStatus !== 'function'
    )
      return;

    setIsFollowLoading(true);
    const newFollowingState = !isFollowing;

    setTimeout(
      () => {
        setIsFollowing(newFollowingState);
        setSessionFollowStatus((prevStatus) => ({
          ...prevStatus,
          [effectiveProfileId]: newFollowingState,
        }));
        setFollowersCount(baseFollowersCount + (newFollowingState ? 1 : 0));
        setIsFollowLoading(false);
      },
      newFollowingState ? 800 : 500
    );
  }, [
    isFollowing,
    isFollowLoading,
    profileData,
    loggedInUserId,
    effectiveProfileId,
    baseFollowersCount,
    setSessionFollowStatus,
  ]);

  // --- RENDERIZAÇÃO ---
  if (profileNotFound) {
    // O AuthWrapper aqui foi removido, pois o ProfilePageWithAuth já o fornece.
    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-8 text-center text-ollo-deep dark:text-ollo-light">
        <ExclamationTriangleIcon className="mx-auto h-20 w-20 mb-6 text-red-500 dark:text-red-400" />
        <h1 className="text-3xl font-bold mb-2">Perfil Não Encontrado</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          O perfil que você está procurando não existe ou não pôde ser
          carregado.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 px-6 py-2.5 rounded-lg font-semibold transition-colors bg-ollo-deep text-ollo-light hover:bg-opacity-90 dark:bg-ollo-accent-light dark:text-ollo-deep"
        >
          Voltar para a Página Inicial
        </button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center text-ollo-deep dark:text-ollo-light">
        <ArrowPathIcon className="h-12 w-12 animate-spin mr-3" />
        <p className="text-xl">Carregando perfil...</p>
      </div>
    );
  }

  const effectiveIsMyProfile = profileData.id === loggedInUserId;
  const currentAvatarDisplayUrl =
    editableAvatarPreview || profileData.avatarUrl;
  const currentCoverDisplayUrl = editableCoverPreview || profileData.coverUrl;
  const filteredPosts = allPosts.filter(
    (post) => post.userName === profileData.userNameForPosts
  );
  const likedPostIdsForCurrentProfile = likedPostsMap[effectiveProfileId] || [];
  const actualLikedPosts = allPosts.filter((post) =>
    likedPostIdsForCurrentProfile.includes(post.postId)
  );

  const getTabClassName = (tabName) => {
    const isActive = activeTab === tabName;
    return `py-3 px-4 sm:px-6 font-semibold text-sm sm:text-base border-b-4 -mb-px transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:z-10 ${
      isActive
        ? 'border-ollo-deep dark:border-ollo-accent-light text-ollo-deep dark:text-ollo-accent-light'
        : 'border-transparent text-gray-500 hover:text-ollo-deep dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
    } focus:ring-ollo-deep/50 dark:focus:ring-ollo-accent-light/50`;
  };

  return (
    <div>
      <div className="bg-white/80 dark:bg-ollo-slate/90 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden mb-6">
        <div className="h-52 md:h-72 bg-gradient-to-r from-ollo-accent/30 to-ollo-steel/30 dark:from-ollo-deep dark:via-teal-900 dark:to-gray-900 relative">
          <img
            className="h-full w-full object-cover"
            src={currentCoverDisplayUrl}
            alt="Imagem de Capa"
          />
          {isEditing && effectiveIsMyProfile && (
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-4 right-4 p-2.5 rounded-full transition-all duration-150 ease-in-out shadow-lg z-10 bg-white/70 hover:bg-white/90 text-ollo-deep dark:bg-black/60 dark:hover:bg-black/80 dark:text-white"
              title="Alterar imagem de capa"
            >
              <CameraIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              <input
                type="file"
                ref={coverInputRef}
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'cover')}
                className="hidden"
              />
            </button>
          )}
        </div>
        <div className="relative px-4 sm:px-6 lg:px-8 pb-8 pt-3">
          <div className="-mt-20 sm:-mt-24 flex justify-center">
            <div className="relative">
              <img
                className="h-28 w-28 sm:h-36 sm:w-36 rounded-full ring-4 ring-offset-4 ring-offset-white dark:ring-offset-ollo-slate ring-ollo-deep dark:ring-ollo-accent-light object-cover bg-gray-200 dark:bg-gray-700 shadow-md"
                src={currentAvatarDisplayUrl}
                alt={`Avatar de ${profileData.name}`}
              />
              {isEditing && effectiveIsMyProfile && (
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2 rounded-full transition-all duration-150 ease-in-out shadow-lg bg-white/70 hover:bg-white/90 text-ollo-deep dark:bg-black/60 dark:hover:bg-black/80 dark:text-white"
                  title="Alterar avatar"
                >
                  <PencilSquareIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <input
                    type="file"
                    ref={avatarInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'avatar')}
                    className="hidden"
                  />
                </button>
              )}
            </div>
          </div>

          <div className="flex mt-4 justify-center md:justify-end mb-4 min-h-[44px]">
            {effectiveIsMyProfile ? (
              isEditing ? (
                <div className="flex space-x-4">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-ollo-deep text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity dark:bg-ollo-accent-light dark:text-ollo-deep"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEditToggle}
                  className="px-5 py-2.5 border-2 border-ollo-deep text-ollo-deep rounded-lg text-sm font-semibold hover:bg-ollo-deep hover:text-white transition-colors duration-150 dark:border-ollo-accent-light dark:text-ollo-accent-light dark:hover:bg-ollo-accent-light dark:hover:text-ollo-deep"
                >
                  Editar Perfil
                </button>
              )
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 w-36 disabled:opacity-60 disabled:cursor-not-allowed 
                  ${
                    isFollowLoading
                      ? 'bg-ollo-deep text-white dark:bg-ollo-accent-light dark:text-ollo-deep'
                      : isFollowing
                        ? 'bg-transparent border-2 border-gray-400 text-gray-500 hover:border-gray-500 hover:text-gray-700 focus:ring-gray-400/30 dark:border-gray-500 dark:text-gray-400 dark:hover:border-gray-400 dark:hover:text-gray-300 dark:focus:ring-gray-500/30'
                        : 'bg-ollo-deep text-white hover:bg-opacity-90 focus:ring-ollo-deep/30 dark:bg-ollo-accent-light dark:text-ollo-deep dark:hover:bg-opacity-90 dark:focus:ring-ollo-accent-light/30'
                  }`}
              >
                {isFollowLoading ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                ) : isFollowing ? (
                  <>
                    <CheckIcon className="h-5 w-5" /> <span>Seguindo</span>
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="h-5 w-5" /> <span>Seguir</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div
            className={`mt-1 ${isEditing ? 'max-w-lg mx-auto' : 'max-w-xl mx-auto text-center'}`}
          >
            {(!isEditing || !effectiveIsMyProfile) && (
              <div className="text-center mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-ollo-deep dark:text-ollo-accent-light mb-2 tracking-tight">
                  {profileData.name}
                </h1>
                <p className="text-base text-gray-700 dark:text-gray-300 mt-2 max-w-lg mx-auto leading-relaxed">
                  {profileData.bio}
                </p>
              </div>
            )}
            {isEditing && effectiveIsMyProfile && (
              <div className="space-y-5 mb-8">
                <div>
                  <label
                    htmlFor="profileName"
                    className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5"
                  >
                    Nome
                  </label>
                  <input
                    type="text"
                    id="profileName"
                    value={editableName}
                    onChange={(e) => setEditableName(e.target.value)}
                    className="w-full p-3 rounded-lg text-base shadow-sm transition-colors bg-white/70 border-gray-300 text-gray-900 focus:ring-ollo-deep focus:border-ollo-deep dark:bg-gray-800/70 dark:border-gray-600 dark:text-white focus:dark:ring-ollo-accent-light focus:dark:border-ollo-accent-light"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profileBio"
                    className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5"
                  >
                    Bio
                  </label>
                  <textarea
                    id="profileBio"
                    rows="5"
                    value={editableBio}
                    onChange={(e) => setEditableBio(e.target.value)}
                    className="w-full p-3 rounded-lg text-base shadow-sm transition-colors bg-white/70 border-gray-300 text-gray-900 focus:ring-ollo-deep focus:border-ollo-deep dark:bg-gray-800/70 dark:border-gray-600 dark:text-white focus:dark:ring-ollo-accent-light focus:dark:border-ollo-accent-light"
                  />
                </div>
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-x-6 sm:gap-x-10 gap-y-3 text-sm">
              <div className="text-center">
                <span className="block font-bold text-xl sm:text-2xl text-ollo-deep dark:text-ollo-accent-light">
                  {filteredPosts.length}
                </span>
                <span className="text-gray-600 dark:text-gray-400">Posts</span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-xl sm:text-2xl text-ollo-deep dark:text-ollo-accent-light">
                  {followersCount}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Seguidores
                </span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-xl sm:text-2xl text-ollo-deep dark:text-ollo-accent-light">
                  {profileData.stats.following}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Seguindo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 sm:mb-8 border-b border-gray-200/80 dark:border-gray-700/50">
        <nav
          className="-mb-px flex justify-center sm:justify-start space-x-2 sm:space-x-6 lg:space-x-8"
          aria-label="Tabs"
        >
          <button
            onClick={() => setActiveTab('posts')}
            className={getTabClassName('posts')}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={getTabClassName('comments')}
          >
            Comentários
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={getTabClassName('likes')}
          >
            Curtidas
          </button>
        </nav>
      </div>

      <div className="max-w-xl mx-auto w-full px-4 sm:px-0 pb-12">
        {activeTab === 'posts' && (
          <div className="space-y-8">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.postId}
                  postData={post}
                  onCommentSubmit={onCommentSubmit}
                />
              ))
            ) : (
              <div className="rounded-xl p-8 sm:p-10 text-center shadow-xl mt-4 bg-white/60 dark:bg-ollo-slate/70">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="mt-4 text-xl font-semibold text-ollo-deep dark:text-white">
                  Sem posts por aqui ainda...
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Quando {profileData.name} compartilhar algo, seus posts
                  aparecerão aqui.
                </p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            {userComments.length > 0 ? (
              userComments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white/80 dark:bg-ollo-slate/90 p-5 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
                >
                  <p className="text-base text-ollo-deep dark:text-white mb-3">
                    "{comment.text}"
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200/80 dark:border-gray-700/50 pt-3">
                    <p>
                      Comentado em{' '}
                      <span className="font-semibold">
                        {comment.timestamp || 'data indisponível'}
                      </span>
                    </p>
                    <p className="mt-1">
                      No post:{' '}
                      <span className="italic">
                        "{comment.originalPost.contentPreview}"
                      </span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl p-8 sm:p-10 text-center shadow-xl bg-white/60 dark:bg-ollo-slate/70">
                <ChatBubbleLeftEllipsisIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" />
                <h3 className="mt-4 text-xl font-semibold text-ollo-deep dark:text-white">
                  Nenhum comentário encontrado.
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Quando {profileData.name} comentar, seus comentários
                  aparecerão aqui.
                </p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'likes' && (
          <div className="space-y-8">
            {actualLikedPosts.length > 0 ? (
              actualLikedPosts.map((post) => (
                <PostCard
                  key={post.postId}
                  postData={post}
                  onCommentSubmit={onCommentSubmit}
                />
              ))
            ) : (
              <div className="rounded-xl p-8 sm:p-10 text-center shadow-xl mt-4 bg-white/60 dark:bg-ollo-slate/70">
                <HeartIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" />
                <h3 className="mt-4 text-xl font-semibold text-ollo-deep dark:text-white">
                  Nenhuma curtida por aqui...
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Quando {profileData.name} curtir algo, aparecerá aqui.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// O componente Wrapper que será exportado.
// Ele garante que qualquer renderização de ProfilePage esteja dentro do AuthWrapper.
function ProfilePageWithAuth(props) {
  return (
    <AuthWrapper>
      <ProfilePage {...props} />
    </AuthWrapper>
  );
}

export default ProfilePageWithAuth;
