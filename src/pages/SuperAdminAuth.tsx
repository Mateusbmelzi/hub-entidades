import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, User, Sparkles, Building2, Award, ArrowLeft, ArrowRight, Crown, Settings } from 'lucide-react';
import { useAuthStateContext } from '@/components/AuthStateProvider';
import { useRedirectDestination } from '@/hooks/useRedirectDestination';

const SuperAdminAuth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { type, loginAsSuperAdmin } = useAuthStateContext();
  const { destination, clearDestination } = useRedirectDestination();

  // Verificar se já está autenticado como super admin
  useEffect(() => {
    if (type === 'superAdmin') {
      console.log('🔄 Super admin já autenticado, redirecionando...');
      
      // Se há um destino salvo, redirecionar para ele
      if (destination) {
        const targetRoute = destination;
        clearDestination();
        navigate(targetRoute);
      } else {
        // Se não há destino, redirecionar para dashboard
        navigate('/dashboard');
      }
    }
  }, [type, navigate, destination, clearDestination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Credenciais fixas do super admin
    const SUPER_ADMIN_EMAIL = 'admin@admin';
    const SUPER_ADMIN_PASSWORD = 'Insper@2025';

    console.log('🔐 Tentativa de login super admin:', { email, password });

    if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
      console.log('✅ Credenciais corretas, fazendo login...');
      
      // Login bem-sucedido usando o sistema exclusivo
      loginAsSuperAdmin(email);
      
      console.log('✅ Login realizado, aguardando atualização do estado...');
      
      // Aguardar um pouco para o estado ser atualizado
      setTimeout(() => {
        console.log('🔄 Redirecionando...');
        
        // Se há um destino salvo, redirecionar para ele
        if (destination) {
          const targetRoute = destination;
          clearDestination();
          navigate(targetRoute);
        } else {
          // Se não há destino, redirecionar para dashboard
          navigate('/dashboard');
        }
      }, 100);
    } else {
      console.log('❌ Credenciais inválidas');
      setError('Credenciais inválidas. Verifique seu email e senha.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
              <Crown className="w-4 h-4 mr-2" />
              Área Administrativa
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Super Admin
            </h1>
            
            <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto mb-8">
              Acesso administrativo especial para gerenciamento do Hub de Entidades Insper
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Gerenciar Organizações</h3>
                <p className="text-red-100 text-sm">
                  Aprovar e gerenciar organizações estudantis
                </p>
              </div>
              
              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Aprovar Eventos</h3>
                <p className="text-red-100 text-sm">
                  Revisar e aprovar eventos das organizações
                </p>
              </div>
              
              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Configurações</h3>
                <p className="text-red-100 text-sm">
                  Gerenciar configurações do sistema
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Form */}
      <div className="max-w-md mx-auto px-4 py-16">
        <Card className="border-0 shadow-2xl bg-white">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Acesso Administrativo</CardTitle>
            <CardDescription className="text-gray-600">
              Entre com suas credenciais de super administrador
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 inline mr-2" />
                  Email Administrativo
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@admin"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gray-200 focus:border-red-500 focus:ring-red-500 pl-10"
                    required
                  />
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Acesso Restrito
                  </Badge>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Senha Administrativa
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite a senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray-200 focus:border-red-500 focus:ring-red-500 pl-10"
                    required
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">
                  Credenciais de acesso exclusivo
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar como Super Admin'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para login normal
              </Button>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Este é um acesso restrito para administradores do sistema
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminAuth;