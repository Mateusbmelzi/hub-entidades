import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLogData {
  activityType: string;
  activitySubtype?: string;
  title: string;
  description?: string;
  userId?: string;
  entityId?: number;
  metadata?: Record<string, unknown>;
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
  metadata?: Record<string, unknown>;
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
      const { error } = await supabase.rpc('log_activity', {
        p_activity_type: data.activityType,
        p_activity_subtype: data.activitySubtype ?? null,
        p_title: data.title,
        p_description: data.description ?? null,
        p_user_id: data.userId ?? null,
        p_entity_id: data.entityId ?? null,
        p_metadata: (data.metadata ?? {}) as Record<string, unknown>,
        p_status: data.status ?? 'completed',
        p_page_url: data.pageUrl ?? null,
        p_session_id: data.sessionId ?? null,
        p_referrer: data.referrer ?? null
      });
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao logar atividade:', error);
    }
  }, []);

  const logUserLogin = useCallback(
    async (userEmail: string) => {
      await logActivity({
        activityType: 'user_login',
        title: 'Login',
        description: userEmail,
        status: 'completed'
      });
    },
    [logActivity]
  );

  const logUserLogout = useCallback(
    async (userEmail: string) => {
      await logActivity({
        activityType: 'user_logout',
        title: 'Logout',
        description: userEmail,
        status: 'completed'
      });
    },
    [logActivity]
  );

  const logPageVisit = useCallback(async (data: PageVisitData) => {
    try {
      const meta = data.metadata && typeof data.metadata === 'object' ? data.metadata : {};
      const userAgent = (meta.userAgent as string) ?? null;
      const screenResolution = (meta.screenResolution as string) ?? null;
      const language = (meta.language as string) ?? null;

      const { error } = await supabase.rpc('log_page_visit', {
        p_page_url: data.pageUrl,
        p_entity_id: data.entityId ?? null,
        p_session_id: data.sessionId ?? null,
        p_referrer: data.referrer ?? null,
        p_user_agent: userAgent,
        p_screen_resolution: screenResolution,
        p_language: language,
        p_metadata: (data.metadata ?? {}) as Record<string, unknown>
      });
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao logar visita de página:', error);
    }
  }, []);

  const logEntityPageVisit = useCallback(
    async (entityId: number, sessionId?: string, referrer?: string) => {
      await logPageVisit({
        pageUrl: window.location.pathname + window.location.search,
        entityId,
        sessionId,
        referrer: referrer ?? undefined
      });
    },
    [logPageVisit]
  );

  const logSearchActivity = useCallback(
    async (data: SearchActivityData) => {
      await logActivity({
        activityType: 'search',
        activitySubtype: data.searchType,
        title: 'Busca',
        description: data.searchTerm,
        sessionId: data.sessionId,
        metadata:
          data.resultsCount !== undefined
            ? { searchTerm: data.searchTerm, resultsCount: data.resultsCount }
            : { searchTerm: data.searchTerm }
      });
    },
    [logActivity]
  );

  const logInterestDemonstration = useCallback(
    async (data: InterestDemonstrationData) => {
      await logActivity({
        activityType: 'interest_demonstration',
        title: 'Demonstração de interesse',
        description: data.estudanteEmail,
        entityId: data.entidadeId,
        sessionId: data.sessionId,
        metadata: data.areaInteresse ? { areaInteresse: data.areaInteresse } : undefined
      });
    },
    [logActivity]
  );

  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  const getCurrentPageUrl = useCallback(() => {
    return window.location.pathname + window.location.search;
  }, []);

  const getReferrer = useCallback(() => {
    return document.referrer || undefined;
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
