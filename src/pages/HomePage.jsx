// src/pages/HomePage.jsx

import React from 'react';
import PostCard from '../components/PostCard';
import StoriesReel from '../components/StoriesReel.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

// Prop 'darkMode' removido
const HomePage = ({
  posts,
  onTriggerCreatePost,
  onCommentSubmit,
  onDeletePost,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const feedPosts = posts;

  return (
    <div className="flex flex-col lg:flex-row lg:gap-x-6 xl:gap-x-8 pt-1 px-2 md:px-4 lg:px-6 xl:px-8">
      <main className="w-full flex-grow lg:max-w-2xl xl:max-w-3xl mx-auto lg:mx-0">
        <div className="space-y-6 md:space-y-8">
          {/* O prop 'darkMode' foi removido daqui */}
          <StoriesReel />

          <section
            aria-labelledby="create-post-prompt-heading"
            className="p-4 rounded-lg bg-white dark:bg-gray-800/70 shadow-md"
          >
            {user && (
              <div className="flex items-center space-x-3">
                <div
                  className="flex-shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold
                                              bg-ollo-deep text-ollo-light dark:bg-ollo-accent-light dark:text-ollo-deep"
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div
                  className="flex-grow px-4 py-2.5 sm:py-3 rounded-full cursor-pointer transition-colors text-left
                                               bg-gray-100 hover:bg-gray-200 text-gray-600
                                               dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                  onClick={onTriggerCreatePost}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ')
                      onTriggerCreatePost();
                  }}
                >
                  No que você está pensando,{' '}
                  {user.name ? user.name.split(' ')[0] : 'Usuário'}?
                </div>
              </div>
            )}
            <h2 id="create-post-prompt-heading" className="sr-only">
              Iniciar nova postagem
            </h2>
          </section>

          <section aria-labelledby="feed-heading">
            <h2
              id="feed-heading"
              className="text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100"
            >
              Atualizações Recentes
            </h2>
            {feedPosts && feedPosts.length > 0 ? (
              <div className="space-y-6 md:space-y-8">
                {feedPosts.map((post) => (
                  <PostCard
                    key={post.postId || post.id}
                    postData={post}
                    onCommentSubmit={onCommentSubmit}
                    onDeletePost={onDeletePost}
                    // O prop 'darkMode' foi removido daqui
                  />
                ))}
              </div>
            ) : (
              <div
                className="text-center py-12 px-6 rounded-lg 
                                          bg-white dark:bg-gray-800/70 shadow-md border border-gray-200/70 dark:border-gray-700/50"
              >
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  Bem-vindo(a) ao OLLO!
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Seu feed está um pouco vazio. Que tal explorar ou criar seu
                  primeiro post?
                </p>
                <button
                  onClick={() => navigate('/explore')}
                  className="mt-6 px-5 py-2.5 rounded-lg font-semibold transition-colors
                                               bg-ollo-deep text-ollo-light hover:bg-opacity-80
                                               dark:bg-ollo-accent-light dark:text-ollo-deep dark:hover:bg-opacity-90"
                >
                  Explorar o OLLO
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <aside className="hidden lg:block lg:w-72 xl:w-80 flex-shrink-0">
        <div className="sticky top-4 space-y-6">
          <h3 className="px-1 text-lg font-semibold tracking-tight text-gray-700 dark:text-gray-300">
            Para Você
          </h3>
          <div
            className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out group
                                  bg-white dark:bg-gray-800 border border-gray-200/90 dark:border-gray-700/60
                                  hover:shadow-xl dark:hover:border-gray-600"
          >
            <div
              className="h-32 bg-cover bg-center bg-gray-300 dark:bg-gray-700"
              style={{
                backgroundImage:
                  "url('https://placehold.co/300x180/A0D2DB/005A4B?text=OLLO+Promo')",
              }}
            ></div>
            <div className="p-4">
              <p className="text-xs uppercase tracking-wider mb-1 text-ollo-deep/80 dark:text-ollo-accent-light/80">
                Patrocinado
              </p>
              <h4 className="font-semibold mb-1 text-ollo-deep group-hover:text-sky-700 dark:text-gray-100 dark:group-hover:text-ollo-accent-light">
                Nova Coleção OLLO!
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Descubra designs incríveis e exclusivos.
              </p>
            </div>
          </div>
          <div
            className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out group
                                  bg-white dark:bg-gray-800 border border-gray-200/90 dark:border-gray-700/60
                                  hover:shadow-xl dark:hover:border-gray-600"
          >
            <div className="p-4">
              <p className="text-xs uppercase tracking-wider mb-1 text-gray-400 dark:text-gray-500">
                Dica OLLO
              </p>
              <h4 className="font-semibold mb-1 text-ollo-deep group-hover:text-sky-700 dark:text-gray-100 dark:group-hover:text-ollo-accent-light">
                Personalize Seu Perfil
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Adicione uma foto e uma bio para se conectar melhor!
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="mt-3 text-xs font-semibold py-1 px-3 rounded-full transition-colors
                                              bg-ollo-deep/10 text-ollo-deep hover:bg-ollo-deep/20
                                              dark:bg-ollo-accent-light/20 dark:text-ollo-accent-light dark:hover:bg-ollo-accent-light/30"
              >
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
