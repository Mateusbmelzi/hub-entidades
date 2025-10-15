import { useState, useEffect } from 'react';
import { useTemplatesFormularios } from '@/hooks/useTemplatesFormularios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface SelecionarTemplateRapidoProps {
  entidadeId: number;
  onTemplateSelect: (templateId: string | null) => void;
  tipoEvento?: string;
}

export function SelecionarTemplateRapido({ 
  entidadeId, 
  onTemplateSelect,
  tipoEvento 
}: SelecionarTemplateRapidoProps) {
  const { templates, loading } = useTemplatesFormularios(entidadeId);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('padrao');

  const templatesDisponiveis = templates.filter(t => 
    !tipoEvento || !t.tipo_evento || t.tipo_evento === tipoEvento
  );

  const handleChange = (value: string) => {
    setSelectedTemplate(value);
    onTemplateSelect(value === 'padrao' ? null : value);
  };

  return (
    <div className="space-y-3">
      <Label>Template do Formulário</Label>
      <Select value={selectedTemplate} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um template" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="padrao">Template Padrão do Sistema</SelectItem>
          {templatesDisponiveis.map(template => (
            <SelectItem key={template.id} value={template.id}>
              {template.nome_template}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Você poderá personalizar o formulário após a criação do evento
        </AlertDescription>
      </Alert>
    </div>
  );
}
