import { useAuth } from '../context/AuthContext'; // Ajuste o caminho se necessário
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// Componente que protege rotas sensíveis do OLLO
export default function ProtectedRoute({ redirectTo = '/login' }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Se não estiver logado, redireciona para login mantendo o destino original (pós-login pode voltar para onde queria)
  if (!currentUser) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // Se autenticado, libera acesso normalmente
  return <Outlet />;
}
