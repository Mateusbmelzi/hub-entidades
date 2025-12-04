import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, TrendingUp, Code, CheckCircle, Clock, Pause } from 'lucide-react';
import type { Projeto } from '@/hooks/useProjetos';

interface ProjetosStatsProps {
  projetos: Projeto[];
}

export const ProjetosStats: React.FC<ProjetosStatsProps> = ({ projetos }) => {
  const stats = React.useMemo(() => {
    const total = projetos.length;
    const porStatus = {
      ativo: projetos.filter(p => p.status === 'ativo').length,
      em_desenvolvimento: projetos.filter(p => p.status === 'em_desenvolvimento').length,
      concluido: projetos.filter(p => p.status === 'concluido').length,
      pausado: projetos.filter(p => p.status === 'pausado').length,
    };

    // Tecnologias mais usadas
    const tecnologiasCount: Record<string, number> = {};
    projetos.forEach(projeto => {
      if (projeto.tecnologias && Array.isArray(projeto.tecnologias)) {
        projeto.tecnologias.forEach(tech => {
          tecnologiasCount[tech] = (tecnologiasCount[tech] || 0) + 1;
        });
      }
    });

    const tecnologiasMaisUsadas = Object.entries(tecnologiasCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tech, count]) => ({ tech, count }));

    return {
      total,
      porStatus,
      tecnologiasMaisUsadas
    };
  }, [projetos]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total de projetos */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Total de Projetos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </CardContent>
      </Card>

      {/* Por status */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Por Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span className="text-sm">Ativo</span>
              </div>
              <Badge variant="secondary">{stats.porStatus.ativo}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-blue-600" />
                <span className="text-sm">Em Desenvolvimento</span>
              </div>
              <Badge variant="secondary">{stats.porStatus.em_desenvolvimento}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-gray-600" />
                <span className="text-sm">Concluído</span>
              </div>
              <Badge variant="secondary">{stats.porStatus.concluido}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pause className="h-3 w-3 text-yellow-600" />
                <span className="text-sm">Pausado</span>
              </div>
              <Badge variant="secondary">{stats.porStatus.pausado}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tecnologias mais usadas */}
      <Card className="border-0 shadow-md md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Code className="h-4 w-4" />
            Tecnologias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.tecnologiasMaisUsadas.length > 0 ? (
            <div className="space-y-2">
              {stats.tecnologiasMaisUsadas.map(({ tech, count }) => (
                <div key={tech} className="flex items-center justify-between">
                  <span className="text-sm truncate">{tech}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma tecnologia cadastrada</p>
          )}
        </CardContent>
      </Card>

      {/* Projetos ativos */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Projetos Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-900">{stats.porStatus.ativo}</div>
          <p className="text-xs text-green-700 mt-1">
            {stats.total > 0 
              ? `${Math.round((stats.porStatus.ativo / stats.total) * 100)}% do total`
              : '0% do total'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

