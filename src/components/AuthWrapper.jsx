import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ✅ importação correta
import LoadingSpinner from './ui/LoadingSpinner'; // ✅ seu componente de loading

export default function AuthWrapper({ children }) {
  const { currentUser, loading } = useAuth(); // ✅ uso correto aqui
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [loading, currentUser, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentUser) return null;

  return children;
}
