import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ActivityLogsRow } from '@/integrations/supabase/types';
import { mapActivityLogToItem } from '@/lib/dashboard-normalization';

export type { ActivityItem, ActivityItemType } from '@/lib/dashboard-normalization';

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
  recentVisits: Array<{ createdAt: string; userId: string; metadata: unknown }>;
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

const STALE_TIME_MS = 5 * 60 * 1000;

export const DASHBOARD_QUERY_KEYS = {
  all: ['dashboard'] as const,
  stats: ['dashboard', 'stats'] as const,
  recentActivities: ['dashboard', 'recent-activities'] as const
};

async function fetchDashboardStats(): Promise<{
  stats: DashboardStats;
  comprehensiveStats: ComprehensiveStats | null;
}> {
  const { data: comprehensiveData, error: comprehensiveError } = await supabase.rpc(
    'get_comprehensive_dashboard_stats'
  );

  if (!comprehensiveError && comprehensiveData) {
    const basic = comprehensiveData.basic_stats as Record<string, number | undefined>;
    const engagement = comprehensiveData.engagement_stats as Record<string, number | undefined>;
    const stats: DashboardStats = {
      totalUsers: basic?.user_registrations ?? 0,
      totalEntities: basic?.entity_creations ?? 0,
      totalEvents: basic?.event_creations ?? 0,
      totalProjects: basic?.project_creations ?? 0,
      activeUsers: basic?.login_activities ?? 0,
      pendingApprovals: basic?.pending_activities ?? 0,
      recentActivity: basic?.total_activities ?? 0,
      pageVisits: basic?.page_visits ?? 0,
      searchActivities: basic?.search_activities ?? 0,
      uniqueVisitors: engagement?.unique_users ?? 0
    };
    return {
      stats,
      comprehensiveStats: comprehensiveData as ComprehensiveStats
    };
  }

  const { data: statsData, error: statsError } = await supabase.rpc('get_dashboard_stats');
  if (statsError) throw statsError;

  const raw = statsData as Record<string, number | undefined>;
  const stats: DashboardStats = {
    totalUsers: raw?.user_registrations ?? 0,
    totalEntities: raw?.entity_creations ?? 0,
    totalEvents: raw?.event_creations ?? 0,
    totalProjects: raw?.project_creations ?? 0,
    activeUsers: raw?.login_activities ?? 0,
    pendingApprovals: raw?.pending_activities ?? 0,
    recentActivity: raw?.total_activities ?? 0,
    pageVisits: raw?.page_visits ?? 0,
    searchActivities: raw?.search_activities ?? 0,
    uniqueVisitors: raw?.unique_users ?? 0
  };

  return { stats, comprehensiveStats: null };
}

async function fetchRecentActivities(): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []).map(mapActivityLogToItem);
}

export const useDashboardData = () => {
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.stats,
    queryFn: fetchDashboardStats,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: true
  });

  const recentActivitiesQuery = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.recentActivities,
    queryFn: fetchRecentActivities,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: true
  });

  const stats = statsQuery.data?.stats ?? {
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
  };

  const comprehensiveStats = statsQuery.data?.comprehensiveStats ?? null;
  const recentActivities = recentActivitiesQuery.data ?? [];
  const isLoading = statsQuery.isLoading || recentActivitiesQuery.isLoading;
  const error =
    statsQuery.error != null
      ? (statsQuery.error as Error).message
      : recentActivitiesQuery.error != null
        ? (recentActivitiesQuery.error as Error).message
        : null;

  const loadDashboardStats = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stats });
  }, [queryClient]);

  const loadRecentActivities = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.recentActivities });
  }, [queryClient]);

  const getEntityVisitStats = useCallback(
    async (
      entityId?: string,
      startDate?: string,
      endDate?: string
    ): Promise<EntityVisitStats | null> => {
      const { data, error } = await supabase.rpc('get_entity_visit_stats', {
        p_entity_id: entityId ?? null,
        p_start_date: startDate ?? null,
        p_end_date: endDate ?? null
      });
      if (error) {
        console.error('Erro ao buscar estatísticas de visita:', error);
        return null;
      }
      return data as EntityVisitStats;
    },
    []
  );

  const generateReport = useCallback(
    async (filters: ReportFilter): Promise<ReportData | null> => {
      const { data, error } = await supabase.rpc('generate_dashboard_report', {
        p_start_date: filters.dateRange.start,
        p_end_date: filters.dateRange.end,
        p_entity_type: filters.entityType,
        p_activity_type: filters.activityType,
        p_engagement_level: filters.engagementLevel
      });
      if (error) {
        console.error('Erro ao gerar relatório:', error);
        return null;
      }
      return data as ReportData;
    },
    []
  );

  const exportReport = useCallback(
    async (filters: ReportFilter) => {
      const report = await generateReport(filters);
      if (!report) return;
    },
    [generateReport]
  );

  const convertDateToISO = useCallback((dateStr: string): string => {
    return new Date(dateStr).toISOString();
  }, []);

  return {
    stats,
    recentActivities,
    reportData: null,
    comprehensiveStats,
    isLoading,
    error,
    loadDashboardStats,
    loadRecentActivities,
    getEntityVisitStats,
    generateReport,
    exportReport,
    convertDateToISO,
    refetchStats: statsQuery.refetch,
    refetchRecentActivities: recentActivitiesQuery.refetch
  };
};
