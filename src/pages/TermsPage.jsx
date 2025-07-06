import React from 'react';

const TermsPage = ({ darkMode }) => {
  return (
    <div className={`p-4 sm:p-6 lg:p-8 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-ollo-bg-light' : 'bg-white text-ollo-deep'}`}>
      <h1 className="text-2xl font-bold mb-4">Termos de Serviço</h1>
      <p>Esta é a página de Termos de Serviço da OLLO.</p>
      <p className="mt-4">O conteúdo completo será adicionado aqui futuramente.</p>
    </div>
  );
};

export default TermsPage;
