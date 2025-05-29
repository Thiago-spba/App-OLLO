// src/pages/ProfilePage.jsx
// (Refatorado para atender aos requisitos da funcionalidade "Seguir")

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import {
    CameraIcon,
    PencilSquareIcon,
    ChatBubbleLeftEllipsisIcon,
    HeartIcon,
    UserPlusIcon,       // Ícone para "Seguir"
    CheckIcon,          // Ícone para "Seguindo"
    ArrowPathIcon,      // Ícone para "Carregando"
    ExclamationTriangleIcon // Para perfil não encontrado
} from '@heroicons/react/24/outline';

// --- DADOS SIMULADOS (Mantidos como no original) ---
const usersProfileData = {
    "usuario-ollo": {
        id: "usuario-ollo",
        name: "Usuário OLLO",
        userNameForPosts: "Usuário OLLO",
        bio: "Este é o perfil do Usuário OLLO. Explorando o universo OLLO e compartilhando ideias!",
        avatarName: "Usuário OLLO",
        coverUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        stats: { followers: 153, following: 88 } // Contagem base de seguidores
    },
    "gemini-aux": {
        id: "gemini-aux",
        name: "Gemini Auxiliar",
        userNameForPosts: "Gemini Auxiliar",
        bio: "Assistente AI, sempre pronto para ajudar e conectar!",
        avatarName: "Gemini Aux",
        coverUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        stats: { followers: 250, following: 10 } // Contagem base de seguidores
    },
    "dev-entusiasta": {
        id: "dev-entusiasta",
        name: "Dev Entusiasta",
        userNameForPosts: "Dev Entusiasta",
        bio: "Apaixonado por código, React e novas tecnologias. #ReactDev",
        avatarName: "Dev Entusiasta",
        coverUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        stats: { followers: 120, following: 75 } // Contagem base de seguidores
    }
};

// Dados simulados de curtidas (mantidos)
const likedPostsMap = {
    'usuario-ollo': ['bem-vindo-ollo', 'usando-useState'],
    'gemini-aux': ['componentizacao-react', 'meu-outro-post', 'bem-vindo-ollo'],
    'dev-entusiasta': ['usando-useState'],
};

// Função para gerar avatar (mantida)
const generateAvatarUrl = (name, isDark) => {
    if (!name) return '';
    const bgColor = isDark ? '005A4B' : 'A0D2DB';
    const textColor = isDark ? 'A0D2DB' : '005A4B';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=${textColor}&size=128&bold=true&format=svg`;
};

// --- COMPONENTE ProfilePage --- Refatorado ---
function ProfilePage({
    allPosts = [],
    onCommentSubmit,
    darkMode,
    sessionFollowStatus,      // PROP: Estado global de quem está sendo seguido na sessão
    setSessionFollowStatus    // PROP: Função para atualizar o estado global
}) {
    const { profileId: profileIdFromUrl } = useParams();
    const navigate = useNavigate();
    const loggedInUserId = "usuario-ollo"; // ID do usuário logado (simulado)
    const effectiveProfileId = profileIdFromUrl || loggedInUserId;

    const [profileData, setProfileData] = useState(null);
    const [profileNotFound, setProfileNotFound] = useState(false);

    // Estados para edição (mantidos)
    const [isEditing, setIsEditing] = useState(false);
    const [editableName, setEditableName] = useState('');
    const [editableBio, setEditableBio] = useState('');
    const [editableAvatarFile, setEditableAvatarFile] = useState(null);
    const [editableAvatarPreview, setEditableAvatarPreview] = useState('');
    const [editableCoverFile, setEditableCoverFile] = useState(null);
    const [editableCoverPreview, setEditableCoverPreview] = useState('');
    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    // --- Estados específicos da funcionalidade "Seguir" ---
    const [isFollowing, setIsFollowing] = useState(false); // Estado local: este perfil está sendo seguido AGORA?
    const [isFollowLoading, setIsFollowLoading] = useState(false); // Estado local: A ação de seguir/deixar de seguir está em andamento?
    const [followersCount, setFollowersCount] = useState(0); // Estado local: Contagem de seguidores a ser EXIBIDA
    const [baseFollowersCount, setBaseFollowersCount] = useState(0); // Estado local: Contagem ORIGINAL de seguidores (do usersProfileData)

    const [activeTab, setActiveTab] = useState('posts');
    const [userComments, setUserComments] = useState([]);

    // --- Efeito para carregar dados do perfil e inicializar estado de "seguir" ---
    useEffect(() => {
        const currentProfileToLoad = usersProfileData[effectiveProfileId];
        if (currentProfileToLoad) {
            const initialProfileData = {
                ...currentProfileToLoad,
                avatarUrl: generateAvatarUrl(currentProfileToLoad.avatarName, darkMode)
            };
            setProfileData(initialProfileData);
            setProfileNotFound(false);
            setIsEditing(false); // Reseta modo de edição ao mudar de perfil

            // Limpa previews de edição anteriores se existirem
            if (editableAvatarPreview && editableAvatarPreview.startsWith('blob:')) URL.revokeObjectURL(editableAvatarPreview);
            if (editableCoverPreview && editableCoverPreview.startsWith('blob:')) URL.revokeObjectURL(editableCoverPreview);
            setEditableAvatarPreview('');
            setEditableCoverPreview('');
            setEditableAvatarFile(null);
            setEditableCoverFile(null);

            // REQUISITO 4: Guarda a contagem de seguidores original (base) do perfil visitado
            const initialStaticFollowers = initialProfileData.stats.followers;
            setBaseFollowersCount(initialStaticFollowers);

            let isCurrentlyFollowingInSession = false;
            // REQUISITO 2: Verifica se não é o perfil do próprio usuário logado
            if (effectiveProfileId !== loggedInUserId) {
                // REQUISITO 3: Usa o estado global (sessionFollowStatus) para determinar o estado inicial do botão
                isCurrentlyFollowingInSession = sessionFollowStatus[effectiveProfileId] || false;
            }
            setIsFollowing(isCurrentlyFollowingInSession); // Define o estado local inicial do botão

            // REQUISITO 1 e 4: Calcula a contagem de seguidores a ser EXIBIDA
            // Baseia-se na contagem original + ajuste se já estiver seguindo na sessão atual
            setFollowersCount(initialStaticFollowers + (isCurrentlyFollowingInSession ? 1 : 0));

            setIsFollowLoading(false); // Garante que não está em estado de loading inicial

        } else {
            // Perfil não encontrado
            setProfileData(null);
            setProfileNotFound(true);
        }
        // Dependências: Recarrega se o ID do perfil, modo escuro, ID logado ou o estado global de seguir mudar.
    }, [effectiveProfileId, darkMode, loggedInUserId, sessionFollowStatus]); // Removido previews das dependências para evitar recargas indesejadas

    // Efeito para atualizar avatar se for ui-avatars e darkMode mudar (CORRIGIDO)
    useEffect(() => {
        if (profileData && !editableAvatarPreview && profileData.avatarUrl && profileData.avatarUrl.includes('ui-avatars.com')) {
            const newAvatarUrl = generateAvatarUrl(profileData.avatarName, darkMode);
            // CORREÇÃO: Só atualiza o estado se a URL do avatar realmente mudou
            if (newAvatarUrl !== profileData.avatarUrl) {
                setProfileData(prev => ({
                    ...prev,
                    avatarUrl: newAvatarUrl
                }));
            }
        }
        // CORREÇÃO: Removido profileData das dependências para evitar loop. 
        // A lógica agora depende apenas de darkMode e editableAvatarPreview para reavaliar.
        // A verificação interna (newAvatarUrl !== profileData.avatarUrl) previne atualizações desnecessárias.
    }, [darkMode, profileData?.avatarName, editableAvatarPreview, profileData?.avatarUrl]); // Adicionado avatarName e avatarUrl para garantir que a URL é gerada/comparada corretamente

    // Efeito para filtrar comentários do usuário (mantido)
    useEffect(() => {
        if (allPosts && profileData?.userNameForPosts) {
            const commentsByThisUser = allPosts.flatMap(post =>
                (post.comments || [])
                .filter(comment => comment.user === profileData.userNameForPosts)
                .map(comment => ({
                    ...comment,
                    id: comment.commentId || `comment-${Date.now()}-${Math.random()}`,
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

    // Efeito para limpeza de Object URLs de previews (mantido)
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

    // Variável para verificar se é o perfil do usuário logado
    const effectiveIsMyProfile = profileData && profileData.id === loggedInUserId;

    // Funções de manipulação de imagem e edição (mantidas)
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
        // Limpa o valor do input para permitir selecionar o mesmo arquivo novamente
        event.target.value = null;
    }, [editableAvatarPreview, editableCoverPreview]);

    const handleEditToggle = useCallback(() => {
        if (!profileData) return;
        if (!isEditing) {
            setEditableName(profileData.name);
            setEditableBio(profileData.bio);
            // Limpa previews ao entrar no modo de edição
            if (editableAvatarPreview && editableAvatarPreview.startsWith('blob:')) URL.revokeObjectURL(editableAvatarPreview);
            if (editableCoverPreview && editableCoverPreview.startsWith('blob:')) URL.revokeObjectURL(editableCoverPreview);
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
        if (editableAvatarPreview) {
            // Se há preview (nova imagem carregada), usa ela
            newAvatarUrl = editableAvatarPreview;
        } else if (editableName !== profileData.name || (profileData.avatarName && editableName !== profileData.avatarName)) {
            // Se não há preview, mas o nome mudou, gera novo avatar com base no nome
             newAvatarUrl = generateAvatarUrl(editableName, darkMode);
        }

        // ATENÇÃO: Esta parte ainda simula a atualização localmente.
        // Numa aplicação real, aqui seria enviada a atualização para o backend.
        setProfileData(prevData => ({
            ...prevData,
            name: editableName,
            avatarName: editableName, // Atualiza o nome base para o avatar também
            bio: editableBio,
            avatarUrl: newAvatarUrl, // Usa a URL do preview ou a gerada
            coverUrl: editableCoverPreview || prevData.coverUrl, // Usa a URL do preview ou a original
        }));

        // Não revoga ObjectURLs aqui, pois elas estão sendo usadas no estado profileData
        // A limpeza ocorrerá quando o componente desmontar ou quando uma nova edição começar/cancelar

        setIsEditing(false);
    }, [profileData, editableName, editableBio, editableAvatarPreview, editableCoverPreview, darkMode]);

    const handleCancel = useCallback(() => {
        // Limpa previews e reseta estado de edição
        if (editableAvatarPreview && editableAvatarPreview.startsWith('blob:')) URL.revokeObjectURL(editableAvatarPreview);
        if (editableCoverPreview && editableCoverPreview.startsWith('blob:')) URL.revokeObjectURL(editableCoverPreview);
        setEditableAvatarFile(null);
        setEditableAvatarPreview('');
        setEditableCoverFile(null);
        setEditableCoverPreview('');
        setIsEditing(false);
    }, [editableAvatarPreview, editableCoverPreview]);

    // --- FUNÇÃO handleFollowToggle --- REVISADA E OTIMIZADA ---
    const handleFollowToggle = useCallback(() => {
        // Impede múltiplos cliques rápidos ou seguir a si mesmo
        if (isFollowLoading || effectiveIsMyProfile || !setSessionFollowStatus) return;

        // REQUISITO 1: Ativa o estado de carregamento
        setIsFollowLoading(true);
        const newFollowingState = !isFollowing; // Determina qual será o *novo* estado

        // Simula a chamada assíncrona (ex: API call)
        setTimeout(() => {
            // Atualiza o estado local para refletir a mudança visual
            setIsFollowing(newFollowingState);

            // REQUISITO 3: Atualiza o estado GLOBAL da sessão no App.jsx
            setSessionFollowStatus(prevStatus => ({
                ...prevStatus,
                [effectiveProfileId]: newFollowingState // Define true ou false para este profileId
            }));

            // REQUISITO 1 e 4: Atualiza a contagem de seguidores EXIBIDA
            // Usa a contagem BASE original + 1 se está seguindo, ou apenas a base se deixou de seguir
            setFollowersCount(baseFollowersCount + (newFollowingState ? 1 : 0));

            // REQUISITO 1: Desativa o estado de carregamento após a "resposta"
            setIsFollowLoading(false);
        }, newFollowingState ? 800 : 500); // Tempo de loading um pouco maior para seguir

    }, [
        isFollowing,            // Depende do estado atual
        isFollowLoading,        // Depende se já está carregando
        effectiveIsMyProfile,   // Depende se é o próprio perfil
        effectiveProfileId,     // Depende do ID do perfil sendo visto
        baseFollowersCount,     // Depende da contagem original
        setSessionFollowStatus  // Depende da função para atualizar estado global (PROP)
    ]);

    // --- Renderização Condicional --- (Tratamento de erros e loading)
    if (profileNotFound) {
        return (
            <div className={`min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-8 text-center ${darkMode ? 'text-ollo-bg-light' : 'text-ollo-deep'}`}>
                <ExclamationTriangleIcon className={`mx-auto h-20 w-20 mb-6 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                <h1 className="text-3xl font-bold mb-2">Perfil Não Encontrado</h1>
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>O perfil que você está procurando não existe ou não pôde ser carregado.</p>
                <button
                    onClick={() => navigate('/')}
                    className={`mt-8 px-6 py-2.5 rounded-lg font-semibold transition-colors ${darkMode ? 'bg-ollo-accent-light text-ollo-deep hover:bg-opacity-90' : 'bg-ollo-deep text-ollo-bg-light hover:bg-opacity-90'}`}
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

    // --- Variáveis de Estilo Dinâmico (mantidas e adicionadas classes para botão seguir) ---
    const currentAvatarDisplayUrl = editableAvatarPreview || profileData.avatarUrl;
    const currentCoverDisplayUrl = editableCoverPreview || profileData.coverUrl;
    const filteredPosts = allPosts.filter(post => post.userName === profileData.userNameForPosts);
    const likedPostIdsForCurrentProfile = likedPostsMap[effectiveProfileId] || [];
    const actualLikedPosts = allPosts.filter(post => likedPostIdsForCurrentProfile.includes(post.postId));

    const cardBgColor = darkMode ? 'bg-ollo-deep/80 border border-gray-700/50 backdrop-blur-md' : 'bg-ollo-bg-light/80 border border-gray-200/50 backdrop-blur-md';
    const bioTextColor = darkMode ? 'text-gray-300' : 'text-gray-700';
    const statsTextColor = darkMode ? 'text-gray-400' : 'text-gray-600';
    const statsNumbersColor = darkMode ? 'text-ollo-accent-light' : 'text-ollo-deep';
    const textColorPrimary = darkMode ? 'text-gray-100' : 'text-gray-900';
    const textColorSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
    const accentColor = darkMode ? 'text-ollo-accent-light' : 'text-ollo-deep';
    const accentRingOffsetColor = darkMode ? 'ring-offset-ollo-deep' : 'ring-offset-ollo-bg-light';
    const accentRingColor = darkMode ? 'ring-ollo-accent-light' : 'ring-ollo-deep';
    const inputBgColor = darkMode ? 'bg-gray-800/70 border-gray-600/80 text-gray-100 placeholder-gray-500 focus:ring-ollo-accent-light focus:border-ollo-accent-light' : 'bg-white/70 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-ollo-deep focus:border-ollo-deep';
    const buttonIconEditBg = darkMode ? 'bg-black/60 hover:bg-black/80 text-white' : 'bg-white/70 hover:bg-gray-50/90 text-ollo-deep';
    const editProfileButtonClasses = darkMode ? "px-5 py-2.5 border-2 border-ollo-accent-light text-ollo-accent-light rounded-lg text-sm font-semibold hover:bg-ollo-accent-light hover:text-ollo-deep transition-colors duration-150" : "px-5 py-2.5 border-2 border-ollo-deep text-ollo-deep rounded-lg text-sm font-semibold hover:bg-ollo-deep hover:text-ollo-bg-light transition-colors duration-150";
    const saveButtonClasses = darkMode ? "px-6 py-2.5 bg-ollo-accent-light text-ollo-deep rounded-lg text-sm font-bold hover:opacity-90 transition-opacity" : "px-6 py-2.5 bg-ollo-deep text-ollo-bg-light rounded-lg text-sm font-bold hover:opacity-90 transition-opacity";
    const cancelButtonClasses = darkMode ? "px-5 py-2.5 bg-gray-600 text-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors" : "px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors";
    const placeholderCardClasses = darkMode ? "bg-gray-800/60 border border-gray-700/50" : "bg-ollo-bg-light/90 border border-gray-200/80";
    const placeholderSvgIconColor = darkMode ? "text-gray-600" : "text-gray-400";

    // REQUISITO 1: Classes base e específicas para os estados do botão "Seguir"
    const followButtonBaseClasses = "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 w-36 disabled:opacity-60 disabled:cursor-not-allowed";
    const followButtonActiveClasses = darkMode ? `${followButtonBaseClasses} bg-ollo-accent-light text-ollo-deep hover:bg-opacity-90 focus:ring-ollo-accent-light/30` : `${followButtonBaseClasses} bg-ollo-deep text-ollo-bg-light hover:bg-opacity-90 focus:ring-ollo-deep/30`;
    const followingButtonClasses = darkMode ? `${followButtonBaseClasses} bg-transparent border-2 border-gray-500 text-gray-400 hover:border-gray-400 hover:text-gray-300 focus:ring-gray-500/30` : `${followButtonBaseClasses} bg-transparent border-2 border-gray-400 text-gray-500 hover:border-gray-500 hover:text-gray-700 focus:ring-gray-400/30`;
    const loadingButtonClasses = `${followButtonActiveClasses} ${followButtonBaseClasses}`; // Usa a classe base + ativa, mas será desabilitado

    const getTabClassName = (tabName) => {
        const isActive = activeTab === tabName;
        const baseClasses = "py-3 px-4 sm:px-6 font-semibold text-sm sm:text-base border-b-4 -mb-px transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:z-10";
        if (darkMode) {
            return `${baseClasses} ${isActive ? 'border-ollo-accent-light text-ollo-accent-light' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'} focus:ring-ollo-accent-light/50`;
        } else {
            return `${baseClasses} ${isActive ? 'border-ollo-deep text-ollo-deep' : 'border-transparent text-gray-500 hover:text-ollo-deep hover:border-gray-300'} focus:ring-ollo-deep/50`;
        }
    };

    // --- JSX de Renderização --- (Com lógica do botão Seguir/Editar atualizada)
    return (
        <div>
            {/* --- Cabeçalho do Perfil --- */}
            <div className={`${cardBgColor} rounded-xl shadow-2xl overflow-hidden mb-6`}>
                {/* Imagem de Capa e Botão de Edição */}
                <div className={`h-52 md:h-72 ${darkMode ? 'bg-gradient-to-r from-ollo-deep via-teal-800 to-gray-900' : 'bg-gradient-to-r from-ollo-crystal-green via-ollo-sky-blue to-ollo-accent-light'} relative`}>
                    <img className="h-full w-full object-cover" src={currentCoverDisplayUrl} alt="Imagem de Capa" />
                    {isEditing && effectiveIsMyProfile && (
                        <button
                            onClick={() => coverInputRef.current?.click()}
                            className={`absolute top-4 right-4 p-2.5 rounded-full transition-all duration-150 ease-in-out shadow-lg z-10 ${buttonIconEditBg}`}
                            title="Alterar imagem de capa"
                        >
                            <CameraIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                            <input type="file" ref={coverInputRef} accept="image/*" onChange={(e) => handleImageChange(e, 'cover')} className="hidden" />
                        </button>
                    )}
                </div>

                {/* Avatar, Botões e Informações */}
                <div className="relative px-4 sm:px-6 lg:px-8 pb-8 pt-3">
                    {/* Avatar e Botão de Edição */}
                    <div className="-mt-20 sm:-mt-24 flex justify-center">
                        <div className="relative">
                            <img
                                className={`h-28 w-28 sm:h-36 sm:w-36 rounded-full ring-4 ${accentRingOffsetColor} ${accentRingColor} object-cover ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} shadow-md`}
                                src={currentAvatarDisplayUrl}
                                alt={profileData ? `Avatar de ${profileData.name}` : 'Avatar'}
                            />
                            {isEditing && effectiveIsMyProfile && (
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    className={`absolute bottom-1 right-1 p-2 rounded-full transition-all duration-150 ease-in-out shadow-lg ${buttonIconEditBg}`}
                                    title="Alterar avatar"
                                >
                                    <PencilSquareIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <input type="file" ref={avatarInputRef} accept="image/*" onChange={(e) => handleImageChange(e, 'avatar')} className="hidden" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* --- Botões: Editar Perfil OU Seguir/Seguindo/Carregando --- */}
                    <div className={`flex mt-4 ${isEditing && effectiveIsMyProfile ? 'justify-center' : 'justify-end'} mb-4 min-h-[44px]`}> {/* Adicionado min-h para evitar pulo de layout */}
                        {effectiveIsMyProfile ? (
                            // REQUISITO 2: Se for o perfil do próprio usuário
                            isEditing ? (
                                // Modo de edição: Botões Salvar/Cancelar
                                <div className="flex space-x-4">
                                    <button onClick={handleSave} className={saveButtonClasses}>Salvar Alterações</button>
                                    <button onClick={handleCancel} className={cancelButtonClasses}>Cancelar</button>
                                </div>
                            ) : (
                                // Modo de visualização: Botão Editar Perfil
                                <button onClick={handleEditToggle} className={editProfileButtonClasses}>Editar Perfil</button>
                            )
                        ) : (
                            // Se for o perfil de OUTRO usuário
                            // REQUISITO 1: Botão Seguir/Seguindo/Carregando
                            <button
                                onClick={handleFollowToggle}
                                disabled={isFollowLoading} // Desabilita durante o carregamento
                                className={isFollowLoading ? loadingButtonClasses : (isFollowing ? followingButtonClasses : followButtonActiveClasses)}
                            >
                                {isFollowLoading ? (
                                    <>
                                        <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                                        <span>{isFollowing ? 'Deixando...' : 'Seguindo...'}</span> {/* Feedback contextual */} 
                                    </>
                                ) : isFollowing ? (
                                    <>
                                        <CheckIcon className="h-5 w-5 mr-2" />
                                        <span>Seguindo</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlusIcon className="h-5 w-5 mr-2" />
                                        <span>Seguir</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Informações do Perfil (Nome, Bio, Stats) */}
                    <div className={`mt-1 ${isEditing && effectiveIsMyProfile ? 'max-w-lg mx-auto' : 'max-w-xl mx-auto text-center'}`}>
                        {/* Nome e Bio (condicionalmente editáveis) */}
                        {(!isEditing || !effectiveIsMyProfile) && profileData && (
                            <div className="text-center mb-6">
                                <h1 className={`text-3xl sm:text-4xl font-bold ${accentColor} mb-2 tracking-tight`}>{profileData.name}</h1>
                                <p className={`text-base ${bioTextColor} mt-2 max-w-lg mx-auto leading-relaxed`}>{profileData.bio}</p>
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

                        {/* Estatísticas (Posts, Seguidores, Seguindo) */}
                        {profileData && (
                            <div className={`flex flex-wrap justify-center gap-x-6 sm:gap-x-10 gap-y-3 text-sm ${isEditing && effectiveIsMyProfile ? 'mt-4' : ''}`}>
                                <div className="text-center">
                                    <span className={`block font-bold text-xl sm:text-2xl ${statsNumbersColor}`}>{filteredPosts.length}</span>
                                    <span className={statsTextColor}>Posts</span>
                                </div>
                                <div className="text-center">
                                    {/* REQUISITO 1 e 4: Exibe a contagem de seguidores dinâmica */}
                                    <span className={`block font-bold text-xl sm:text-2xl ${statsNumbersColor}`}>{followersCount}</span>
                                    <span className={statsTextColor}>Seguidores</span>
                                </div>
                                <div className="text-center">
                                    <span className={`block font-bold text-xl sm:text-2xl ${statsNumbersColor}`}>{profileData.stats.following}</span>
                                    <span className={statsTextColor}>Seguindo</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Abas (Posts, Comentários, Curtidas) --- */}
            <div className={`mb-6 sm:mb-8 border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200/80'}`}>
                <nav className="-mb-px flex justify-center sm:justify-start space-x-2 sm:space-x-6 lg:space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('posts')} className={getTabClassName('posts')}>Posts</button>
                    <button onClick={() => setActiveTab('comments')} className={getTabClassName('comments')}>Comentários</button>
                    <button onClick={() => setActiveTab('likes')} className={getTabClassName('likes')}>Curtidas</button>
                </nav>
            </div>

            {/* --- Conteúdo das Abas --- */}
            <div className="max-w-xl mx-auto pb-12">
                {/* Aba de Posts */}
                {activeTab === 'posts' && (
                    <div className="space-y-8">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((post) => (
                                <PostCard key={post.postId} postData={post} onCommentSubmit={onCommentSubmit} darkMode={darkMode} />
                            ))
                        ) : (
                            profileData && (
                                <div className={`rounded-xl p-8 sm:p-10 text-center shadow-xl mt-4 ${placeholderCardClasses}`}>
                                    <svg className={`mx-auto h-16 w-16 ${placeholderSvgIconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                                    <h3 className={`mt-4 text-xl font-semibold ${textColorPrimary}`}>Sem posts por aqui ainda...</h3>
                                    <p className={`mt-2 text-base ${textColorSecondary}`}>Quando {profileData.name} compartilhar algo, seus posts aparecerão aqui.</p>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* Aba de Comentários */}
                {activeTab === 'comments' && (
                    <div className="space-y-6 animate-fadeIn">
                        {userComments.length > 0 ? (
                            userComments.map((comment) => (
                                <div key={comment.id} className={`${cardBgColor} p-5 rounded-xl shadow-lg border`}>
                                    <p className={`text-base ${textColorPrimary} mb-3`}>"{comment.text}"</p>
                                    <div className={`text-xs ${textColorSecondary} border-t ${darkMode ? 'border-gray-700/50' : 'border-gray-200/80'} pt-3`}>
                                        <p>Comentado em <span className="font-semibold">{comment.timestamp || 'data indisponível'}</span></p>
                                        <p className="mt-1">No post: <span className="italic">"{comment.originalPost.contentPreview}"</span></p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            profileData && (
                                <div className={`rounded-xl p-8 sm:p-10 text-center shadow-xl ${placeholderCardClasses}`}>
                                    <ChatBubbleLeftEllipsisIcon className={`mx-auto h-16 w-16 ${placeholderSvgIconColor}`} />
                                    <h3 className={`mt-4 text-xl font-semibold ${textColorPrimary}`}>Nenhum comentário encontrado.</h3>
                                    <p className={`mt-2 text-base ${textColorSecondary}`}>Quando {profileData.name} comentar em algum post, seus comentários aparecerão aqui.</p>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* Aba de Curtidas */}
                {activeTab === 'likes' && (
                    <div className="space-y-8">
                        {actualLikedPosts.length > 0 ? (
                            actualLikedPosts.map((post) => (
                                <PostCard key={post.postId} postData={post} onCommentSubmit={onCommentSubmit} darkMode={darkMode} />
                            ))
                        ) : (
                            profileData && (
                                <div className={`rounded-xl p-8 sm:p-10 text-center shadow-xl mt-4 ${placeholderCardClasses}`}>
                                    <HeartIcon className={`mx-auto h-16 w-16 ${placeholderSvgIconColor}`} />
                                    <h3 className={`mt-4 text-xl font-semibold ${textColorPrimary}`}>Nenhuma curtida por aqui...</h3>
                                    <p className={`mt-2 text-base ${textColorSecondary}`}>Quando {profileData.name} curtir algum post, ele aparecerá aqui.</p>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;
