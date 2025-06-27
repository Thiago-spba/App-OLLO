// src/components/PWABanner.jsx
import React, { useEffect, useState } from 'react';
import { safeGetItem, safeSetItem } from '../utils/safeLocalStorage';

function CloseIcon({ className }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
    >
      <circle cx="11" cy="11" r="11" fill="rgba(5,255,176,0.13)" />
      <path
        d="M7 7l8 8M15 7l-8 8"
        stroke="#05ffb0"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const STORAGE_KEY = 'pwa_banner_closed';

const PWABanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const alreadyClosed = safeGetItem(STORAGE_KEY);
    if (alreadyClosed) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setShowBanner(false);
      setDeferredPrompt(null);
      safeSetItem(STORAGE_KEY, 'yes');
    }
  };

  const handleClose = () => {
    setShowBanner(false);
    safeSetItem(STORAGE_KEY, 'yes');
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
      style={{ animation: 'fadeInBg 0.2s' }}
    >
      <div
        className="
          max-w-xs w-[95vw] flex items-center gap-3 
          rounded-2xl px-4 py-4 shadow-xl border border-[#05ffb0]
          bg-white/95 dark:bg-[#131e18]/95
          relative animate-slide-up pointer-events-auto
        "
        style={{ animation: 'slideUp 0.4s cubic-bezier(.4,1.7,.65,1)' }}
      >
        <img
          src="/images/android-chrome-192x192.png"
          alt="Logo OLLO"
          className="w-12 h-12 rounded-xl shadow border border-[#05ffb0] bg-white"
          style={{ objectFit: 'cover' }}
        />
        <div className="flex-1 min-w-0">
          <span className="block font-semibold text-base text-ollo-deep dark:text-ollo-crystal-green mb-0.5">
            Instale o OLLO
          </span>
          <span className="block text-xs text-gray-700 dark:text-gray-100">
            Acesso rápido, notificações e uso offline.
          </span>
        </div>
        <button
          aria-label="Instalar app OLLO"
          className="ml-2 bg-[#05ffb0] hover:bg-ollo-deep text-white font-bold px-4 py-1 rounded-lg transition shadow text-sm"
          style={{
            minWidth: 85,
            fontWeight: 'bold',
            boxShadow: '0 2px 6px 0 rgba(5,255,176,0.12)',
          }}
          onClick={handleInstall}
        >
          Instalar
        </button>
        <button
          aria-label="Fechar banner de instalação"
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-[#05ffb0]/20 transition"
          style={{ lineHeight: 0 }}
        >
          <CloseIcon />
        </button>
        {/* Animações */}
        <style>
          {`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(40px);}
              to { opacity: 1; transform: translateY(0);}
            }
            @keyframes fadeInBg {
              from { opacity: 0;}
              to { opacity: 1;}
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default PWABanner;
