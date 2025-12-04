import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Projeto } from './useProjetos';

export const useProjeto = (projetoId: number | string | undefined) => {
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjeto = async () => {
    if (!projetoId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projetos')
        .select(`
          *,
          entidades(id, nome, descricao_curta, contato)
        `)
        .eq('id', projetoId)
        .single();

      if (error) throw error;

      console.log('📥 Projeto carregado do banco:', { 
        id: data?.id, 
        nome: data?.nome, 
        imagem_url: data?.imagem_url 
      });

      setProjeto(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar projeto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjeto();
  }, [projetoId]);

  return { projeto, loading, error, refetch: fetchProjeto };
};

