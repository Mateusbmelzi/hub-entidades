import { useState, useEffect } from 'react';

export type AuthType = 'student' | 'superAdmin' | null;

interface AuthState {
  type: AuthType;
  user: any | null;
  isAuthenticated: boolean;
}

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    type: null,
    user: null,
    isAuthenticated: false
  });

  // Verificar estado inicial ao carregar
  useEffect(() => {
    const checkAuthState = () => {
      console.log('🔍 Verificando estado de autenticação...');
      
      // Verificar se há token do Supabase (aluno logado) de forma mais robusta
      const hasSupabaseToken = 
        localStorage.getItem('supabase.auth.token') ||
        localStorage.getItem('supabase.auth.refreshToken') ||
        localStorage.getItem('supabase.auth.expires_at') ||
        localStorage.getItem('supabase.auth.expires_in') ||
        localStorage.getItem('supabase.auth.access_token') ||
        localStorage.getItem('supabase.auth.refresh_token') ||
        // Verificar se há alguma chave que contenha 'supabase' e 'auth'
        Object.keys(localStorage).some(key => 
          key.includes('supabase') && key.includes('auth') && 
          localStorage.getItem(key) && 
          localStorage.getItem(key) !== 'null'
        );
      
      console.log('🔍 Token Supabase encontrado:', !!hasSupabaseToken);
      console.log('🔍 Chaves do localStorage:', Object.keys(localStorage).filter(key => key.includes('supabase')));
      
      if (hasSupabaseToken) {
        console.log('✅ Definindo como aluno (token Supabase encontrado)');
        setAuthState({
          type: 'student',
          user: null, // Será preenchido pelo useAuth
          isAuthenticated: true
        });
        return;
      }
      
      // Só verificar super admin se não houver token do Supabase
      const isSuperAdmin = localStorage.getItem('superAdminAuthenticated') === 'true';
      console.log('🔍 Super admin encontrado:', isSuperAdmin);
      
      if (isSuperAdmin) {
        console.log('✅ Definindo como super admin');
        setAuthState({
          type: 'superAdmin',
          user: { email: localStorage.getItem('superAdminEmail') },
          isAuthenticated: true
        });
      } else {
        console.log('❌ Nenhuma autenticação encontrada');
        setAuthState({
          type: null,
          user: null,
          isAuthenticated: false
        });
      }
    };

    checkAuthState();
  }, []);

  const loginAsSuperAdmin = (email: string) => {
    console.log('🔐 Login como super admin:', email);
    
    // Limpar qualquer login de aluno primeiro
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refreshToken');
    localStorage.removeItem('supabase.auth.expires_at');
    
    // Definir login como super admin
    localStorage.setItem('superAdminAuthenticated', 'true');
    localStorage.setItem('superAdminEmail', email);
    
    setAuthState({
      type: 'superAdmin',
      user: { email },
      isAuthenticated: true
    });
  };

  const loginAsStudent = (user: any) => {
    console.log('🔐 Login como aluno:', user?.email || user?.id);
    console.log('🔍 Estado antes do loginAsStudent:');
    console.log('  - Tipo atual:', authState.type);
    console.log('  - Usuário atual:', authState.user);
    
    // Limpar qualquer login de super admin primeiro
    localStorage.removeItem('superAdminAuthenticated');
    localStorage.removeItem('superAdminEmail');
    
    console.log('🔍 Limpando chaves de super admin...');
    
    setAuthState({
      type: 'student',
      user,
      isAuthenticated: true
    });
    
    console.log('✅ Estado atualizado para student');
    
    // Verificar localStorage após atualização
    setTimeout(() => {
      const supabaseKeys = Object.keys(localStorage).filter(key => key.includes('supabase'));
      console.log('🔍 Chaves Supabase após loginAsStudent:', supabaseKeys);
      supabaseKeys.forEach(key => {
        console.log(`  - ${key}:`, localStorage.getItem(key) ? '✅' : '❌');
      });
    }, 100);
  };

  const logout = () => {
    console.log('🚪 Fazendo logout...');
    
    // Limpar todos os dados de autenticação
    localStorage.removeItem('superAdminAuthenticated');
    localStorage.removeItem('superAdminEmail');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refreshToken');
    localStorage.removeItem('supabase.auth.expires_at');
    
    setAuthState({
      type: null,
      user: null,
      isAuthenticated: false
    });
    
    // Redirecionar para a página inicial após o logout
    // Usar setTimeout para garantir que o estado seja limpo antes do redirecionamento
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const updateStudentUser = (user: any) => {
    if (authState.type === 'student') {
      setAuthState(prev => ({
        ...prev,
        user
      }));
    }
  };

  return {
    ...authState,
    loginAsSuperAdmin,
    loginAsStudent,
    logout,
    updateStudentUser
  };
}; 