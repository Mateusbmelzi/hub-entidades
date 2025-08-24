import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface TopOrganizacao {
  nome_entidade: string;
  total_demonstracoes: number;
}

interface TopOrganizacoesChartProps {
  organizacoes: TopOrganizacao[];
  loading: boolean;
  error: string | null;
  onRefetch: () => void;
}

export const TopOrganizacoesChart: React.FC<TopOrganizacoesChartProps> = ({
  organizacoes,
  loading,
  error,
  onRefetch
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Top 5 Organizações com Mais Demonstrações de Interesse
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ranking das organizações mais populares entre os estudantes
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Carregando dados...</p>
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
            <Users className="h-5 w-5 text-purple-600" />
            Top 5 Organizações com Mais Demonstrações de Interesse
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ranking das organizações mais populares entre os estudantes
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            <div className="mb-4">
              <TrendingDown className="h-8 w-8 mx-auto text-red-400 mb-2" />
            </div>
            <div className="text-sm font-medium mb-2">Erro ao carregar dados</div>
            <div className="text-xs mb-3">{error}</div>
            <Button onClick={onRefetch} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (organizacoes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Top 5 Organizações com Mais Demonstrações de Interesse
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ranking das organizações mais populares entre os estudantes
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="mb-4">
              <Users className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            </div>
            <div className="text-sm font-medium mb-2">Nenhum dado encontrado</div>
            <div className="text-xs">
              A tabela top_entidades_interesse ainda não possui dados.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Users className="h-5 w-5 text-purple-600" />
          Top 5 Organizações com Mais Demonstrações de Interesse
        </CardTitle>
        <p className="text-sm text-purple-700">
          Ranking das organizações mais populares entre os estudantes
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {organizacoes.slice(0, 5).map((organizacao, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">
                  {organizacao.nome_entidade}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {organizacao.total_demonstracoes.toLocaleString('pt-BR')} demonstrações
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
      </CardContent>
    </Card>
  );
};
