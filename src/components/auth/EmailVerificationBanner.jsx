// COMPONENTE PARA GERENCIAR VERIFICAÇÃO DE EMAIL PERSONALIZADA

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { sendEmailVerification, reload } from 'firebase/auth';

export default function EmailVerificationBanner() {
  const { currentUser } = useAuth();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [lastSent, setLastSent] = useState(null);

  // Verificar se precisa mostrar o banner
  if (!currentUser || currentUser.emailVerified) {
    return null;
  }

  // Função para enviar email personalizado via Cloud Function
  const sendCustomVerification = async () => {
    if (sending) return;

    setSending(true);
    setMessage('');

    try {
      const functions = getFunctions();
      const sendVerification = httpsCallable(
        functions,
        'sendCustomVerificationEmail'
      );

      console.log('[EmailVerification] Chamando função personalizada...');

      const result = await sendVerification();

      console.log('[EmailVerification] Sucesso:', result.data);

      setMessage(
        'Email de verificação personalizado enviado! Verifique sua caixa de entrada.'
      );
      setLastSent(Date.now());
    } catch (error) {
      console.error('[EmailVerification] Erro na função personalizada:', error);

      // Fallback: usar método padrão do Firebase
      try {
        console.log('[EmailVerification] Tentando método padrão...');
        await sendEmailVerification(currentUser);
        setMessage(
          'Email de verificação enviado! Verifique sua caixa de entrada.'
        );
        setLastSent(Date.now());
      } catch (fallbackError) {
        console.error('[EmailVerification] Erro no fallback:', fallbackError);
        setMessage('Erro ao enviar email. Tente novamente em alguns minutos.');
      }
    } finally {
      setSending(false);
    }
  };

  // Função para verificar se o email foi verificado
  const checkEmailVerification = async () => {
    try {
      console.log('[EmailVerification] Verificando status do email...');
      await reload(currentUser);

      // Forçar atualização do contexto de autenticação
      if (currentUser.emailVerified) {
        setMessage('Email verificado com sucesso! Recarregando página...');
        // Recarregar a página após 2 segundos
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage(
          'Email ainda não verificado. Verifique sua caixa de entrada e clique no link de verificação.'
        );
      }
    } catch (error) {
      console.error('[EmailVerification] Erro ao verificar status:', error);
      setMessage('Erro ao verificar status. Tente recarregar a página.');
    }
  };

  // Verificar se pode reenviar (cooldown de 1 minuto)
  const canResend = !lastSent || Date.now() - lastSent > 60000;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
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
            <h3 className="text-sm font-medium text-yellow-800">
              Verifique seu e-mail
            </h3>
            <div className="mt-1 text-sm text-yellow-700">
              <p>
                Seu e-mail ainda não foi verificado. Por favor, verifique sua
                caixa de entrada ou{' '}
                <button
                  onClick={sendCustomVerification}
                  disabled={sending || !canResend}
                  className="font-medium text-yellow-800 underline hover:text-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Enviando...' : 'clique aqui para reenviar o link'}
                </button>
                .
              </p>
              {!canResend && (
                <p className="text-xs mt-1">
                  Aguarde 1 minuto antes de reenviar novamente.
                </p>
              )}
              {message && (
                <p
                  className={`text-xs mt-2 font-medium ${
                    message.includes('Erro') ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={checkEmailVerification}
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-medium py-1 px-3 rounded transition-colors"
          >
            Já verifiquei
          </button>
        </div>
      </div>
    </div>
  );
}
