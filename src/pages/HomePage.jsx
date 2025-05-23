// src/pages/HomePage.jsx
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';

function HomePage({ posts, onAddPost, onCommentSubmit, darkMode }) { // Adicionada a prop darkMode se você for usá-la aqui

  return (
    <div className="max-w-xl mx-auto">
      {/* Adicionada margem inferior ao componente CreatePost */}
      <div className="mb-8"> {/* Você pode ajustar mb-8 para mb-6 ou outro valor se preferir */}
        <CreatePost 
          onAddPost={onAddPost} 
          darkMode={darkMode} // Passando darkMode para o CreatePost, caso ele precise
        />
      </div>

      {/* Lista de Posts */}
      {/* Adicionado um pequeno espaçamento no topo da lista de posts, se houver posts */}
      {posts && posts.length > 0 && (
        <div className="space-y-8"> {/* Ou mantenha o map direto se não quiser um div extra */}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              postData={post}
              onCommentSubmit={onCommentSubmit}
              darkMode={darkMode} // Passando darkMode para o PostCard
              // variant="explore" // Remova ou ajuste a variant se não for para a HomePage
            />
          ))}
        </div>
      )}
      {/* Você pode querer uma mensagem aqui se não houver posts, similar à ExplorePage */}
      {(!posts || posts.length === 0) && (
        <div className={`text-center p-10 rounded-lg my-8 ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500 shadow-md'}`}>
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Nenhum post por aqui ainda!</h3>
          <p className="mt-2">Seja o primeiro a compartilhar algo no OLLO.</p>
        </div>
      )}
    </div>
  );
}

export default HomePage;