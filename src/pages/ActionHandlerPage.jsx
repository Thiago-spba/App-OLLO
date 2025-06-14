// src/pages/ActionHandlerPage.jsx

import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../firebase/config';
import toast, { Toaster } from 'react-hot-toast';

const ActionHandlerPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const actionCode = searchParams.get('oobCode');
    
    if (!actionCode) {
      navigate('/login'); // Se não há código, não há o que fazer aqui
      return;
    }

    switch (mode) {
      case 'verifyEmail':
        handleVerifyEmail(actionCode);
        break;
      case 'resetPassword':
        navigate(`/reset-password?oobCode=${actionCode}`);
        break;
      default:
        navigate('/login');
    }
  }, [searchParams, navigate]);

  const handleVerifyEmail = async (code) => {
    try {
      await applyActionCode(auth, code);
      toast.success('E-mail verificado com sucesso! Você já pode fazer o login.', { duration: 5000 });
      navigate('/login');
    } catch (error) {
      toast.error('Link de verificação inválido ou expirado. Tente fazer login para reenviar.');
      navigate('/login');
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-white rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4">Processando...</h2>
          <p>Por favor, aguarde enquanto processamos sua solicitação.</p>
        </div>
      </div>
    </>
  );
};

export default ActionHandlerPage;
