import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLogData {
  activityType: string;
  activitySubtype?: string;
  title: string;
  description?: string;
  userId?: string;
  entityId?: number;
  metadata?: Record<string, any>;
  status?: 'completed' | 'pending' | 'failed' | 'cancelled';
  pageUrl?: string;
  sessionId?: string;
  referrer?: string;
}

export interface PageVisitData {
  pageUrl: string;
  entityId?: number;
  sessionId?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

export interface SearchActivityData {
  searchTerm: string;
  searchType?: string;
  resultsCount?: number;
  sessionId?: string;
}

export interface InterestDemonstrationData {
  entidadeId: number;
  estudanteEmail: string;
  areaInteresse?: string;
  sessionId?: string;
}

export const useActivityLogger = () => {
  const logActivity = useCallback(async (data: ActivityLogData) => {
    try {
      console.log('Activity logged (simulated):', data);
      // TODO: Implement actual RPC call when database is ready
      // const { error } = await supabase.rpc('log_activity', {
      //   p_activity_type: data.activityType,
      //   p_activity_subtype: data.activitySubtype || null,
      //   p_title: data.title,
      //   p_description: data.description || null,
      //   p_user_id: data.userId || null,
      //   p_entity_id: data.entityId || null,
      //   p_metadata: data.metadata || {},
      //   p_status: data.status || 'completed',
      //   p_page_url: data.pageUrl || null,
      //   p_session_id: data.sessionId || null,
      //   p_referrer: data.referrer || null
      // });
    } catch (error) {
      console.error('Erro ao logar atividade:', error);
    }
  }, []);

  const logUserLogin = useCallback(async (userEmail: string) => {
    try {
      console.log('User login logged (simulated):', userEmail);
      // TODO: Implement actual RPC call when database is ready
    } catch (error) {
      console.error('Erro ao logar login:', error);
    }
  }, []);

  const logUserLogout = useCallback(async (userEmail: string) => {
    try {
      console.log('User logout logged (simulated):', userEmail);
      // TODO: Implement actual RPC call when database is ready
    } catch (error) {
      console.error('Erro ao logar logout:', error);
    }
  }, []);

  // New function to log page visits
  const logPageVisit = useCallback(async (data: PageVisitData) => {
    try {
      console.log('Page visit logged (simulated):', data);
      // TODO: Implement actual RPC call when database is ready
    } catch (error) {
      console.error('Erro ao logar visita de página:', error);
    }
  }, []);

  // New function to log entity page visits specifically
  const logEntityPageVisit = useCallback(async (entityId: number, sessionId?: string, referrer?: string) => {
    try {
      console.log('Entity page visit logged (simulated):', { entityId, sessionId, referrer });
      // TODO: Implement actual RPC call when database is ready
    } catch (error) {
      console.error('Erro ao logar visita de página da entidade:', error);
    }
  }, []);

  // New function to log search activities
  const logSearchActivity = useCallback(async (data: SearchActivityData) => {
    try {
      console.log('Search activity logged (simulated):', data);
      // TODO: Implement actual RPC call when database is ready
    } catch (error) {
      console.error('Erro ao logar atividade de busca:', error);
    }
  }, []);

  // New function to log interest demonstrations
  const logInterestDemonstration = useCallback(async (data: InterestDemonstrationData) => {
    try {
      console.log('Interest demonstration logged (simulated):', data);
      // TODO: Implement actual RPC call when database is ready
    } catch (error) {
      console.error('Erro ao logar demonstração de interesse:', error);
    }
  }, []);

  // Helper functions
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const getCurrentPageUrl = useCallback(() => {
    return window.location.pathname + window.location.search;
  }, []);

  const getReferrer = useCallback(() => {
    return document.referrer || null;
  }, []);

  return {
    logActivity,
    logUserLogin,
    logUserLogout,
    logPageVisit,
    logEntityPageVisit,
    logSearchActivity,
    logInterestDemonstration,
    generateSessionId,
    getCurrentPageUrl,
    getReferrer
  };
}; 