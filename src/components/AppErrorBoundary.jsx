// src/components/AppErrorBoundary.jsx

import React from 'react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log do erro para um serviço de monitoramento (se disponível)
    console.error('Erro capturado pelo Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
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
            onMouseOver={(e) => (e.target.style.opacity = 0.8)}
            onMouseOut={(e) => (e.target.style.opacity = 1)}
          >
            Recarregar página
          </button>

          {/* Detalhes do erro (apenas em desenvolvimento) */}
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details
              style={{
                marginTop: 20,
                color: '#fff',
                maxWidth: 600,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                padding: 15,
                borderRadius: 8,
              }}
            >
              <summary style={{ cursor: 'pointer' }}>
                Detalhes do erro (apenas desenvolvimento)
              </summary>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: 12,
                  overflowX: 'auto',
                }}
              >
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
