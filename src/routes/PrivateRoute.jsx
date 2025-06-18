// src/routes/PrivateRoute.jsx - Refatorado para usar Outlet

import { Navigate, Outlet } from 'react-router-dom';
// Troque pelo seu contexto ou store de autenticação
// import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  // Exemplo: Substitua pela sua lógica real para verificar se o usuário está logado
  // const { currentUser } = useAuth();
  const isAuthenticated = true; // <<-- COLOQUE SUA LÓGICA DE VERIFICAÇÃO REAL AQUI

  // Se estiver autenticado, renderiza a rota filha através do Outlet.
  // Se não, redireciona para a página de login.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
