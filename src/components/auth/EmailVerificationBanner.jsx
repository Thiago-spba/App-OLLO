// COMPONENTE DEFINITIVO PARA VERIFICAÇÃO DE EMAIL - PROBLEMA RESOLVIDO
// Versão com correção do erro getIdToken e integração com Cloud Function

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/config';
import { sendEmailVerification } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function EmailVerificationBanner() {
  const { currentUser, forceReloadUser } = useAuth();
  const [sending, setSending] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [lastSent, setLastSent] = useState(null);

  // Verificar se precisa mostrar o banner
  if (!currentUser || currentUser.emailVerified) {
    return null;
  }

  // Função CORRIGIDA para enviar email (usa auth.currentUser)
  const sendVerificationEmail = async () => {
    if (sending) return;

    setSending(true);
    setMessage('');

    try {
      console.log('[EmailVerification] Enviando email...');
      // CORREÇÃO: usar auth.currentUser em vez de currentUser do contexto
      await sendEmailVerification(auth.currentUser);
      setMessage('Email enviado! Verifique sua caixa de entrada.');
      setLastSent(Date.now());
    } catch (error) {
      console.error('[EmailVerification] Erro:', error);
      setMessage('Erro ao enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  // NOVA FUNÇÃO: Sincronizar status via Cloud Function
  const syncVerificationStatus = async () => {
    if (syncing) return;

    setSyncing(true);
    setMessage('');

    try {
      console.log('[EmailVerification] Sincronizando status...');

      // Chamar Cloud Function de sincronização
const functions = getFunctions(undefined, 'southamerica-east1');
      const syncFunction = httpsCallable(
        functions,
        'syncEmailVerificationStatus'
      );

      const result = await syncFunction();

      if (result.data.success) {
        setMessage('Verificação sincronizada! Recarregando...');

        // Forçar reload do usuário para pegar dados atualizados
        setTimeout(async () => {
          await forceReloadUser();
          window.location.reload(); // Recarregar página para refletir mudanças
        }, 1000);
      } else {
        setMessage(
          'Email ainda não foi verificado. Verifique sua caixa de entrada.'
        );
      }
    } catch (error) {
      console.error('[EmailVerification] Erro na sincronização:', error);
      setMessage('Erro ao verificar. Tente novamente em alguns segundos.');
    } finally {
      setSyncing(false);
    }
  };

  // Verificar cooldown de 1 minuto
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
              Verifique seu email
            </h3>
            <div className="mt-1 text-sm text-yellow-700">
              <p>
                Seu email ainda não foi verificado. Verifique sua caixa de
                entrada ou{' '}
                <button
                  onClick={sendVerificationEmail}
                  disabled={sending || !canResend}
                  className="font-medium text-yellow-800 underline hover:text-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Enviando...' : 'clique para reenviar'}
                </button>
                .
              </p>

              {!canResend && (
                <p className="text-xs mt-1">
                  Aguarde 1 minuto antes de reenviar.
                </p>
              )}

              {/* NOVA SEÇÃO: Verificação após clicar no link */}
              <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-800 mb-2">
                  Já clicou no link do email?
                </p>
                <button
                  onClick={syncVerificationStatus}
                  disabled={syncing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                >
                  {syncing ? 'Verificando...' : 'Clique aqui para verificar'}
                </button>
              </div>

              {message && (
                <p
                  className={`text-xs mt-2 font-medium ${
                    message.includes('Erro') || message.includes('ainda não')
                      ? 'text-red-600'
                      : 'text-green-600'
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
            onClick={() => window.location.reload()}
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-medium py-1 px-3 rounded transition-colors"
          >
            Recarregar página
          </button>
        </div>
      </div>
    </div>
  );
}
