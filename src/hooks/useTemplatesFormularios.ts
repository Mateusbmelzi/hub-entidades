import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TemplateFormulario, 
  TemplateFormularioFormData,
  CampoPersonalizado 
} from '@/types/template-formulario';

export function useTemplatesFormularios(entidadeId: number) {
  const [templates, setTemplates] = useState<TemplateFormulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Buscando templates para entidade:', entidadeId);
      
      const { data, error } = await supabase
        .from('templates_formularios')
        .select('*')
        .eq('entidade_id', entidadeId)
        .order('created_at', { ascending: false });
      
      console.log('📤 Resposta da busca de templates:', { data, error });
      
      if (error) {
        console.error('❌ Erro ao buscar templates:', error);
        throw error;
      }
      
      setTemplates(data || []);
      console.log('✅ Templates carregados:', data?.length || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar templates';
      setError(errorMessage);
      console.error('💥 Erro ao buscar templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: TemplateFormularioFormData) => {
    try {
      console.log('🚀 Tentando criar template:', { templateData, entidadeId });
      
      const { data, error } = await supabase
        .from('templates_formularios')
        .insert({
          ...templateData,
          entidade_id: entidadeId
        })
        .select()
        .single();
      
      console.log('📤 Resposta da API:', { data, error });
      
      if (error) {
        console.error('❌ Erro na API:', error);
        throw error;
      }
      
      await fetchTemplates();
      toast({
        title: 'Sucesso',
        description: 'Template criado com sucesso!'
      });
      
      return { success: true, data };
    } catch (err) {
      console.error('💥 Erro geral na criação:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar template';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      return { success: false, error: errorMessage };
    }
  };

  const updateTemplate = async (id: string, updates: Partial<TemplateFormularioFormData>) => {
    try {
      const { error } = await supabase
        .from('templates_formularios')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchTemplates();
      toast({
        title: 'Sucesso',
        description: 'Template atualizado com sucesso!'
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar template';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      return { success: false, error: errorMessage };
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('templates_formularios')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchTemplates();
      toast({
        title: 'Sucesso',
        description: 'Template excluído com sucesso!'
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir template';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      return { success: false, error: errorMessage };
    }
  };

  const duplicateTemplate = async (id: string) => {
    try {
      const template = templates.find(t => t.id === id);
      if (!template) {
        throw new Error('Template não encontrado');
      }
      
      const { id: _, created_at, updated_at, ...templateData } = template;
      const duplicatedData = {
        ...templateData,
        nome_template: `${template.nome_template} (cópia)`
      };
      
      return createTemplate(duplicatedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao duplicar template';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      return { success: false, error: errorMessage };
    }
  };

  const getTemplateById = async (id: string): Promise<TemplateFormulario | null> => {
    try {
      const { data, error } = await supabase
        .from('templates_formularios')
        .select('*')
        .eq('id', id)
        .eq('entidade_id', entidadeId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao buscar template:', err);
      return null;
    }
  };

  const getTemplatesByTipo = (tipoEvento?: string) => {
    if (!tipoEvento) return templates;
    return templates.filter(t => t.tipo_evento === tipoEvento);
  };

  const getTemplatesByTipoProcessoSeletivo = () => {
    return templates.filter(t => t.tipo_evento === 'processo_seletivo');
  };

  useEffect(() => {
    if (entidadeId) {
      fetchTemplates();
    }
  }, [entidadeId]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    getTemplateById,
    getTemplatesByTipo,
    getTemplatesByTipoProcessoSeletivo
  };
}

// Hook auxiliar para gerenciar campos personalizados
export function useCamposPersonalizados() {
  const [campos, setCampos] = useState<CampoPersonalizado[]>([]);

  const addCampo = (campo: Omit<CampoPersonalizado, 'id'>) => {
    const novoCampo: CampoPersonalizado = {
      ...campo,
      id: `campo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setCampos([...campos, novoCampo]);
  };

  const removeCampo = (campoId: string) => {
    setCampos(campos.filter(c => c.id !== campoId));
  };

  const updateCampo = (campoId: string, updates: Partial<CampoPersonalizado>) => {
    setCampos(campos.map(campo => 
      campo.id === campoId ? { ...campo, ...updates } : campo
    ));
  };

  const reorderCampos = (fromIndex: number, toIndex: number) => {
    const newCampos = [...campos];
    const [removed] = newCampos.splice(fromIndex, 1);
    newCampos.splice(toIndex, 0, removed);
    setCampos(newCampos);
  };

  const clearCampos = () => {
    setCampos([]);
  };

  return {
    campos,
    addCampo,
    removeCampo,
    updateCampo,
    reorderCampos,
    clearCampos,
    setCampos
  };
}
