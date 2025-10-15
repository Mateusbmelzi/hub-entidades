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

  console.log('🔍 WelcomeRoute - Estado atual:');
  console.log('  - user:', !!user);
  console.log('  - profile:', !!profile);
  console.log('  - loading:', loading);
  console.log('  - isAuthenticated (entity):', isAuthenticated);

  // Se não há usuário autenticado, redirecionar para auth
  if (!user) {
    console.log('❌ WelcomeRoute: Usuário não autenticado, redirecionando para /auth');
    return <Navigate to="/auth" replace />;
  }

  // Se o usuário é uma entidade, redirecionar para dashboard
  if (isAuthenticated) {
    console.log('❌ WelcomeRoute: Usuário é entidade, redirecionando para /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Se ainda está carregando o perfil, aguardar
  if (loading) {
    console.log('⏳ WelcomeRoute: Perfil ainda carregando, mostrando skeleton');
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
    console.log('❌ WelcomeRoute: Perfil não completo, redirecionando para /profile-setup');
    return <Navigate to="/profile-setup" replace />;
  }

  // Se chegou até aqui, o usuário está autenticado, tem perfil completo e não é entidade
  // Permitir acesso à página Welcome
  console.log('✅ WelcomeRoute: Acesso permitido à página Welcome');
  return <>{children}</>;
}
