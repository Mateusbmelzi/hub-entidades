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
      console.log('🔍 Verificando estado inicial de autenticação...');
      
      const isSuperAdmin = localStorage.getItem('superAdminAuthenticated') === 'true';
      const studentUser = localStorage.getItem('supabase.auth.token'); // Verificar se há token do Supabase
      
      console.log('📊 Estado do localStorage:', { isSuperAdmin, studentUser: !!studentUser });
      
      if (isSuperAdmin) {
        console.log('👑 Detectado super admin no localStorage');
        setAuthState({
          type: 'superAdmin',
          user: { email: localStorage.getItem('superAdminEmail') },
          isAuthenticated: true
        });
      } else if (studentUser) {
        console.log('👨‍🎓 Detectado aluno no localStorage');
        // Se há token do Supabase, o usuário está logado como aluno
        setAuthState({
          type: 'student',
          user: null, // Será preenchido pelo useAuth
          isAuthenticated: true
        });
      } else {
        console.log('🚫 Nenhum usuário autenticado');
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
    console.log('🔐 loginAsSuperAdmin chamado com:', email);
    
    // Limpar qualquer login de aluno primeiro
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refreshToken');
    
    // Definir login como super admin
    localStorage.setItem('superAdminAuthenticated', 'true');
    localStorage.setItem('superAdminEmail', email);
    
    console.log('💾 localStorage atualizado');
    
    const newAuthState = {
      type: 'superAdmin' as const,
      user: { email },
      isAuthenticated: true
    };
    
    console.log('🔄 Atualizando AuthState para:', newAuthState);
    setAuthState(newAuthState);
    
    console.log('✅ AuthState atualizado para superAdmin');
  };

  const loginAsStudent = (user: any) => {
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
    // Limpar todos os dados de autenticação
    localStorage.removeItem('superAdminAuthenticated');
    localStorage.removeItem('superAdminEmail');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refreshToken');
    
    setAuthState({
      type: null,
      user: null,
      isAuthenticated: false
    });
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