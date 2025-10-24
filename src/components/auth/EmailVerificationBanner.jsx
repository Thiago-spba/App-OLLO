// src/components/auth/EmailVerificationBanner.jsx
// COMPONENTE OTIMIZADO PARA BANNER DE VERIFICAÇÃO

import React, { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/config';
import { toast } from 'react-hot-toast';

// Nome da Cloud Function que corrige o domínio e envia via Brevo
const BREVO_VERIFICATION_FUNCTION_NAME = 'sendBrevoVerificationEmail';

export default function EmailVerificationBanner() {
  const { currentUser } = useAuth();
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState(null);
  const RESEND_COOLDOWN_MS = 60000; // 1 minuto

  // Não renderiza se o usuário não existe ou já verificou o email
  if (!currentUser || currentUser.emailVerified) {
    return null;
  }

  // Memoiza a função para evitar recriação desnecessária
  const sendVerificationEmail = useCallback(async () => {
    if (sending) return;

    setSending(true);

    try {
      console.log(
        `[EmailVerificationBanner] Chamando Cloud Function: ${BREVO_VERIFICATION_FUNCTION_NAME}...`
      );

      // CHAMA A FUNÇÃO CORRETA E CORRIGIDA NO BACKEND
      const sendEmail = httpsCallable(
        functions,
        BREVO_VERIFICATION_FUNCTION_NAME
      );

      // Passamos o email e nome para que o backend possa gerar o link customizado
      await sendEmail({
        email: currentUser.email,
        displayName: currentUser.displayName,
      });

      toast.success('Email enviado! Verifique sua caixa de entrada e spam.');
      setLastSent(Date.now());
    } catch (error) {
      console.error('[EmailVerificationBanner] Erro ao reenviar email:', error);

      // Otimiza a mensagem de erro para o usuário
      if (error.code === 'unavailable') {
        toast.error('Serviço indisponível. Tente novamente mais tarde.');
      } else if (error.message.includes('cooldown')) {
        toast.error('Aguarde um momento antes de reenviar o email.');
      } else {
        toast.error(
          'Erro desconhecido ao enviar. Verifique o console para detalhes.'
        );
      }
    } finally {
      setSending(false);
    }
  }, [currentUser, sending]);

  // Calcula se o tempo de espera (cooldown) terminou
  const canResend = !lastSent || Date.now() - lastSent > RESEND_COOLDOWN_MS;
  const remainingTime = Math.ceil(
    (RESEND_COOLDOWN_MS - (Date.now() - lastSent)) / 1000
  );

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 dark:bg-yellow-900/20 dark:border-yellow-500">
      <div className="flex items-center justify-between">
        <div className="flex">
          <div className="flex-shrink-0">{/* SVG icon aqui... */}</div>
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
                  Aguarde {remainingTime} segundos antes de reenviar.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
