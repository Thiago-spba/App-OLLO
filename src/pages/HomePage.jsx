// src/pages/HomePage.jsx
import React from 'react';
import PostCard from '../components/PostCard'; // Usará o SEU PostCard.jsx "original"
import StoriesReel from '../components/StoriesReel.jsx'; 
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const HomePage = ({ posts, onTriggerCreatePost, onCommentSubmit, onDeletePost, darkMode }) => {
    const { user } = useAuth(); 
    const navigate = useNavigate();
    const feedPosts = posts; 

    return (
        <div className="flex flex-col lg:flex-row lg:gap-x-6 xl:gap-x-8 pt-1 px-2 md:px-4 lg:px-6 xl:px-8">
            
            <main className="w-full flex-grow lg:max-w-2xl xl:max-w-3xl mx-auto lg:mx-0"> 
                <div className="space-y-6 md:space-y-8">
                    <StoriesReel darkMode={darkMode} />

                    <section aria-labelledby="create-post-prompt-heading" 
                             className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/70' : 'bg-white shadow-md'}`}>
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
                                                ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
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

                    <section aria-labelledby="feed-heading">
                        <h2 id="feed-heading" className={`text-xl md:text-2xl font-semibold mb-4 sm:mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            Atualizações Recentes
                        </h2>
                        {feedPosts && feedPosts.length > 0 ? (
                            <div className="space-y-6 md:space-y-8">
                                {feedPosts.map(post => (
                                    <PostCard 
                                        key={post.postId || post.id} 
                                        postData={post} 
                                        onCommentSubmit={onCommentSubmit}
                                        onDeletePost={onDeletePost}
                                        darkMode={darkMode} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className={`text-center py-12 px-6 rounded-lg 
                                            ${darkMode 
                                                ? 'bg-gray-800/70 border border-gray-700/50' 
                                                : 'bg-white shadow-md border border-gray-200/70'}`}>
                                <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Bem-vindo(a) ao OLLO!
                                </h3>
                                <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Seu feed está um pouco vazio. Que tal explorar ou criar seu primeiro post?
                                </p>
                                <button 
                                    onClick={() => navigate('/explore')} 
                                    className={`mt-6 px-5 py-2.5 rounded-lg font-semibold transition-colors
                                                ${darkMode ? 'bg-ollo-accent-light text-ollo-deep hover:bg-opacity-90' : 'bg-ollo-deep text-ollo-bg-light hover:bg-opacity-80'}`}
                                >
                                    Explorar o OLLO
                                </button> 
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <aside className="hidden lg:block lg:w-72 xl:w-80 flex-shrink-0">
                <div className={`sticky top-4 space-y-6 ${darkMode ? 'p-0.5' : ''}`}>
                    <h3 className={`px-1 text-lg font-semibold tracking-tight ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Para Você
                    </h3>
                    <div className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out group
                                    ${darkMode ? 'bg-gray-800 border border-gray-700/60 hover:border-gray-600' : 'bg-white border border-gray-200/90 hover:shadow-xl'}`}>
                        <div className={`h-32 bg-cover bg-center ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} 
                             style={{ backgroundImage: "url('https://placehold.co/300x180/A0D2DB/005A4B?text=OLLO+Promo')" }}>
                        </div>
                        <div className="p-4">
                            <p className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-ollo-accent-light/80' : 'text-ollo-deep/80'}`}>
                                Patrocinado
                            </p>
                            <h4 className={`font-semibold mb-1 ${darkMode ? 'text-gray-100 group-hover:text-ollo-accent-light' : 'text-ollo-deep group-hover:text-sky-700'}`}>
                                Nova Coleção OLLO!
                            </h4>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Descubra designs incríveis e exclusivos.
                            </p>
                        </div>
                    </div>
                    <div className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out group
                                    ${darkMode ? 'bg-gray-800 border border-gray-700/60 hover:border-gray-600' : 'bg-white border border-gray-200/90 hover:shadow-xl'}`}>
                        <div className="p-4">
                            <p className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                Dica OLLO
                            </p>
                            <h4 className={`font-semibold mb-1 ${darkMode ? 'text-gray-100 group-hover:text-ollo-accent-light' : 'text-ollo-deep group-hover:text-sky-700'}`}>
                                Personalize Seu Perfil
                            </h4>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Adicione uma foto e uma bio para se conectar melhor!
                            </p>
                             <button onClick={() => navigate('/profile')} className={`mt-3 text-xs font-semibold py-1 px-3 rounded-full transition-colors
                                              ${darkMode ? 'bg-ollo-accent-light/20 text-ollo-accent-light hover:bg-ollo-accent-light/30' 
                                                         : 'bg-ollo-deep/10 text-ollo-deep hover:bg-ollo-deep/20'}`}>
                                Ver Perfil
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default HomePage;