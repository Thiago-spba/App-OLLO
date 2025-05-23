/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Garante que o Tailwind escaneie seus arquivos de projeto
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de Cores Ollo Principal
        'ollo-deep': '#005A4B',          // Verde escuro e rico (ex: para textos em fundo claro, botões)
        'ollo-accent-light': '#A0D2DB',  // Ciano claro (ex: para destaques, ícones, bordas ativas)
        'ollo-bg-light': '#F0F7F7',      // Tom de branco/cinza muito claro (ex: para fundos claros de página ou sidebar)

        // Cores Adicionais para Efeitos (como gradientes)
        'ollo-crystal-green': '#E0FFF8', // Verde água cristalino (usado no gradiente do MainLayout)
        'ollo-sky-blue': '#87CEEB',      // Azul celeste (usado no gradiente do MainLayout)
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'), // Plugin para truncamento de texto ("Continuar lendo...")
    // Adicione outros plugins do Tailwind aqui, se forem necessários no futuro
  ],
  safelist: [
    // É uma boa prática adicionar classes à safelist se elas são geradas dinamicamente
    // ou se você quer garantir que o Tailwind não as remova no processo de "purge".
    // Essencial para as classes de gradiente com cores customizadas.
    'from-ollo-crystal-green',
    'to-ollo-sky-blue',

    // Exemplos de classes line-clamp que você poderia adicionar se as usasse dinamicamente:
    // 'line-clamp-1',
    // 'line-clamp-2',
    // 'line-clamp-3',
    // 'line-clamp-4', // Usamos esta no PostCard
    // 'line-clamp-5',
  ],
};