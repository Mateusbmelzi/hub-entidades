import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import type { HistoricoFase } from '@/types/acompanhamento-processo';

interface TimelineFasesPSProps {
  candidatoId: string;
}

export function TimelineFasesPS({ candidatoId }: TimelineFasesPSProps) {
  const [historico, setHistorico] = useState<HistoricoFase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('inscricoes_fases_ps')
          .select(`
            *,
            fase:processos_seletivos_fases(nome, ordem)
          `)
          .eq('inscricao_id', candidatoId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setHistorico(data || []);
      } catch (err) {
        console.error('Erro ao buscar histórico:', err);
        setError('Erro ao carregar histórico');
      } finally {
        setLoading(false);
      }
    };

    fetchHistorico();
  }, [candidatoId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'reprovado':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reprovado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getTimelineColor = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-500';
      case 'reprovado':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (historico.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-sm text-muted-foreground">Nenhum histórico de fases encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {historico.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          {/* Timeline indicator */}
          <div className="flex flex-col items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm
              ${getTimelineColor(item.status)}
            `}>
              {getStatusIcon(item.status)}
            </div>
            {index < historico.length - 1 && (
              <div className="w-0.5 h-8 bg-gray-200 mt-2" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 pb-4">
            <Card className="hover:shadow-sm transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-lg">{item.fase.nome}</h4>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(item.status)}
                  >
                    {item.status === 'aprovado' && 'Aprovado'}
                    {item.status === 'reprovado' && 'Reprovado'}
                    {item.status === 'pendente' && 'Pendente'}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(item.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {format(new Date(item.created_at), "HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
                
                {item.feedback && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                    <p className="text-sm text-gray-600">{item.feedback}</p>
                  </div>
                )}
                
                {/* Informações adicionais */}
                <div className="mt-3 text-xs text-muted-foreground">
                  <p>Ordem da fase: {item.fase.ordem}</p>
                  <p>ID da inscrição: {item.inscricao_id.slice(0, 8)}...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
      
      {/* Resumo */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h5 className="font-semibold text-blue-900 mb-2">Resumo do Processo</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700 font-medium">Total de Fases:</span>
            <span className="ml-2 text-blue-600">{historico.length}</span>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Aprovadas:</span>
            <span className="ml-2 text-green-600">
              {historico.filter(h => h.status === 'aprovado').length}
            </span>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Reprovadas:</span>
            <span className="ml-2 text-red-600">
              {historico.filter(h => h.status === 'reprovado').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
