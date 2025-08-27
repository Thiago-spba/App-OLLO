// src/components/SafeExternalLink.jsx
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para links externos seguros
 * Protege contra ataques de phishing e direciona o usuário com alertas
 * @param {Object} props - Propriedades do componente
 * @returns {JSX.Element} Componente de link seguro
 */
const SafeExternalLink = ({ 
  href, 
  children, 
  className = '', 
  showWarning = true,
  rel = "noopener noreferrer", 
  ...props 
}) => {
  // Lista de domínios confiáveis que não precisam de aviso
  const trustedDomains = [
    'olloapp.com.br',
    'olloapp-egl2025.web.app',
    'olloapp-egl2025.firebaseapp.com',
    'github.com/Thiago-spba',
    'firebase.google.com'
  ];
  
  const handleClick = (e) => {
    if (!showWarning) return; // Pula a verificação se showWarning for falso
    
    try {
      // Analisa a URL para verificar o domínio
      const url = new URL(href);
      const isTrusted = trustedDomains.some(domain => 
        url.hostname === domain || url.hostname.endsWith(`.${domain}`)
      );
      
      // Se for um domínio confiável, permite navegação direta
      if (isTrusted) {
        return;
      }
      
      // Caso contrário, mostra aviso
      e.preventDefault();
      
      const confirmed = window.confirm(
        `Você está saindo do OLLO para navegar para ${url.hostname}.\n\n` +
        `Este é um site externo que não controlamos. Deseja continuar?`
      );
      
      if (confirmed) {
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      // Se houver erro ao analisar a URL, bloqueia a navegação
      e.preventDefault();
      console.error('URL inválida:', href);
      alert('O link parece ser inválido e foi bloqueado por segurança.');
    }
  };
  
  return (
    <a
      href={href}
      className={`text-ollo-accent hover:underline ${className}`}
      rel={rel}
      target="_blank"
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
};

SafeExternalLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  showWarning: PropTypes.bool,
  rel: PropTypes.string
};

export default SafeExternalLink;
