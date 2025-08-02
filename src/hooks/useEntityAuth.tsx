import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseWithRetry } from '@/lib/supabase-utils';

interface EntityAuth {
  entidadeId: number | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const EntityAuthContext = createContext<EntityAuth | null>(null);

export const useEntityAuth = () => {
  const context = useContext(EntityAuthContext);
  if (!context) {
    throw new Error('useEntityAuth must be used within an EntityAuthProvider');
  }
  return context;
};

export const EntityAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [entidadeId, setEntidadeId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if there's a stored session
    const storedEntidadeId = localStorage.getItem('entity_session');
    if (storedEntidadeId) {
      setEntidadeId(parseInt(storedEntidadeId));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('🔄 Tentando autenticar entidade:', username);
      
      const { data, error } = await supabaseWithRetry(
        () => supabase.rpc('authenticate_entity', {
          _username: username,
          _password: password
        }),
        { maxRetries: 2, delay: 1000 }
      );

      if (error) throw error;

      const result = data[0];
      if (result.success) {
        console.log('✅ Entidade autenticada com sucesso:', result.entidade_id);
        setEntidadeId(result.entidade_id);
        setIsAuthenticated(true);
        localStorage.setItem('entity_session', result.entidade_id.toString());
        return { success: true, message: result.message };
      } else {
        console.log('❌ Falha na autenticação:', result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('❌ Erro ao fazer login da entidade:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao fazer login'
      };
    }
  };

  const logout = () => {
    setEntidadeId(null);
    setIsAuthenticated(false);
    localStorage.removeItem('entity_session');
  };

  return (
    <EntityAuthContext.Provider value={{ entidadeId, isAuthenticated, login, logout }}>
      {children}
    </EntityAuthContext.Provider>
  );
};