import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { 
  BarChart3, 
  LogOut, 
  RefreshCw,
  Trophy,
  Users,
  TrendingUp,
  Info,
  GraduationCap,
  Building2,
  Calendar,
  Target,
  TrendingDown,
  BarChart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Activity
} from 'lucide-react';
import { useTopEventos } from '@/hooks/useTopEventos';
import { useStats } from '@/hooks/useStats';
import { useAfinidadeCursoArea } from '@/hooks/useAfinidadeCursoArea';
import { useTaxaConversaoEntidades } from '@/hooks/useTaxaConversaoEntidades';
import { useEventosAprovacaoStats } from '@/hooks/useEventosAprovacaoStats';
import { useTopEntidadesInteresse } from '@/hooks/useTopEntidadesInteresse';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useEventosPorArea } from '@/hooks/useEventosPorArea';
import { useEventosPorOrganizacao } from '@/hooks/useEventosPorOrganizacao';
import { useDemonstracoesPorArea } from '@/hooks/useDemonstracoesPorArea';
import { useAreasEntidades } from '@/hooks/useAreasEntidades';
import { useAlunosPorCurso } from '@/hooks/useAlunosPorCurso';
import { useAlunosPorSemestre } from '@/hooks/useAlunosPorSemestre';
import { useDemonstracoesPorCurso } from '@/hooks/useDemonstracoesPorCurso';
import { useInscricoesPorCurso } from '@/hooks/useInscricoesPorCurso';
import { useAuthStateContext } from '@/components/AuthStateProvider';
import { EventosAprovacaoStats } from '@/components/EventosAprovacaoStats';
import { EventosPorAreaChart } from '@/components/EventosPorAreaChart';
import { EventosPorOrganizacaoChart } from '@/components/EventosPorOrganizacaoChart';
import { TopOrganizacoesChart } from '@/components/TopOrganizacoesChart';
import { DemonstracoesPorAreaChart } from '@/components/DemonstracoesPorAreaChart';
import { AreasEntidadesChart } from '@/components/AreasEntidadesChart';
import { AlunosPorCursoChart } from '@/components/AlunosPorCursoChart';
import { AlunosPorSemestreChart } from '@/components/AlunosPorSemestreChart';
import { DemonstracoesPorCursoChart } from '@/components/DemonstracoesPorCursoChart';
import { InscricoesPorCursoChart } from '@/components/InscricoesPorCursoChart';
import { ExportDashboardButton } from '@/components/ExportDashboardButton';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, type } = useAuthStateContext();
  const { eventos, loading: eventosLoading, error: eventosError, refetch: refetchEventos } = useTopEventos();
  const { totalAlunos, totalEntidades, loading: statsLoading, error: statsError } = useStats();
  const { afinidades, loading: afinidadesLoading, error: afinidadesError, refetch: refetchAfinidades } = useAfinidadeCursoArea();
  const { entidades: taxaConversaoEntidades, loading: taxaConversaoLoading, error: taxaConversaoError, refetch: refetchTaxaConversao } = useTaxaConversaoEntidades();
  const { entidades: topEntidadesInteresse, loading: topEntidadesInteresseLoading, error: topEntidadesInteresseError, refetch: refetchTopEntidadesInteresse } = useTopEntidadesInteresse();
  const { stats: eventosAprovacaoStats, eventosPendentes, loading: eventosAprovacaoLoading, error: eventosAprovacaoError, refetch: refetchEventosAprovacao } = useEventosAprovacaoStats();
  const { totalDemonstracoes, totalEventos, loading: dashboardStatsLoading, error: dashboardStatsError, refetch: refetchDashboardStats } = useDashboardStats();
  const { eventosPorArea, loading: eventosPorAreaLoading, error: eventosPorAreaError, refetch: refetchEventosPorArea } = useEventosPorArea();
  const { eventosPorOrganizacao, loading: eventosPorOrganizacaoLoading, error: eventosPorOrganizacaoError, refetch: refetchEventosPorOrganizacao } = useEventosPorOrganizacao();
  const { demonstracoesPorArea, loading: demonstracoesPorAreaLoading, error: demonstracoesPorAreaError, refetch: refetchDemonstracoesPorArea } = useDemonstracoesPorArea();
  const { areasEntidades, loading: areasEntidadesLoading, error: areasEntidadesError, refetch: refetchAreasEntidades } = useAreasEntidades();
  const { alunosPorCurso, loading: alunosPorCursoLoading, error: alunosPorCursoError, refetch: refetchAlunosPorCurso } = useAlunosPorCurso();
  const { alunosPorSemestre, loading: alunosPorSemestreLoading, error: alunosPorSemestreError, refetch: refetchAlunosPorSemestre } = useAlunosPorSemestre();
  const { demonstracoesPorCurso, loading: demonstracoesPorCursoLoading, error: demonstracoesPorCursoError, refetch: refetchDemonstracoesPorCurso } = useDemonstracoesPorCurso();
  const { inscricoesPorCurso, loading: inscricoesPorCursoLoading, error: inscricoesPorCursoError, refetch: refetchInscricoesPorCurso } = useInscricoesPorCurso();

  // Estado para controlar qual seção está ativa
  const [activeSection, setActiveSection] = useState<'overview' | 'eventos' | 'organizacoes' | 'demonstracoes' | 'alunos'>('overview');

  // Verificar se o usuário é super admin
  const isSuperAdmin = 
    type === 'superAdmin' || 
    localStorage.getItem('superAdmin') === 'true';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRefreshAll = () => {
    refetchEventos();
    refetchAfinidades();
    refetchTaxaConversao();
    refetchTopEntidadesInteresse();
    refetchDashboardStats();
    refetchEventosPorArea();
    refetchEventosPorOrganizacao();
    refetchDemonstracoesPorArea();
    refetchAreasEntidades();
    refetchAlunosPorCurso();
    refetchAlunosPorSemestre();
    refetchDemonstracoesPorCurso();
    refetchInscricoesPorCurso();
    if (isSuperAdmin) {
      refetchEventosAprovacao();
    }
  };

  const handleCardClick = (section: 'overview' | 'eventos' | 'organizacoes' | 'demonstracoes' | 'alunos') => {
    setActiveSection(section);
  };

  if (eventosLoading || statsLoading || afinidadesLoading || taxaConversaoLoading || topEntidadesInteresseLoading || dashboardStatsLoading || eventosPorAreaLoading || eventosPorOrganizacaoLoading || demonstracoesPorAreaLoading || areasEntidadesLoading || alunosPorCursoLoading || alunosPorSemestreLoading || demonstracoesPorCursoLoading || inscricoesPorCursoLoading || (isSuperAdmin && eventosAprovacaoLoading)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>
        
        <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-sm text-gray-600">Indicadores gerais, afinidades e top eventos</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ExportDashboardButton
                data={{
                  totalAlunos: totalAlunos || 0,
                  totalEntidades: totalEntidades || 0,
                  totalDemonstracoes: totalDemonstracoes || 0,
                  totalEventos: totalEventos || 0,
                  taxaConversaoEntidades: taxaConversaoEntidades || [],
                  topEventos: eventos || [],
                  topEntidadesInteresse: topEntidadesInteresse.map(e => ({
                    nome: e.nome_entidade,
                    total_interesses: e.total_demonstracoes
                  })) || [],
                  afinidadesCursoArea: afinidades || [],
                  eventosAprovacao: eventosAprovacaoStats ? {
                    total: eventosAprovacaoStats.total,
                    pendentes: eventosAprovacaoStats.pendentes,
                    aprovados: eventosAprovacaoStats.aprovados,
                    rejeitados: eventosAprovacaoStats.rejeitados,
                    taxaAprovacao: `${(eventosAprovacaoStats.taxaAprovacao * 100).toFixed(1)}%`
                  } : {
                    total: 0,
                    pendentes: 0,
                    aprovados: 0,
                    rejeitados: 0,
                    taxaAprovacao: '0%'
                  }
                }}
                disabled={eventosLoading || statsLoading || afinidadesLoading || taxaConversaoLoading || topEntidadesInteresseLoading || dashboardStatsLoading || (isSuperAdmin && eventosAprovacaoLoading)}
              />
              
              <Button 
                onClick={handleRefreshAll}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Recarregar
              </Button>
              
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {/* Indicadores Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
            onClick={() => handleCardClick('alunos')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Alunos</CardTitle>
              <GraduationCap className="h-5 w-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {totalAlunos?.toLocaleString('pt-BR') || '0'}
              </div>
              <p className="text-xs text-muted-foreground">Alunos cadastrados</p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
            onClick={() => handleCardClick('organizacoes')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Organizações</CardTitle>
              <Building2 className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {totalEntidades?.toLocaleString('pt-BR') || '0'}
              </div>
              <p className="text-xs text-muted-foreground">Organizações ativas</p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
            onClick={() => handleCardClick('eventos')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Eventos</CardTitle>
              <Calendar className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {dashboardStatsError ? (
                  <span className="text-sm text-red-500">Erro</span>
                ) : (
                  totalEventos?.toLocaleString('pt-BR') || '0'
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardStatsError ? 'Erro ao carregar' : 'Eventos cadastrados'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Aprovação de Eventos (visão geral) - Apenas eventos pendentes */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Introdução ao Dashboard */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Info className="h-6 w-6 text-blue-600" />
                  Bem-vindo ao Dashboard
                </CardTitle>
                <p className="text-sm text-blue-700">
                  Este dashboard oferece uma visão completa e organizada de todos os aspectos do sistema de eventos e organizações estudantis.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span className="text-gray-700"><strong>Eventos:</strong> Aprovação, análise por área e organização</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-700"><strong>Organizações:</strong> Estatísticas e demonstrações de interesse</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-indigo-500" />
                    <span className="text-gray-700"><strong>Alunos:</strong> Distribuição por curso e semestre</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600">
                    💡 <strong>Dica:</strong> Clique nos cards coloridos acima para navegar entre as diferentes seções do dashboard e explorar informações detalhadas sobre cada área.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
                Eventos Pendentes de Aprovação
              </h2>
            </div>

            {/* Eventos Pendentes */}
          <Card>
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Eventos Aguardando Aprovação
              </CardTitle>
                <p className="text-sm text-yellow-700">
                  Eventos que precisam ser revisados e aprovados
              </p>
            </CardHeader>
              <CardContent className="pt-4">
                {eventosAprovacaoLoading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Carregando eventos pendentes...</p>
                  </div>
                ) : eventosPendentes && eventosPendentes.length > 0 ? (
                  <div className="space-y-3">
                    {eventosPendentes.map((evento, index) => (
                                               <div key={index} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                           <div className="flex-1">
                             <div className="font-medium text-sm text-gray-900">
                               {evento.nome}
                             </div>
                             <div className="text-xs text-gray-600 mt-1">
                               Organização: {evento.entidade_nome} • Data: {new Date(evento.data).toLocaleDateString('pt-BR')}
                             </div>
                  </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {/* Função de aprovar evento */}}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {/* Função de rejeitar evento */}}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeitar
                  </Button>
                </div>
                      </div>
                    ))}
                  </div>
                ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="mb-4">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-2" />
                    </div>
                    <div className="text-sm font-medium mb-2">Nenhum evento pendente</div>
                    <div className="text-xs">Todos os eventos foram revisados e aprovados</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo Rápido */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Info className="h-5 w-5 text-blue-600" />
                  Resumo Rápido
                </CardTitle>
                <p className="text-sm text-blue-700">
                  Visão geral dos eventos por status
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-700">
                      {eventosAprovacaoStats?.total || 0}
                    </div>
                    <div className="text-xs text-blue-600">Total</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-700">
                      {eventosAprovacaoStats?.pendentes || 0}
                    </div>
                    <div className="text-xs text-yellow-600">Pendentes</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-700">
                      {eventosAprovacaoStats?.aprovados || 0}
                    </div>
                    <div className="text-xs text-green-600">Aprovados</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold text-red-700">
                      {eventosAprovacaoStats?.rejeitados || 0}
                    </div>
                    <div className="text-xs text-red-600">Rejeitados</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Seção de Eventos */}
        {activeSection === 'eventos' && (
          <div className="space-y-6">
                         <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                 <Calendar className="h-6 w-6 text-orange-500" />
                 Análise de Eventos
               </h2>
               <div className="flex items-center gap-3">
                 <Button 
                   onClick={() => navigate('/aprovar-eventos')}
                   className="bg-orange-600 hover:bg-orange-700 text-white"
                 >
                   <Calendar className="h-4 w-4 mr-2" />
                   Gerenciar Eventos
                 </Button>
                 <Button 
                   variant="outline" 
                   size="sm"
                   onClick={() => handleCardClick('overview')}
                   className="flex items-center gap-2"
                 >
                   ← Voltar à Visão Geral
                 </Button>
               </div>
             </div>

          

                        {/* 1. Sistema de Aprovação de Eventos */}
             <Card>
               <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                 <CardTitle className="flex items-center gap-2 text-blue-800">
                   <Activity className="h-5 w-5 text-blue-600" />
                   Sistema de Aprovação de Eventos
                 </CardTitle>
                 <p className="text-sm text-blue-700">
                   Gerencie todos os eventos e suas aprovações
                 </p>
               </CardHeader>
               <CardContent className="pt-4">
                 {/* Estatísticas de Status */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                   <div className="text-center p-4 bg-blue-50 rounded-lg">
                     <div className="text-2xl font-bold text-blue-700">
                       {eventosAprovacaoStats?.total || 0}
                     </div>
                     <div className="text-sm text-blue-600">Total</div>
                   </div>
                   <div className="text-center p-4 bg-yellow-50 rounded-lg">
                     <div className="text-2xl font-bold text-yellow-700">
                       {eventosAprovacaoStats?.pendentes || 0}
                     </div>
                     <div className="text-sm text-yellow-600">Pendentes</div>
                   </div>
                   <div className="text-center p-4 bg-green-50 rounded-lg">
                     <div className="text-2xl font-bold text-green-700">
                       {eventosAprovacaoStats?.aprovados || 0}
                     </div>
                     <div className="text-sm text-green-600">Aprovados</div>
                   </div>
                   <div className="text-center p-4 bg-red-50 rounded-lg">
                     <div className="text-2xl font-bold text-red-700">
                       {eventosAprovacaoStats?.rejeitados || 0}
                  </div>
                     <div className="text-sm text-red-600">Rejeitados</div>
                  </div>
                </div>

                 {/* Eventos Pendentes com Ações */}
                 <div className="mt-6">
                   <h4 className="font-medium text-gray-900 mb-3">Eventos Pendentes de Aprovação</h4>
                   {eventosAprovacaoLoading ? (
                     <div className="text-center py-4">
                       <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                       <p className="text-sm text-gray-600 mt-2">Carregando...</p>
                     </div>
                   ) : eventosPendentes && eventosPendentes.length > 0 ? (
                     <div className="space-y-2">
                       {eventosPendentes.map((evento, index) => (
                         <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">
                               {evento.nome}
                             </div>
                             <div className="text-xs text-gray-600 mt-1">
                               Organização: {evento.entidade_nome} • Data: {new Date(evento.data).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                             <Button 
                               size="sm" 
                               className="bg-green-600 hover:bg-green-700 text-white"
                               onClick={() => {/* Função de aprovar evento */}}
                             >
                               <CheckCircle className="h-4 w-4 mr-1" />
                               Aprovar
                             </Button>
                             <Button 
                               size="sm" 
                               variant="destructive"
                               onClick={() => {/* Função de rejeitar evento */}}
                             >
                               <XCircle className="h-4 w-4 mr-1" />
                               Rejeitar
                             </Button>
                      </div>
                    </div>
                  ))}
                     </div>
                   ) : (
                     <div className="text-center py-4 text-muted-foreground">
                       <CheckCircle className="h-8 w-8 mx-auto text-green-400 mb-2" />
                       <div className="text-sm font-medium">Nenhum evento pendente</div>
                       <div className="text-xs">Todos os eventos foram revisados</div>
                </div>
              )}
                 </div>
            </CardContent>
          </Card>

            {/* 2. Top 5 Eventos com Mais Inscritos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                  Top 5 Eventos com Mais Inscritos
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ranking dos eventos mais populares
              </p>
            </CardHeader>
            <CardContent>
              {eventosError ? (
                <div className="text-center py-8 text-red-600">
                  <div className="mb-4">
                    <TrendingUp className="h-8 w-8 mx-auto text-red-400 mb-2" />
                  </div>
                  <div className="text-sm font-medium mb-2">Erro ao carregar dados</div>
                  <div className="text-xs mb-3">{eventosError}</div>
                  <Button onClick={refetchEventos} variant="outline" size="sm">
                    Tentar novamente
                  </Button>
                </div>
              ) : eventos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="mb-4">
                    <Trophy className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  </div>
                  <div className="text-sm font-medium mb-2">Nenhum evento encontrado</div>
                  <div className="text-xs">
                    A tabela top_eventos ainda não possui dados.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                    {eventos.slice(0, 5).map((evento, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">
                          {evento.nome_evento}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {evento.total_inscricoes.toLocaleString('pt-BR')} inscrições
                        </Badge>
                        {index < 3 && (
                          <Badge className={`text-xs ${
                            index === 0 ? 'bg-yellow-500 hover:bg-yellow-600' :
                            index === 1 ? 'bg-gray-400 hover:bg-gray-500' :
                            'bg-amber-600 hover:bg-amber-700'
                          } text-white`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

            {/* 3.0 Eventos por Área de Atuação - Gráfico Simples */}
            <EventosPorAreaChart
              eventosPorArea={eventosPorArea}
              loading={eventosPorAreaLoading}
              error={eventosPorAreaError}
              onRefetch={refetchEventosPorArea}
            />

            {/* 3.1 Eventos por Organização - Gráfico Simples */}
            <EventosPorOrganizacaoChart
              eventosPorOrganizacao={eventosPorOrganizacao}
              loading={eventosPorOrganizacaoLoading}
              error={eventosPorOrganizacaoError}
              onRefetch={refetchEventosPorOrganizacao}
            />
          </div>
        )}

        {/* Seção de Organizações */}
        {activeSection === 'organizacoes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-purple-500" />
                Análise de Organizações
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCardClick('overview')}
                className="flex items-center gap-2"
              >
                ← Voltar à Visão Geral
              </Button>
        </div>

            {/* Estatísticas Gerais das Organizações */}
          <Card>
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Building2 className="h-5 w-5 text-slate-600" />
                  Estatísticas Gerais das Organizações
              </CardTitle>
                <p className="text-sm text-slate-700">
                  Visão consolidada das organizações
              </p>
            </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-700">
                      {totalEntidades?.toLocaleString('pt-BR') || 0}
                  </div>
                    <div className="text-sm text-slate-600">Organizações Ativas</div>
                </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-700">
                      {totalEventos?.toLocaleString('pt-BR') || 0}
                  </div>
                    <div className="text-sm text-slate-600">Eventos Realizados</div>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Demonstrações de Interesse por Área de Atuação */}
            <DemonstracoesPorAreaChart
              demonstracoesPorArea={demonstracoesPorArea}
              loading={demonstracoesPorAreaLoading}
              error={demonstracoesPorAreaError}
              onRefetch={refetchDemonstracoesPorArea}
            />

            {/* Distribuição das Áreas das Entidades */}
            <AreasEntidadesChart
              areasEntidades={areasEntidades}
              loading={areasEntidadesLoading}
              error={areasEntidadesError}
              onRefetch={refetchAreasEntidades}
            />
                </div>
              )}

        {/* Seção de Demonstrações de Interesse e Alunos */}
        {activeSection === 'alunos' && (
          <div className="space-y-6">
                         <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                 <GraduationCap className="h-6 w-6 text-indigo-500" />
                 Análise de Alunos e Demonstrações de Interesse
               </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCardClick('overview')}
                className="flex items-center gap-2"
              >
                ← Voltar à Visão Geral
              </Button>
        </div>

            {/* Estatísticas Gerais dos Alunos */}
          <Card>
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
                <CardTitle className="flex items-center gap-2 text-indigo-800">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                  Estatísticas Gerais dos Alunos
              </CardTitle>
                <p className="text-sm text-indigo-700">
                  Visão consolidada dos estudantes
              </p>
            </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-700">
                      {totalAlunos?.toLocaleString('pt-BR') || 0}
                  </div>
                    <div className="text-sm text-indigo-600">Total de Alunos</div>
                </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-700">
                      {totalDemonstracoes?.toLocaleString('pt-BR') || 0}
                  </div>
                    <div className="text-sm text-indigo-600">Demonstrações de Interesse</div>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-700">
                      {totalEventos?.toLocaleString('pt-BR') || 0}
                </div>
                    <div className="text-sm text-indigo-600">Eventos Disponíveis</div>
                      </div>
                    </div>
            </CardContent>
          </Card>

            {/* Alunos por Curso */}
            <AlunosPorCursoChart
              alunosPorCurso={alunosPorCurso}
              loading={alunosPorCursoLoading}
              error={alunosPorCursoError}
              onRefetch={refetchAlunosPorCurso}
            />

            {/* Alunos por Semestre */}
            <AlunosPorSemestreChart
              alunosPorSemestre={alunosPorSemestre}
              loading={alunosPorSemestreLoading}
              error={alunosPorSemestreError}
              onRefetch={refetchAlunosPorSemestre}
            />

            {/* Demonstrações de Interesse por Curso */}
            <DemonstracoesPorCursoChart
              demonstracoesPorCurso={demonstracoesPorCurso}
              loading={demonstracoesPorCursoLoading}
              error={demonstracoesPorCursoError}
              onRefetch={refetchDemonstracoesPorCurso}
            />

            {/* Inscrições em Eventos por Curso */}
            <InscricoesPorCursoChart
              inscricoesPorCurso={inscricoesPorCurso}
              loading={inscricoesPorCursoLoading}
              error={inscricoesPorCursoError}
              onRefetch={refetchInscricoesPorCurso}
            />
        </div>
        )}


      </div>
    </div>
  );
};

export default Dashboard; 


