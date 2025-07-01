// src/components/pages/profile/ShareButton.jsx
import { useState } from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from 'react-share';
import { QRCodeCanvas } from 'qrcode.react';

import { FiCopy, FiCheck, FiX, FiShare2 } from 'react-icons/fi';

export function ShareButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [copyStatus, setCopyStatus] = useState('idle'); // 'idle', 'copying', 'copied'
  const url = window.location.href;
  const title = 'Confira meu perfil no OLLO';

  const handleCopy = async () => {
    try {
      setCopyStatus('copying');
      await navigator.clipboard.writeText(url);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopyStatus('idle');
    }
  };

  return (
    <div className="relative">
      {/* Botão Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
        aria-label="Compartilhar perfil"
        aria-expanded={isOpen}
      >
        <FiShare2 className="text-lg" />
        <span>Compartilhar</span>
      </button>

      {/* Menu de Compartilhamento */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              Compartilhar via
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Fechar menu"
            >
              <FiX className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-3 grid grid-cols-3 gap-2">
            <FacebookShareButton
              url={url}
              quote={title}
              className="focus:outline-none"
            >
              <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <FacebookIcon size={32} round />
                <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">
                  Facebook
                </span>
              </div>
            </FacebookShareButton>

            <TwitterShareButton
              url={url}
              title={title}
              className="focus:outline-none"
            >
              <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <TwitterIcon size={32} round />
                <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">
                  Twitter
                </span>
              </div>
            </TwitterShareButton>

            <WhatsappShareButton
              url={url}
              title={title}
              className="focus:outline-none"
            >
              <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <WhatsappIcon size={32} round />
                <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">
                  WhatsApp
                </span>
              </div>
            </WhatsappShareButton>
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              disabled={copyStatus === 'copying'}
            >
              {copyStatus === 'copied' ? (
                <FiCheck className="text-emerald-500" />
              ) : (
                <FiCopy />
              )}
              {copyStatus === 'copied' ? 'Link copiado!' : 'Copiar link'}
            </button>

            <button
              onClick={() => setShowQRCode(true)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-gray-600 dark:border-gray-400" />
              </div>
              Gerar QR Code
            </button>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                QR Code do Perfil
              </h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Fechar modal"
              >
                <FiX className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="flex justify-center p-4 bg-white rounded-lg">
              <QRCode
                value={url}
                size={200}
                level="H"
                includeMargin
                fgColor="#0f766e" // Cor teal-800
              />
            </div>

            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300 break-all">
              {url}
            </div>

            <button
              onClick={handleCopy}
              className="mt-4 w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              disabled={copyStatus === 'copying'}
            >
              {copyStatus === 'copied' ? 'Link copiado!' : 'Copiar link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
