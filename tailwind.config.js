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
        'ollo-deep': '#0D1B2A',
        'ollo-slate': '#1B263B',
        'ollo-steel': '#415A77',
        'ollo-silver': '#778DA9',
        'ollo-light': '#E0E1DD',
        'ollo-accent': '#00A896',
        'ollo-accent-light': '#02C39A',
      },
      backgroundImage: {
        'ollo-gradient-main': 'linear-gradient(to top right, var(--tw-gradient-from), var(--tw-gradient-to))',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    // A linha do line-clamp foi removida daqui, como sugerido pelo warning.
  ],
}