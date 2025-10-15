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
      // Log reduzido - apenas em caso de erro
      
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
      
      if (hasSupabaseToken) {
        setAuthState({
          type: 'student',
          user: null, // Será preenchido pelo useAuth
          isAuthenticated: true
        });
        return;
      }
      
      // Só verificar super admin se não houver token do Supabase
      const isSuperAdmin = localStorage.getItem('superAdminAuthenticated') === 'true';
      
      if (isSuperAdmin) {
        setAuthState({
          type: 'superAdmin',
          user: { email: localStorage.getItem('superAdminEmail') },
          isAuthenticated: true
        });
      } else {
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
    // Log reduzido - apenas em caso de erro
    
    // Limpar qualquer login de super admin primeiro
    localStorage.removeItem('superAdminAuthenticated');
    localStorage.removeItem('superAdminEmail');
    
    setAuthState({
      type: 'student',
      user,
      isAuthenticated: true
    });
  };

  const logout = () => {
    console.log('🚪 Fazendo logout...');
    
    // Limpar todos os dados de autenticação
    localStorage.removeItem('superAdminAuthenticated');
    localStorage.removeItem('superAdminEmail');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refreshToken');
    localStorage.removeItem('supabase.auth.expires_at');
    localStorage.removeItem('supabase.auth.access_token');
    localStorage.removeItem('supabase.auth.refresh_token');
    
    // Remover todas as chaves do Supabase
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
    
    setAuthState({
      type: null,
      user: null,
      isAuthenticated: false
    });
    
    console.log('✅ Logout concluído - estado limpo');
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