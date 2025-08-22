import React from 'react';
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
  AlertCircle
} from 'lucide-react';
import { useTopEventos } from '@/hooks/useTopEventos';
import { useStats } from '@/hooks/useStats';
import { useAfinidadeCursoArea } from '@/hooks/useAfinidadeCursoArea';
import { useTaxaConversaoEntidades } from '@/hooks/useTaxaConversaoEntidades';
import { useEventosAprovacaoStats } from '@/hooks/useEventosAprovacaoStats';
import { useTopEntidadesInteresse } from '@/hooks/useTopEntidadesInteresse';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuthStateContext } from '@/components/AuthStateProvider';
import { EventosAprovacaoStats } from '@/components/EventosAprovacaoStats';

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
    if (isSuperAdmin) {
      refetchEventosAprovacao();
    }
  };

  if (eventosLoading || statsLoading || afinidadesLoading || taxaConversaoLoading || topEntidadesInteresseLoading || dashboardStatsLoading || (isSuperAdmin && eventosAprovacaoLoading)) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="hover:shadow-lg transition-all duration-200">
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

          <Card className="hover:shadow-lg transition-all duration-200">
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

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Demonstrações</CardTitle>
              <Target className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {dashboardStatsError ? (
                  <span className="text-sm text-red-500">Erro</span>
                ) : (
                  totalDemonstracoes?.toLocaleString('pt-BR') || '0'
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardStatsError ? 'Erro ao carregar' : 'Demonstrações de interesse'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Eventos</CardTitle>
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

        {/* Seção de Aprovação de Eventos (apenas para super admins) */}
        {isSuperAdmin && (
          <EventosAprovacaoStats
            stats={eventosAprovacaoStats}
            eventosPendentes={eventosPendentes}
            loading={eventosAprovacaoLoading}
          />
        )}

        {/* Seção de Análises */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Afinidade Curso-Área */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-blue-500" />
                Afinidade Curso-Área de Atuação
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Relação entre cursos dos estudantes e áreas de interesse nas organizações
              </p>
            </CardHeader>
            <CardContent>
              {afinidadesError ? (
                <div className="text-center py-8 text-red-600">
                  <div className="mb-4">
                    <TrendingDown className="h-8 w-8 mx-auto text-red-400 mb-2" />
                  </div>
                  <div className="text-sm font-medium mb-2">Erro ao carregar dados</div>
                  <div className="text-xs mb-3">{afinidadesError}</div>
                  <Button onClick={refetchAfinidades} variant="outline" size="sm">
                    Tentar novamente
                  </Button>
                </div>
              ) : afinidades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="mb-4">
                    <BarChart className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  </div>
                  <div className="text-sm font-medium mb-2">Nenhum dado de afinidade</div>
                  <div className="text-xs">
                    A tabela afinidade_curso_area ainda não possui dados.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {afinidades.slice(0, 8).map((afinidade, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">
                          {afinidade.curso_estudante} - {afinidade.area_atuacao}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {afinidade.total_interesses} interesses
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
                  {/* Botão "Ver mais" removido - não implementava funcionalidade real */}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Eventos com Mais Inscritos
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
                  {eventos.slice(0, 8).map((evento, index) => (
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
                  {/* Botão "Ver mais" removido - não implementava funcionalidade real */}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Organizações com Mais Demonstrações de Interesse */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Top Organizações com Mais Demonstrações de Interesse
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ranking das organizações que mais despertam interesse dos estudantes
              </p>
            </CardHeader>
            <CardContent>
              {topEntidadesInteresseError ? (
                <div className="text-center py-8 text-red-600">
                  <div className="mb-4">
                    <TrendingDown className="h-8 w-8 mx-auto text-red-400 mb-2" />
                  </div>
                  <div className="text-sm font-medium mb-2">Erro ao carregar dados</div>
                  <div className="text-xs mb-3">{topEntidadesInteresseError}</div>
                  <Button onClick={refetchTopEntidadesInteresse} variant="outline" size="sm">
                    Tentar novamente
                  </Button>
                </div>
              ) : topEntidadesInteresse.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="mb-4">
                    <Users className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  </div>
                  <div className="text-sm font-medium mb-2">Nenhum dado encontrado</div>
                  <div className="text-xs">
                    A tabela top_entidades_interesse ainda não possui dados.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {topEntidadesInteresse.slice(0, 10).map((entidade, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">
                          {entidade.nome_entidade}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {entidade.total_demonstracoes.toLocaleString('pt-BR')} demonstrações
                        </Badge>
                        {index < 3 && (
                          <Badge className={`text-xs ${
                            index === 0 ? 'bg-purple-500 hover:bg-purple-600' :
                            index === 1 ? 'bg-blue-500 hover:bg-blue-600' :
                            'bg-indigo-500 hover:bg-indigo-600'
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
        </div>

        {/* Taxa de Conversão das Entidades */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Taxa de Conversão das Entidades
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Efetividade das organizações em converter interesse em participação em eventos
              </p>
            </CardHeader>
            <CardContent>
              {taxaConversaoError ? (
                <div className="text-center py-8 text-red-600">
                  <div className="mb-4">
                    <TrendingDown className="h-8 w-8 mx-auto text-red-400 mb-2" />
                  </div>
                  <div className="text-sm font-medium mb-2">Erro ao carregar dados</div>
                  <div className="text-xs mb-3">{taxaConversaoError}</div>
                  <Button onClick={refetchTaxaConversao} variant="outline" size="sm">
                    Tentar novamente
                  </Button>
                </div>
              ) : taxaConversaoEntidades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="mb-4">
                    <TrendingUp className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  </div>
                  <div className="text-sm font-medium mb-2">Nenhum dado de conversão</div>
                  <div className="text-xs">
                    A tabela taxa_conversao_entidades ainda não possui dados.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {taxaConversaoEntidades.slice(0, 8).map((entidade, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">
                          {entidade.nome}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {entidade.total_demonstracoes} demonstrações • {entidade.total_participantes_eventos} participantes
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {(entidade.taxa_conversao * 100).toFixed(1)}%
                        </Badge>
                        {index < 3 && (
                          <Badge className={`text-xs ${
                            index === 0 ? 'bg-green-500 hover:bg-green-600' :
                            index === 1 ? 'bg-blue-500 hover:bg-blue-600' :
                            'bg-purple-500 hover:bg-purple-600'
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
        </div>

        {/* Informações sobre as tabelas */}
        <div className="mt-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <div className="font-semibold mb-1">Sobre este dashboard:</div>
                  <div>• <strong>Indicadores Gerais:</strong> Dados extraídos diretamente das tabelas <code className="bg-blue-100 px-1 rounded">profiles</code> e <code className="bg-blue-100 px-1 rounded">entidades</code> (mesma fonte da Home)</div>
                  <div>• <strong>Afinidade Curso-Área:</strong> Dados extraídos da tabela <code className="bg-blue-100 px-1 rounded">afinidade_curso_area</code></div>
                  <div>• <strong>Top Eventos:</strong> Dados extraídos da tabela <code className="bg-blue-100 px-1 rounded">top_eventos</code></div>
                  <div>• <strong>Top Organizações:</strong> Dados extraídos da tabela <code className="bg-blue-100 px-1 rounded">top_entidades_interesse</code></div>
                  <div>• <strong>Taxa de Conversão:</strong> Dados extraídos da tabela <code className="bg-blue-100 px-1 rounded">taxa_conversao_entidades</code></div>
                  <div>• <strong>Dados em tempo real:</strong> Indicadores sempre atualizados e consistentes com a Home</div>
                  <div>• <strong>Sem cron jobs:</strong> Dados buscados diretamente das tabelas originais</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 


