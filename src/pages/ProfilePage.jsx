// src/pages/ProfilePage.jsx (VERSÃO REFINADA)

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import {
    CameraIcon,
    PencilSquareIcon,
    ChatBubbleLeftEllipsisIcon,
    HeartIcon,
    UserPlusIcon,
    CheckIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

function ProfilePage({ allPosts, onCommentSubmit, darkMode }) {
    const { profileId: profileIdFromUrl } = useParams();
    const loggedInUserId = "logged-in-user-123";
    const initialProfileBase = {
        id: "usuario-ollo-id",
        name: "Usuário OLLO",
        bio: "Este é o perfil do Usuário OLLO. Explorando o universo OLLO e compartilhando ideias!",
        avatarUrl: '',
        coverUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        stats: { followers: 153, following: 88 }
    };

    const generateAvatarUrl = (name, isDark) => {
        const bgColor = isDark ? '005A4B' : 'A0D2DB';
        const textColor = isDark ? 'A0D2DB' : '005A4B';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=${textColor}&size=128&bold=true`;
    };

    const [profileData, setProfileData] = useState({
        ...initialProfileBase,
        avatarUrl: generateAvatarUrl(initialProfileBase.name, darkMode)
    });

    const effectiveIsMyProfile = profileData.id === loggedInUserId;
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [followersCount, setFollowersCount] = useState(profileData.stats.followers);
    const [isEditing, setIsEditing] = useState(false);
    const [editableName, setEditableName] = useState('');
    const [editableBio, setEditableBio] = useState('');
    const [editableAvatarFile, setEditableAvatarFile] = useState(null);
    const [editableAvatarPreview, setEditableAvatarPreview] = useState('');
    const [editableCoverFile, setEditableCoverFile] = useState(null);
    const [editableCoverPreview, setEditableCoverPreview] = useState('');
    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('posts');
    const [likedPostIds, setLikedPostIds] = useState([]);
    const [userComments, setUserComments] = useState([]);

    useEffect(() => {
        setFollowersCount(profileData.stats.followers);
        setIsFollowing(false);
        setIsFollowLoading(false);
    }, [profileData.id, profileData.stats.followers]);

    useEffect(() => {
        if (!editableAvatarPreview) {
            setProfileData(prev => ({
                ...prev,
                avatarUrl: generateAvatarUrl(prev.name, darkMode)
            }));
        }
    }, [darkMode, editableAvatarPreview, profileData.name]);

    useEffect(() => {
        if (profileData.id === "usuario-ollo-id") {
            setLikedPostIds(['bem-vindo-ollo', 'componentizacao-react']);
        } else {
            setLikedPostIds([]);
        }
    }, [profileData.id, allPosts]);

    useEffect(() => {
        if (allPosts && profileData.name) {
            const commentsByThisUser = allPosts.flatMap(post =>
                (post.comments || [])
                .filter(comment => comment.user === profileData.name)
                .map(comment => ({
                    ...comment,
                    originalPost: {
                        id: post.postId,
                        contentPreview: post.content.substring(0, 100) + '...'
                    }
                }))
            );
            setUserComments(commentsByThisUser);
        }
    }, [allPosts, profileData.name]);

    const currentAvatarDisplayUrl = editableAvatarPreview || profileData.avatarUrl;
    const currentCoverDisplayUrl = editableCoverPreview || profileData.coverUrl;
    const filteredPosts = allPosts.filter(post => post.userName === profileData.name);
    const actualLikedPosts = allPosts.filter(post => likedPostIds.includes(post.postId));

    const handleImageChange = (event, imageType) => {
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
    };
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

    const handleEditToggle = () => {
        if (!isEditing) {
            setEditableName(profileData.name);
            setEditableBio(profileData.bio);
            setEditableAvatarPreview('');
            setEditableCoverPreview('');
            setEditableAvatarFile(null);
            setEditableCoverFile(null);
        } else {
            if (editableAvatarPreview && editableAvatarPreview.startsWith('blob:')) URL.revokeObjectURL(editableAvatarPreview);
            if (editableCoverPreview && editableCoverPreview.startsWith('blob:')) URL.revokeObjectURL(editableCoverPreview);
            setEditableAvatarPreview('');
            setEditableCoverPreview('');
            setEditableAvatarFile(null);
            setEditableCoverFile(null);
        }
        setIsEditing(!isEditing);
    };

    const handleSave = () => {
        let newAvatarUrl = profileData.avatarUrl;
        let newCoverUrl = profileData.coverUrl;

        if (editableAvatarPreview && editableAvatarPreview.startsWith('blob:')) {
            newAvatarUrl = editableAvatarPreview;
        } else if (editableName !== profileData.name || (profileData.avatarUrl && !profileData.avatarUrl.includes(encodeURIComponent(profileData.name))) || !profileData.avatarUrl) {
            newAvatarUrl = generateAvatarUrl(editableName, darkMode);
        }

        if (editableCoverPreview && editableCoverPreview.startsWith('blob:')) {
            newCoverUrl = editableCoverPreview;
        }

        setProfileData(prevData => ({
            ...prevData,
            name: editableName,
            bio: editableBio,
            avatarUrl: newAvatarUrl,
            coverUrl: newCoverUrl,
        }));
        setIsEditing(false);
    };

    const handleCancel = () => {
        if (editableAvatarPreview && editableAvatarPreview.startsWith('blob:')) {
            URL.revokeObjectURL(editableAvatarPreview);
        }
        if (editableCoverPreview && editableCoverPreview.startsWith('blob:')) {
            URL.revokeObjectURL(editableCoverPreview);
        }
        setEditableAvatarFile(null);
        setEditableAvatarPreview('');
        setEditableCoverFile(null);
        setEditableCoverPreview('');
        setIsEditing(false);
    };

    // ==================================================================
    // INÍCIO DA ÁREA MODIFICADA: Lógica do Botão Seguir
    // ==================================================================
    const handleFollowToggle = () => {
        if (isFollowLoading) return;

        setIsFollowLoading(true); // Ativa o estado de "carregando" para ambas as ações

        if (!isFollowing) {
            // Ação de Seguir: Atualiza o contador imediatamente (UI Otimista)
            setFollowersCount(prevCount => prevCount + 1);
            
            // Simula a requisição e atualiza o estado do botão depois
            setTimeout(() => {
                setIsFollowing(true);
                setIsFollowLoading(false);
            }, 1000); // Tempo de 1 segundo para uma boa fluidez
        } else {
            // Ação de Deixar de Seguir: Atualiza o contador imediatamente
            setFollowersCount(prevCount => prevCount - 1);

            // Simula a requisição e atualiza o estado do botão
            setTimeout(() => {
                setIsFollowing(false);
                setIsFollowLoading(false);
            }, 500); // Um tempo menor, pois "unfollow" geralmente é mais rápido
        }
    };
    // ==================================================================
    // FIM DA ÁREA MODIFICADA
    // ==================================================================

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