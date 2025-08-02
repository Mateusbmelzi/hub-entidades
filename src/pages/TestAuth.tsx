import React, { useEffect } from 'react';
import { useAuthStateContext } from '@/components/AuthStateProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TestAuth: React.FC = () => {
  const { type, user, isAuthenticated, loginAsSuperAdmin, logout } = useAuthStateContext();

  useEffect(() => {
    console.log('🧪 TestAuth - Estado atual:', { type, user, isAuthenticated });
  }, [type, user, isAuthenticated]);

  const handleTestLogin = () => {
    console.log('🧪 Testando login como super admin...');
    loginAsSuperAdmin('admin@admin');
  };

  const handleTestLogout = () => {
    console.log('🧪 Testando logout...');
    logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>🧪 Teste de Autenticação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p><strong>Tipo:</strong> {type || 'null'}</p>
            <p><strong>Autenticado:</strong> {isAuthenticated ? 'Sim' : 'Não'}</p>
            <p><strong>Usuário:</strong> {user ? JSON.stringify(user) : 'null'}</p>
          </div>
          
          <div className="space-y-2">
            <Button onClick={handleTestLogin} className="w-full">
              Testar Login Super Admin
            </Button>
            <Button onClick={handleTestLogout} variant="outline" className="w-full">
              Testar Logout
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            <p>Abra o console do navegador para ver os logs detalhados.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAuth; 