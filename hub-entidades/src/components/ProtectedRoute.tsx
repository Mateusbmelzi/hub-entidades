import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRedirectDestination } from '@/hooks/useRedirectDestination';
import { useAuthStateContext } from '@/components/AuthStateProvider';

interface ProtectedRouteProps {
  children: ReactNode;
  requireProfile?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireProfile = false 
}) => {
  const { user, profile } = useAuth();
  const { type } = useAuthStateContext();
  const location = useLocation();
  const { setDestination } = useRedirectDestination();

  // Verificar se há usuário do Supabase OU super admin autenticado
  const isAuthenticated = user || type === 'superAdmin';

  // Se não há usuário nem super admin, salvar a URL atual e redirecionar para login
  if (!isAuthenticated) {
    // Usar useEffect para evitar chamar setState durante render
    useEffect(() => {
      const currentPath = location.pathname + location.search;
      setDestination(currentPath);
    }, [location.pathname, location.search, setDestination]);
    
    return <Navigate to="/auth" replace />;
  }

  // Se requer perfil completo e o perfil não está completo (apenas para usuários normais)
  if (requireProfile && user && !profile?.profile_completed) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
}; 