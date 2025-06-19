// src/api/axios.js

import axios from 'axios';

// 1. Criação da Instância
// Aqui, criamos uma cópia personalizada do axios para o nosso projeto.
const apiClient = axios.create({
  // IMPORTANTE: Esta é a URL base do seu backend.
  // Todas as requisições (ex: /users, /posts) serão adicionadas ao final dela.
  // Use a URL correta do seu ambiente de desenvolvimento.
  baseURL: 'http://localhost:5000/api', // <-- CONFIRME SE ESTA É A URL DO SEU BACKEND
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor de Requisição (A Mágica da Autenticação)
// Este trecho de código é como um "porteiro" que inspeciona cada requisição
// antes dela sair do seu app para o backend.
apiClient.interceptors.request.use(
  (config) => {
    // Ele tenta pegar o token de autenticação que salvaremos no login.
    const token = localStorage.getItem('authToken'); 
    
    // Se o token existir, ele o adiciona no cabeçalho 'Authorization'.
    // É assim que o seu backend saberá quem está fazendo a requisição.
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Devolve a requisição configurada para que ela possa continuar sua viagem.
    return config;
  },
  (error) => {
    // Em caso de um erro na configuração, ele é rejeitado.
    return Promise.reject(error);
  }
);

// 3. Exportação
// Exportamos nossa instância personalizada para que possamos usá-la em qualquer
// parte do nosso aplicativo, como na ProfilePage.
export default apiClient;