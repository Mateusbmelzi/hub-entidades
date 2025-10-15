import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trophy, TrendingUp, Building2 } from 'lucide-react';
import { TopEntidadeInteresse } from '@/hooks/useTopEntidadesInteresse';

interface TopEntidadesInteresseChartProps {
  entidades: TopEntidadeInteresse[];
  loading: boolean;
  error: string | null;
  onRefetch: () => void;
}

export const TopEntidadesInteresseChart: React.FC<TopEntidadesInteresseChartProps> = ({
  entidades,
  loading,
  error,
  onRefetch
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 5 Entidades com Mais Demonstrações de Interesse
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ranking das organizações mais populares entre os estudantes
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Carregando ranking...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 5 Entidades com Mais Demonstrações de Interesse
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ranking das organizações mais populares entre os estudantes
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            <div className="mb-4">
              <TrendingUp className="h-8 w-8 mx-auto text-red-400 mb-2" />
            </div>
            <div className="text-sm font-medium mb-2">Erro ao carregar dados</div>
            <div className="text-xs mb-3">{error}</div>
            <Button onClick={onRefetch} variant="outline" size="sm">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entidades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 5 Entidades com Mais Demonstrações de Interesse
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ranking das organizações mais populares entre os estudantes
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="mb-4">
              <Building2 className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            </div>
            <div className="text-sm font-medium mb-2">Nenhuma entidade encontrada</div>
            <div className="text-xs">
              Ainda não há demonstrações de interesse registradas.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-100 border-yellow-200">
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Top 5 Entidades com Mais Demonstrações de Interesse
        </CardTitle>
        <p className="text-sm text-yellow-700">
          Ranking das organizações mais populares entre os estudantes
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {entidades.slice(0, 5).map((entidade, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 flex-1">
                {/* Ranking com medalhas */}
                <div className="flex-shrink-0">
                  {index < 3 ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      'bg-amber-600'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                      #{index + 1}
                    </div>
                  )}
                </div>
                
                {/* Nome da entidade */}
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {entidade.nome_entidade}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {entidade.total_demonstracoes} demonstração{entidade.total_demonstracoes !== 1 ? 'ões' : ''} de interesse
                  </div>
                </div>
              </div>
              
              {/* Badge com total */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                  {entidade.total_demonstracoes.toLocaleString('pt-BR')} interesse{entidade.total_demonstracoes !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        {/* Estatísticas adicionais */}
        {entidades.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-700">
                  {entidades[0]?.total_demonstracoes || 0}
                </div>
                <div className="text-xs text-yellow-600">1º Lugar</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-700">
                  {entidades.reduce((acc, ent) => acc + ent.total_demonstracoes, 0).toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-yellow-600">Total Geral</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
