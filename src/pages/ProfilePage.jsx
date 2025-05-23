// src/pages/ProfilePage.jsx
import { useState, useEffect, useRef } from 'react';
import PostCard from '../components/PostCard';
import { 
    CameraIcon, 
    PencilSquareIcon,
    ChatBubbleLeftEllipsisIcon, // Ícone para Comentários
    HeartIcon                   // Ícone para Curtidas
} from '@heroicons/react/24/outline';

function ProfilePage({ allPosts, onCommentSubmit }) {
  const initialProfileData = {
    name: "Usuário OLLO", 
    bio: "Este é o perfil do Usuário OLLO. Explorando o universo OLLO e compartilhando ideias!", 
    avatarUrl: `https://ui-avatars.com/api/?name=Usuario+OLLO&background=005A4B&color=A0D2DB&size=128&bold=true`, 
    coverUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    stats: { followers: 153, following: 88 }
  };

  const [profileData, setProfileData] = useState(initialProfileData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState('');
  const [editableBio, setEditableBio] = useState('');

  const [editableAvatarFile, setEditableAvatarFile] = useState(null);
  const [editableAvatarPreview, setEditableAvatarPreview] = useState('');
  const [editableCoverFile, setEditableCoverFile] = useState(null);
  const [editableCoverPreview, setEditableCoverPreview] = useState('');

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'comments', 'likes'

  const currentAvatarDisplayUrl = editableAvatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=005A4B&color=A0D2DB&size=128&bold=true`;
  const currentCoverDisplayUrl = editableCoverPreview || profileData.coverUrl;

  const filteredPosts = allPosts.filter(post => post.userName === profileData.name);

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
    } else {
      if (imageType === 'avatar') {
        if (editableAvatarPreview && editableAvatarPreview.startsWith('blob:')) URL.revokeObjectURL(editableAvatarPreview);
        setEditableAvatarFile(null);
        setEditableAvatarPreview('');
      } else if (imageType === 'cover') {
        if (editableCoverPreview && editableCoverPreview.startsWith('blob:')) URL.revokeObjectURL(editableCoverPreview);
        setEditableCoverFile(null);
        setEditableCoverPreview('');
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

    if (editableAvatarPreview) {
      newAvatarUrl = editableAvatarPreview;
    } else {
      if (editableName !== profileData.name || !profileData.avatarUrl.includes(encodeURIComponent(profileData.name))) { 
        newAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(editableName)}&background=005A4B&color=A0D2DB&size=128&bold=true`;
      }
    }

    if (editableCoverPreview) {
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
    setEditableAvatarFile(null); 
    setEditableCoverFile(null);
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

  const getTabClassName = (tabName) => {
    const isActive = activeTab === tabName;
    return `py-3 px-4 sm:px-6 font-semibold text-sm sm:text-base border-b-4 -mb-px transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-ollo-accent-light/50 focus:z-10
            ${isActive 
              ? 'border-ollo-accent-light text-ollo-accent-light' 
              : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
            }`;
  };

  return (
    <div>
      {/* Card de Informações do Perfil */}
      <div className="bg-gray-900/70 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden mb-6 border border-gray-700/50">
        <div className="h-52 md:h-72 bg-gradient-to-r from-ollo-deep via-teal-800 to-gray-900 relative">
          <img 
            className="h-full w-full object-cover" 
            src={currentCoverDisplayUrl} 
            alt="Imagem de Capa" 
          />
          {isEditing && (
            <button
              onClick={() => coverInputRef.current && coverInputRef.current.click()}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 p-2.5 rounded-full text-white transition-all duration-150 ease-in-out shadow-lg z-10"
              title="Alterar imagem de capa"
            >
              <CameraIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              <input type="file" ref={coverInputRef} accept="image/*" onChange={(e) => handleImageChange(e, 'cover')} className="hidden" />
            </button>
          )}
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8 pb-8 pt-3">
          <div className="-mt-20 sm:-mt-24 flex justify-center">
            <div className="relative">
              <img
                className="h-28 w-28 sm:h-36 sm:w-36 rounded-full ring-4 ring-offset-4 ring-offset-gray-800 ring-ollo-accent-light object-cover bg-gray-700 shadow-md"
                src={currentAvatarDisplayUrl}
                alt={`Avatar de ${profileData.name}`}
              />
              {isEditing && (
                <button
                  onClick={() => avatarInputRef.current && avatarInputRef.current.click()}
                  className="absolute bottom-1 right-1 bg-black/60 hover:bg-black/80 p-2 rounded-full text-white transition-all duration-150 ease-in-out shadow-lg"
                  title="Alterar avatar"
                >
                  <PencilSquareIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <input type="file" ref={avatarInputRef} accept="image/*" onChange={(e) => handleImageChange(e, 'avatar')} className="hidden" />
                </button>
              )}
            </div>
          </div>
          
          <div className={`flex mt-4 ${isEditing ? 'justify-center' : 'justify-end'} mb-4`}>
            {!isEditing ? (
              <button 
                onClick={handleEditToggle} 
                className="px-5 py-2.5 border-2 border-ollo-accent-light text-ollo-accent-light rounded-lg text-sm font-semibold hover:bg-ollo-accent-light hover:text-ollo-deep transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-ollo-accent-light/30 shadow-md hover:shadow-lg"
              >
                Editar Perfil
              </button>
            ) : (
              <div className="flex space-x-4">
                <button 
                  onClick={handleSave} 
                  className="px-6 py-2.5 bg-ollo-accent-light text-ollo-deep rounded-lg text-sm font-bold hover:opacity-90 transition-opacity duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-ollo-accent-light/50 shadow-lg"
                >
                  Salvar Alterações
                </button>
                <button 
                  onClick={handleCancel} 
                  className="px-5 py-2.5 bg-gray-600 text-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-gray-500/30 shadow-md"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div className={`mt-1 text-gray-200 ${isEditing ? 'max-w-lg mx-auto' : 'max-w-xl mx-auto text-center sm:text-left'}`}>
            {!isEditing ? (
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-ollo-accent-light mb-2 tracking-tight">{profileData.name}</h1>
                <p className="text-base text-gray-300 mt-2 max-w-lg mx-auto leading-relaxed mb-8">{profileData.bio}</p>
              </div>
            ) : (
              <div className="space-y-5 mb-8">
                <div>
                  <label htmlFor="profileName" className="block text-sm font-medium text-gray-400 mb-1.5">Nome</label>
                  <input type="text" id="profileName" value={editableName} onChange={(e) => setEditableName(e.target.value)} className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-ollo-accent-light focus:border-ollo-accent-light text-base shadow-sm transition-colors" />
                </div>
                <div>
                  <label htmlFor="profileBio" className="block text-sm font-medium text-gray-400 mb-1.5">Bio</label>
                  <textarea id="profileBio" rows="5" value={editableBio} onChange={(e) => setEditableBio(e.target.value)} className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-ollo-accent-light focus:border-ollo-accent-light text-base shadow-sm transition-colors" />
                </div>
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-x-6 sm:gap-x-10 gap-y-3 text-sm text-gray-400">
              <div className="text-center">
                <span className="block font-bold text-xl sm:text-2xl text-ollo-accent-light">{filteredPosts.length}</span>
                <span>Posts</span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-xl sm:text-2xl text-ollo-accent-light">{profileData.stats.followers}</span>
                <span>Seguidores</span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-xl sm:text-2xl text-ollo-accent-light">{profileData.stats.following}</span>
                <span>Seguindo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação das Abas */}
      <div className="mb-6 sm:mb-8 border-b border-gray-700/50">
        <nav className="-mb-px flex justify-center sm:justify-start space-x-2 sm:space-x-6 lg:space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('posts')} className={getTabClassName('posts')}>
            Posts
          </button>
          <button onClick={() => setActiveTab('comments')} className={getTabClassName('comments')}>
            Comentários
          </button>
          <button onClick={() => setActiveTab('likes')} className={getTabClassName('likes')}>
            Curtidas
          </button>
        </nav>
      </div>

      {/* Conteúdo Condicional das Abas */}
      <div className="max-w-xl mx-auto">
        {activeTab === 'posts' && (
          <div className="space-y-8">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard key={post.id} postData={post} onCommentSubmit={onCommentSubmit} />
              ))
            ) : (
              <div className="border border-gray-700/50 bg-gray-900/70 backdrop-blur-sm rounded-xl p-8 sm:p-10 text-center shadow-xl mt-4">
                <svg className="mx-auto h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-4 text-xl font-semibold text-gray-200">Sem posts por aqui ainda...</h3>
                <p className="mt-2 text-base text-gray-400">
                  Quando {profileData.name} compartilhar algo, seus posts aparecerão aqui.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="text-center py-12 px-6 bg-gray-900/70 backdrop-blur-md rounded-xl border border-gray-700/50 shadow-lg animate-fadeIn">
            <ChatBubbleLeftEllipsisIcon className="mx-auto h-16 w-16 text-ollo-accent-light/80 mb-5" />
            <h3 className="mt-2 text-xl font-semibold text-ollo-accent-light">Comentários de {profileData.name}</h3>
            <p className="mt-2 text-gray-300 max-w-md mx-auto">
              Aqui você verá todas as conversas e opiniões que {profileData.name} compartilhou nos posts.
            </p>
            <p className="mt-6 text-sm text-gray-500">
              Estamos preparando esta seção com carinho! 💬 <br/> (Funcionalidade em desenvolvimento)
            </p>
          </div>
        )}

        {activeTab === 'likes' && (
          <div className="text-center py-12 px-6 bg-gray-900/70 backdrop-blur-md rounded-xl border border-gray-700/50 shadow-lg animate-fadeIn">
            <HeartIcon className="mx-auto h-16 w-16 text-ollo-accent-light/80 mb-5" />
            <h3 className="mt-2 text-xl font-semibold text-ollo-accent-light">Curtidas de {profileData.name}</h3>
            <p className="mt-2 text-gray-300 max-w-md mx-auto">
              Descubra os posts que conquistaram um <span className="text-red-400 font-semibold">gosto</span> de {profileData.name}.
            </p>
            <p className="mt-6 text-sm text-gray-500">
              Espalhando a solidariedade, um post de cada vez! ❤️ <br/> (Funcionalidade em desenvolvimento)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
export default ProfilePage;