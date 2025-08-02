import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { loginAsStudent, logout: logoutAuthState } = useAuthStateContext();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Notificar o sistema de autenticação exclusivo
          loginAsStudent(session.user);
          
          // Fetch user profile with retry logic
          setTimeout(async () => {
            try {
              console.log('Buscando perfil do usuário:', session.user.id);
              
              // Fetch profile with retry
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              
              // Get user role with retry
              let roleData = null;
              try {
                console.log('Buscando role do usuário');
                const { data: roleResult } = await supabase
                  .from('user_roles')
                  .select('role')
                  .eq('user_id', session.user.id)
                  .single();
                roleData = roleResult;
                console.log('Role encontrado:', roleData);
              } catch (roleError: any) {
                // Se não conseguir buscar role, assume aluno
                console.warn('Could not fetch user role, defaulting to aluno:', roleError?.message);
              }
              
              if (profileData && roleData) {
                setProfile({ ...profileData, role: roleData.role });
              } else if (profileData) {
                setProfile({ ...profileData, role: 'aluno' });
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
            } finally {
              setLoading(false);
            }
          }, 2000); // Aumentei o delay para dar tempo do Supabase se recuperar
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
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loginAsStudent]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    // Disable email confirmation for signup - we'll handle it manually
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/profile-setup`,
        data: {
          email_confirm: false // Disable automatic email
        }
      }
    });

    // Se o signUp foi bem-sucedido, fazer login automaticamente
    if (!error) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      return { error: signInError };
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    logoutAuthState(); // Limpar estado de autenticação exclusivo
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}