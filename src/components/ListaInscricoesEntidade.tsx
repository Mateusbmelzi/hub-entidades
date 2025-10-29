import { useInscricoesProcesso } from '@/hooks/useInscricoesProcesso';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, Users, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FaseProcessoSeletivo } from '@/types/processo-seletivo';

interface Props {
  entidadeId?: number;
}

export default function ListaInscricoesEntidade({ entidadeId }: Props) {
  const { inscricoes, loading, decidir, processarInscricoesAprovadas } = useInscricoesProcesso(entidadeId);
  const { toast } = useToast();

  const [fases, setFases] = useState<FaseProcessoSeletivo[]>([]);
  const [faseFiltro, setFaseFiltro] = useState<string>('todas');
  const [inscricoesComFases, setInscricoesComFases] = useState<any[]>([]);

  const inscricoesAprovadas = inscricoes.filter(i => i.status === 'aprovado');
  const temInscricoesAprovadas = inscricoesAprovadas.length > 0;

  // Buscar fases e inscrições com fases
  useEffect(() => {
    const fetchFasesEInscricoes = async () => {
      if (!entidadeId) return;

      try {
        // Buscar fases
        const { data: fasesData, error: fasesError } = await supabase
          .from('processos_seletivos_fases')
          .select('*')
          .eq('entidade_id', entidadeId)
          .order('ordem', { ascending: true });

        if (fasesError) throw fasesError;
        setFases(fasesData || []);

        // Buscar inscrições com fases
        const { data: inscricoesFasesData, error: inscricoesFasesError } = await supabase
          .from('inscricoes_fases_ps')
          .select(`
            *,
            fase:processos_seletivos_fases(*)
          `)
          .in('inscricao_id', inscricoes.map(i => i.id));

        if (inscricoesFasesError) throw inscricoesFasesError;

        // Combinar dados
        const inscricoesComFasesData = inscricoes.map(inscricao => {
          const inscricaoFase = inscricoesFasesData?.find(ifp => ifp.inscricao_id === inscricao.id);
          return {
            ...inscricao,
            faseAtual: inscricaoFase?.fase || null,
            statusFase: inscricaoFase?.status || 'pendente'
          };
        });

        setInscricoesComFases(inscricoesComFasesData);
      } catch (error) {
        console.error('Erro ao buscar fases e inscrições:', error);
      }
    };

    fetchFasesEInscricoes();
  }, [entidadeId, inscricoes]);

  // Filtrar inscrições por fase
  const inscricoesFiltradas = inscricoesComFases.filter(inscricao => {
    if (faseFiltro === 'todas') return true;
    if (faseFiltro === 'sem-fase') return !inscricao.faseAtual;
    return inscricao.faseAtual?.id === faseFiltro;
  });

  const handleDecidir = async (id: string, status: 'aprovado' | 'reprovado') => {
    const res = await decidir(id, status);
    if (!res.success) {
      toast({
        title: 'Erro',
        description: res.error || 'Erro ao processar decisão',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="bg-yellow-50"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'aprovado':
        return <Badge variant="outline" className="bg-green-50"><Check className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'reprovado':
        return <Badge variant="outline" className="bg-red-50"><X className="w-3 h-3 mr-1" />Reprovado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Inscrições no Processo Seletivo</CardTitle>
          {temInscricoesAprovadas && (
            <Button 
              onClick={processarInscricoesAprovadas}
              variant="outline"
              size="sm"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              <Check className="w-4 h-4 mr-2" />
              Converter Aprovados em Membros ({inscricoesAprovadas.length})
            </Button>
          )}
        </div>
        
        {/* Filtro por fase */}
        {fases.length > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={faseFiltro}
              onChange={(e) => setFaseFiltro(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="todas">Todas as fases</option>
              <option value="sem-fase">Sem fase</option>
              {fases.map(fase => (
                <option key={fase.id} value={fase.id}>
                  {fase.nome} (Ordem {fase.ordem})
                </option>
              ))}
            </select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Carregando...</div>
        ) : inscricoesFiltradas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {faseFiltro === 'todas' ? 'Nenhuma inscrição recebida ainda' : 'Nenhuma inscrição encontrada para esta fase'}
          </div>
        ) : (
          <div className="space-y-3">
            {inscricoesFiltradas.map((i) => (
              <div key={i.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="font-semibold">{i.nome_estudante}</div>
                    <div className="text-sm text-muted-foreground">{i.email_estudante}</div>
                    <div className="text-sm text-muted-foreground">
                      {i.curso_estudante} • {i.semestre_estudante}º semestre
                    </div>
                    
                    {/* Fase atual */}
                    {i.faseAtual && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Users className="w-3 h-3 mr-1" />
                          {i.faseAtual.nome}
                        </Badge>
                        <Badge variant="outline" className={
                          i.statusFase === 'aprovado' ? 'bg-green-50 text-green-700 border-green-200' :
                          i.statusFase === 'reprovado' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }>
                          {i.statusFase === 'aprovado' ? 'Aprovado' :
                           i.statusFase === 'reprovado' ? 'Reprovado' : 'Pendente'}
                        </Badge>
                      </div>
                    )}
                    
                    {i.area_interesse && (
                      <div className="text-sm text-muted-foreground">Interesse: {i.area_interesse}</div>
                    )}
                    {i.mensagem && (
                      <div className="text-sm mt-2 p-2 bg-gray-50 rounded">{i.mensagem}</div>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                      Inscrito em {format(new Date(i.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    {getStatusBadge(i.status)}
                    {i.status === 'pendente' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleDecidir(i.id, 'aprovado')}>
                          <Check className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDecidir(i.id, 'reprovado')}>
                          <X className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


