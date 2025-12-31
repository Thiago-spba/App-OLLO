// ARQUIVO: src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// --- PROVEDORES DE CONTEXTO ---
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

// --- COMPONENTES DE LAYOUT E WRAPPERS ---
import App from './App.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// --- PÁGINAS ---
// Nota: Importamos VerifySuccess do local onde você o salvou (dentro de components/pages)
import VerifySuccess from './components/pages/VerifySuccess.jsx';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import ActionHandlerPage from './pages/ActionHandlerPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';
import CreateListingPage from './pages/CreateListingPage.jsx';
import ListingDetailPage from './pages/ListingDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ProfileRedirectPage from './pages/ProfileRedirectPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import PostDetailPage from './pages/PostDetailPage.jsx';
import PublicErrorPage from './pages/PublicErrorPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

import './index.css';

// --- Verificação das variáveis de ambiente do Firebase ---
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  throw new Error(
    'As variáveis de ambiente do Firebase não foram configuradas corretamente.'
  );
}

// --- DEFINIÇÃO CENTRALIZADA DAS ROTAS ---
const router = createBrowserRouter([
  // --- Rotas de Autenticação (Tela Cheia) ---
  { path: '/login', element: <LoginPage />, errorElement: <PublicErrorPage /> },
  {
    path: '/register',
    element: <RegisterPage />,
    errorElement: <PublicErrorPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
    errorElement: <PublicErrorPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
    errorElement: <PublicErrorPage />,
  },
  {
    path: '/actions',
    element: <ActionHandlerPage />,
    errorElement: <PublicErrorPage />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
    errorElement: <PublicErrorPage />,
  },

  // --- NOVA ROTA DE SUCESSO DE VERIFICAÇÃO ---
  {
    path: '/verify-success',
    element: <VerifySuccess />,
    errorElement: <PublicErrorPage />,
  },

  // --- Rotas Principais com Layout (Sidebar, etc.) ---
  {
    path: '/',
    element: <App />,
    errorElement: <PublicErrorPage />,
    children: [
      // -- Rotas Públicas (limitadas) --
      { path: 'explore', element: <ExplorePage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'posts/:postId', element: <PostDetailPage /> },
      {
        path: 'marketplace/detalhes/:listingId',
        element: <ListingDetailPage />,
      },

      // -- Rotas Privadas (exigem login e e-mail verificado) --
      {
        element: <ProtectedRoute />, // O "guardião" das rotas abaixo
        children: [
          { index: true, element: <HomePage /> },

          { path: 'profile/:username', element: <ProfilePage /> },
          { path: 'marketplace', element: <MarketplacePage /> },
          { path: 'marketplace/criar', element: <CreateListingPage /> },
          { path: 'profile', element: <ProfileRedirectPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
        ],
      },

      // Rota coringa (catch-all) para URLs não encontradas
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

// --- RENDERIZAÇÃO DA APLICAÇÃO ---
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);

// --- Service Worker ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (window.location.hostname.startsWith('www.')) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (let registration of registrations) {
            registration.unregister();
          }
        })
        .finally(() => {
          console.warn(
            'Service Worker: Desregistro forçado para evitar SecurityError no redirecionamento WWW.'
          );
        });
      return;
    }
    navigator.serviceWorker
      .register('/service-worker.js')
      .catch((err) => console.warn('Falha ao registrar Service Worker:', err));
  });
}
