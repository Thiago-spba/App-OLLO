// src/pages/HomePage.jsx
import React from 'react';
import CreatePost from '../components/CreatePost'; // Verifique se CreatePost é o modal ou o formulário em si
import PostCard from '../components/PostCard';
import StoriesReel from '../components/StoriesReel.jsx'; 
import { useAuth } from '../context/AuthContext.jsx';

const HomePage = ({ posts, onTriggerCreatePost, onCommentSubmit, onDeletePost, darkMode }) => {
    const { user } = useAuth(); 
    const feedPosts = posts; 

    return (
        // Container principal da HomePage que permitirá o layout de 2 colunas internas (centro + direita)
        // Em telas menores (mobile), a coluna da direita ficará oculta e a central ocupará tudo.
        <div className="flex flex-col lg:flex-row lg:space-x-6 xl:space-x-8 py-1 px-1 sm:px-0">
            
            {/* === Coluna Central de Conteúdo === */}
            <main className="w-full lg:flex-grow lg:max-w-2xl xl:max-w-3xl mx-auto"> {/* Centraliza e limita a largura */}
                <div className="space-y-6 md:space-y-8">
                    {/* --- Seção 1: Stories --- */}
                    <StoriesReel darkMode={darkMode} />

                    {/* --- Seção 2: Criar Post (Prompt) --- */}
                    <section aria-labelledby="create-post-prompt-heading" 
                             className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/50 sm:bg-gray-800/70' : 'bg-white sm:shadow-sm'}`}>
                        {user && (
                            <div className="flex items-center space-x-3">
                                <div 
                                    className={`flex-shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold
                                                ${darkMode ? 'bg-ollo-accent-light text-ollo-deep' : 'bg-ollo-deep text-ollo-bg-light'}`}
                                >
                                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div 
                                    className={`flex-grow px-4 py-2.5 sm:py-3 rounded-full cursor-pointer transition-colors text-left
                                                ${darkMode ? 'bg-gray-700 hover:bg-gray-600/80 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}
                                    onClick={onTriggerCreatePost} 
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') onTriggerCreatePost(); }}
                                >
                                    No que você está pensando, {user.name ? user.name.split(' ')[0] : 'Usuário'}?
                                </div>
                            </div>
                        )}
                        <h2 id="create-post-prompt-heading" className="sr-only">Iniciar nova postagem</h2>
                    </section>

                    {/* --- Seção 3: Feed de Posts --- */}
                    <section aria-labelledby="feed-heading">
                        {/* Você pode adicionar um título para o feed se quiser, ex: "Atualizações Recentes" */}
                        {feedPosts && feedPosts.length > 0 ? (
                            <div className="space-y-6 md:space-y-8">
                                {feedPosts.map(post => (
                                    <PostCard 
                                        key={post.postId || post.id} // Usar postIdString se disponível e único
                                        postData={post} 
                                        onCommentSubmit={onCommentSubmit}
                                        onDeletePost={onDeletePost}
                                        darkMode={darkMode} 
                                        // variant pode ser removido se não estiver mais sendo usado para diferenciar estilos de forma significativa
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className={`text-center py-12 px-6 rounded-lg 
                                            ${darkMode 
                                                ? 'bg-gray-800/60 border border-gray-700/50' 
                                                : 'bg-white/80 backdrop-blur-sm shadow-md border border-gray-200/70'}`}>
                                <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Bem-vindo(a) ao OLLO!
                                </h3>
                                <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Seu feed está um pouco vazio. Que tal explorar ou criar seu primeiro post?
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </main>

{/* === Coluna Lateral Direita (Patrocinadores/Conteúdo Adicional) === */}
            <aside className="hidden lg:block lg:w-72 xl:w-80 flex-shrink-0">
                <div className="sticky top-4 space-y-6"> {/* Removido padding e bg daqui, para aplicar nos cards internos */}
                    
                    {/* Título da Seção Lateral */}
                    <h3 className={`px-1 text-lg font-semibold tracking-tight ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Para Você
                    </h3>

                    {/* Card de Patrocinador/Conteúdo 1 */}
                    <div className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out group
                                    ${darkMode ? 'bg-gray-800/80 border border-gray-700/60 hover:border-gray-600' : 'bg-white border border-gray-200/90 hover:shadow-xl'}`}>
                        <div className={`h-32 bg-cover bg-center ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} 
                             style={{ backgroundImage: "url('https://via.placeholder.com/300x180/A0D2DB/005A4B?text=OLLO+Ads')" }}>
                            {/* Imagem do anúncio */}
                        </div>
                        <div className="p-4">
                            <p className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-ollo-accent-light/80' : 'text-ollo-deep/80'}`}>
                                Patrocinado
                            </p>
                            <h4 className={`font-semibold mb-1 ${darkMode ? 'text-gray-100 group-hover:text-ollo-accent-light' : 'text-ollo-deep group-hover:text-sky-700'}`}>
                                Descubra a Nova Coleção!
                            </h4>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Ofertas incríveis esperam por você. Clique para saber mais e aproveitar.
                            </p>
                        </div>
                    </div>

                    {/* Card de Patrocinador/Conteúdo 2 */}
                    <div className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out group
                                    ${darkMode ? 'bg-gray-800/80 border border-gray-700/60 hover:border-gray-600' : 'bg-white border border-gray-200/90 hover:shadow-xl'}`}>
                        {/* Sem imagem, apenas texto */}
                        <div className="p-4">
                            <p className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                Dica OLLO
                            </p>
                            <h4 className={`font-semibold mb-1 ${darkMode ? 'text-gray-100 group-hover:text-ollo-accent-light' : 'text-ollo-deep group-hover:text-sky-700'}`}>
                                Explore Novos Horizontes
                            </h4>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Use a busca para encontrar posts e pessoas sobre seus temas favoritos.
                            </p>
                             <button className={`mt-3 text-xs font-semibold py-1 px-3 rounded-full transition-colors
                                              ${darkMode ? 'bg-ollo-accent-light/20 text-ollo-accent-light hover:bg-ollo-accent-light/30' 
                                                         : 'bg-ollo-deep/10 text-ollo-deep hover:bg-ollo-deep/20'}`}>
                                Explorar Agora
                            </button>
                        </div>
                    </div>

                    {/* Você pode adicionar mais cards aqui ou um link "Ver mais" */}
                </div>
            </aside>
        </div>
    );
};

export default HomePage;