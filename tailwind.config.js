/** @type {import('tailwindcss').Config} */
export default {
  // Habilita a estratégia de tema escuro baseada em classe.
  // O Tailwind procurará a classe "dark" no elemento <html>.
  darkMode: 'class',

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        // Paleta Principal "Ollo"
        'ollo-deep': '#0D1B2A',         // Um azul quase preto, para textos e fundos profundos
        'ollo-slate': '#1B263B',       // Ardósia escuro, para painéis e cards em tema escuro
        'ollo-steel': '#415A77',       // Um cinza-azulado, para subtextos ou bordas
        'ollo-silver': '#778DA9',      // Prata, para ícones e textos secundários
        'ollo-light': '#E0E1DD',        // Quase branco, para fundos e textos em tema claro
        'ollo-accent': '#00A896',      // Um verde-azulado vibrante para ações principais (ex: botões)
        'ollo-accent-light': '#02C39A', // Variação mais clara do accent para hover/foco
      },
      // Exemplo de gradiente usando as cores "Ollo"
      backgroundImage: {
        'ollo-gradient-main': 'linear-gradient(to top right, var(--tw-gradient-from), var(--tw-gradient-to))',
      },
    },
  },
  
  plugins: [
    require('tailwind-scrollbar-hide'),
    require('@tailwindcss/line-clamp'),
  ],
}