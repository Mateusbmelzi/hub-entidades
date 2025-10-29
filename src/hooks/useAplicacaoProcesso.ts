import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { InscricaoProcessoSeletivo } from '@/types/processo-seletivo';

export function useAplicacaoProcesso(entidadeId?: number) {
  const [inscricao, setInscricao] = useState<InscricaoProcessoSeletivo | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificandoInscricao, setVerificandoInscricao] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

  // Verificar se usuário já está inscrito
  const verificarInscricao = useCallback(async () => {
    if (!entidadeId || !user?.id) {
      setVerificandoInscricao(false);
      return;
    }

    console.log('Verificando inscrição no processo seletivo para entidade:', entidadeId, 'e usuário:', user.email);
    
    try {
      const { data, error } = await supabase
        .from('inscricoes_processo_seletivo')
        .select('*')
        .eq('entidade_id', entidadeId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar inscrição:', error);
      }

      if (data) {
        console.log('Inscrição encontrada:', data);
        setInscricao(data as InscricaoProcessoSeletivo);
      } else {
        console.log('Nenhuma inscrição encontrada');
        setInscricao(null);
      }
    } catch (err) {
      console.error('Erro ao verificar inscrição:', err);
    } finally {
      setVerificandoInscricao(false);
    }
  }, [entidadeId, user?.id, user?.email]);

  useEffect(() => {
    verificarInscricao();
  }, [verificarInscricao]);

  const aplicar = useCallback(
    async (
      dadosInscricao?: {
        nome_estudante?: string;
        email_estudante?: string;
        curso_estudante?: string;
        semestre_estudante?: number;
        area_interesse?: string;
        mensagem?: string;
      },
      respostasExtras?: Record<string, any>
    ): Promise<{ success: boolean; data?: InscricaoProcessoSeletivo; error?: string }> => {
      if (!entidadeId) return { success: false, error: 'Entidade inválida' };
      if (!user || !profile) return { success: false, error: 'Usuário não autenticado' };
      
      try {
        setLoading(true);
        setError(null);

        const inscricaoData = {
          entidade_id: entidadeId,
          user_id: user.id,
          nome_estudante: dadosInscricao?.nome_estudante || profile.nome || '',
          email_estudante: dadosInscricao?.email_estudante || user.email || '',
          curso_estudante: dadosInscricao?.curso_estudante || profile.curso || '',
          semestre_estudante: dadosInscricao?.semestre_estudante || profile.semestre || 1,
          area_interesse: dadosInscricao?.area_interesse || profile.area_interesse || '',
          mensagem: dadosInscricao?.mensagem || '',
          status: 'pendente' as const,
        };

        const { data, error } = await supabase
          .from('inscricoes_processo_seletivo')
          .insert(inscricaoData)
          .select()
          .single();

        if (error) throw error;

        // Buscar a primeira fase ativa (menor ordem) para criar inscrição automática
        const { data: primeiraFase, error: faseError } = await supabase
          .from('processos_seletivos_fases')
          .select('id, template_formulario_id, ordem, nome')
          .eq('entidade_id', entidadeId)
          .eq('ativa', true)
          .order('ordem', { ascending: true })
          .limit(1)
          .single();

        if (faseError) {
          console.warn('Erro ao buscar primeira fase:', faseError);
        } else if (primeiraFase) {
          console.log(`✅ Criando inscrição na primeira fase: ${primeiraFase.nome} (ordem ${primeiraFase.ordem})`);
          
          // Criar inscrição na primeira fase automaticamente
          const { error: inscricaoFaseError } = await supabase
            .from('inscricoes_fases_ps')
            .insert({
              inscricao_id: data.id,
              fase_id: primeiraFase.id,
              respostas_formulario: respostasExtras || {},
              formulario_preenchido: !!primeiraFase.template_formulario_id,
              status: 'pendente'
            });

          if (inscricaoFaseError) {
            console.warn('Erro ao criar inscrição na primeira fase:', inscricaoFaseError);
          } else {
            console.log('✅ Candidato adicionado à primeira fase com sucesso');
          }
        }
        
        setInscricao(data as InscricaoProcessoSeletivo);
        return { success: true, data: data as InscricaoProcessoSeletivo };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao inscrever-se';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [entidadeId, user, profile]
  );

  return { inscricao, aplicar, loading, error, verificandoInscricao, jaInscrito: !!inscricao };
}


