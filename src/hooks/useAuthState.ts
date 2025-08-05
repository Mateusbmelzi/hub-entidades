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
      const isSuperAdmin = localStorage.getItem('superAdminAuthenticated') === 'true';
      
      if (isSuperAdmin) {
        setAuthState({
          type: 'superAdmin',
          user: { email: localStorage.getItem('superAdminEmail') },
          isAuthenticated: true
        });
      } else {
        // Verificar se há token do Supabase (aluno logado)
        const hasSupabaseToken = localStorage.getItem('supabase.auth.token');
        
        if (hasSupabaseToken) {
          setAuthState({
            type: 'student',
            user: null, // Será preenchido pelo useAuth
            isAuthenticated: true
          });
        } else {
          setAuthState({
            type: null,
            user: null,
            isAuthenticated: false
          });
        }
      }
    };

    checkAuthState();
  }, []);

  const loginAsSuperAdmin = (email: string) => {
    // Limpar qualquer login de aluno primeiro
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refreshToken');
    
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