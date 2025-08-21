// src/pages/NotFoundPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    // MUDANÇA ESTRUTURAL: Aplicamos a nova classe de gradiente e usamos Flexbox via Tailwind.
    <div className="min-h-screen w-full bg-ollo-error-gradient flex flex-col items-center justify-center text-center p-6 text-white font-sans">
      {/* CORREÇÃO: O logotipo no topo foi removido, como solicitado. */}

      <img
        src="/images/android-chrome-512x512.png" // Imagem principal mantida.
        alt="Ícone OLLO"
        className="w-16 h-16 mb-7 rounded-[20%] shadow-[0_0_24px_#1effbc90]"
        draggable={false}
      />

      <h1 className="text-3xl font-black tracking-wide text-shadow-[0_2px_8px_#10f4a655]">
        Página Não Encontrada
      </h1>

      <p className="mt-4 text-lg text-[#E6FFF6] max-w-md leading-relaxed opacity-95">
        O caminho que você buscou não existe em nosso universo. <br />
        Vamos te guiar de volta para um terreno conhecido.
      </p>

      {/* MUDANÇA: Trocamos o botão de recarregar por um Link para a Home. */}
      <Link
        to="/"
        className="mt-8 px-9 py-2.5 bg-gradient-to-r from-[#09fda4] to-[#0cf4e7] text-[#0c1b13] text-lg font-bold rounded-2xl shadow-[0_2px_12px_#19f7d044] hover:opacity-90 transition-opacity"
      >
        VOLTAR À HOME
      </Link>
    </div>
  );
}
