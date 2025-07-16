// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
// Importamos useAuth do nosso contexto, que agora vai nos dar a função de registro
import { useAuth } from '../context/AuthContext';
// Importamos a função para salvar o perfil do usuário no Firestore
// import { createUserProfile } from '../firebase/userFirestore'; // LINHA 9: COMENTADA
import * as FirestoreService from '../firebase/userFirestore'; // <--- NOVA LINHA DE IMPORTAÇÃO (LINHA 9 AGORA)
// Importamos a função do Firebase Auth para enviar e-mail de verificação
import { sendEmailVerification } from 'firebase/auth'; // Importado diretamente do SDK do Firebase

import {
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm();

  // Assumimos que registerUser do useAuth retorna o objeto UserCredential completo.
  // Se seu AuthContext usa 'registerWithEmail', precisaremos que ele retorne o 'user'.
  const { registerWithEmail: registerUser } = useAuth(); // Renomeado para evitar conflito e ser mais genérico
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUsernameTooltipVisible, setIsUsernameTooltipVisible] =
    useState(false);

  const getFriendlyError = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso. Tente recuperar sua conta ou use outro e-mail.';
      case 'auth/invalid-email':
        return 'Formato de e-mail inválido. Verifique e tente novamente.';
      case 'auth/weak-password':
        return 'Senha muito fraca. Use no mínimo 6 caracteres.';
      case 'auth/operation-not-allowed': // Adicionado para cobrir um caso comum de Firebase Auth
        return 'O registro com e-mail/senha não está ativado. Contate o suporte.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde.';
      default:
        return 'Ocorreu um erro inesperado no cadastro. Tente novamente.';
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    const profileData = {
      // Renomeado para 'profileData' para clareza
      name: `${data.firstName} ${data.lastName}`,
      username: data.username.toLowerCase(),
      bio: 'Novo membro da comunidade OLLO!',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        data.firstName + ' ' + data.lastName
      )}&background=4f46e5&color=fff&bold=true`,
      createdAt: new Date().toISOString(), // Adiciona um timestamp de criação
      // Adicione outros campos padrão do perfil aqui, se necessário (ex: followers, following, postsCount)
      followers: 0,
      following: 0,
      postsCount: 0,
    };

    try {
      // 1. REGISTRAR O USUÁRIO NO FIREBASE AUTH
      // A função registerUser (que vem de useAuth) DEVE retornar o objeto userCredential
      const userCredential = await registerUser(data.email, data.password);
      const user = userCredential.user; // Extraímos o objeto user do UserCredential

      if (!user) {
        throw new Error('Usuário não retornado após o registro.');
      }

      // 2. SALVAR DADOS ADICIONAIS DO PERFIL NO FIRESTORE
      // await createUserProfile(user.uid, profileData); // LINHA ANTIGA
      await FirestoreService.createUserProfile(user.uid, profileData); // <--- NOVA CHAMADA

      console.log('Perfil do usuário salvo no Firestore:', user.uid);

      // 3. ENVIAR E-MAIL DE VERIFICAÇÃO
      // Certifique-se de que o Firebase Auth está ativado para envio de e-mails
      // E que as configurações de template de e-mail estão corretas no console do Firebase
      await sendEmailVerification(user);
      console.log('E-mail de verificação enviado para:', user.email);

      // Exibe mensagem de sucesso e redireciona
      toast.success(
        'Conta criada com sucesso! Verifique seu e-mail para ativar.',
        {
          duration: 8000, // Aumentado para dar mais tempo ao usuário ler
          position: 'top-center',
        }
      );
      reset(); // Limpa o formulário
      navigate('/verify-email'); // Redireciona para a página de verificação
    } catch (error) {
      console.error('Erro detalhado no processo de cadastro:', error); // Log mais detalhado
      const errorMessage = getFriendlyError(error?.code);
      toast.error(errorMessage, {
        duration: 7000, // Aumentado para o usuário ter tempo de ler o erro
        position: 'top-center',
      });
      // Se houver erro de autenticação, e o perfil do firestore já tiver sido criado,
      // você pode considerar remover o perfil do firestore ou marcar para remoção (lógica mais avançada).
      // Por enquanto, apenas lidamos com o erro.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-lg p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <img
              src="/images/logo_ollo.jpeg"
              alt="Logo OLLO"
              className="h-16 mx-auto rounded-full mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Junte-se à Comunidade OLLO
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Crie sua conta para começar a explorar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nome e Sobrenome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Nome
                </label>
                <input
                  {...register('firstName', {
                    required: 'Nome é obrigatório',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                  })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light outline-none"
                  placeholder="Seu nome"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Sobrenome
                </label>
                <input
                  {...register('lastName', {
                    required: 'Sobrenome é obrigatório',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                  })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light outline-none"
                  placeholder="Seu sobrenome"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Nome de usuário */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome de usuário
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setIsUsernameTooltipVisible(!isUsernameTooltipVisible)
                  }
                  className="text-gray-500 dark:text-gray-400"
                  aria-label="Regras para nome de usuário"
                >
                  <InformationCircleIcon className="h-5 w-5" />
                </button>
              </div>
              <input
                {...register('username', {
                  required: 'Nome de usuário é obrigatório',
                  pattern: {
                    value: /^[a-z0-9_.]+$/,
                    message:
                      'Use apenas letras minúsculas, números, ponto ou underline',
                  },
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                  maxLength: { value: 20, message: 'Máximo 20 caracteres' },
                })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light outline-none"
                placeholder="ex: ana.silva"
              />
              {isUsernameTooltipVisible && (
                <div className="absolute mt-2 text-sm bg-gray-800 text-white p-3 rounded-lg shadow">
                  <p className="font-semibold">Regras:</p>
                  <ul className="list-disc list-inside">
                    <li>3-20 caracteres</li>
                    <li>Minúsculas, números, ponto ou underline</li>
                  </ul>
                </div>
              )}
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                E-mail
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'E-mail é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Formato de e-mail inválido',
                  },
                })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light outline-none"
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Senha */}
            <div className="relative">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Senha é obrigatória',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                })}
                className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-10 right-3"
                aria-label="Mostrar ou ocultar senha"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirmar senha */}
            <div className="relative">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Confirmar Senha
              </label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Confirme sua senha',
                  validate: (value) =>
                    value === watch('password') || 'As senhas não coincidem',
                })}
                className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-10 right-3"
                aria-label="Mostrar ou ocultar senha"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Botão de ação */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-ollo-deep dark:bg-ollo-accent-light text-white dark:text-gray-900 font-semibold hover:bg-opacity-90 transition disabled:opacity-50 flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="font-medium text-ollo-deep dark:text-ollo-accent-light hover:underline"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
