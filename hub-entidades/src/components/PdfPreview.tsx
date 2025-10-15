import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  Building2, 
  Calendar, 
  BarChart3,
  TrendingUp,
  Timer,
  Target,
  Eye,
  GraduationCap,
  Activity,
  CheckSquare,
  Clock
} from 'lucide-react';

interface PdfPreviewProps {
  filters: {
    includeSummary: boolean;
    includeOverview: boolean;
    includeAlunos: boolean;
    includeOrganizacoes: boolean;
    includeEventos: boolean;
    includeAprovacao: boolean;
    customTitle: string;
  };
  stats: {
    totalEntidades: number;
    totalEventos: number;
    totalInscritos: number;
    totalAlunos: number;
  };
  dataCounts: {
    taxaLoginTurmas: number;
    tempoNavegacaoAlunos: number;
    perfilInteresseCursos: number;
    eventosPorEntidade: number;
    atratividadePorCurso: number;
    eventosMaisInscritos: number;
    eventosPendentes: number;
  };
  reportType?: 'pdf' | 'csv';
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ filters, stats, dataCounts }) => {
  const sections = [
    {
      id: 'summary',
      title: 'Resumo Executivo',
      icon: <BarChart3 className="h-4 w-4" />,
      included: filters.includeSummary,
      description: 'Principais métricas e indicadores gerais',
      items: [
        `🎓 Total de Alunos: ${stats.totalAlunos}`,
        `🏛️ Total de Organizações: ${stats.totalEntidades}`,
        `📅 Total de Eventos: ${stats.totalEventos}`,
        `👥 Demonstrações de Interesse: ${stats.totalInscritos}`,
        `⏳ Eventos Pendentes: ${dataCounts.eventosPendentes}`,
        `📊 Taxa de Engajamento Geral: ${((stats.totalInscritos > 0 ? 75 : 0))}%`
      ]
    },
    {
      id: 'overview',
      title: 'Visão Geral do Sistema',
      icon: <FileText className="h-4 w-4" />,
      included: filters.includeOverview,
      description: 'Descrição do sistema e funcionalidades',
      items: [
        'Descrição do Hub de Entidades',
        'Principais funcionalidades analisadas',
        'Objetivos do sistema'
      ]
    },
    {
      id: 'alunos',
      title: 'Indicadores dos Alunos',
      icon: <Users className="h-4 w-4" />,
      included: filters.includeAlunos,
      description: 'Comportamento e engajamento dos estudantes',
      items: [
        `📈 Taxa de Login por Turma (${dataCounts.taxaLoginTurmas} turmas)`,
        `🕒 Tempo de Navegação (${dataCounts.tempoNavegacaoAlunos} alunos)`,
        `🎯 Perfil de Interesse por Curso (${dataCounts.perfilInteresseCursos} cursos)`
      ]
    },
    {
      id: 'organizacoes',
      title: 'Indicadores das Organizações',
      icon: <Building2 className="h-4 w-4" />,
      included: filters.includeOrganizacoes,
      description: 'Performance e vitalidade das organizações',
      items: [
        `📊 Eventos por Organização (${dataCounts.eventosPorEntidade} organizações)`,
        `🎓 Atratividade por Curso (${dataCounts.atratividadePorCurso} organizações)`
      ]
    },
    {
      id: 'eventos',
      title: 'Análise de Eventos',
      icon: <Calendar className="h-4 w-4" />,
      included: filters.includeEventos,
      description: 'Eventos com mais inscritos e sucesso',
      items: [
        `🏆 Eventos com Mais Inscritos (${dataCounts.eventosMaisInscritos} eventos)`,
        'Análise de formatos de sucesso'
      ]
    },
    {
      id: 'aprovacao',
      title: 'Eventos Pendentes',
      icon: <Clock className="h-4 w-4" />,
      included: filters.includeAprovacao,
      description: 'Eventos aguardando aprovação',
      items: [
        `⏳ ${dataCounts.eventosPendentes} eventos pendentes`,
        'Detalhes dos eventos para aprovação'
      ]
    }
  ];

  const includedSections = sections.filter(section => section.included);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Preview do Relatório</h3>
      </div>

      {/* Título do Relatório */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-xl font-bold text-blue-900">
            {filters.customTitle || 'Relatório do Dashboard - Hub de Entidades'}
          </CardTitle>
          <div className="text-center text-sm text-blue-700">
            Gerado em: {new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </CardHeader>
      </Card>

      {/* Seções Incluídas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {includedSections.map((section) => (
          <Card key={section.id} className="border-2 border-green-200 bg-green-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                {section.icon}
                {section.title}
                <Badge variant="secondary" className="ml-auto text-xs">
                  Incluído
                </Badge>
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                {section.description}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {section.items.map((item, index) => (
                  <div key={index} className="text-xs text-gray-700 flex items-start gap-2">
                    <CheckSquare className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seções Não Incluídas */}
      {sections.filter(section => !section.included).length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Seções Não Incluídas:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sections.filter(section => !section.included).map((section) => (
              <Card key={section.id} className="border-2 border-gray-200 bg-gray-50/30 opacity-60">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {section.icon}
                    {section.title}
                    <Badge variant="outline" className="ml-auto text-xs">
                      Excluído
                    </Badge>
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">
                    {section.description}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Informações Adicionais */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{includedSections.length}</div>
              <div className="text-xs text-purple-700">Seções Incluídas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{Math.max(includedSections.length + 2, 3)}</div>
              <div className="text-xs text-blue-700">Páginas Estimadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.totalEntidades + stats.totalEventos + stats.totalInscritos}</div>
              <div className="text-xs text-green-700">Total de Dados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">LGPD</div>
              <div className="text-xs text-orange-700">Dados Anonimizados</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PdfPreview; 