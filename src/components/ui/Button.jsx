import PropTypes from 'prop-types';
import { FiLoader } from 'react-icons/fi';

export const Button = ({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary',
  className = '',
  ...props
}) => {
  // Classes base para todos os botões
  const baseClasses = `
    px-6 py-3 rounded-xl font-medium
    flex items-center justify-center gap-2
    transition-all duration-200
    focus-visible-ring active:scale-98
    disabled:opacity-70 disabled:cursor-not-allowed
  `;

  // Variantes de estilo
  const variantClasses = {
    primary:
      'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700',
    secondary: 'bg-ollo-light text-ollo-dark hover:bg-ollo-silver',
    ghost:
      'bg-transparent border border-ollo-accent text-ollo-accent hover:bg-ollo-accent/10',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <FiLoader className="animate-spin" />
          Processando...
        </>
      ) : (
        children
      )}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  className: PropTypes.string,
};
