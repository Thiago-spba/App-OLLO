// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// --- PROVEDORES DE CONTEXTO ---
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

// --- COMPONENTES DE LAYOUT E WRAPPERS ---
import App from './App.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RequireVerifiedEmail from './components/RequireVerifiedEmail.jsx';

// --- PÁGINAS ---
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
import NotificationsPage from './pages/NotificationsPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import PostDetailPage from './pages/PostDetailPage.jsx';
import PublicErrorPage from './pages/PublicErrorPage.jsx'; // <<<< Importação do fallback OLLO

import './index.css';

// Garante que as chaves do Firebase existam antes de iniciar
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  throw new Error(
    'As variáveis de ambiente do Firebase não foram configuradas corretamente.'
  );
}

// --- DEFINIÇÃO CENTRALIZADA DAS ROTAS ---
const router = createBrowserRouter([
  // Rota raiz com layout e contextos globais
  {
    path: '/',
    element: (
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    ),
    errorElement: <PublicErrorPage />, // Fallback OLLO global
    children: [
      { index: true, element: <HomePage /> },
      { path: 'explore', element: <ExplorePage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'posts/:postId', element: <PostDetailPage /> },
      {
        path: 'marketplace/detalhes/:listingId',
        element: <ListingDetailPage />,
      },
      {
        element: <RequireVerifiedEmail />,
        children: [
          { path: 'marketplace', element: <MarketplacePage /> },
          { path: 'marketplace/criar', element: <CreateListingPage /> },
          { path: 'profile/:profileId?', element: <ProfilePage /> },
          { path: 'notifications', element: <NotificationsPage /> },
        ],
      },
      {
        path: '/verify-email',
        element: (
          <ProtectedRoute>
            <VerifyEmailPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // --- Rotas de tela cheia com fallback público OLLO ---
  {
    path: '/login',
    element: (
      <AuthProvider>
        <ThemeProvider>
          <LoginPage />
        </ThemeProvider>
      </AuthProvider>
    ),
    errorElement: <PublicErrorPage />, // Fallback OLLO
  },
  {
    path: '/register',
    element: (
      <AuthProvider>
        <ThemeProvider>
          <RegisterPage />
        </ThemeProvider>
      </AuthProvider>
    ),
    errorElement: <PublicErrorPage />,
  },
  {
    path: '/forgot-password',
    element: (
      <AuthProvider>
        <ThemeProvider>
          <ForgotPasswordPage />
        </ThemeProvider>
      </AuthProvider>
    ),
    errorElement: <PublicErrorPage />,
  },
  {
    path: '/reset-password',
    element: (
      <AuthProvider>
        <ThemeProvider>
          <ResetPasswordPage />
        </ThemeProvider>
      </AuthProvider>
    ),
    errorElement: <PublicErrorPage />,
  },
  {
    path: '/actions',
    element: (
      <AuthProvider>
        <ThemeProvider>
          <ActionHandlerPage />
        </ThemeProvider>
      </AuthProvider>
    ),
    errorElement: <PublicErrorPage />,
  },
]);

// --- RENDERIZAÇÃO DA APLICAÇÃO ---
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// Service Worker (opcional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .catch((err) => console.warn('Falha ao registrar Service Worker:', err));
  });
}
