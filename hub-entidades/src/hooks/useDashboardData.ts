import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalUsers: number;
  totalEntities: number;
  totalEvents: number;
  totalProjects: number;
  activeUsers: number;
  pendingApprovals: number;
  recentActivity: number;
  pageVisits: number;
  searchActivities: number;
  uniqueVisitors: number;
}

export interface ReportFilter {
  dateRange: {
    start: string;
    end: string;
  };
  entityType: string;
  activityType: string;
  engagementLevel: string;
}

export interface ActivityItem {
  id: string;
  type: 'user_registration' | 'entity_creation' | 'event_creation' | 'project_creation' | 'interest_demonstration' | 'page_visit' | 'search' | 'user_login' | 'profile_update';
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  entity?: string;
  user?: string;
  pageUrl?: string;
  sessionId?: string;
}

export interface ReportData {
  period: string;
  totalActivities: number;
  newUsers: number;
  newEntities: number;
  newEvents: number;
  newProjects: number;
  interestDemonstrations: number;
  engagementRate: number;
  pageVisits: number;
  searchActivities: number;
  uniqueVisitors: number;
}

export interface EntityVisitStats {
  totalVisits: number;
  uniqueVisitors: number;
  totalInterestDemonstrations: number;
  uniqueInterestUsers: number;
  mostActiveHours: Array<{ hour: number; visitCount: number }>;
  recentVisits: Array<{ createdAt: string; userId: string; metadata: any }>;
}

export interface ComprehensiveStats {
  basicStats: {
    totalActivities: number;
    userRegistrations: number;
    entityCreations: number;
    eventCreations: number;
    projectCreations: number;
    interestDemonstrations: number;
    loginActivities: number;
    profileUpdates: number;
    pageVisits: number;
    searchActivities: number;
    pendingActivities: number;
    failedActivities: number;
  };
  engagementStats: {
    uniqueUsers: number;
    uniqueEntitiesVisited: number;
    averageSessionDuration: string;
    bounceRate: number;
    returnVisitors: number;
  };
  topEntities: Array<{
    entityName: string;
    entityId: string;
    visitCount: number;
    uniqueVisitors: number;
  }>;
  activityTimeline: Array<{
    date: string;
    activityCount: number;
    uniqueUsers: number;
  }>;
}

// Cache para dados do dashboard
const dashboardCache = new Map<string, {
  data: any;
  timestamp: number;
}>();

const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutos

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEntities: 0,
    totalEvents: 0,
    totalProjects: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    recentActivity: 0,
    pageVisits: 0,
    searchActivities: 0,
    uniqueVisitors: 0
  });

  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [comprehensiveStats, setComprehensiveStats] = useState<ComprehensiveStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs para controlar requisições
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Função para verificar cache
  const getCachedData = useCallback((key: string) => {
    const cached = dashboardCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TIMEOUT) {
      return cached.data;
    }
    return null;
  }, []);

  // Função para salvar no cache
  const setCachedData = useCallback((key: string, data: any) => {
    dashboardCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  const loadDashboardStats = useCallback(async () => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      // Verificar cache primeiro
      const cachedStats = getCachedData('dashboard_stats');
      if (cachedStats) {
        console.log('📦 Usando estatísticas em cache');
        setStats(cachedStats.stats);
        setComprehensiveStats(cachedStats.comprehensiveStats);
        return;
      }

      console.log('🔄 Carregando estatísticas do dashboard...');

      // Tentar carregar estatísticas abrangentes primeiro (mais eficiente)
      const { data: comprehensiveData, error: comprehensiveError } = await supabase
        .rpc('get_comprehensive_dashboard_stats');

      if (!comprehensiveError && comprehensiveData) {
        const basicStats = comprehensiveData.basic_stats;
        const engagementStats = comprehensiveData.engagement_stats;
        
        const newStats = {
          totalUsers: basicStats.user_registrations || 0,
          totalEntities: basicStats.entity_creations || 0,
          totalEvents: basicStats.event_creations || 0,
          totalProjects: basicStats.project_creations || 0,
          activeUsers: basicStats.login_activities || 0,
          pendingApprovals: basicStats.pending_activities || 0,
          recentActivity: basicStats.total_activities || 0,
          pageVisits: basicStats.page_visits || 0,
          searchActivities: basicStats.search_activities || 0,
          uniqueVisitors: engagementStats.unique_users || 0
        };

        if (isMountedRef.current) {
          setStats(newStats);
          setComprehensiveStats(comprehensiveData);
          
          // Salvar no cache
          setCachedData('dashboard_stats', {
            stats: newStats,
            comprehensiveStats: comprehensiveData
          });
        }
      } else {
        // Fallback para estatísticas básicas
        console.log('🔄 Usando fallback para estatísticas básicas...');
        
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_dashboard_stats');

        if (statsError) {
          console.error('Erro ao carregar estatísticas:', statsError);
          
          // Fallback para queries diretas otimizadas
          const [usersCount, entitiesCount, eventsCount, projectsCount, activeUsersCount, pendingApprovalsCount] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('entidades').select('*', { count: 'exact', head: true }),
            supabase.from('eventos').select('*', { count: 'exact', head: true }),
            supabase.from('projetos').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profile_completed', true),
            supabase.from('entidades').select('*', { count: 'exact', head: true }).is('approved', null)
          ]);

          const newStats = {
            totalUsers: usersCount.count || 0,
            totalEntities: entitiesCount.count || 0,
            totalEvents: eventsCount.count || 0,
            totalProjects: projectsCount.count || 0,
            activeUsers: activeUsersCount.count || 0,
            pendingApprovals: pendingApprovalsCount.count || 0,
            recentActivity: 0,
            pageVisits: 0,
            searchActivities: 0,
            uniqueVisitors: 0
          };

          if (isMountedRef.current) {
            setStats(newStats);
            setCachedData('dashboard_stats', { stats: newStats, comprehensiveStats: null });
          }
        } else {
          const newStats = {
            totalUsers: statsData?.user_registrations || 0,
            totalEntities: statsData?.entity_creations || 0,
            totalEvents: statsData?.event_creations || 0,
            totalProjects: statsData?.project_creations || 0,
            activeUsers: statsData?.login_activities || 0,
            pendingApprovals: statsData?.pending_activities || 0,
            recentActivity: statsData?.total_activities || 0,
            pageVisits: statsData?.page_visits || 0,
            searchActivities: statsData?.search_activities || 0,
            uniqueVisitors: statsData?.unique_users || 0
          };

          if (isMountedRef.current) {
            setStats(newStats);
            setCachedData('dashboard_stats', { stats: newStats, comprehensiveStats: null });
          }
        }
      }

    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) return;
      
      console.error('Erro ao carregar estatísticas:', err);
      setError('Erro ao carregar estatísticas do dashboard');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [getCachedData, setCachedData]);

  const loadRecentActivities = useCallback(async () => {
    // Verificar cache primeiro
    const cachedActivities = getCachedData('recent_activities');
    if (cachedActivities) {
      console.log('📦 Usando atividades recentes em cache');
      setRecentActivities(cachedActivities);
      return;
    }

    try {
      console.log('🔄 Carregando atividades recentes...');
      
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (isMountedRef.current) {
        setRecentActivities(data || []);
        setCachedData('recent_activities', data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar atividades recentes:', err);
    }
  }, [getCachedData, setCachedData]);

  const getEntityVisitStats = useCallback(async (entityId?: string, startDate?: string, endDate?: string): Promise<EntityVisitStats | null> => {
    try {
      const { data, error } = await supabase
        .rpc('get_entity_visit_stats', {
          p_entity_id: entityId,
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao buscar estatísticas de visita:', err);
      return null;
    }
  }, []);

  const generateReport = useCallback(async (filters: ReportFilter): Promise<ReportData | null> => {
    try {
      const { data, error } = await supabase
        .rpc('generate_dashboard_report', {
          p_start_date: filters.dateRange.start,
          p_end_date: filters.dateRange.end,
          p_entity_type: filters.entityType,
          p_activity_type: filters.activityType,
          p_engagement_level: filters.engagementLevel
        });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      return null;
    }
  }, []);

  const exportReport = useCallback(async (filters: ReportFilter) => {
    try {
      const reportData = await generateReport(filters);
      if (!reportData) return;

      // Lógica de exportação aqui
      console.log('Exportando relatório:', reportData);
    } catch (err) {
      console.error('Erro ao exportar relatório:', err);
    }
  }, [generateReport]);

  const convertDateToISO = useCallback((dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toISOString();
  }, []);

  // Limpar cache periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of dashboardCache.entries()) {
        if ((now - value.timestamp) > CACHE_TIMEOUT) {
          dashboardCache.delete(key);
        }
      }
    }, CACHE_TIMEOUT);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadDashboardStats();
    loadRecentActivities();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadDashboardStats, loadRecentActivities]);

  return {
    stats,
    recentActivities,
    reportData,
    comprehensiveStats,
    isLoading,
    error,
    loadDashboardStats,
    loadRecentActivities,
    getEntityVisitStats,
    generateReport,
    exportReport,
    convertDateToISO
  };
}; 