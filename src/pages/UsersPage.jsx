import React from 'react';
import UserAvatarsCard from '../components/UserAvatarsCard';

const UsersPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Usuários da OLLO</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Usuários Recentes</h2>
        <UserAvatarsCard 
          limit={12} 
          title="Descubra novos usuários"
          description="Conecte-se com as pessoas que entraram recentemente na comunidade OLLO"
        />
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Usuários Mais Ativos</h2>
        <UserAvatarsCard 
          limit={8} 
          orderBy="postCount"
          orderDirection="desc"
          title="Usuários mais ativos"
          description="Pessoas que mais contribuem com conteúdo na plataforma"
          showDisplayName={true}
        />
      </div>
    </div>
  );
};

export default UsersPage;
