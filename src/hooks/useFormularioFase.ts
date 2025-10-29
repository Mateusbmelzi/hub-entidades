import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TemplateFormulario } from '@/types/template-formulario';
import type { FaseProcessoSeletivo, InscricaoFasePS } from '@/types/processo-seletivo';

export function useFormularioFase(inscricaoFaseId: string) {
  const [inscricaoFase, setInscricaoFase] = useState<InscricaoFasePS | null>(null);
  const [fase, setFase] = useState<FaseProcessoSeletivo | null>(null);
  const [template, setTemplate] = useState<TemplateFormulario | null>(null);
  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Buscar inscrição na fase
      const { data: inscricaoData, error: inscricaoError } = await supabase
        .from('inscricoes_fases_ps')
        .select('*')
        .eq('id', inscricaoFaseId)
        .single();

      if (inscricaoError) throw inscricaoError;
      setInscricaoFase(inscricaoData as InscricaoFasePS);
      setRespostas(inscricaoData.respostas_formulario || {});

      // 2. Buscar fase
      const { data: faseData, error: faseError } = await supabase
        .from('processos_seletivos_fases')
        .select('*')
        .eq('id', inscricaoData.fase_id)
        .single();

      if (faseError) throw faseError;
      setFase(faseData as FaseProcessoSeletivo);

      // 3. Se fase tem template, buscar template
      if (faseData.template_formulario_id) {
        const { data: templateData, error: templateError } = await supabase
          .from('templates_formularios')
          .select('*')
          .eq('id', faseData.template_formulario_id)
          .single();

        if (templateError) throw templateError;
        setTemplate(templateData as TemplateFormulario);
      }
    } catch (error: any) {
      console.error('Erro ao buscar dados do formulário:', error);
      toast({
        title: 'Erro ao carregar formulário',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [inscricaoFaseId, toast]);

  useEffect(() => {
    if (inscricaoFaseId) {
      fetchData();
    }
  }, [inscricaoFaseId, fetchData]);

  const salvarRespostas = useCallback(
    async (novasRespostas: Record<string, any>, marcarComoPreenchido: boolean = false) => {
      try {
        setSaving(true);

        const updateData: any = {
          respostas_formulario: novasRespostas,
          updated_at: new Date().toISOString(),
        };

        if (marcarComoPreenchido) {
          updateData.formulario_preenchido = true;
        }

        const { error } = await supabase
          .from('inscricoes_fases_ps')
          .update(updateData)
          .eq('id', inscricaoFaseId);

        if (error) throw error;

        setRespostas(novasRespostas);
        if (marcarComoPreenchido && inscricaoFase) {
          setInscricaoFase({ ...inscricaoFase, formulario_preenchido: true });
        }

        toast({
          title: '✅ Respostas salvas',
          description: marcarComoPreenchido 
            ? 'Formulário preenchido com sucesso!' 
            : 'Suas respostas foram salvas',
        });

        return { success: true };
      } catch (error: any) {
        console.error('Erro ao salvar respostas:', error);
        toast({
          title: 'Erro ao salvar',
          description: error.message || 'Tente novamente',
          variant: 'destructive',
        });
        return { success: false, error: error.message };
      } finally {
        setSaving(false);
      }
    },
    [inscricaoFaseId, inscricaoFase, toast]
  );

  const marcarComoPreenchido = useCallback(async () => {
    return await salvarRespostas(respostas, true);
  }, [respostas, salvarRespostas]);

  return {
    inscricaoFase,
    fase,
    template,
    respostas,
    loading,
    saving,
    salvarRespostas,
    marcarComoPreenchido,
    refetch: fetchData,
  };
}

