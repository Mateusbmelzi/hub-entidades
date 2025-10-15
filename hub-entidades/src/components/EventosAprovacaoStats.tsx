import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  Eye,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EventosAprovacaoStatsProps {
  stats: {
    total: number;
    pendentes: number;
    aprovados: number;
    rejeitados: number;
    taxaAprovacao: number;
    eventosHoje: number;
    eventosSemana: number;
  };
  eventosPendentes: Array<{
    id: string;
    nome: string;
    entidade_nome: string;
    data: string;
    created_at: string;
  }>;
  loading?: boolean;
}

export const EventosAprovacaoStats: React.FC<EventosAprovacaoStatsProps> = ({
  stats,
  eventosPendentes,
  loading = false
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: 'pendentes' | 'aprovados' | 'rejeitados') => {
    switch (status) {
      case 'pendentes':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'aprovados':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejeitados':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: 'pendentes' | 'aprovados' | 'rejeitados') => {
    switch (status) {
      case 'pendentes':
        return <Clock className="w-4 h-4" />;
      case 'aprovados':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejeitados':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Estatísticas de Aprovação de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Estatísticas de Aprovação de Eventos
          </CardTitle>
          <Button 
            onClick={() => navigate('/aprovar-eventos')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Ver Todos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Estatísticas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {stats.total}
            </div>
            <div className="text-xs text-blue-700">Total de Eventos</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {stats.pendentes}
            </div>
            <div className="text-xs text-yellow-700">Pendentes</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {stats.aprovados}
            </div>
            <div className="text-xs text-green-700">Aprovados</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {stats.rejeitados}
            </div>
            <div className="text-xs text-red-700">Rejeitados</div>
          </div>
        </div>

        {/* Métricas Secundárias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Taxa de Aprovação</span>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {(stats.taxaAprovacao * 100).toFixed(1)}%
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Eventos Hoje</span>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {stats.eventosHoje}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">Esta Semana</span>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {stats.eventosSemana}
            </Badge>
          </div>
        </div>

        {/* Eventos Pendentes */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Eventos Pendentes de Aprovação
              {stats.pendentes > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.pendentes}
                </Badge>
              )}
            </h3>
            {stats.pendentes > 0 && (
              <Button 
                onClick={() => navigate('/aprovar-eventos')}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Clock className="mr-2 h-4 w-4" />
                Revisar Todos
              </Button>
            )}
          </div>

          {eventosPendentes.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto text-green-400 mb-2" />
              <div className="text-sm font-medium">Nenhum evento pendente</div>
              <div className="text-xs">Todos os eventos foram revisados</div>
            </div>
          ) : (
            <div className="space-y-3">
              {eventosPendentes.slice(0, 3).map((evento) => (
                <div key={evento.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">
                      {evento.nome}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {evento.entidade_nome} • {new Date(evento.data).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Criado em {new Date(evento.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => navigate(`/aprovar-eventos`)}
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Revisar
                    </Button>
                  </div>
                </div>
              ))}
              
              {eventosPendentes.length > 3 && (
                <div className="text-center py-2">
                  <Button 
                    onClick={() => navigate('/aprovar-eventos')}
                    variant="ghost"
                    size="sm"
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    Ver mais {eventosPendentes.length - 3} eventos pendentes...
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
