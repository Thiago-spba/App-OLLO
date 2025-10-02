// src/components/auth/EmailVerificationBanner.jsx
// COMPONENTE SIMPLES PARA BANNER DE VERIFICAÇÃO - SEM LOOPS

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/config';
import { toast } from 'react-hot-toast';

export default function EmailVerificationBanner() {
  const { currentUser } = useAuth();
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState(null);

  // Se não há usuário ou email já verificado, não mostra o banner
  if (!currentUser || currentUser.emailVerified) {
    return null;
  }

  // Função para enviar email de verificação
  const sendVerificationEmail = async () => {
    if (sending) return;

    setSending(true);

    try {
      console.log('[EmailVerificationBanner] Enviando email...');
      const sendEmail = httpsCallable(functions, 'sendCustomVerificationEmail');
      await sendEmail();
      toast.success('Email enviado! Verifique sua caixa de entrada.');
      setLastSent(Date.now());
    } catch (error) {
      console.error('[EmailVerificationBanner] Erro:', error);
      toast.error('Erro ao enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  // Verificar cooldown de 1 minuto
  const canResend = !lastSent || Date.now() - lastSent > 60000;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 dark:bg-yellow-900/20 dark:border-yellow-500">
      <div className="flex items-center justify-between">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Verifique seu email
            </h3>
            <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              <p>
                Seu email ainda não foi verificado. Verifique sua caixa de
                entrada ou{' '}
                <button
                  onClick={sendVerificationEmail}
                  disabled={sending || !canResend}
                  className="font-medium text-yellow-800 underline hover:text-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed dark:text-yellow-200 dark:hover:text-yellow-100"
                >
                  {sending ? 'Enviando...' : 'clique para reenviar'}
                </button>
                .
              </p>

              {!canResend && (
                <p className="text-xs mt-1 text-yellow-600 dark:text-yellow-400">
                  Aguarde 1 minuto antes de reenviar.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
