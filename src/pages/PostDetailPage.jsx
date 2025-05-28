import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, UserCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

const PostDetailPage = ({ darkMode, allPosts = [] }) => {
  const { postId } = useParams();
  const navigate = useNavigate();

  // --- LÓGICA DE BUSCA COM DEPURAÇÃO ---
  // Esta é a parte que foi alterada para nos ajudar a encontrar o problema.
  console.log('--- Iniciando busca pelo post ---');
  console.log(`Procurando pelo postId: |${postId}|`);
  console.log(`Total de posts para pesquisar: ${allPosts.length}`);

  const postData = allPosts.find(p => {
    const saoIguais = p.postId === postId;
    // Este log vai mostrar cada comparação que o javascript está fazendo.
    console.log(`Comparando: |${p.postId}| com |${postId}|. Resultado: ${saoIguais}`);
    return saoIguais;
  });

  console.log('--- Fim da busca ---');
  
  // --- Lógica para Próximo Post ---
  const currentIndex = allPosts.findIndex(p => p.postId === postId);
  const nextPost = currentIndex > -1 && currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  // TRATAR O CASO DE POST NÃO ENCONTRADO
  if (!postData) {
    return (
      <div className={`p-4 sm:p-6 lg:p-8 rounded-lg shadow-md text-center ${darkMode ? 'bg-gray-800 text-ollo-bg-light' : 'bg-white text-ollo-deep'}`}>
        <h1 className="text-2xl font-bold mb-4">Post Não Encontrado</h1>
        <p>O post que você está procurando não existe ou foi removido. (Verifique o console para detalhes da busca).</p>
        <button 
          onClick={() => navigate('/')}
          className={`mt-6 inline-block px-4 py-2 rounded-lg font-semibold ${darkMode ? 'bg-ollo-accent-light text-ollo-deep' : 'bg-ollo-deep text-ollo-bg-light'}`}
        >
          Voltar para a Página Inicial
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 lg:p-8 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-ollo-bg-light' : 'bg-white text-ollo-deep'}`}>
      
      {/* --- Botão Voltar --- */}
      <button 
        onClick={() => navigate(-1)}
        className={`flex items-center gap-2 mb-6 text-sm font-semibold ${darkMode ? 'text-ollo-accent-light hover:text-white' : 'text-ollo-deep hover:text-black'}`}
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Voltar
      </button>

      {/* --- EXIBIR CABEÇALHO E CONTEÚDO DO POST --- */}
      <div className="flex items-center gap-3 mb-4">
        <UserCircleIcon className={`h-10 w-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        <div>
          <p className="font-bold">{postData.userName}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <ClockIcon className="h-3 w-3" />
            <span>{postData.timestamp}</span>
          </div>
        </div>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p>{postData.content}</p>
      </div>
      
      {/* --- Navegação para Próximo Post --- */}
      <div className="mt-8 pt-4 border-t border-gray-300 dark:border-gray-700 flex justify-end">
        {nextPost ? (
          <button
            onClick={() => navigate(`/posts/${nextPost.postId}`)}
            className={`flex items-center gap-2 text-sm font-semibold ${darkMode ? 'text-ollo-accent-light hover:text-white' : 'text-ollo-deep hover:text-black'}`}
          >
            Próximo Post
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        ) : (
          <p className="text-sm text-gray-500">Você está no último post.</p>
        )}
      </div>

    </div>
  );
};

export default PostDetailPage;