import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InscritoEvento {
  id: string;
  evento_id: string;
  profile_id: string | null;
  nome_completo: string;
  email: string;
  curso: string | null;
  semestre: number | null;
  campos_adicionais: Record<string, any>;
  status: 'confirmado' | 'cancelado' | 'lista_espera';
  numero_inscricao: number;
  created_at: string;
}

export interface InscritosStats {
  total: number;
  confirmados: number;
  lista_espera: number;
  cancelados: number;
}

export function useInscritosEvento(eventoId: string) {
  const [inscritos, setInscritos] = useState<InscritoEvento[]>([]);
  const [stats, setStats] = useState<InscritosStats>({
    total: 0,
    confirmados: 0,
    lista_espera: 0,
    cancelados: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'confirmados' | 'lista_espera' | 'cancelados'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Buscar inscritos
  const fetchInscritos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('inscricoes_eventos')
        .select('*')
        .eq('evento_id', eventoId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInscritos(data || []);
      
      // Calcular estatísticas
      const stats = {
        total: data?.length || 0,
        confirmados: data?.filter(i => i.status === 'confirmado').length || 0,
        lista_espera: data?.filter(i => i.status === 'lista_espera').length || 0,
        cancelados: data?.filter(i => i.status === 'cancelado').length || 0
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Erro ao buscar inscritos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de inscritos.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar inscritos
  const filteredInscritos = inscritos.filter(inscrito => {
    // Filtro por status
    if (filter !== 'todos' && inscrito.status !== filter) {
      return false;
    }
    
    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        inscrito.nome_completo.toLowerCase().includes(term) ||
        inscrito.email.toLowerCase().includes(term) ||
        (inscrito.curso && inscrito.curso.toLowerCase().includes(term))
      );
    }
    
    return true;
  });

  // Atualizar status de um inscrito
  const updateStatusInscrito = async (inscritoId: string, novoStatus: 'confirmado' | 'cancelado' | 'lista_espera') => {
    try {
      const { error } = await supabase
        .from('inscricoes_eventos')
        .update({ status: novoStatus })
        .eq('id', inscritoId);

      if (error) throw error;

      // Atualizar lista local
      setInscritos(prev => 
        prev.map(inscrito => 
          inscrito.id === inscritoId 
            ? { ...inscrito, status: novoStatus }
            : inscrito
        )
      );

      // Recalcular estatísticas
      const updatedInscritos = inscritos.map(inscrito => 
        inscrito.id === inscritoId 
          ? { ...inscrito, status: novoStatus }
          : inscrito
      );

      const newStats = {
        total: updatedInscritos.length,
        confirmados: updatedInscritos.filter(i => i.status === 'confirmado').length,
        lista_espera: updatedInscritos.filter(i => i.status === 'lista_espera').length,
        cancelados: updatedInscritos.filter(i => i.status === 'cancelado').length
      };
      
      setStats(newStats);

      toast({
        title: 'Status atualizado',
        description: `Status do inscrito alterado para ${novoStatus}.`
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do inscrito.',
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  // Remover inscrito
  const removeInscrito = async (inscritoId: string) => {
    try {
      const { error } = await supabase
        .from('inscricoes_eventos')
        .delete()
        .eq('id', inscritoId);

      if (error) throw error;

      // Atualizar lista local
      setInscritos(prev => prev.filter(inscrito => inscrito.id !== inscritoId));

      // Recalcular estatísticas
      const updatedInscritos = inscritos.filter(inscrito => inscrito.id !== inscritoId);
      const newStats = {
        total: updatedInscritos.length,
        confirmados: updatedInscritos.filter(i => i.status === 'confirmado').length,
        lista_espera: updatedInscritos.filter(i => i.status === 'lista_espera').length,
        cancelados: updatedInscritos.filter(i => i.status === 'cancelado').length
      };
      
      setStats(newStats);

      toast({
        title: 'Inscrito removido',
        description: 'O inscrito foi removido da lista.'
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover inscrito:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o inscrito.',
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  // Exportar para CSV
  const exportToCSV = () => {
    if (filteredInscritos.length === 0) {
      toast({
        title: 'Nada para exportar',
        description: 'Não há inscritos para exportar com os filtros atuais.',
        variant: 'destructive'
      });
      return;
    }

    const headers = [
      'Número',
      'Nome Completo',
      'Email',
      'Curso',
      'Semestre',
      'Status',
      'Data de Inscrição'
    ];

    // Adicionar headers para campos personalizados
    const camposPersonalizados = new Set<string>();
    filteredInscritos.forEach(inscrito => {
      Object.keys(inscrito.campos_adicionais || {}).forEach(campo => {
        camposPersonalizados.add(campo);
      });
    });

    const allHeaders = [...headers, ...Array.from(camposPersonalizados)];

    const csvContent = [
      allHeaders.join(','),
      ...filteredInscritos.map(inscrito => {
        const row = [
          inscrito.numero_inscricao,
          `"${inscrito.nome_completo}"`,
          `"${inscrito.email}"`,
          `"${inscrito.curso || ''}"`,
          inscrito.semestre || '',
          inscrito.status,
          new Date(inscrito.created_at).toLocaleDateString('pt-BR')
        ];

        // Adicionar campos personalizados
        camposPersonalizados.forEach(campo => {
          const valor = inscrito.campos_adicionais?.[campo] || '';
          row.push(`"${valor}"`);
        });

        return row.join(',');
      })
    ].join('\n');

    // Download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inscritos_evento_${eventoId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Exportação realizada',
      description: 'Lista de inscritos exportada com sucesso!'
    });
  };

  useEffect(() => {
    if (eventoId) {
      fetchInscritos();
    }
  }, [eventoId]);

  return {
    inscritos: filteredInscritos,
    stats,
    loading,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    fetchInscritos,
    updateStatusInscrito,
    removeInscrito,
    exportToCSV
  };
}
