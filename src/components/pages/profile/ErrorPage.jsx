// src/pages/ErrorPage.jsx

import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error); // Loga o erro no console para depuração

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-white dark:bg-gray-800">
      <h1 className="text-6xl font-bold text-ollo-primary dark:text-ollo-accent-light">
        Oops!
      </h1>
      <p className="mt-4 text-xl text-gray-700 dark:text-gray-300">
        Ocorreu um erro inesperado.
      </p>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        <i>{error.statusText || error.message}</i>
      </p>
      <Link
        to="/"
        className="mt-8 px-6 py-3 bg-ollo-deep dark:bg-ollo-accent-light text-white dark:text-gray-900 font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition"
      >
        Voltar para a Página Inicial
      </Link>
    </div>
  );
}
