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
  Activity,
  Building,
  Settings
} from 'lucide-react';
import { useStats } from '@/hooks/useStats';
import { useAfinidadeCursoArea } from '@/hooks/useAfinidadeCursoArea';
import { useTaxaConversaoEntidades } from '@/hooks/useTaxaConversaoEntidades';
import { useReservasPendentes } from '@/hooks/useReservas';
import { useAprovarReservas } from '@/hooks/useAprovarReservas';
import { useTopEntidadesInteresse } from '@/hooks/useTopEntidadesInteresse';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useDemonstracoesPorArea } from '@/hooks/useDemonstracoesPorArea';
import { useAreasEntidades } from '@/hooks/useAreasEntidades';
import { useAlunosPorCurso } from '@/hooks/useAlunosPorCurso';
import { useAlunosPorSemestre } from '@/hooks/useAlunosPorSemestre';
import { useDemonstracoesPorCurso } from '@/hooks/useDemonstracoesPorCurso';
import { useInscricoesPorCurso } from '@/hooks/useInscricoesPorCurso';
import { useAuthStateContext } from '@/components/AuthStateProvider';
import { TopEntidadesInteresseChart } from '@/components/TopEntidadesInteresseChart';
import { DemonstracoesPorAreaChart } from '@/components/DemonstracoesPorAreaChart';
import { AreasEntidadesChart } from '@/components/AreasEntidadesChart';
import { AlunosPorCursoChart } from '@/components/AlunosPorCursoChart';
import { AlunosPorSemestreChart } from '@/components/AlunosPorSemestreChart';
import { DemonstracoesPorCursoChart } from '@/components/DemonstracoesPorCursoChart';
import { InscricoesPorCursoChart } from '@/components/InscricoesPorCursoChart';
import { ExportDashboardButton } from '@/components/ExportDashboardButton';
import { DashboardSection, StatCard, StatusMetrics } from '@/components/DashboardSection';
import { DashboardNavigation, DashboardSectionActions } from '@/components/DashboardNavigation';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, type } = useAuthStateContext();
  const { totalAlunos, totalEntidades, loading: statsLoading, error: statsError } = useStats();
  const { afinidades, loading: afinidadesLoading, error: afinidadesError, refetch: refetchAfinidades } = useAfinidadeCursoArea();
  const { entidades: taxaConversaoEntidades, loading: taxaConversaoLoading, error: taxaConversaoError, refetch: refetchTaxaConversao } = useTaxaConversaoEntidades();
  const { entidades: topEntidadesInteresse, loading: topEntidadesInteresseLoading, error: topEntidadesInteresseError, refetch: refetchTopEntidadesInteresse } = useTopEntidadesInteresse();
  const { reservasPendentes, loading: reservasPendentesLoading, error: reservasPendentesError, refetch: refetchReservasPendentes } = useReservasPendentes();
  const { aprovarReserva, rejeitarReserva, loading: acaoReservaLoading } = useAprovarReservas();
  const { totalDemonstracoes, totalEventos, loading: dashboardStatsLoading, error: dashboardStatsError, refetch: refetchDashboardStats } = useDashboardStats();
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
    refetchAfinidades();
    refetchTaxaConversao();
    refetchTopEntidadesInteresse();
    refetchDashboardStats();
    refetchDemonstracoesPorArea();
    refetchAreasEntidades();
    refetchAlunosPorCurso();
    refetchAlunosPorSemestre();
    refetchDemonstracoesPorCurso();
    refetchInscricoesPorCurso();
    if (isSuperAdmin) {
      refetchReservasPendentes();
    }
  };

  const handleCardClick = (section: 'overview' | 'eventos' | 'organizacoes' | 'demonstracoes' | 'alunos') => {
    setActiveSection(section);
  };

  if (statsLoading || afinidadesLoading || taxaConversaoLoading || topEntidadesInteresseLoading || dashboardStatsLoading || demonstracoesPorAreaLoading || areasEntidadesLoading || alunosPorCursoLoading || alunosPorSemestreLoading || demonstracoesPorCursoLoading || inscricoesPorCursoLoading || (isSuperAdmin && reservasPendentesLoading)) {
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
                  <p className="text-sm text-gray-600">Indicadores gerais, afinidades e aprovação de reservas</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ExportDashboardButton
                data={{
                  // Indicadores Principais
                  totalAlunos: totalAlunos || 0,
                  totalEntidades: totalEntidades || 0,
                  totalDemonstracoes: totalDemonstracoes || 0,
                  totalEventos: totalEventos || 0,
                  
                  
                  // Seção Organizações
                  taxaConversaoEntidades: taxaConversaoEntidades || [],
                  topEntidadesInteresse: topEntidadesInteresse.map(e => ({
                    nome: e.nome_entidade,
                    total_interesses: e.total_demonstracoes
                  })) || [],
                  demonstracoesPorArea: demonstracoesPorArea || [],
                  areasEntidades: areasEntidades || [],
                  
                  // Seção Alunos
                  alunosPorCurso: alunosPorCurso || [],
                  alunosPorSemestre: alunosPorSemestre?.map(e => ({
                    semestre: e.semestre.toString(),
                    total_alunos: e.total_alunos
                  })) || [],
                  demonstracoesPorCurso: demonstracoesPorCurso?.map(e => ({
                    curso_estudante: e.curso,
                    total_demonstracoes: e.total_demonstracoes
                  })) || [],
                  inscricoesPorCurso: inscricoesPorCurso?.map(e => ({
                    curso_estudante: e.curso,
                    total_inscricoes: e.total_inscricoes
                  })) || [],
                  
                  // Afinidades
                  afinidadesCursoArea: afinidades || [],
                  
                  // Propriedades obrigatórias do tipo (mantidas vazias)
                  eventosAprovacao: {
                    total: 0,
                    pendentes: 0,
                    aprovados: 0,
                    rejeitados: 0,
                    taxaAprovacao: '0%'
                  },
                  topEventos: [],
                  eventosPorArea: [],
                  eventosPorOrganizacao: []
                }}
                disabled={statsLoading || afinidadesLoading || taxaConversaoLoading || topEntidadesInteresseLoading || dashboardStatsLoading || demonstracoesPorAreaLoading || areasEntidadesLoading || alunosPorCursoLoading || alunosPorSemestreLoading || demonstracoesPorCursoLoading || inscricoesPorCursoLoading || (isSuperAdmin && reservasPendentesLoading)}
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
        {/* Navegação entre Seções */}
        <DashboardNavigation
          activeSection={activeSection}
          onSectionChange={handleCardClick}
          stats={{
            totalAlunos: totalAlunos || 0,
            totalEntidades: totalEntidades || 0,
            totalEventos: totalEventos || 0,
            totalDemonstracoes: totalDemonstracoes || 0
          }}
        />

        {/* Seção de Aprovação de Eventos (visão geral) - Apenas eventos pendentes */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Introdução ao Dashboard */}
            <DashboardSection
              title="Bem-vindo ao Dashboard"
              description="Este dashboard oferece uma visão completa e organizada de todos os aspectos do sistema de eventos e organizações estudantis."
              icon={<Info className="h-6 w-6" />}
              iconColor="text-blue-600"
              variant="gradient"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="text-gray-700"><strong>Reservas:</strong> Aprovação de salas e auditórios</span>
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
                  💡 <strong>Dica:</strong> Clique nos cards coloridos acima para navegar entre as diferentes seções do dashboard. A seção de eventos agora foca na aprovação de reservas de salas e auditórios.
                </p>
              </div>
            </DashboardSection>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
                Reservas Pendentes de Aprovação
              </h2>
            </div>

            {/* Reservas Pendentes */}
            <DashboardSection
              title="Reservas Aguardando Aprovação"
              description="Reservas que precisam ser revisadas e aprovadas"
              icon={<Clock className="h-5 w-5" />}
              iconColor="text-yellow-600"
              variant="gradient"
              loading={reservasPendentesLoading}
              isEmpty={!reservasPendentes || reservasPendentes.length === 0}
              emptyMessage="Nenhuma reserva pendente"
              emptyIcon={<CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-2" />}
            >
              {reservasPendentes && reservasPendentes.length > 0 && (
                <div className="space-y-3">
                  {reservasPendentes.slice(0, 5).map((reserva, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300 transition-all duration-200 cursor-pointer group">
                      <div 
                        className="flex-1"
                        onClick={() => navigate('/aprovar-reservas')}
                      >
                        <div className="font-medium text-sm text-gray-900 group-hover:text-gray-700">
                          {reserva.nome_evento || 'Reserva de ' + (reserva.tipo_reserva === 'auditorio' ? 'Auditório' : 'Sala')}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 group-hover:text-gray-500">
                          Solicitante: {reserva.nome_solicitante} • Data: {new Date(reserva.data_reserva).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          Clique para gerenciar reserva →
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            aprovarReserva(reserva.id, 'Aprovada via dashboard');
                          }}
                          disabled={acaoReservaLoading}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            rejeitarReserva(reserva.id, 'Rejeitada via dashboard');
                          }}
                          disabled={acaoReservaLoading}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                  {reservasPendentes.length > 5 && (
                    <div className="text-center pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/aprovar-reservas')}
                      >
                        Ver todas as {reservasPendentes.length} reservas pendentes
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </DashboardSection>

            {/* Resumo Rápido */}
            <DashboardSection
              title="Resumo Rápido"
              description="Visão geral das reservas por status"
              icon={<Info className="h-5 w-5" />}
              iconColor="text-blue-600"
              variant="gradient"
            >
              <StatusMetrics
                metrics={[
                  {
                    label: 'Total Pendentes',
                    value: reservasPendentes?.length || 0,
                    color: 'blue',
                    bgColor: 'bg-blue-50',
                    textColor: 'text-blue-700'
                  },
                  {
                    label: 'Auditório',
                    value: reservasPendentes?.filter(r => r.tipo_reserva === 'auditorio').length || 0,
                    color: 'purple',
                    bgColor: 'bg-purple-50',
                    textColor: 'text-purple-700'
                  },
                  {
                    label: 'Salas',
                    value: reservasPendentes?.filter(r => r.tipo_reserva === 'sala').length || 0,
                    color: 'indigo',
                    bgColor: 'bg-indigo-50',
                    textColor: 'text-indigo-700'
                  },
                  {
                    label: 'Com Evento',
                    value: reservasPendentes?.filter(r => r.nome_evento).length || 0,
                    color: 'green',
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-700'
                  }
                ]}
              />
            </DashboardSection>
          </div>
        )}

        {/* Seção de Reservas */}
        {activeSection === 'eventos' && (
          <div className="space-y-6">
            <DashboardSectionActions
              title="Aprovação de Reservas"
              description="Gestão e aprovação de reservas de salas e auditórios"
              actions={
                <>
                  <Button 
                    onClick={() => navigate('/aprovar-reservas')}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Gerenciar Reservas
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCardClick('overview')}
                    className="flex items-center gap-2"
                  >
                    ← Voltar à Visão Geral
                  </Button>
                </>
              }
            />

            {/* 1. Sistema de Aprovação de Reservas */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Sistema de Aprovação de Reservas
                </CardTitle>
                <p className="text-sm text-blue-700">
                  Gerencie todas as reservas de salas e auditórios
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Estatísticas de Status */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">
                      {reservasPendentes?.length || 0}
                    </div>
                    <div className="text-sm text-blue-600">Total Pendentes</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">
                      {reservasPendentes?.filter(r => r.tipo_reserva === 'auditorio').length || 0}
                    </div>
                    <div className="text-sm text-purple-600">Auditórios</div>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-700">
                      {reservasPendentes?.filter(r => r.tipo_reserva === 'sala').length || 0}
                    </div>
                    <div className="text-sm text-indigo-600">Salas</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                      {reservasPendentes?.filter(r => r.nome_evento).length || 0}
                    </div>
                    <div className="text-sm text-green-600">Com Evento</div>
                  </div>
                </div>

                {/* Reservas Pendentes com Ações */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Reservas Pendentes de Aprovação</h4>
                  {reservasPendentesLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-600 mt-2">Carregando...</p>
                    </div>
                  ) : reservasPendentes && reservasPendentes.length > 0 ? (
                    <div className="space-y-2">
                      {reservasPendentes.slice(0, 3).map((reserva, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300 transition-all duration-200 cursor-pointer group">
                          <div 
                            className="flex-1"
                            onClick={() => navigate('/aprovar-reservas')}
                          >
                            <div className="font-medium text-sm text-gray-900 group-hover:text-gray-700">
                              {reserva.nome_evento || 'Reserva de ' + (reserva.tipo_reserva === 'auditorio' ? 'Auditório' : 'Sala')}
                            </div>
                            <div className="text-xs text-gray-600 mt-1 group-hover:text-gray-500">
                              Solicitante: {reserva.nome_solicitante} • Data: {new Date(reserva.data_reserva).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-xs text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              Clique para gerenciar reserva →
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                aprovarReserva(reserva.id, 'Aprovada via dashboard');
                              }}
                              disabled={acaoReservaLoading}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                rejeitarReserva(reserva.id, 'Rejeitada via dashboard');
                              }}
                              disabled={acaoReservaLoading}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        </div>
                      ))}
                      {reservasPendentes.length > 3 && (
                        <div className="text-center pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate('/aprovar-reservas')}
                          >
                            Ver todas as {reservasPendentes.length} reservas pendentes
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto text-green-400 mb-2" />
                      <div className="text-sm font-medium">Nenhuma reserva pendente</div>
                      <div className="text-xs">Todas as reservas foram revisadas</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 2. Resumo de Reservas por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-500" />
                  Resumo de Reservas por Tipo
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Distribuição das reservas pendentes por categoria
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-purple-700">
                          {reservasPendentes?.filter(r => r.tipo_reserva === 'auditorio').length || 0}
                        </div>
                        <div className="text-sm text-purple-600">Reservas de Auditório</div>
                      </div>
                      <Building className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-indigo-700">
                          {reservasPendentes?.filter(r => r.tipo_reserva === 'sala').length || 0}
                        </div>
                        <div className="text-sm text-indigo-600">Reservas de Sala</div>
                      </div>
                      <Settings className="h-8 w-8 text-indigo-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Ações Rápidas
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Acesso rápido às funcionalidades de gestão de reservas
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => navigate('/aprovar-reservas')}
                    className="h-20 flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <CheckCircle className="h-6 w-6" />
                    <span className="font-medium">Aprovar Reservas</span>
                    <span className="text-xs opacity-90">Gerenciar todas as reservas pendentes</span>
                  </Button>
                  <Button 
                    onClick={() => navigate('/calendario-reservas')}
                    className="h-20 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Calendar className="h-6 w-6" />
                    <span className="font-medium">Calendário</span>
                    <span className="text-xs opacity-90">Visualizar reservas aprovadas</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
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

            {/* Top 5 Entidades com Mais Demonstrações de Interesse */}
            <TopEntidadesInteresseChart
              entidades={topEntidadesInteresse}
              loading={topEntidadesInteresseLoading}
              error={topEntidadesInteresseError}
              onRefetch={refetchTopEntidadesInteresse}
            />

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


