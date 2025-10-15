import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CampoPersonalizado {
  id: string;
  label: string;
  tipo: 'text' | 'textarea' | 'select' | 'checkbox';
  obrigatorio: boolean;
  opcoes?: string[]; // Para tipo 'select'
  placeholder?: string;
}

export interface FormularioInscricao {
  id?: string;
  evento_id: string;
  entidade_id: number;
  ativo: boolean;
  limite_vagas: number | null;
  aceita_lista_espera: boolean;
  campos_basicos_visiveis: string[];
  campos_personalizados: CampoPersonalizado[];
  created_at?: string;
  updated_at?: string;
}

export function useFormularioInscricao(eventoId: string) {
  const [formulario, setFormulario] = useState<FormularioInscricao | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Buscar configuração do formulário
  const fetchFormulario = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('formularios_inscricao')
        .select('*')
        .eq('evento_id', eventoId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      if (data) {
        setFormulario({
          ...data,
          campos_basicos_visiveis: data.campos_basicos_visiveis || ['nome_completo', 'email', 'curso', 'semestre'],
          campos_personalizados: data.campos_personalizados || []
        });
      } else {
        // Se não existe, criar um formulário vazio
        setFormulario({
          evento_id: eventoId,
          entidade_id: 0, // Será preenchido ao salvar
          ativo: false,
          limite_vagas: null,
          aceita_lista_espera: false,
          campos_basicos_visiveis: ['nome_completo', 'email', 'curso', 'semestre'],
          campos_personalizados: []
        });
      }
    } catch (error) {
      console.error('Erro ao buscar formulário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a configuração do formulário.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Salvar configuração do formulário
  const saveFormulario = async (formularioData: FormularioInscricao) => {
    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('formularios_inscricao')
        .upsert({
          ...formularioData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setFormulario(data);
      
      // Atualizar campos na tabela eventos
      const { error: eventoError } = await supabase
        .from('eventos')
        .update({
          formulario_ativo: formularioData.ativo,
          limite_vagas: formularioData.limite_vagas
        })
        .eq('id', eventoId);

      if (eventoError) {
        console.warn('Erro ao atualizar evento:', eventoError);
      }

      toast({
        title: 'Sucesso',
        description: 'Configuração do formulário salva com sucesso!'
      });

      return { success: true, data };
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
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
  const createFormularioComTemplatesPadrao = async (eventoId: string, entidadeId: number) => {
    try {
      // Buscar template padrão (entidade_id = NULL)
      const { data: templatePadrao, error: templateError } = await supabase
        .from('templates_formularios')
        .select('*')
        .is('entidade_id', null)
        .eq('nome_template', 'Template Padrão')
        .single();

      if (templateError) {
        console.warn('Template padrão não encontrado, usando configuração básica');
      }

      const formularioData: FormularioInscricao = {
        evento_id: eventoId,
        entidade_id: entidadeId,
        ativo: false, // Inativo por padrão até entidade ativar
        limite_vagas: null,
        aceita_lista_espera: false,
        campos_basicos_visiveis: templatePadrao?.campos_basicos_visiveis || 
          ['nome_completo', 'email', 'curso', 'semestre'],
        campos_personalizados: templatePadrao?.campos_personalizados || [],
        template_id: templatePadrao?.id || null
      };

      const { data, error } = await supabase
        .from('formularios_inscricao')
        .insert(formularioData)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Erro ao criar formulário padrão:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (eventoId) {
      fetchFormulario();
    }
  }, [eventoId]);

  // Aplicar template ao formulário
  const aplicarTemplate = async (templateId: string, capacidadeSala?: number) => {
    try {
      const { data: template, error } = await supabase
        .from('templates_formularios')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (error || !template) {
        toast({
          title: 'Erro',
          description: 'Template não encontrado.',
          variant: 'destructive'
        });
        return;
      }
      
      if (formulario) {
        setFormulario({
          ...formulario,
          campos_basicos_visiveis: template.campos_basicos_visiveis,
          campos_personalizados: template.campos_personalizados,
          limite_vagas: template.usa_limite_sala 
            ? capacidadeSala || null 
            : template.limite_vagas_customizado,
          aceita_lista_espera: template.aceita_lista_espera
        });
        
        toast({
          title: 'Template aplicado',
          description: `Template "${template.nome_template}" foi aplicado com sucesso.`
        });
      }
    } catch (error) {
      console.error('Erro ao aplicar template:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aplicar o template.',
        variant: 'destructive'
      });
    }
  };

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
    reorderCampos,
    aplicarTemplate
  };
}
