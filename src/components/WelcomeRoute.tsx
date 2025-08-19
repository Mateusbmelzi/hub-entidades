import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEntityAuth } from '@/hooks/useEntityAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface WelcomeRouteProps {
  children: React.ReactNode;
}

export function WelcomeRoute({ children }: WelcomeRouteProps) {
  const { user, profile, loading } = useAuth();
  const { isAuthenticated } = useEntityAuth();

  // Se não há usuário autenticado, redirecionar para auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Se o usuário é uma entidade, redirecionar para dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se ainda está carregando o perfil, aguardar
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
          <Skeleton className="w-64 h-8 mb-2" />
          <Skeleton className="w-48 h-4" />
        </div>
      </div>
    );
  }

  // Se o usuário não tem perfil completo, redirecionar para profile-setup
  if (!profile?.profile_completed) {
    return <Navigate to="/profile-setup" replace />;
  }

  // Se chegou até aqui, o usuário está autenticado, tem perfil completo e não é entidade
  // Permitir acesso à página Welcome
  return <>{children}</>;
}
