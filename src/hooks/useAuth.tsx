import React, { useState, useEffect, createContext, useContext, ReactNode, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from './useActivityLogger';
import { useAuthStateContext } from '@/components/AuthStateProvider';

interface Profile {
  id: string;
  role: string;
  nome?: string;
  data_nascimento?: string;
  curso?: string;
  semestre?: number;
  area_interesse?: string;
  celular?: string;
  email?: string;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache para perfis de usuário
const profileCache = new Map<string, {
  profile: Profile;
  timestamp: number;
}>();

const PROFILE_CACHE_TIMEOUT = 10 * 60 * 1000; // 10 minutos

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { loginAsStudent, logout: logoutAuthState } = useAuthStateContext();
  
  // Ref para controlar se o componente ainda está montado
  const isMountedRef = useRef(true);
  const profileFetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para buscar perfil com cache
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      // Verificar cache primeiro
      const cached = profileCache.get(userId);
      if (cached && (Date.now() - cached.timestamp) < PROFILE_CACHE_TIMEOUT) {
        console.log('📦 Usando perfil em cache para usuário:', userId);
        setProfile(cached.profile);
        return;
      }

      console.log('🔄 Buscando perfil do usuário:', userId);
      
      // Buscar perfil e role em paralelo
      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single()
      ]);
      
      // Tratar erro do roleResult separadamente
      let userRole = 'aluno'; // Fallback padrão
      if (roleResult.error) {
        console.log('⚠️ Erro ao buscar role, usando fallback:', roleResult.error);
      } else if (roleResult.data) {
        userRole = roleResult.data.role;
      }
      
      if (profileResult.data) {
        const userProfile = { 
          ...profileResult.data, 
          role: userRole
        };
        
        // Salvar no cache
        profileCache.set(userId, {
          profile: userProfile,
          timestamp: Date.now()
        });
        
        if (isMountedRef.current) {
          setProfile(userProfile);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Função para forçar refresh do perfil (limpa cache e busca novamente)
  const refreshProfile = useCallback(async () => {
    if (user) {
      console.log('🔄 Forçando refresh do perfil...');
      
      // Limpar cache do usuário atual
      profileCache.delete(user.id);
      console.log('🗑️ Cache do perfil limpo para usuário:', user.id);
      
      // Buscar perfil novamente
      await fetchUserProfile(user.id);
      console.log('✅ Perfil atualizado com sucesso');
    }
  }, [user, fetchUserProfile]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Notificar o sistema de autenticação exclusivo
          loginAsStudent(session.user);
          
          // Limpar timeout anterior se existir
          if (profileFetchTimeoutRef.current) {
            clearTimeout(profileFetchTimeoutRef.current);
          }
          
          // Buscar perfil com delay reduzido
          profileFetchTimeoutRef.current = setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 500); // Reduzido de 2000ms para 500ms
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loginAsStudent(session.user);
        
        // Buscar perfil imediatamente se já há sessão
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (profileFetchTimeoutRef.current) {
        clearTimeout(profileFetchTimeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, [loginAsStudent, fetchUserProfile]);

  // Limpar cache periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of profileCache.entries()) {
        if ((now - value.timestamp) > PROFILE_CACHE_TIMEOUT) {
          profileCache.delete(key);
        }
      }
    }, PROFILE_CACHE_TIMEOUT);

    return () => clearInterval(interval);
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    // Limpar cache ao fazer logout
    profileCache.clear();
    
    await supabase.auth.signOut();
    logoutAuthState();
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}