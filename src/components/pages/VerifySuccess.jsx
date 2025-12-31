// src/components/pages/VerifySuccess.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../../firebase/config';

export default function VerifySuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // 1. Captura o código da URL
    const oobCode = searchParams.get('oobCode');

    // Se não houver código, mostra erro
    if (!oobCode) {
      setStatus('error');
      setErrorMessage('Link inválido ou incompleto.');
      return;
    }

    // 2. Tenta validar o código no Firebase
    applyActionCode(auth, oobCode)
      .then(async () => {
        console.log('✅ Código validado com sucesso!');

        // Se o usuário estiver logado no navegador, atualiza o status dele agora
        if (auth.currentUser) {
          await auth.currentUser.reload();
          console.log('🔄 Status do usuário recarregado.');
        }

        setStatus('success');

        // Redireciona para a Home em 3 segundos
        setTimeout(() => {
          navigate('/');
        }, 3000);
      })
      .catch((error) => {
        console.error('❌ Erro na validação:', error);
        setStatus('error');

        // Mensagens de erro mais claras para o usuário
        if (error.code === 'auth/invalid-action-code') {
          setErrorMessage(
            'Este link já foi utilizado ou expirou. Solicite um novo.'
          );
        } else {
          setErrorMessage('Ocorreu um erro ao validar. Tente novamente.');
        }
      });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* ESTADO: PROCESSANDO */}
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800">Verificando...</h2>
            <p className="text-gray-500 mt-2">
              Estamos validando seu código de acesso.
            </p>
          </>
        )}

        {/* ESTADO: SUCESSO */}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Sucesso Absoluto!
            </h2>
            <p className="text-gray-600">Seu e-mail foi confirmado.</p>
            <p className="text-sm text-gray-400 mt-4">Entrando no OLLO...</p>
          </>
        )}

        {/* ESTADO: ERRO */}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Algo deu errado
            </h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar para Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
