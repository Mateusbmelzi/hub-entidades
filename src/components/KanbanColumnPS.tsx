import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Check, X, Users } from 'lucide-react';
import { CandidatoCardPS } from './CandidatoCardPS';
import type { FaseProcessoSeletivo, InscricaoProcessoUsuario } from '@/types/acompanhamento-processo';

interface KanbanColumnPSProps {
  fase: FaseProcessoSeletivo;
  candidatos: InscricaoProcessoUsuario[];
  onMoverCandidato: (candidatoId: string, novaFaseId: string) => void;
  onAprovar: (candidatoId: string, feedback?: string) => void;
  onReprovar: (candidatoId: string, feedback?: string) => void;
}

export function KanbanColumnPS({ 
  fase, 
  candidatos, 
  onMoverCandidato, 
  onAprovar, 
  onReprovar 
}: KanbanColumnPSProps) {
  const pendentes = candidatos.filter(c => c.status_fase === 'pendente').length;
  const aprovados = candidatos.filter(c => c.status_fase === 'aprovado').length;
  const reprovados = candidatos.filter(c => c.status_fase === 'reprovado').length;

  const handleAprovarTodos = () => {
    candidatos
      .filter(c => c.status_fase === 'pendente')
      .forEach(candidato => onAprovar(candidato.id));
  };

  const handleReprovarTodos = () => {
    candidatos
      .filter(c => c.status_fase === 'pendente')
      .forEach(candidato => onReprovar(candidato.id));
  };

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{fase.nome}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {candidatos.length} candidatos
              </Badge>
              {pendentes > 0 && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                  {pendentes} pendentes
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleAprovarTodos}>
                <Check className="w-4 h-4 mr-2" />
                Aprovar Todos Pendentes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleReprovarTodos}>
                <X className="w-4 h-4 mr-2" />
                Reprovar Todos Pendentes
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="w-4 h-4 mr-2" />
                Exportar Lista
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Métricas da Fase */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-yellow-100 rounded-lg">
            <div className="text-lg font-bold text-yellow-800">{pendentes}</div>
            <div className="text-xs text-yellow-600">Pendentes</div>
          </div>
          <div className="text-center p-2 bg-green-100 rounded-lg">
            <div className="text-lg font-bold text-green-800">{aprovados}</div>
            <div className="text-xs text-green-600">Aprovados</div>
          </div>
          <div className="text-center p-2 bg-red-100 rounded-lg">
            <div className="text-lg font-bold text-red-800">{reprovados}</div>
            <div className="text-xs text-red-600">Reprovados</div>
          </div>
        </div>

        {/* Progress Bar */}
        {candidatos.length > 0 && (
          <div className="mb-4">
            <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
              <div 
                className="bg-yellow-500 transition-all duration-300" 
                style={{ width: `${(pendentes/candidatos.length)*100}%` }}
              />
              <div 
                className="bg-green-500 transition-all duration-300" 
                style={{ width: `${(aprovados/candidatos.length)*100}%` }}
              />
              <div 
                className="bg-red-500 transition-all duration-300" 
                style={{ width: `${(reprovados/candidatos.length)*100}%` }}
              />
            </div>
          </div>
        )}

        {/* Cards de Candidatos */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {candidatos.map(candidato => (
            <CandidatoCardPS
              key={candidato.id}
              candidato={candidato}
              onAprovar={() => onAprovar(candidato.id)}
              onReprovar={() => onReprovar(candidato.id)}
            />
          ))}
          
          {candidatos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum candidato nesta fase</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
