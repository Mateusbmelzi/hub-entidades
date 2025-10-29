import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Clock, 
  Check, 
  Calendar, 
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  HourglassIcon
} from 'lucide-react';
import { useAcompanhamentoFases } from '@/hooks/useAcompanhamentoFases';
import { EstudanteFaseCard } from './EstudanteFaseCard';
import type { InscricaoProcessoUsuario } from '@/types/acompanhamento-processo';
import { toast } from 'sonner';

interface AcompanhamentoFasesPSProps {
  entidadeId: number;
}

export function AcompanhamentoFasesPS({ entidadeId }: AcompanhamentoFasesPSProps) {
  const [detalhesEstudanteId, setDetalhesEstudanteId] = useState<string | null>(null);
  
  const {
    candidatosPorFase,
    fases,
    metricas,
    loading,
    error,
    aprovarCandidato,
    reprovarCandidato
  } = useAcompanhamentoFases(entidadeId);

  const handleAprovarCandidato = async (candidatoId: string) => {
    // Buscar o candidato para saber qual é a fase atual
    const candidato = Array.from(candidatosPorFase.values())
      .flat()
      .find(c => c.id === candidatoId);
    
    const faseAtual = candidato?.fase_atual;
    const proximaFase = faseAtual ? fases.find(f => f.ordem === faseAtual.ordem + 1) : null;
    
    const result = await aprovarCandidato(candidatoId);
    if (result.success) {
      if (proximaFase) {
        toast.success(`Candidato aprovado e movido para: ${proximaFase.nome}!`, {
          duration: 4000,
        });
      } else if (faseAtual) {
        toast.success('Candidato aprovado definitivamente no processo seletivo!', {
          duration: 4000,
        });
      } else {
        toast.success('Candidato aprovado com sucesso!');
      }
    } else {
      toast.error('Erro ao aprovar candidato');
    }
  };

  const handleReprovarCandidato = async (candidatoId: string) => {
    const result = await reprovarCandidato(candidatoId);
    if (result.success) {
      toast.success('Candidato reprovado');
    } else {
      toast.error('Erro ao reprovar candidato');
    }
  };

  const handleVerDetalhes = (candidatoId: string) => {
    setDetalhesEstudanteId(candidatoId);
    // TODO: Implementar dialog de detalhes
    toast.info('Funcionalidade de detalhes em desenvolvimento');
  };

  const getCandidatosPorFase = (faseId: string): InscricaoProcessoUsuario[] => {
    return candidatosPorFase.get(faseId) || [];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (fases.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Nenhuma fase cadastrada. Configure as fases do processo seletivo na aba "Fases".
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Métricas Globais */}
      {metricas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Candidatos</p>
                  <p className="text-2xl font-bold">{metricas.totalCandidatos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Em Processo</p>
                  <p className="text-2xl font-bold">{metricas.emProcesso}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Check className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</p>
                  <p className="text-2xl font-bold">{metricas.taxaAprovacao.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                  <p className="text-2xl font-bold">{Math.round(metricas.tempoMedio)} dias</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Nested Tabs por Fase */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Candidatos por Fase</CardTitle>
          <p className="text-sm text-muted-foreground">
            Navegue pelas fases para visualizar e gerenciar os candidatos
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={fases[0]?.id} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${fases.length}, minmax(0, 1fr))` }}>
              {fases.map(fase => {
                const candidatosFase = getCandidatosPorFase(fase.id);
                return (
                  <TabsTrigger value={fase.id} key={fase.id} className="flex items-center gap-2">
                    <span>{fase.nome}</span>
                    <Badge variant="secondary" className="ml-1">
                      {candidatosFase.length}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {fases.map(fase => {
              const candidatosFase = getCandidatosPorFase(fase.id);
              const pendentes = candidatosFase.filter(c => c.status_fase === 'pendente').length;
              const aprovados = candidatosFase.filter(c => c.status_fase === 'aprovado').length;
              const reprovados = candidatosFase.filter(c => c.status_fase === 'reprovado').length;

              return (
                <TabsContent value={fase.id} key={fase.id} className="mt-6">
                  {/* Métricas da Fase */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{fase.nome}</h3>
                        {fase.descricao && (
                          <p className="text-sm text-muted-foreground mb-3">{fase.descricao}</p>
                        )}
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">
                              Total: <strong>{candidatosFase.length}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <HourglassIcon className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium">
                              Pendentes: <strong>{pendentes}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">
                              Aprovados: <strong>{aprovados}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium">
                              Reprovados: <strong>{reprovados}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Lista
                      </Button>
                    </div>
                  </div>

                  {/* Lista de Estudantes */}
                  {candidatosFase.length > 0 ? (
                    <div className="space-y-4">
                      {candidatosFase.map(candidato => (
                        <EstudanteFaseCard
                          key={candidato.id}
                          candidato={candidato}
                          onAprovar={handleAprovarCandidato}
                          onReprovar={handleReprovarCandidato}
                          onVerDetalhes={handleVerDetalhes}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhum candidato nesta fase
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Os candidatos aparecerão aqui quando forem movidos para esta fase.
                      </p>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
