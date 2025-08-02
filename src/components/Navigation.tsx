
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Calendar, 
  Home, 
  Menu, 
  X, 
  User, 
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStateContext } from '@/components/AuthStateProvider';
import NotificationBell from './NotificationBell';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { type, logout } = useAuthStateContext();

  const isActive = (path: string) => location.pathname === path;
  const isSuperAdmin = type === 'superAdmin';

  const handleSignOut = async () => {
    // Prevenir múltiplos cliques
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      console.log('🚪 Iniciando logout...');
      
      if (user) {
        console.log('👨‍🎓 Logout de aluno');
        await signOut();
      } else if (isSuperAdmin) {
        console.log('👑 Logout de super admin');
        logout();
      }
      
      console.log('✅ Logout concluído');
      
      // Redirecionar para a página inicial após o logout
      // Usar setTimeout para garantir que o estado seja limpo antes do redirecionamento
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('❌ Erro durante logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Navegação principal focada no aluno
  const navigationItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Organizações', href: '/entidades', icon: Building2 },
    { name: 'Eventos', href: '/eventos', icon: Calendar },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-insper-light-gray-1 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/logo-hub-entidades.svg" 
                alt="Hub de Entidades Insper" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-insper-black">Hub de Entidades</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-insper-red bg-red-50 border-b-2 border-insper-red'
                      : 'text-insper-dark-gray hover:text-insper-black hover:bg-insper-light-gray'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                {/* Notificações */}
                <NotificationBell />
                
                {/* Perfil */}
                <Link
                  to="/perfil"
                  className="text-sm text-insper-dark-gray hover:text-insper-black flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-insper-light-gray transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Perfil</span>
                </Link>

                {/* Sair */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="text-insper-dark-gray hover:text-insper-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-insper-red border-t-transparent" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}

            {isSuperAdmin && (
              <div className="flex items-center space-x-3">
                {/* Super Admin - Muito sutil */}
                <Link
                  to="/dashboard"
                  className="text-xs text-insper-dark-gray hover:text-insper-black flex items-center space-x-1 px-2 py-1 rounded transition-colors"
                  title="Dashboard Admin"
                >
                  <Settings className="w-3 h-3" />
                  <span className="hidden lg:inline">Admin</span>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="text-insper-dark-gray hover:text-insper-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-insper-red border-t-transparent" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}

            {!user && !isSuperAdmin && (
              <div className="flex items-center space-x-2">
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Entrar
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.href)
                      ? 'text-insper-red bg-red-50'
                      : 'text-insper-dark-gray hover:text-insper-black hover:bg-insper-light-gray'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {user && (
              <>
                <Link
                  to="/perfil"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-insper-dark-gray hover:text-insper-black hover:bg-insper-light-gray"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span>Perfil</span>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="w-full justify-start text-insper-dark-gray hover:text-insper-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-insper-red border-t-transparent mr-2" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                  )}
                  Sair
                </Button>
              </>
            )}

            {isSuperAdmin && (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-insper-dark-gray hover:text-insper-black hover:bg-insper-light-gray"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-5 h-5" />
                  <span>Dashboard Admin</span>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="w-full justify-start text-insper-dark-gray hover:text-insper-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-insper-red border-t-transparent mr-2" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                  )}
                  Sair
                </Button>
              </>
            )}

            {!user && !isSuperAdmin && (
              <Link
                to="/auth"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-insper-dark-gray hover:text-insper-black hover:bg-insper-light-gray"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-5 h-5" />
                <span>Entrar</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
