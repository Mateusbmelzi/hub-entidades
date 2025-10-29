import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { FormularioFasePS, CampoPersonalizado } from '@/types/processo-seletivo';

export function useFormularioFasePS(faseId: string) {
  const [formulario, setFormulario] = useState<FormularioFasePS | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Buscar configuração do formulário
  const fetchFormulario = useCallback(async () => {
    if (!faseId) return;
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('formularios_fases_ps')
        .select('*')
        .eq('fase_id', faseId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      if (data) {
        setFormulario({
          ...data,
          campos_basicos_visiveis: data.campos_basicos_visiveis || ['nome', 'email', 'curso', 'semestre'],
          campos_personalizados: data.campos_personalizados || []
        });
      } else {
        // Se não existe, criar um formulário vazio
        setFormulario({
          fase_id: faseId,
          entidade_id: 0, // Será preenchido ao salvar
          ativo: false,
          campos_basicos_visiveis: ['nome', 'email', 'curso', 'semestre'],
          campos_personalizados: []
        });
      }
    } catch (error) {
      console.error('Erro ao buscar formulário da fase:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a configuração do formulário.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [faseId, toast]);

  // Salvar configuração do formulário
  const saveFormulario = async (formularioData: FormularioFasePS) => {
    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('formularios_fases_ps')
        .upsert({
          ...formularioData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setFormulario(data);
      
      toast({
        title: 'Sucesso',
        description: 'Configuração do formulário salva com sucesso!'
      });

      return { success: true, data };
    } catch (error) {
      console.error('Erro ao salvar formulário da fase:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a configuração do formulário.',
        variant: 'destructive'
      });
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  // Adicionar campo personalizado
  const addCampoPersonalizado = (campo: Omit<CampoPersonalizado, 'id'>) => {
    if (!formulario) return;

    const novoCampo: CampoPersonalizado = {
      ...campo,
      id: `campo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setFormulario({
      ...formulario,
      campos_personalizados: [...formulario.campos_personalizados, novoCampo]
    });
  };

  // Remover campo personalizado
  const removeCampoPersonalizado = (campoId: string) => {
    if (!formulario) return;

    setFormulario({
      ...formulario,
      campos_personalizados: formulario.campos_personalizados.filter(c => c.id !== campoId)
    });
  };

  // Atualizar campo personalizado
  const updateCampoPersonalizado = (campoId: string, updates: Partial<CampoPersonalizado>) => {
    if (!formulario) return;

    setFormulario({
      ...formulario,
      campos_personalizados: formulario.campos_personalizados.map(campo =>
        campo.id === campoId ? { ...campo, ...updates } : campo
      )
    });
  };

  // Reordenar campos
  const reorderCampos = (fromIndex: number, toIndex: number) => {
    if (!formulario) return;

    const campos = [...formulario.campos_personalizados];
    const [removed] = campos.splice(fromIndex, 1);
    campos.splice(toIndex, 0, removed);

    setFormulario({
      ...formulario,
      campos_personalizados: campos
    });
  };

  // Criar formulário com template padrão
  const createFormularioComTemplatesPadrao = async (faseId: string, entidadeId: number) => {
    try {
      const formularioData: FormularioFasePS = {
        fase_id: faseId,
        entidade_id: entidadeId,
        ativo: false, // Inativo por padrão até entidade ativar
        campos_basicos_visiveis: ['nome', 'email', 'curso', 'semestre'],
        campos_personalizados: []
      };

      const { data, error } = await supabase
        .from('formularios_fases_ps')
        .insert(formularioData)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Erro ao criar formulário padrão da fase:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (faseId) {
      fetchFormulario();
    }
  }, [fetchFormulario]);

  return {
    formulario,
    setFormulario,
    loading,
    saving,
    fetchFormulario,
    saveFormulario,
    createFormularioComTemplatesPadrao,
    addCampoPersonalizado,
    removeCampoPersonalizado,
    updateCampoPersonalizado,
    reorderCampos
  };
}
