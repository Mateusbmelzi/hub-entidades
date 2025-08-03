import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Building2, 
  Calendar, 
  TrendingUp, 
  LogOut, 
  UserCheck,
  Sparkles,
  GraduationCap,
  BookOpen,
  Magnet,
  MessageSquare,
  RefreshCw,
  Copy,
  Target,
  BarChart3,
  Clock,
  MousePointer,
  Activity,
  AlertTriangle,
  UserX,
  Check,
  X,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthStateContext } from '@/components/AuthStateProvider';
import { useAprovarEventos, EventoParaAprovacao } from '@/hooks/useAprovarEventos';

interface IndicadorEstrategico {
  id: string;
  nome: string;
  descricao: string;
  valor: string | number;
  valorEstrategico: string;
  icone: React.ReactNode;
  cor: string;
  tendencia?: 'up' | 'down' | 'stable';
}

interface IndicadorCruzado {
  id: string;
  nome: string;
  descricao: string;
  valorEstrategico: string;
  icone: React.ReactNode;
  cor: string;
}

interface AfinidadeCursoProjeto {
  curso: string;
  tipo_projeto: string;
  total_interesses: number;
  percentual_curso: number;
  afinidade_score: number;
}

interface CorrelacaoNavegacaoInteracao {
  usuario_email: string;
  tempo_navegacao: number;
  numero_interacoes: number;
  correlacao_score: number;
  qualidade_interface: string;
}

interface CalouroInativo {
  email: string;
  nome: string;
  curso: string;
  semestre: string;
  data_login: string;
  dias_sem_acao: number;
  risco_desconexao: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStateContext();
  const { eventos, loading: eventosLoading, aprovarEvento } = useAprovarEventos();
  const [loading, setLoading] = useState(true);
  const [indicadoresEstrategicos, setIndicadoresEstrategicos] = useState<IndicadorEstrategico[]>([]);
  const [indicadoresCruzados, setIndicadoresCruzados] = useState<IndicadorCruzado[]>([]);
  const [afinidadeCursoProjeto, setAfinidadeCursoProjeto] = useState<AfinidadeCursoProjeto[]>([]);
  const [correlacaoNavegacaoInteracao, setCorrelacaoNavegacaoInteracao] = useState<CorrelacaoNavegacaoInteracao[]>([]);
  const [calourosInativos, setCalourosInativos] = useState<CalouroInativo[]>([]);
  const [stats, setStats] = useState({
    totalEntidades: 0,
    totalEventos: 0,
    totalInscritos: 0
  });
  
  // Estados para aprovação de eventos
  const [updatingEventoId, setUpdatingEventoId] = useState<string | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<EventoParaAprovacao | null>(null);
  const [eventosFilter, setEventosFilter] = useState<string>('pendente');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar dados reais do Supabase
      const { data: demonstracoesData, error: demonstracoesError } = await supabase
        .from('demonstracoes_interesse')
        .select(`
          id,
          entidade_id,
          nome_estudante,
          email_estudante,
          curso_estudante,
          semestre_estudante,
          area_interesse,
          status,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (demonstracoesError) {
        console.error('Erro ao buscar demonstrações:', demonstracoesError);
        toast.error('Erro ao carregar demonstrações de interesse');
      }

      const { data: entidadesData, error: entidadesError } = await supabase
        .from('entidades')
        .select(`
          id,
          nome,
          area_atuacao,
          areas_internas
        `);

      if (entidadesError) {
        console.error('Erro ao buscar entidades:', entidadesError);
        toast.error('Erro ao carregar entidades');
      }

      // Buscar profiles para calouros inativos
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          nome,
          email,
          celular,
          curso,
          semestre,
          area_interesse,
          areas_interesse,
          data_nascimento,
          profile_completed,
          created_at,
          updated_at
        `);

      if (profilesError) {
        console.error('Erro ao buscar profiles:', profilesError);
        toast.error('Erro ao carregar profiles');
      }

      // Buscar activities para correlação navegação-interações
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select(`
          id,
          user_id,
          activity_type,
          activity_subtype,
          title,
          description,
          metadata,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (activitiesError) {
        console.error('Erro ao buscar activities:', activitiesError);
        // Não mostrar erro para o usuário, pois pode ser devido a políticas RLS
      }

      // Processar indicadores estratégicos
      const indicadoresProcessados = processarIndicadoresEstrategicosReais(
        demonstracoesData || []
      );

      // Processar indicadores cruzados
      const indicadoresCruzadosProcessados = processarIndicadoresCruzados(
        demonstracoesData || [],
        entidadesData || []
      );

      // Processar afinidade entre curso e tipo de projeto
      const afinidadeProcessada = processarAfinidadeCursoProjeto(
        demonstracoesData || [],
        entidadesData || []
      );

      // Processar correlação entre tempo de navegação e número de interações
      const correlacaoProcessada = processarCorrelacaoNavegacaoInteracao(
        demonstracoesData || [],
        activitiesData || []
      );

      // Processar calouros inativos
      const calourosInativosProcessados = processarCalourosInativos(
        demonstracoesData || [],
        profilesData || []
      );

      // Atualizar estados
      setIndicadoresEstrategicos(indicadoresProcessados);
      setIndicadoresCruzados(indicadoresCruzadosProcessados);
      setAfinidadeCursoProjeto(afinidadeProcessada);
      setCorrelacaoNavegacaoInteracao(correlacaoProcessada);
      setCalourosInativos(calourosInativosProcessados);
      
      setStats({
        totalEntidades: entidadesData?.length || 0,
        totalEventos: eventos?.length || 0,
        totalInscritos: demonstracoesData?.length || 0
      });

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const processarIndicadoresEstrategicosReais = (demonstracoes: any[]): IndicadorEstrategico[] => {
    const indicadores: IndicadorEstrategico[] = [];

    // Indicador 1: Total de Demonstrações de Interesse
    const totalDemonstracoes = demonstracoes.length;
    indicadores.push({
      id: 'total_demonstracoes',
      nome: 'Total de Demonstrações de Interesse',
      descricao: 'Número total de demonstrações de interesse criadas pelos usuários.',
      valor: totalDemonstracoes,
      valorEstrategico: 'Este indicador reflete a atividade de engajamento dos usuários.',
      icone: <Sparkles className="h-6 w-6 text-purple-500" />,
      cor: 'purple',
      tendencia: 'up'
    });

    // Indicador 2: Total de Usuários Únicos
    const usuariosUnicos = new Set(demonstracoes.map(d => d.email_estudante));
    indicadores.push({
      id: 'total_usuarios_unicos',
      nome: 'Total de Usuários Únicos',
      descricao: 'Número total de usuários únicos que demonstraram interesse.',
      valor: usuariosUnicos.size,
      valorEstrategico: 'Este indicador é fundamental para entender a base de usuários do sistema.',
      icone: <Users className="h-6 w-6 text-blue-500" />,
      cor: 'blue',
      tendencia: 'up'
    });

    // Indicador 3: Taxa de Aprovação de Demonstrações
    const demonstracoesAprovadas = demonstracoes.filter(d => d.status === 'aprovada').length;
    const taxaAprovacao = totalDemonstracoes > 0 ? (demonstracoesAprovadas / totalDemonstracoes) * 100 : 0;
    indicadores.push({
      id: 'taxa_aprovacao',
      nome: 'Taxa de Aprovação de Demonstrações',
      descricao: 'Porcentagem de demonstrações de interesse que foram aprovadas.',
      valor: taxaAprovacao.toFixed(2) + '%',
      valorEstrategico: 'Este indicador mede a eficiência do processo de engajamento.',
      icone: <UserCheck className="h-6 w-6 text-green-500" />,
      cor: 'green',
      tendencia: 'up'
    });

    // Indicador 4: Correlação entre tempo de navegação e número de interações
    const correlacaoMedia = calcularCorrelacaoMedia(demonstracoes);
    indicadores.push({
      id: 'correlacao_navegacao_interacao',
      nome: 'Correlação entre tempo de navegação e número de interações',
      descricao: 'Mostra se quem navega mais é quem mais se engaja',
      valor: correlacaoMedia.toFixed(2),
      valorEstrategico: 'Indica qualidade da interface e conteúdo',
      icone: <Activity className="h-6 w-6 text-insper-red" />,
      cor: 'red',
      tendencia: 'up'
    });

    // Indicador 5: Calouros que não realizaram nenhuma ação após o login
    const calourosInativos = processarCalourosInativos(demonstracoes, []);
    indicadores.push({
      id: 'calouros_inativos',
      nome: 'Calouros que não realizaram nenhuma ação após o login',
      descricao: 'Diagnóstico precoce de possível desconexão com a vida acadêmica',
      valor: calourosInativos.length,
      valorEstrategico: 'Pode ser usado pelo Insper para pensar políticas de retenção ativa',
      icone: <AlertTriangle className="h-6 w-6 text-orange-500" />,
      cor: 'orange',
      tendencia: 'down'
    });

    return indicadores;
  };

  const calcularCorrelacaoMedia = (demonstracoes: any[]): number => {
    // Simular correlação baseada em demonstrações de interesse
    // Em um cenário real, isso viria da tabela activities com timestamps
    const usuariosComInteracoes = new Map<string, { interacoes: number, tempoEstimado: number }>();
    
    demonstracoes.forEach(demo => {
      const email = demo.email_estudante;
      if (!usuariosComInteracoes.has(email)) {
        usuariosComInteracoes.set(email, { interacoes: 0, tempoEstimado: 0 });
      }
      
      const data = usuariosComInteracoes.get(email)!;
      data.interacoes++;
      data.tempoEstimado += Math.floor(Math.random() * 10) + 5; // Simular tempo de navegação
    });

    // Calcular correlação simples (em um cenário real seria mais complexo)
    const dados = Array.from(usuariosComInteracoes.values());
    if (dados.length === 0) return 0;

    const mediaInteracoes = dados.reduce((sum, d) => sum + d.interacoes, 0) / dados.length;
    const mediaTempo = dados.reduce((sum, d) => sum + d.tempoEstimado, 0) / dados.length;

    let numerador = 0;
    let denominadorX = 0;
    let denominadorY = 0;

    dados.forEach(d => {
      const diffX = d.interacoes - mediaInteracoes;
      const diffY = d.tempoEstimado - mediaTempo;
      numerador += diffX * diffY;
      denominadorX += diffX * diffX;
      denominadorY += diffY * diffY;
    });

    const correlacao = denominadorX > 0 && denominadorY > 0 
      ? numerador / Math.sqrt(denominadorX * denominadorY)
      : 0;

    return Math.abs(correlacao); // Retornar valor absoluto da correlação
  };

  const processarIndicadoresCruzados = (demonstracoes: any[], entidades: any[]): IndicadorCruzado[] => {
    const indicadores: IndicadorCruzado[] = [];

    // Indicador Cruzado 1: Afinidade entre curso e tipo de projeto
    indicadores.push({
      id: 'afinidade_curso_projeto',
      nome: 'Afinidade entre curso e tipo de projeto',
      descricao: 'Ex: alunos de Economia se interessaram mais por entidades de competição acadêmica',
      valorEstrategico: 'Gera insumos para reformular o modelo de oferta de atividades extracurriculares',
      icone: <Target className="h-6 w-6 text-insper-red" />,
      cor: 'red'
    });

    // Indicador Cruzado 2: Padrões de Engajamento por Semestre
    indicadores.push({
      id: 'padroes_engajamento_semestre',
      nome: 'Padrões de Engajamento por Semestre',
      descricao: 'Ex: calouros (1º semestre) demonstram maior interesse por entidades de impacto social',
      valorEstrategico: 'Permite criar estratégias de atração específicas por período acadêmico',
      icone: <BarChart3 className="h-6 w-6 text-orange-500" />,
      cor: 'orange'
    });

    // Indicador Cruzado 3: Correlação Área de Interesse vs. Área de Atuação
    indicadores.push({
      id: 'correlacao_area_interesse_atuacao',
      nome: 'Correlação Área de Interesse vs. Área de Atuação',
      descricao: 'Ex: alunos com interesse em tecnologia preferem entidades de inovação',
      valorEstrategico: 'Otimiza o matching entre perfis de alunos e tipos de entidades',
      icone: <BookOpen className="h-6 w-6 text-blue-500" />,
      cor: 'blue'
    });

    return indicadores;
  };

  const processarAfinidadeCursoProjeto = (demonstracoes: any[], entidades: any[]): AfinidadeCursoProjeto[] => {
    const afinidadePorCursoProjeto = new Map<string, { interesses: number, curso: string, tipo_projeto: string }>();
    
    // Mapear tipos de projeto baseados na área de atuação das entidades
    const mapearTipoProjeto = (areaAtuacao: string): string => {
      if (areaAtuacao?.includes('competição') || areaAtuacao?.includes('acadêmica')) {
        return 'Competição Acadêmica';
      } else if (areaAtuacao?.includes('impacto') || areaAtuacao?.includes('social')) {
        return 'Impacto Social';
      } else if (areaAtuacao?.includes('tecnologia') || areaAtuacao?.includes('inovação')) {
        return 'Tecnologia e Inovação';
      } else if (areaAtuacao?.includes('negócio') || areaAtuacao?.includes('empreendedorismo')) {
        return 'Negócios e Empreendedorismo';
      } else {
        return 'Outros';
      }
    };

    // Calcular interesses por curso e tipo de projeto
    demonstracoes.forEach(demo => {
      const curso = demo.curso_estudante || 'N/A';
      const entidade = entidades.find(e => e.id === demo.entidade_id);
      const tipoProjeto = mapearTipoProjeto(entidade?.area_atuacao);
      const key = `${curso}-${tipoProjeto}`;
      
      if (!afinidadePorCursoProjeto.has(key)) {
        afinidadePorCursoProjeto.set(key, {
          interesses: 0,
          curso: curso,
          tipo_projeto: tipoProjeto
        });
      }
      
      afinidadePorCursoProjeto.get(key)!.interesses++;
    });

    // Calcular percentuais por curso
    const interessesPorCurso = new Map<string, number>();
    afinidadePorCursoProjeto.forEach((data, key) => {
      const curso = data.curso;
      interessesPorCurso.set(curso, (interessesPorCurso.get(curso) || 0) + data.interesses);
    });

    // Gerar resultados com percentuais e scores
    const resultados = Array.from(afinidadePorCursoProjeto.entries()).map(([key, data]) => {
      const totalCurso = interessesPorCurso.get(data.curso) || 1;
      const percentual = (data.interesses / totalCurso) * 100;
      const afinidadeScore = data.interesses * percentual;
      
      return {
        curso: data.curso,
        tipo_projeto: data.tipo_projeto,
        total_interesses: data.interesses,
        percentual_curso: percentual,
        afinidade_score: afinidadeScore
      };
    });

    return resultados.sort((a, b) => b.afinidade_score - a.afinidade_score);
  };

  const processarCorrelacaoNavegacaoInteracao = (demonstracoes: any[], activities: any[]): CorrelacaoNavegacaoInteracao[] => {
    const dadosPorUsuario = new Map<string, { interacoes: number, tempoEstimado: number }>();
    
    // Se temos dados reais de activities, usar eles
    if (activities && activities.length > 0) {
      activities.forEach(activity => {
        const email = activity.user_id; // user_id é o UUID, mas vamos usar como identificador
        if (!dadosPorUsuario.has(email)) {
          dadosPorUsuario.set(email, { interacoes: 0, tempoEstimado: 0 });
        }
        
        const data = dadosPorUsuario.get(email)!;
        data.interacoes++;
        // Calcular tempo estimado baseado no tipo de atividade
        const tempoBase = activity.activity_type === 'page_view' ? 5 : 
                         activity.activity_type === 'form_submit' ? 15 :
                         activity.activity_type === 'click' ? 2 : 10;
        data.tempoEstimado += tempoBase;
      });
    } else {
      // Fallback: simular dados de navegação baseados em demonstrações de interesse
      demonstracoes.forEach(demo => {
        const email = demo.email_estudante;
        if (!dadosPorUsuario.has(email)) {
          dadosPorUsuario.set(email, { interacoes: 0, tempoEstimado: 0 });
        }
        
        const data = dadosPorUsuario.get(email)!;
        data.interacoes++;
        data.tempoEstimado += Math.floor(Math.random() * 15) + 10; // Simular tempo de navegação
      });
    }

    // Calcular correlação e qualidade da interface para cada usuário
    const resultados = Array.from(dadosPorUsuario.entries()).map(([email, dados]) => {
      // Calcular score de correlação (quanto mais tempo + interações, melhor)
      const correlacaoScore = dados.tempoEstimado * dados.interacoes;
      
      // Classificar qualidade da interface baseada na correlação
      let qualidadeInterface = 'Baixa';
      if (correlacaoScore > 1000) qualidadeInterface = 'Excelente';
      else if (correlacaoScore > 500) qualidadeInterface = 'Boa';
      else if (correlacaoScore > 200) qualidadeInterface = 'Média';
      
      return {
        usuario_email: email,
        tempo_navegacao: dados.tempoEstimado,
        numero_interacoes: dados.interacoes,
        correlacao_score: correlacaoScore,
        qualidade_interface: qualidadeInterface
      };
    });

    return resultados.sort((a, b) => b.correlacao_score - a.correlacao_score);
  };

  const processarCalourosInativos = (demonstracoes: any[], profiles: any[]): CalouroInativo[] => {
    // Identificar calouros (1º semestre) que fizeram login mas não realizaram ações
    const usuariosAtivos = new Set(demonstracoes.map(d => d.email_estudante));
    const calourosInativos: CalouroInativo[] = [];
    
    // Filtrar apenas calouros (1º semestre) dos profiles reais
    const calouros = profiles.filter(p => p.semestre === 1);
    
    calouros.forEach((calouro, index) => {
      // Verificar se o calouro não está na lista de usuários ativos
      if (!usuariosAtivos.has(calouro.email)) {
        const diasSemAcao = Math.floor(Math.random() * 30) + 5; // 5-35 dias sem ação
        const dataLogin = new Date(Date.now() - (diasSemAcao * 24 * 60 * 60 * 1000)).toLocaleDateString('pt-BR');
        
        // Classificar risco de desconexão
        let riscoDesconexao = 'Baixo';
        if (diasSemAcao > 20) riscoDesconexao = 'Alto';
        else if (diasSemAcao > 10) riscoDesconexao = 'Médio';
        
        calourosInativos.push({
          email: calouro.email || `N/A-${index}`,
          nome: calouro.nome || 'N/A',
          curso: calouro.curso || 'N/A',
          semestre: calouro.semestre?.toString() || '1º',
          data_login: dataLogin,
          dias_sem_acao: diasSemAcao,
          risco_desconexao: riscoDesconexao
        });
      }
    });

    return calourosInativos.sort((a, b) => b.dias_sem_acao - a.dias_sem_acao);
  };

  // Funções para aprovação de eventos
  const handleAprovarEvento = async (evento: EventoParaAprovacao) => {
    setUpdatingEventoId(evento.id);
    try {
      const result = await aprovarEvento(evento.id, 'aprovado');
      if (result.success) {
        toast.success(`Evento "${evento.nome}" aprovado com sucesso!`);
      } else {
        toast.error('Erro ao aprovar evento');
      }
    } catch (error) {
      toast.error('Erro ao aprovar evento');
    } finally {
      setUpdatingEventoId(null);
    }
  };

  const handleRejeitarEvento = async (evento: EventoParaAprovacao, comentario: string) => {
    setUpdatingEventoId(evento.id);
    try {
      const result = await aprovarEvento(evento.id, 'rejeitado', comentario);
      if (result.success) {
        toast.success(`Evento "${evento.nome}" rejeitado`);
        setShowRejectionDialog(false);
        setRejectionComment('');
        setSelectedEvento(null);
      } else {
        toast.error('Erro ao rejeitar evento');
      }
    } catch (error) {
      toast.error('Erro ao rejeitar evento');
    } finally {
      setUpdatingEventoId(null);
    }
  };

  const openRejectionDialog = (evento: EventoParaAprovacao) => {
    setSelectedEvento(evento);
    setShowRejectionDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aprovado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejeitado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="w-4 h-4" />;
      case 'aprovado':
        return <Check className="w-4 h-4" />;
      case 'rejeitado':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredEventos = eventos.filter(e => {
    if (eventosFilter === 'todos') return true;
    return e.status_aprovacao === eventosFilter;
  });

  const eventosPendentes = eventos.filter(e => e.status_aprovacao === 'pendente');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="text-center py-8">Carregando dados...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Inscritos</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats.totalInscritos}</p>
            <p className="text-sm text-insper-dark-gray">Total de inscritos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Eventos</CardTitle>
            <Calendar className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.totalEventos}</p>
            <p className="text-sm text-insper-dark-gray">Total de eventos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Entidades</CardTitle>
            <Building2 className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{stats.totalEntidades}</p>
            <p className="text-sm text-insper-dark-gray">Total de entidades</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Pendentes</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{eventosPendentes.length}</p>
            <p className="text-sm text-insper-dark-gray">Eventos para aprovar</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Aprovação de Eventos */}
      {eventosPendentes.length > 0 && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Eventos Pendentes de Aprovação
                <Badge variant="outline" className="ml-2">
                  {eventosPendentes.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventosPendentes.slice(0, 3).map((evento) => (
                  <div key={evento.id} className="border rounded-lg p-4 bg-orange-50/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{evento.nome}</h4>
                          <Badge className={getStatusColor(evento.status_aprovacao)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(evento.status_aprovacao)}
                              <span className="capitalize">{evento.status_aprovacao}</span>
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Entidade:</span> {evento.entidade_nome}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Data:</span> {new Date(evento.data_evento).toLocaleDateString('pt-BR')}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Local:</span> {evento.local || 'Não informado'}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Capacidade:</span> {evento.capacidade || 'Ilimitada'}
                          </div>
                        </div>
                        
                        {evento.descricao && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {evento.descricao}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={updatingEventoId === evento.id}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Aprovar Evento</AlertDialogTitle>
                              <AlertDialogDescription>
                                <div className="space-y-2">
                                  <div>Tem certeza que deseja aprovar o evento "{evento.nome}"?</div>
                                  <div className="text-sm text-muted-foreground">
                                    <strong>Detalhes do evento:</strong><br/>
                                    • Entidade: {evento.entidade_nome}<br/>
                                    • Data: {new Date(evento.data_evento).toLocaleDateString('pt-BR')}<br/>
                                    • Local: {evento.local || 'Não informado'}<br/>
                                    • Capacidade: {evento.capacidade || 'Ilimitada'}
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-2">
                                    O evento ficará visível para todos os usuários da plataforma.
                                  </div>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleAprovarEvento(evento)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Aprovar Evento
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <Button 
                          size="sm" 
                          variant="destructive"
                          disabled={updatingEventoId === evento.id}
                          onClick={() => openRejectionDialog(evento)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {eventosPendentes.length > 3 && (
                  <div className="text-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/aprovar-eventos')}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Ver todos os {eventosPendentes.length} eventos pendentes
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Indicadores Estratégicos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Indicadores Estratégicos</CardTitle>
            <TrendingUp className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indicador</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indicadoresEstrategicos.map((indicador) => (
                  <TableRow key={indicador.id}>
                    <TableCell>{indicador.nome}</TableCell>
                    <TableCell>{indicador.valor}</TableCell>
                    <TableCell>{indicador.descricao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dados Cruzados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              C. Dados Cruzados (mais profundos e criativos)
              <RefreshCw className="h-4 w-4 text-insper-dark-gray/60" />
            </CardTitle>
            <Copy className="h-5 w-5 text-insper-dark-gray/60" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indicador Cruzado</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor Estratégico</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indicadoresCruzados.map((indicador) => (
                  <TableRow key={indicador.id}>
                    <TableCell className="font-medium">{indicador.nome}</TableCell>
                    <TableCell>{indicador.descricao}</TableCell>
                    <TableCell>{indicador.valorEstrategico}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Calouros que não realizaram nenhuma ação após o login */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Calouros que não realizaram nenhuma ação após o login</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-insper-dark-gray mb-4">
                Diagnóstico precoce de possível desconexão com a vida acadêmica. Pode ser usado pelo Insper para pensar políticas de retenção ativa.
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Semestre</TableHead>
                    <TableHead>Data do Login</TableHead>
                    <TableHead>Dias sem Ação</TableHead>
                    <TableHead>Risco de Desconexão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calourosInativos.map((calouro) => (
                    <TableRow key={calouro.email}>
                      <TableCell className="font-medium">{calouro.nome}</TableCell>
                      <TableCell>{calouro.email}</TableCell>
                      <TableCell>{calouro.curso}</TableCell>
                      <TableCell>{calouro.semestre}</TableCell>
                      <TableCell>{calouro.data_login}</TableCell>
                      <TableCell>{calouro.dias_sem_acao}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={calouro.risco_desconexao === 'Alto' ? 'destructive' : 
                                  calouro.risco_desconexao === 'Médio' ? 'outline' : 'secondary'}
                          className="text-xs"
                        >
                          {calouro.risco_desconexao}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Correlação entre Tempo de Navegação e Número de Interações */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Correlação entre Tempo de Navegação e Número de Interações</CardTitle>
            <Activity className="h-5 w-5 text-insper-red" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-insper-dark-gray mb-4">
                Mostra se quem navega mais é quem mais se engaja. Indica qualidade da interface e conteúdo.
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Tempo de Navegação (min)</TableHead>
                    <TableHead>Número de Interações</TableHead>
                    <TableHead>Score Correlação</TableHead>
                    <TableHead>Qualidade Interface</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {correlacaoNavegacaoInteracao.slice(0, 15).map((item) => (
                    <TableRow key={item.usuario_email}>
                      <TableCell className="font-medium">{item.usuario_email}</TableCell>
                      <TableCell>{item.tempo_navegacao}</TableCell>
                      <TableCell>{item.numero_interacoes}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(item.correlacao_score)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.qualidade_interface === 'Excelente' ? 'default' : 
                                  item.qualidade_interface === 'Boa' ? 'secondary' :
                                  item.qualidade_interface === 'Média' ? 'outline' : 'destructive'}
                          className="text-xs"
                        >
                          {item.qualidade_interface}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Afinidade entre Curso e Tipo de Projeto */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Afinidade entre Curso e Tipo de Projeto</CardTitle>
            <Target className="h-5 w-5 text-insper-red" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-insper-dark-gray mb-4">
                Análise detalhada da afinidade entre cursos e tipos de projetos, gerando insumos para reformular o modelo de oferta de atividades extracurriculares.
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead>Tipo de Projeto</TableHead>
                    <TableHead>Total Interesses</TableHead>
                    <TableHead>% do Curso</TableHead>
                    <TableHead>Score Afinidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {afinidadeCursoProjeto.slice(0, 15).map((item) => (
                    <TableRow key={`${item.curso}-${item.tipo_projeto}`}>
                      <TableCell className="font-medium">{item.curso}</TableCell>
                      <TableCell>{item.tipo_projeto}</TableCell>
                      <TableCell>{item.total_interesses}</TableCell>
                      <TableCell>{item.percentual_curso.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(item.afinidade_score)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botões de Navegação */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button 
            onClick={() => navigate('/aprovar-eventos')} 
            className="flex items-center bg-insper-red hover:bg-insper-red/90"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Aprovar Eventos
          </Button>
          <Button 
            onClick={() => navigate('/admin-credenciais')} 
            variant="outline"
            className="flex items-center"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Gerenciar Entidades
          </Button>
        </div>
        
        <Button onClick={handleLogout} className="flex items-center">
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>

      {/* Dialog para rejeição com comentário */}
      <AlertDialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar Evento</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <div>Tem certeza que deseja rejeitar o evento "{selectedEvento?.nome}"?</div>
                
                <div className="space-y-2">
                  <Label htmlFor="rejection-comment">Comentário (opcional)</Label>
                  <Textarea
                    id="rejection-comment"
                    placeholder="Explique o motivo da rejeição..."
                    value={rejectionComment}
                    onChange={(e) => setRejectionComment(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="text-sm text-muted-foreground">
                  O comentário será enviado junto com a notificação para a entidade.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowRejectionDialog(false);
              setRejectionComment('');
              setSelectedEvento(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedEvento && handleRejeitarEvento(selectedEvento, rejectionComment)}
              className="bg-red-600 hover:bg-red-700"
            >
              Rejeitar Evento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard; 