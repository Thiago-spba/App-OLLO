// ARQUIVO NOVO: src/components/Avatar.jsx

import React, { useState, useEffect } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';

/**
 * Componente Avatar reutilizável e inteligente.
 * Exibe a imagem do usuário e, em caso de falha ou ausência,
 * mostra um ícone de fallback.
 * @param {string} src - A URL da imagem do avatar.
 * @param {string} alt - O texto alternativo para a imagem.
 * @param {string} className - Classes CSS para estilização.
 */
function Avatar({ src, alt, className, ...props }) {
  const [error, setError] = useState(!src);

  // Se a prop 'src' mudar, resetamos o estado de erro.
  // Isso é importante para quando o componente é reutilizado em listas.
  useEffect(() => {
    setError(!src);
  }, [src]);

  if (error) {
    return <UserCircleIcon className={className} aria-label={alt} {...props} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      // O segredo está aqui: se a imagem falhar ao carregar, atualizamos o estado.
      onError={() => setError(true)}
      {...props}
    />
  );
}

export default Avatar;
