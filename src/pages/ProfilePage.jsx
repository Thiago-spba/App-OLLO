// src/pages/ProfilePage.jsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import {
    CameraIcon,
    PencilSquareIcon,
    ChatBubbleLeftEllipsisIcon,
    HeartIcon,
    UserPlusIcon,
    CheckIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon // Para perfil não encontrado
} from '@heroicons/react/24/outline'; // Outline para consistência, exceto onde solid é necessário

// --- DADOS SIMULADOS ---
const usersProfileData = {
  "usuario-ollo": {
    id: "usuario-ollo",
    name: "Usuário OLLO",
    userNameForPosts: "Usuário OLLO", // Usado para filtrar posts/comentários do usuário
    bio: "Este é o perfil do Usuário OLLO. Explorando o universo OLLO e compartilhando ideias!",
    avatarName: "Usuário OLLO", // Nome base para ui-avatars
    coverUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    stats: { followers: 153, following: 88 }
  },
  "gemini-aux": {
    id: "gemini-aux",
    name: "Gemini Auxiliar",
    userNameForPosts: "Gemini Auxiliar",
    bio: "Assistente AI, sempre pronto para ajudar e conectar!",
    avatarName: "Gemini Aux",
    coverUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    stats: { followers: 250, following: 10 }
  },
  "dev-entusiasta": {
    id: "dev-entusiasta",
    name: "Dev Entusiasta",
    userNameForPosts: "Dev Entusiasta",
    bio: "Apaixonado por código, React e novas tecnologias. #ReactDev",
    avatarName: "Dev Entusiasta",
    coverUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    stats: { followers: 120, following: 75 }
  }
};

const likedPostsMap = {
  'usuario-ollo': ['bem-vindo-ollo', 'usando-useState'],
  'gemini-aux': ['componentizacao-react', 'meu-outro-post', 'bem-vindo-ollo'],
  'dev-entusiasta': ['usando-useState'],
};

// Função utilitária para gerar avatar (fora do componente para ser estável)
const generateAvatarUrl = (name, isDark) => {
    if (!name) return ''; // Evitar erro se nome for undefined
    const bgColor = isDark ? '005A4B' : 'A0D2DB'; // ollo-deep : ollo-accent-light
    const textColor = isDark ? 'A0D2DB' : '005A4B'; // ollo-accent-light : ollo-deep
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=${textColor}&size=128&bold=true&format=svg`;
};

// --- COMPONENTE ---
function ProfilePage({ allPosts = [], onCommentSubmit, darkMode }) {
    const { profileId: profileIdFromUrl } = useParams();
    const navigate = useNavigate();
    const loggedInUserId = "usuario-ollo"; // Simulação do ID do usuário logado
    const effectiveProfileId = profileIdFromUrl || loggedInUserId;

    const [profileData, setProfileData] = useState(null); // Dados do perfil carregado
    const [profileNotFound, setProfileNotFound] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editableName, setEditableName] = useState('');
    const [editableBio, setEditableBio] = useState('');
    const [editableAvatarFile, setEditableAvatarFile] = useState(null);
    const [editableAvatarPreview, setEditableAvatarPreview] = useState('');
    const [editableCoverFile, setEditableCoverFile] = useState(null);
    const [editableCoverPreview, setEditableCoverPreview] = useState('');

    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const [isFollowing, setIsFollowing] = useState(false); // Simulado
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);

    const [activeTab, setActiveTab] = useState('posts');
    const [userComments, setUserComments] = useState([]);

    // Carregar dados do perfil
    useEffect(() => {
        const currentProfile = usersProfileData[effectiveProfileId];
        if (currentProfile) {
            setProfileData({
                ...currentProfile,
                avatarUrl: generateAvatarUrl(currentProfile.avatarName, darkMode)
            });
            setProfileNotFound(false);
            setIsEditing(false); // Resetar modo de edição ao mudar de perfil
            // Limpar previews de edição
            if (editableAvatarPreview.startsWith('blob:')) URL.revokeObjectURL(editableAvatarPreview);
            if (editableCoverPreview.startsWith('blob:')) URL.revokeObjectURL(editableCoverPreview);
            setEditableAvatarPreview('');
            setEditableCoverPreview('');
            setEditableAvatarFile(null);
            setEditableCoverFile(null);
        } else {
            setProfileData(null);
            setProfileNotFound(true);
        }
    }, [effectiveProfileId, darkMode]); // Não incluir navigate aqui para evitar re-execuções indesejadas

    // Atualizar avatar se for ui-avatars e darkMode mudar (e não houver preview de edição)
    useEffect(() => {
        if (profileData && !editableAvatarPreview && profileData.avatarUrl.includes('ui-avatars.com')) {
            setProfileData(prev => ({
                ...prev,
                avatarUrl: generateAvatarUrl(prev.avatarName, darkMode)
            }));
        }
    }, [darkMode, profileData?.avatarName]); // Depender apenas de darkMode e avatarName (do profileData)

    // Sincronizar estado de "seguir" e contagem de seguidores
    useEffect(() => {
        if (profileData) {
            setFollowersCount(profileData.stats.followers);
            setIsFollowing(false); // Simulação: resetar sempre
            setIsFollowLoading(false);
        }
    }, [profileData]);

    // Filtrar comentários do usuário
    useEffect(() => {
        if (allPosts && profileData?.userNameForPosts) {
            const commentsByThisUser = allPosts.flatMap(post =>
                (post.comments || [])
                .filter(comment => comment.user === profileData.userNameForPosts)
                .map(comment => ({
                    ...comment,
                    id: comment.commentId || `comment-${Math.random()}`, // Garantir ID único
                    originalPost: {
                        id: post.postId,
                        contentPreview: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')
                    }
                }))
            );
            setUserComments(commentsByThisUser);
        } else {
            setUserComments([]);
        }
    }, [allPosts, profileData?.userNameForPosts]);

    // Limpeza de Object URLs de previews
    useEffect(() => {
        return () => {
            if (editableAvatarPreview && editableAvatarPreview.startsWith('blob:')) {
                URL.revokeObjectURL(editableAvatarPreview);
            }
            if (editableCoverPreview && editableCoverPreview.startsWith('blob:')) {
                URL.revokeObjectURL(editableCoverPreview);
            }
        };
    }, [editableAvatarPreview, editableCoverPreview]);

    const effectiveIsMyProfile = profileData && profileData.id === loggedInUserId;

    const handleImageChange = useCallback((event, imageType) => {
        const file = event.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            if (imageType === 'avatar') {
                if (editableAvatarPreview && editableAvatarPreview.startsWith('blob:')) URL.revokeObjectURL(editableAvatarPreview);
                setEditableAvatarFile(file);
                setEditableAvatarPreview(previewUrl);
            } else if (imageType === 'cover') {
                if (editableCoverPreview && editableCoverPreview.startsWith('blob:')) URL.revokeObjectURL(editableCoverPreview);
                setEditableCoverFile(file);
                setEditableCoverPreview(previewUrl);
            }
        }
    }, [editableAvatarPreview, editableCoverPreview]);

    const handleEditToggle = useCallback(() => {
        if (!profileData) return;
        if (!isEditing) {
            setEditableName(profileData.name);
            setEditableBio(profileData.bio);
            // Limpar previews antigos ao entrar no modo de edição
            if (editableAvatarPreview.startsWith('blob:')) URL.revokeObjectURL(editableAvatarPreview);
            if (editableCoverPreview.startsWith('blob:')) URL.revokeObjectURL(editableCoverPreview);
            setEditableAvatarPreview('');
            setEditableCoverPreview('');
            setEditableAvatarFile(null);
            setEditableCoverFile(null);
        }
        setIsEditing(!isEditing);
    }, [isEditing, profileData, editableAvatarPreview, editableCoverPreview]);

    const handleSave = useCallback(() => {
        if (!profileData) return;

        let newAvatarUrl = profileData.avatarUrl;
        if (editableAvatarPreview) { // Se há um preview (blob), use-o
            newAvatarUrl = editableAvatarPreview;
        } else if (editableName !== profileData.name || editableName !== profileData.avatarName) { // Se não há preview E o nome mudou
            newAvatarUrl = generateAvatarUrl(editableName, darkMode);
        }
        // Se nem preview nem nome mudou, mantém o avatarUrl original (que pode ter sido atualizado pelo darkMode)

        setProfileData(prevData => ({
            ...prevData,
            name: editableName,
            avatarName: editableName, // Atualizar também o nome base para o avatar
            bio: editableBio,
            avatarUrl: newAvatarUrl,
            coverUrl: editableCoverPreview || prevData.coverUrl, // Usa preview da capa ou mantém a antiga
        }));
        setIsEditing(false);
        // Não revogar ObjectURLs aqui, pois elas agora fazem parte de profileData.avatarUrl ou coverUrl
        // A limpeza de blobs antigos que NÃO foram salvos é feita no useEffect de limpeza ou ao re-entrar no modo de edição.
    }, [profileData, editableName, editableBio, editableAvatarPreview, editableCoverPreview, darkMode]);

    const handleCancel = useCallback(() => {
        // Limpa os previews que não foram salvos
        if (editableAvatarPreview.startsWith('blob:')) URL.revokeObjectURL(editableAvatarPreview);
        if (editableCoverPreview.startsWith('blob:')) URL.revokeObjectURL(editableCoverPreview);
        setEditableAvatarFile(null);
        setEditableAvatarPreview('');
        setEditableCoverFile(null);
        setEditableCoverPreview('');
        setIsEditing(false);
    }, [editableAvatarPreview, editableCoverPreview]);

    const handleFollowToggle = useCallback(() => {
        if (isFollowLoading) return;
        setIsFollowLoading(true);
        setTimeout(() => {
            if (isFollowing) {
                setFollowersCount(prev => prev - 1);
            } else {
                setFollowersCount(prev => prev + 1);
            }
            setIsFollowing(prev => !prev);
            setIsFollowLoading(false);
        }, isFollowing ? 500 : 1000);
    }, [isFollowing, isFollowLoading]);


    if (profileNotFound) {
        return (
            <div className={`min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-8 text-center ${darkMode ? 'text-ollo-bg-light' : 'text-ollo-deep'}`}>
                <ExclamationTriangleIcon className={`mx-auto h-20 w-20 mb-6 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                <h1 className="text-3xl font-bold mb-2">Perfil Não Encontrado</h1>
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>O perfil que você está procurando não existe ou não pôde ser carregado.</p>
                <button
                    onClick={() => navigate('/')}
                    className={`mt-8 px-6 py-2.5 rounded-lg font-semibold transition-colors
                        ${darkMode ? 'bg-ollo-accent-light text-ollo-deep hover:bg-opacity-90' 
                                   : 'bg-ollo-deep text-ollo-bg-light hover:bg-opacity-90'}`}
                >
                    Voltar para a Página Inicial
                </button>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className={`min-h-[calc(100vh-200px)] flex items-center justify-center ${darkMode ? 'text-ollo-bg-light' : 'text-ollo-deep'}`}>
                <ArrowPathIcon className="h-12 w-12 animate-spin mr-3" />
                <p className="text-xl">Carregando perfil...</p>
            </div>
        );
    }

    // Dados derivados para exibição
    const currentAvatarDisplayUrl = editableAvatarPreview || profileData.avatarUrl;
    const currentCoverDisplayUrl = editableCoverPreview || profileData.coverUrl;
    const filteredPosts = allPosts.filter(post => post.userName === profileData.userNameForPosts);
    const likedPostIdsForCurrentProfile = likedPostsMap[effectiveProfileId] || [];
    const actualLikedPosts = allPosts.filter(post => likedPostIdsForCurrentProfile.includes(post.postId));

    // Estilos (mantidos da sua versão, para consistência)
    const cardBgColor = darkMode ? 'bg-ollo-deep border-gray-700' : 'bg-ollo-bg-light/90 border-gray-200';
    const bioTextColor = darkMode ? 'text-gray-300' : 'text-ollo-deep';
    const statsTextColor = darkMode ? 'text-gray-400' : 'text-ollo-deep';
    const statsNumbersColor = darkMode ? 'text-ollo-accent-light' : 'text-ollo-deep';
    const textColorPrimary = darkMode ? 'text-gray-200' : 'text-ollo-deep';
    const textColorSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
    const accentColor = darkMode ? 'text-ollo-accent-light' : 'text-ollo-deep';
    const accentRingOffsetColor = darkMode ? 'ring-offset-ollo-deep' : 'ring-offset-ollo-bg-light';
    const accentRingColor = darkMode ? 'ring-ollo-accent-light' : 'ring-ollo-deep';
    const inputBgColor = darkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:ring-ollo-accent-light focus:border-ollo-accent-light' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-ollo-deep focus:border-ollo-deep';
    const buttonIconEditBg = darkMode ? 'bg-black/60 hover:bg-black/80 text-white' : 'bg-white/70 hover:bg-gray-50/90 text-ollo-deep';
    const editProfileButtonClasses = darkMode ? "px-5 py-2.5 border-2 border-ollo-accent-light text-ollo-accent-light rounded-lg text-sm font-semibold hover:bg-ollo-accent-light hover:text-ollo-deep" : "px-5 py-2.5 border-2 border-ollo-deep text-ollo-deep rounded-lg text-sm font-semibold hover:bg-ollo-deep hover:text-ollo-bg-light";
    const saveButtonClasses = darkMode ? "px-6 py-2.5 bg-ollo-accent-light text-ollo-deep rounded-lg text-sm font-bold hover:opacity-90" : "px-6 py-2.5 bg-ollo-deep text-ollo-bg-light rounded-lg text-sm font-bold hover:opacity-90";
    const cancelButtonClasses = darkMode ? "px-5 py-2.5 bg-gray-600 text-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-700" : "px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300";
    const placeholderCardClasses = darkMode ? "bg-gray-800/60 border-gray-700/50" : "bg-ollo-bg-light/90 border-gray-200";
    const placeholderSvgIconColor = darkMode ? "text-gray-600" : "text-gray-400";
    const followButtonBaseClasses = "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 w-36";
    const followButtonClasses = darkMode ? `${followButtonBaseClasses} bg-ollo-accent-light text-ollo-deep hover:bg-opacity-90 focus:ring-ollo-accent-light/30` : `${followButtonBaseClasses} bg-ollo-deep text-ollo-bg-light hover:bg-opacity-90 focus:ring-ollo-deep/30`;
    const followingButtonClasses = darkMode ? `${followButtonBaseClasses} bg-transparent border-2 border-gray-500 text-gray-400 hover:border-gray-400 hover:text-gray-300 focus:ring-gray-500/30` : `${followButtonBaseClasses} bg-transparent border-2 border-gray-400 text-gray-500 hover:border-gray-500 hover:text-gray-700 focus:ring-gray-400/30`;
    const loadingButtonClasses = `${followButtonClasses} opacity-75 cursor-not-allowed`;

    const getTabClassName = (tabName) => {
        const isActive = activeTab === tabName;
        if (darkMode) {
            return `py-3 px-4 sm:px-6 font-semibold text-sm sm:text-base border-b-4 -mb-px transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-ollo-accent-light/50 focus:z-10
                    ${isActive ? 'border-ollo-accent-light text-ollo-accent-light' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'}`;
        } else {
            return `py-3 px-4 sm:px-6 font-semibold text-sm sm:text-base border-b-4 -mb-px transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-ollo-deep/50 focus:z-10
                    ${isActive ? 'border-ollo-deep text-ollo-deep' : 'border-transparent text-gray-500 hover:text-ollo-deep hover:border-gray-300'}`;
        }
    };

    return (
        <div>
            <div className={`${cardBgColor} backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden mb-6`}>
                <div className={`h-52 md:h-72 ${darkMode ? 'bg-gradient-to-r from-ollo-deep via-teal-800 to-gray-900' : 'bg-gradient-to-r from-ollo-crystal-green via-ollo-sky-blue to-ollo-accent-light'} relative`}>
                    <img className="h-full w-full object-cover" src={currentCoverDisplayUrl} alt="Imagem de Capa" />
                    {isEditing && effectiveIsMyProfile && (
                        <button onClick={() => coverInputRef.current && coverInputRef.current.click()} className={`absolute top-4 right-4 p-2.5 rounded-full transition-all duration-150 ease-in-out shadow-lg z-10 ${buttonIconEditBg}`} title="Alterar imagem de capa" >
                            <CameraIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                            <input type="file" ref={coverInputRef} accept="image/*" onChange={(e) => handleImageChange(e, 'cover')} className="hidden" />
                        </button>
                    )}
                </div>
                <div className="relative px-4 sm:px-6 lg:px-8 pb-8 pt-3">
                    <div className="-mt-20 sm:-mt-24 flex justify-center">
                        <div className="relative">
                            <img className={`h-28 w-28 sm:h-36 sm:w-36 rounded-full ring-4 ${accentRingOffsetColor} ${accentRingColor} object-cover ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} shadow-md`} src={currentAvatarDisplayUrl} alt={`Avatar de ${profileData.name}`} />
                            {isEditing && effectiveIsMyProfile && (
                                <button onClick={() => avatarInputRef.current && avatarInputRef.current.click()} className={`absolute bottom-1 right-1 p-2 rounded-full transition-all duration-150 ease-in-out shadow-lg ${buttonIconEditBg}`} title="Alterar avatar" >
                                    <PencilSquareIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <input type="file" ref={avatarInputRef} accept="image/*" onChange={(e) => handleImageChange(e, 'avatar')} className="hidden" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={`flex mt-4 ${isEditing && effectiveIsMyProfile ? 'justify-center' : 'justify-end'} mb-4`}>
                        {effectiveIsMyProfile ? (
                            isEditing ? (
                                <div className="flex space-x-4">
                                    <button onClick={handleSave} className={saveButtonClasses}>Salvar Alterações</button>
                                    <button onClick={handleCancel} className={cancelButtonClasses}>Cancelar</button>
                                </div>
                            ) : (
                                <button onClick={handleEditToggle} className={editProfileButtonClasses}>Editar Perfil</button>
                            )
                        ) : isFollowLoading ? (
                            <button className={loadingButtonClasses} disabled >
                                <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                                <span>Conectando...</span>
                            </button>
                        ) : isFollowing ? (
                            <button onClick={handleFollowToggle} className={followingButtonClasses}>
                                <CheckIcon className="h-5 w-5 mr-2" />
                                <span>Seguindo</span>
                            </button>
                        ) : (
                            <button onClick={handleFollowToggle} className={followButtonClasses}>
                                <UserPlusIcon className="h-5 w-5 mr-2" />
                                <span>Seguir</span>
                            </button>
                        )}
                    </div>
                    <div className={`mt-1 ${isEditing && effectiveIsMyProfile ? 'max-w-lg mx-auto' : 'max-w-xl mx-auto text-center sm:text-left'}`}>
                        {(!isEditing || !effectiveIsMyProfile) && (
                            <div className="text-center">
                                <h1 className={`text-3xl sm:text-4xl font-bold ${accentColor} mb-2 tracking-tight`}>{profileData.name}</h1>
                                <p className={`text-base ${bioTextColor} mt-2 max-w-lg mx-auto leading-relaxed mb-8`}>{profileData.bio}</p>
                            </div>
                        )}
                        {isEditing && effectiveIsMyProfile && (
                            <div className="space-y-5 mb-8">
                                <div>
                                    <label htmlFor="profileName" className={`block text-sm font-medium ${textColorSecondary} mb-1.5`}>Nome</label>
                                    <input type="text" id="profileName" value={editableName} onChange={(e) => setEditableName(e.target.value)} className={`w-full p-3 rounded-lg text-base shadow-sm transition-colors ${inputBgColor}`} />
                                </div>
                                <div>
                                    <label htmlFor="profileBio" className={`block text-sm font-medium ${textColorSecondary} mb-1.5`}>Bio</label>
                                    <textarea id="profileBio" rows="5" value={editableBio} onChange={(e) => setEditableBio(e.target.value)} className={`w-full p-3 rounded-lg text-base shadow-sm transition-colors ${inputBgColor}`} />
                                </div>
                            </div>
                        )}
                        <div className={`flex flex-wrap justify-center gap-x-6 sm:gap-x-10 gap-y-3 text-sm`}>
                            <div className="text-center">
                                <span className={`block font-bold text-xl sm:text-2xl ${statsNumbersColor}`}>{filteredPosts.length}</span>
                                <span className={statsTextColor}>Posts</span>
                            </div>
                            <div className="text-center">
                                <span className={`block font-bold text-xl sm:text-2xl ${statsNumbersColor}`}>{followersCount}</span>
                                <span className={statsTextColor}>Seguidores</span>
                            </div>
                            <div className="text-center">
                                <span className={`block font-bold text-xl sm:text-2xl ${statsNumbersColor}`}>{profileData.stats.following}</span>
                                <span className={statsTextColor}>Seguindo</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`mb-6 sm:mb-8 border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200'}`}>
                <nav className="-mb-px flex justify-center sm:justify-start space-x-2 sm:space-x-6 lg:space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('posts')} className={getTabClassName('posts')}>Posts</button>
                    <button onClick={() => setActiveTab('comments')} className={getTabClassName('comments')}>Comentários</button>
                    <button onClick={() => setActiveTab('likes')} className={getTabClassName('likes')}>Curtidas</button>
                </nav>
            </div>
            
            <div className="max-w-xl mx-auto">
                {activeTab === 'posts' && (
                    <div className="space-y-8">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((post) => (<PostCard key={post.postId} postData={post} onCommentSubmit={onCommentSubmit} darkMode={darkMode} />))
                        ) : (
                            <div className={`backdrop-blur-sm rounded-xl p-8 sm:p-10 text-center shadow-xl mt-4 ${placeholderCardClasses}`}>
                                <svg className={`mx-auto h-16 w-16 ${placeholderSvgIconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                                <h3 className={`mt-4 text-xl font-semibold ${textColorPrimary}`}>Sem posts por aqui ainda...</h3>
                                <p className={`mt-2 text-base ${textColorSecondary}`}>Quando ${profileData.name} compartilhar algo, seus posts aparecerão aqui.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div className="space-y-6 animate-fadeIn">
                        {userComments.length > 0 ? (
                            userComments.map((comment) => (
                                <div key={comment.id} className={`${cardBgColor} backdrop-blur-lg p-5 rounded-xl shadow-lg border`}>
                                    <p className={`text-base ${textColorPrimary} mb-3`}>"{comment.text}"</p>
                                    <div className={`text-xs ${textColorSecondary} border-t ${darkMode ? 'border-gray-700/50' : 'border-gray-200/80'} pt-3`}>
                                        <p>Comentado em <span className="font-semibold">{comment.timestamp}</span></p>
                                        <p className="mt-1">No post: <span className="italic">"{comment.originalPost.contentPreview}"</span></p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={`backdrop-blur-sm rounded-xl p-8 sm:p-10 text-center shadow-xl ${placeholderCardClasses}`}>
                                <ChatBubbleLeftEllipsisIcon className={`mx-auto h-16 w-16 ${placeholderSvgIconColor}`} />
                                <h3 className={`mt-4 text-xl font-semibold ${textColorPrimary}`}>Nenhum comentário encontrado.</h3>
                                <p className={`mt-2 text-base ${textColorSecondary}`}>Quando ${profileData.name} comentar em algum post, seus comentários aparecerão aqui.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'likes' && (
                    <div className="space-y-8">
                        {actualLikedPosts.length > 0 ? (
                            actualLikedPosts.map((post) => (<PostCard key={post.postId} postData={post} onCommentSubmit={onCommentSubmit} darkMode={darkMode} />))
                        ) : (
                            <div className={`backdrop-blur-sm rounded-xl p-8 sm:p-10 text-center shadow-xl mt-4 ${placeholderCardClasses}`}>
                                <HeartIcon className={`mx-auto h-16 w-16 ${placeholderSvgIconColor}`} />
                                <h3 className={`mt-4 text-xl font-semibold ${textColorPrimary}`}>Nenhuma curtida por aqui...</h3>
                                <p className={`mt-2 text-base ${textColorSecondary}`}>Quando ${profileData.name} curtir algum post, ele aparecerá aqui.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
export default ProfilePage;