// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// ESTA É A CONFIGURAÇÃO PADRÃO E CORRETA.
// Não é necessário usar 'loadEnv' ou 'define' para variáveis .env com prefixo VITE_.
// O Vite faz isso automaticamente e de forma segura.

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});