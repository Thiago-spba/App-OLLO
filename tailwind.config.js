/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {}, // Mantendo EXATAMENTE como você forneceu (sem cores Ollo aqui)
  },
  plugins: [
    // Adicionando APENAS os plugins
    require('tailwind-scrollbar-hide'),
    require('@tailwindcss/line-clamp'), // Adicionado conforme plano do projeto
  ],
}