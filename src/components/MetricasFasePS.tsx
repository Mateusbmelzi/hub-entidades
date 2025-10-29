import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { FaseProcessoSeletivo, InscricaoProcessoUsuario } from '@/types/acompanhamento-processo';

interface MetricasFasePSProps {
  fase: FaseProcessoSeletivo;
  candidatos: InscricaoProcessoUsuario[];
}

export function MetricasFasePS({ fase, candidatos }: MetricasFasePSProps) {
  const pendentes = candidatos.filter(c => c.status_fase === 'pendente').length;
  const aprovados = candidatos.filter(c => c.status_fase === 'aprovado').length;
  const reprovados = candidatos.filter(c => c.status_fase === 'reprovado').length;
  const total = candidatos.length;
  
  const taxaConversao = total > 0 ? (aprovados / total * 100) : 0;
  const taxaReprovacao = total > 0 ? (reprovados / total * 100) : 0;
  const taxaPendencia = total > 0 ? (pendentes / total * 100) : 0;

  const getFaseColor = (ordem: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    return colors[(ordem - 1) % colors.length];
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getFaseColor(fase.ordem)}`} />
            <span>{fase.nome}</span>
          </CardTitle>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Users className="w-3 h-3 mr-1" />
            {total}
          </Badge>
        </div>
        {fase.descricao && (
          <p className="text-sm text-muted-foreground mt-1">
            {fase.descricao}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Métricas Principais */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-center mb-1">
              <Clock className="w-4 h-4 text-yellow-600 mr-1" />
              <span className="text-2xl font-bold text-yellow-800">{pendentes}</span>
            </div>
            <div className="text-xs text-yellow-600 font-medium">Pendentes</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-2xl font-bold text-green-800">{aprovados}</span>
            </div>
            <div className="text-xs text-green-600 font-medium">Aprovados</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-center mb-1">
              <XCircle className="w-4 h-4 text-red-600 mr-1" />
              <span className="text-2xl font-bold text-red-800">{reprovados}</span>
            </div>
            <div className="text-xs text-red-600 font-medium">Reprovados</div>
          </div>
        </div>

        {/* Taxa de Conversão */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Taxa de Conversão</span>
            <span className="text-green-600 font-semibold">{taxaConversao.toFixed(1)}%</span>
          </div>
          <Progress value={taxaConversao} className="h-2" />
        </div>

        {/* Progress Bar Detalhada */}
        {total > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Distribuição de Status</div>
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
              <div 
                className="bg-yellow-500 transition-all duration-300" 
                style={{ width: `${taxaPendencia}%` }}
                title={`${pendentes} pendentes (${taxaPendencia.toFixed(1)}%)`}
              />
              <div 
                className="bg-green-500 transition-all duration-300" 
                style={{ width: `${taxaConversao}%` }}
                title={`${aprovados} aprovados (${taxaConversao.toFixed(1)}%)`}
              />
              <div 
                className="bg-red-500 transition-all duration-300" 
                style={{ width: `${taxaReprovacao}%` }}
                title={`${reprovados} reprovados (${taxaReprovacao.toFixed(1)}%)`}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Pendentes</span>
              <span>Aprovados</span>
              <span>Reprovados</span>
            </div>
          </div>
        )}

        {/* Estatísticas Adicionais */}
        {total > 0 && (
          <div className="pt-3 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total de Candidatos</span>
              <span className="font-semibold">{total}</span>
            </div>
            
            {aprovados > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Taxa de Aprovação</span>
                <span className="font-semibold text-green-600">
                  {taxaConversao.toFixed(1)}%
                </span>
              </div>
            )}
            
            {reprovados > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Taxa de Reprovação</span>
                <span className="font-semibold text-red-600">
                  {taxaReprovacao.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Estado Vazio */}
        {total === 0 && (
          <div className="text-center py-6">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">Nenhum candidato nesta fase</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
