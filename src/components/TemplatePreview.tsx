import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, CheckCircle } from 'lucide-react';
import { TemplateFormulario } from '@/types/template-formulario';

interface TemplatePreviewProps {
  templateId: string | null;
  entidadeId: number;
}

export function TemplatePreview({ templateId, entidadeId }: TemplatePreviewProps) {
  const [template, setTemplate] = useState<TemplateFormulario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) return;
      
      setLoading(true);
      
      if (templateId === 'padrao') {
        // Buscar template padrão
        const { data } = await supabase
          .from('templates_formularios')
          .select('*')
          .is('entidade_id', null)
          .eq('nome_template', 'Template Padrão')
          .single();
        setTemplate(data);
      } else if (templateId !== 'criar-novo') {
        // Buscar template específico
        const { data } = await supabase
          .from('templates_formularios')
          .select('*')
          .eq('id', templateId)
          .single();
        setTemplate(data);
      }
      
      setLoading(false);
    };

    fetchTemplate();
  }, [templateId]);

  if (loading) {
    return <div className="text-sm text-gray-500">Carregando preview...</div>;
  }

  if (!template || templateId === 'criar-novo') {
    return null;
  }

  return (
    <Alert>
      <FileText className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <p className="font-medium text-sm mb-2">
              Preview: {template.nome_template}
            </p>
            {template.descricao && (
              <p className="text-xs text-gray-600">{template.descricao}</p>
            )}
          </div>

          {/* Campos Básicos */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">
              Campos Básicos:
            </p>
            <div className="flex flex-wrap gap-1">
              {template.campos_basicos_visiveis?.map((campo: string) => (
                <Badge key={campo} variant="secondary" className="text-xs">
                  {campo.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Campos Personalizados */}
          {template.campos_personalizados && template.campos_personalizados.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">
                Campos Personalizados:
              </p>
              <div className="flex flex-wrap gap-1">
                {template.campos_personalizados.map((campo: any) => (
                  <Badge key={campo.id} variant="outline" className="text-xs">
                    {campo.label} ({campo.tipo})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Configurações */}
          <div className="flex gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {template.usa_limite_sala 
                ? 'Usa limite da sala' 
                : template.limite_vagas_customizado 
                  ? `Limite: ${template.limite_vagas_customizado}` 
                  : 'Sem limite'}
            </div>
            {template.aceita_lista_espera && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Lista de espera ativa
              </div>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
