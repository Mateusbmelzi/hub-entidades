import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStateContext } from '@/components/AuthStateProvider';
import { useRedirectDestination } from '@/hooks/useRedirectDestination';

interface SuperAdminRouteProps {
  children: ReactNode;
}

export const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const location = useLocation();
  const { type } = useAuthStateContext();
  const { setDestination } = useRedirectDestination();
  
  // Verificar se o super admin está autenticado
  const isSuperAdmin = type === 'superAdmin';

  // Se não é super admin, salvar a URL atual e redirecionar para login
  if (!isSuperAdmin) {
    // Usar useEffect para evitar chamar setState durante render
    React.useEffect(() => {
      setDestination(location.pathname + location.search);
    }, [location.pathname, location.search, setDestination]);
    
    return <Navigate to="/super-admin-auth" replace />;
  }

  return <>{children}</>;
}; 