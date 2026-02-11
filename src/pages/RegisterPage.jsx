// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

// MUDANÇA CRÍTICA: Importamos auth e db JÁ PRONTOS do nosso config
// Isso resolve o erro "network-request-failed"
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getFriendlyError = (error) => {
    const errorCode = error?.code;
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso.';
      case 'auth/invalid-email':
        return 'Formato de e-mail inválido.';
      case 'auth/weak-password':
        return 'Senha muito fraca (min 6 caracteres).';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet.';
      default:
        return 'Erro ao criar conta. Tente novamente.';
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // 1. CRIAR O USUÁRIO (Usando o auth importado e estável)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      // 2. ATUALIZAR PERFIL
      await updateProfile(user, {
        displayName: `${data.firstName} ${data.lastName}`,
      });

      // 3. SALVAR NO FIRESTORE (Usando o db importado e estável)
      const additionalData = {
        name: `${data.firstName} ${data.lastName}`,
        username: data.username.toLowerCase(),
        email: data.email,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.firstName + ' ' + data.lastName)}&background=0D4D44&color=fff&bold=true`,
        bio: 'Novo membro da comunidade OLLO!',
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), additionalData, { merge: true });

      await setDoc(
        doc(db, 'users_public', user.uid),
        {
          username: data.username.toLowerCase(),
          name: additionalData.name,
          avatarUrl: additionalData.avatarUrl,
          userId: user.uid,
        },
        { merge: true }
      );

      // 4. SUCESSO
      toast.success('Conta criada! Verifique seu e-mail.', { duration: 6000 });
      reset();
      navigate('/verify-email');
    } catch (error) {
      console.error('Erro no registro:', error);
      const msg = getFriendlyError(error);
      toast.error(msg, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-lg p-4 sm:p-6 lg:p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Junte-se à Comunidade OLLO
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Crie sua conta para começar a explorar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Nome
                </label>
                <input
                  {...register('firstName', {
                    required: 'Obrigatório',
                    minLength: 2,
                  })}
                  className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0D4D44]"
                  placeholder="Nome"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">Inválido</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Sobrenome
                </label>
                <input
                  {...register('lastName', {
                    required: 'Obrigatório',
                    minLength: 2,
                  })}
                  className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0D4D44]"
                  placeholder="Sobrenome"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Nome de usuário
              </label>
              <input
                {...register('username', {
                  required: 'Obrigatório',
                  pattern: {
                    value: /^[a-z0-9_.]+$/,
                    message: 'Letras minúsculas, números, . ou _',
                  },
                  minLength: 3,
                  maxLength: 20,
                })}
                className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0D4D44]"
                placeholder="ex: ana.silva"
              />
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                E-mail
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Obrigatório',
                  pattern: { value: /^\S+@\S+$/i, message: 'Inválido' },
                })}
                className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0D4D44]"
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">Inválido</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Obrigatório',
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                  })}
                  className="w-full px-4 py-3 pr-10 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0D4D44]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-500"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Confirmar Senha
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Obrigatório',
                    validate: (val) =>
                      val === watch('password') || 'As senhas não coincidem',
                  })}
                  className="w-full px-4 py-3 pr-10 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0D4D44]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-[#0D4D44] text-white font-semibold hover:bg-[#093630] transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-md"
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
                className="font-medium text-[#0D4D44] hover:underline"
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
