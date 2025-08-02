import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useAuthStateContext } from '@/components/AuthStateProvider';

export type UserRole = 'aluno' | 'lider_entidade' | 'admin';

interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

interface EntityLeaderData {
  id: string;
  user_id: string;
  entidade_id: number;
  created_at: string;
}

// Função para retry com delay exponencial
const retryWithDelay = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      
      // Se for erro de recursos insuficientes, aguarda mais tempo
      const delay = error?.message?.includes('INSUFFICIENT_RESOURCES') 
        ? baseDelay * Math.pow(2, i + 1) 
        : baseDelay * Math.pow(2, i);
      
      console.log(`Tentativa ${i + 1} falhou, aguardando ${delay}ms antes da próxima tentativa`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
};

export function useUserRole() {
  const { user } = useAuth();
  const { type } = useAuthStateContext();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [entityLeaderships, setEntityLeaderships] = useState<EntityLeaderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Se não há usuário, limpa o estado
    if (!user) {
      setUserRole(null);
      setEntityLeaderships([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Se é super admin, não precisa verificar role no banco
    if (type === 'superAdmin') {
      console.log('Super admin detectado, definindo role como admin');
      setUserRole('admin');
      setEntityLeaderships([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchUserRole = async () => {
      try {
        setError(null);
        
        console.log('Buscando role do usuário:', user.id);
        
        // Fetch user role with retry logic
        const roleData = await retryWithDelay(async () => {
          const { data, error } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }
          return data;
        });

        if (roleData) {
          console.log('Role encontrado:', roleData.role);
          setUserRole(roleData.role as UserRole);
        } else {
          console.log('Nenhum role encontrado, assumindo aluno');
          // Se não tem role definido, assume aluno
          setUserRole('aluno');
        }

        // Fetch entity leaderships if user is a leader
        if (roleData?.role === 'lider_entidade' || roleData?.role === 'admin') {
          console.log('Buscando lideranças da entidade');
          const leadershipData = await retryWithDelay(async () => {
            const { data, error } = await supabase
              .from('entity_leaders')
              .select('*')
              .eq('user_id', user.id);

            if (error) {
              throw error;
            }
            return data || [];
          });

          setEntityLeaderships(leadershipData);
        }
      } catch (error: any) {
        console.error('Erro ao buscar role do usuário:', error);
        setError(error?.message || 'Erro ao carregar dados do usuário');
        
        // Fallback: assume aluno se houver erro
        setUserRole('aluno');
        setEntityLeaderships([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, type]);

  const isAdmin = userRole === 'admin';
  const isEntityLeader = userRole === 'lider_entidade';
  const isStudent = userRole === 'aluno';

  const canEditEntity = (entityId: number) => {
    if (isAdmin) return true;
    if (isEntityLeader) {
      return entityLeaderships.some(leadership => leadership.entidade_id === entityId);
    }
    return false;
  };

  const canCreateEvents = isEntityLeader || isAdmin;
  const canManageUsers = isAdmin;

  return {
    userRole,
    entityLeaderships,
    loading,
    error,
    isAdmin,
    isEntityLeader,
    isStudent,
    canEditEntity,
    canCreateEvents,
    canManageUsers,
  };
}