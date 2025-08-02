import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRedirectDestination } from '@/hooks/useRedirectDestination';

interface ProtectedRouteProps {
  children: ReactNode;
  requireProfile?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireProfile = false 
}) => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const { setDestination } = useRedirectDestination();

  // Se não há usuário, salvar a URL atual e redirecionar para login
  if (!user) {
    // Salvar a URL atual para redirecionar após login
    const currentPath = location.pathname + location.search;
    console.log('🔒 ProtectedRoute - Usuário não autenticado, salvando destino:', currentPath);
    setDestination(currentPath);
    return <Navigate to="/auth" replace />;
  }

  // Se requer perfil completo e o perfil não está completo, redireciona para setup
  if (requireProfile && !profile?.profile_completed) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
}; 