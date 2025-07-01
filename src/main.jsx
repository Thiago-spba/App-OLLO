import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './lib/firebase-config.js';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { createBrowserHistory } from 'history';

// --- REGISTRO DO SERVICE WORKER ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => {
        // console.log('Service Worker registrado:', reg);
      })
      .catch((err) => {
        console.warn('Falha ao registrar Service Worker:', err);
      });
  });
}
// -----------------------------------

const history = createBrowserHistory({ window });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HistoryRouter
      history={history}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </HistoryRouter>
  </React.StrictMode>
);
