// tailwind.config.js - atualizado em agosto de 2025

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Estilos OLLO já existentes
        'ollo-deep': '#0D1B2A',
        'ollo-slate': '#1B263B',
        'ollo-steel': '#415A77',
        'ollo-silver': '#778DA9',
        'ollo-light': '#E0E1DD',
        'ollo-accent': '#00A896',
        'ollo-accent-light': '#02C39A',

        // Novas cores para PostForm (sem hífen para funcionar com Tailwind)
        olloPrimary100: '#e6f7f0',
        olloPrimary300: '#8fd8b7',
        olloPrimary500: '#2ecc71',
        olloPrimary600: '#27ae60',
        olloPrimary700: '#219653',

        olloLight100: '#f8f9fa',
        olloLight200: '#e9ecef',
        olloLight300: '#dee2e6',

        olloDark600: '#2d3436',
        olloDark700: '#252a2b',
        olloDark800: '#1e2122',
        olloDark900: '#121415',
      },

      backgroundImage: {
        'ollo-gradient-main': 'linear-gradient(to top right, var(--tw-gradient-from), var(--tw-gradient-to))',
        // MUDANÇA: Linha adicionada conforme solicitado, sem alterar o existente.
        'ollo-error-gradient': 'linear-gradient(135deg, #19232D 60%, #31e6b2 100%)',
      },

      // Novas extensões adicionadas abaixo (sem modificar o existente)
      transitionProperty: {
        'scale': 'transform',
      },
      transitionDuration: {
        '150': '150ms',
      },
      scale: {
        '98': '0.98',
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    // Plugin adicional para melhorar acessibilidade em focus states
    function({ addUtilities }) {
      const newUtilities = {
        '.focus-visible-ring': {
          '&:focus-visible': {
            'outline': 'none',
            'ring': '2px',
            'ring-offset': '2px',
            'ring-color': 'var(--tw-ring-color, #02C39A)',
          },
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
}