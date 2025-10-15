import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStateContext } from '@/components/AuthStateProvider';
import { useUserRole } from '@/hooks/useUserRole';
import { useRedirectDestination } from '@/hooks/useRedirectDestination';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const location = useLocation();
  const { type } = useAuthStateContext();
  const { isAdmin, loading } = useUserRole();
  const { setDestination } = useRedirectDestination();
  
  // Se ainda está carregando, mostrar loading
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }
  
  // Verificar se é super admin OU admin
  const isAuthorized = type === 'superAdmin' || isAdmin;

  // Se não é autorizado, salvar a URL atual e redirecionar para login admin
  if (!isAuthorized) {
    // Usar useEffect para evitar chamar setState durante render
    React.useEffect(() => {
      console.log('🔍 AdminRoute: Salvando destino para redirecionamento:', location.pathname + location.search);
      setDestination(location.pathname + location.search);
    }, [location.pathname, location.search, setDestination]);
    
    console.log('🔍 AdminRoute: Redirecionando para /super-admin-auth');
    return <Navigate to="/super-admin-auth" replace />;
  }

  return <>{children}</>;
};
