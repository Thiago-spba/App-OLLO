// src/pages/PublicErrorPage.jsx

import React from 'react';

export default function PublicErrorPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #19232D 60%, #31e6b2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      {/* Logotipo OLLO no topo */}
      <img
        src="/images/default-avatar.png"
        alt="Logo OLLOAPP"
        style={{
          width: 74,
          height: 74,
          borderRadius: 18,
          boxShadow: '0 6px 28px #21f8a466',
          marginBottom: 28,
        }}
        draggable={false}
      />

      <h1
        style={{
          fontSize: 32,
          fontWeight: 900,
          color: '#fff',
          marginBottom: 10,
          textShadow: '0 2px 8px #10f4a655',
          letterSpacing: '0.02em',
        }}
      >
        Ops! Algo deu errado.
      </h1>

      <p
        style={{
          fontSize: 19,
          color: '#E6FFF6',
          marginBottom: 35,
          lineHeight: 1.5,
          maxWidth: 420,
          opacity: 0.93,
        }}
      >
        Não foi possível carregar a aplicação no momento.
        <br />
        Tente novamente em alguns instantes.
        <br />
        Se o problema persistir, contate o suporte OLLO.
      </p>

      {/* Olhinhos verdes OLLO centralizados */}
      <img
        src="/images/android-chrome-512x512.png"
        alt="Olhinhos verdes OLLO"
        style={{
          width: 64,
          height: 64,
          margin: '0 auto',
          marginBottom: 18,
          borderRadius: '20%',
          boxShadow: '0 0 24px #1effbc90',
        }}
        draggable={false}
      />

      {/* Botão para recarregar a aplicação */}
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: 30,
          padding: '10px 36px',
          borderRadius: 14,
          background: 'linear-gradient(90deg, #09fda4 0%, #0cf4e7 100%)',
          color: '#0c1b13',
          border: 'none',
          fontWeight: 700,
          fontSize: 18,
          boxShadow: '0 2px 12px #19f7d044',
          cursor: 'pointer',
          letterSpacing: 1,
          transition: 'opacity 0.22s',
        }}
      >
        Recarregar página
      </button>
    </div>
  );
}
