import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical, Eye, Save, X } from 'lucide-react';
import { useTemplatesFormularios, useCamposPersonalizados } from '@/hooks/useTemplatesFormularios';
import { 
  TemplateFormulario, 
  TemplateFormularioFormData,
  TIPO_EVENTO_LABELS,
  CAMPOS_BASICOS_LABELS,
  TIPOS_CAMPO_LABELS,
  CampoBasico,
  CampoPersonalizado
} from '@/types/template-formulario';
import { useToast } from '@/hooks/use-toast';

interface CriarEditarTemplateProps {
  entidadeId: number;
  template?: TemplateFormulario | null;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: (template: TemplateFormulario) => void;
  onCancel?: () => void;
}

export function CriarEditarTemplate({ 
  entidadeId, 
  template, 
  isOpen = true, 
  onClose, 
  onSuccess,
  onCancel
}: CriarEditarTemplateProps) {
  const { toast } = useToast();
  const { createTemplate, updateTemplate } = useTemplatesFormularios(entidadeId);
  const { campos, addCampo, removeCampo, updateCampo, clearCampos, setCampos } = useCamposPersonalizados();
  
  const [showPreview, setShowPreview] = useState(false);
  const [showAddCampo, setShowAddCampo] = useState(false);
  const [novoCampo, setNovoCampo] = useState<Partial<CampoPersonalizado>>({
    label: '',
    tipo: 'text',
    obrigatorio: false,
    placeholder: ''
  });

  // Estados do formulário
  const [formData, setFormData] = useState<TemplateFormularioFormData>({
    nome_template: '',
    descricao: '',
    tipo_evento: undefined,
    campos_basicos_visiveis: ['nome_completo', 'email', 'curso', 'semestre'],
    campos_personalizados: [],
    usa_limite_sala: true,
    limite_vagas_customizado: undefined,
    aceita_lista_espera: false
  });

  const [saving, setSaving] = useState(false);

  // Inicializar dados quando template for fornecido (modo edição)
  useEffect(() => {
    if (template) {
      setFormData({
        nome_template: template.nome_template,
        descricao: template.descricao || '',
        tipo_evento: template.tipo_evento,
        campos_basicos_visiveis: template.campos_basicos_visiveis,
        campos_personalizados: template.campos_personalizados,
        usa_limite_sala: template.usa_limite_sala,
        limite_vagas_customizado: template.limite_vagas_customizado,
        aceita_lista_espera: template.aceita_lista_espera
      });
      setCampos(template.campos_personalizados);
    } else {
      // Reset para modo criação
      setFormData({
        nome_template: '',
        descricao: '',
        tipo_evento: undefined,
        campos_basicos_visiveis: ['nome_completo', 'email', 'curso', 'semestre'],
        campos_personalizados: [],
        usa_limite_sala: true,
        limite_vagas_customizado: undefined,
        aceita_lista_espera: false
      });
      setCampos([]);
    }
  }, [template, setCampos]);

  // Atualizar campos personalizados quando a lista mudar
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      campos_personalizados: campos
    }));
  }, [campos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_template.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'O nome do template é obrigatório.',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);

    try {
      const result = template 
        ? await updateTemplate(template.id, formData)
        : await createTemplate(formData);

      if (result.success) {
        if (result.data) {
          onSuccess?.(result.data);
        }
        onClose?.();
      }
    } catch (error) {
      console.error('Erro ao salvar template:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCampo = () => {
    if (!novoCampo.label?.trim()) {
      toast({
        title: 'Erro',
        description: 'O label do campo é obrigatório.',
        variant: 'destructive'
      });
      return;
    }

    addCampo({
      label: novoCampo.label,
      tipo: novoCampo.tipo || 'text',
      obrigatorio: novoCampo.obrigatorio || false,
      placeholder: novoCampo.placeholder,
      opcoes: novoCampo.tipo === 'select' ? novoCampo.opcoes : undefined
    });

    setNovoCampo({
      label: '',
      tipo: 'text',
      obrigatorio: false,
      placeholder: ''
    });
    setShowAddCampo(false);
  };

  const handleToggleCampoBasico = (campo: CampoBasico, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        campos_basicos_visiveis: [...prev.campos_basicos_visiveis, campo]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        campos_basicos_visiveis: prev.campos_basicos_visiveis.filter(c => c !== campo)
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            {template ? 'Editar Template' : 'Criar Novo Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nome_template">Nome do Template *</Label>
                <Input
                  id="nome_template"
                  value={formData.nome_template}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_template: e.target.value }))}
                  placeholder="Ex: Workshop Técnico, Palestra Motivacional"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição (opcional)</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva quando usar este template..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="tipo_evento">Tipo de Evento (opcional)</Label>
                <Select 
                  value={formData.tipo_evento || 'nenhum'} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    tipo_evento: value === 'nenhum' ? undefined : (value as any)
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo de evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Sem tipo específico</SelectItem>
                    {Object.entries(TIPO_EVENTO_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Campos Básicos */}
          <Card>
            <CardHeader>
              <CardTitle>Campos Básicos</CardTitle>
              <p className="text-sm text-gray-500">
                Selecione quais campos básicos aparecerão no formulário. 
                Os dados virão pré-preenchidos do perfil do usuário.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(CAMPOS_BASICOS_LABELS).map(([value, label]) => (
                  <div key={value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`basico-${value}`}
                      checked={formData.campos_basicos_visiveis.includes(value as CampoBasico)}
                      onChange={(e) => handleToggleCampoBasico(value as CampoBasico, e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <Label htmlFor={`basico-${value}`} className="text-sm">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campos Personalizados */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Campos Personalizados</CardTitle>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? 'Ocultar' : 'Preview'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setShowAddCampo(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Campo
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {campos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum campo personalizado adicionado.</p>
                  <p className="text-sm">Clique em "Adicionar Campo" para começar.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campos.map((campo, index) => (
                    <div key={campo.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{campo.label}</span>
                          {campo.obrigatorio && (
                            <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {TIPOS_CAMPO_LABELS[campo.tipo]}
                          </Badge>
                        </div>
                        
                        {campo.placeholder && (
                          <p className="text-sm text-gray-500">"{campo.placeholder}"</p>
                        )}
                        
                        {campo.tipo === 'select' && campo.opcoes && (
                          <p className="text-sm text-gray-500">
                            Opções: {campo.opcoes.join(', ')}
                          </p>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCampo(campo.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Preview do formulário */}
              {showPreview && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-4">Preview do Formulário</h4>
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    {formData.campos_basicos_visiveis.map(campoBasico => (
                      <div key={campoBasico}>
                        <Label>{CAMPOS_BASICOS_LABELS[campoBasico]} *</Label>
                        <Input placeholder={`Exemplo de ${CAMPOS_BASICOS_LABELS[campoBasico].toLowerCase()}`} disabled />
                      </div>
                    ))}
                    
                    {campos.map((campo) => (
                      <div key={campo.id}>
                        <Label>
                          {campo.label}
                          {campo.obrigatorio && ' *'}
                        </Label>
                        {campo.tipo === 'text' && (
                          <Input placeholder={campo.placeholder} disabled />
                        )}
                        {campo.tipo === 'textarea' && (
                          <Textarea placeholder={campo.placeholder} disabled />
                        )}
                        {campo.tipo === 'select' && (
                          <Select disabled>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma opção" />
                            </SelectTrigger>
                          </Select>
                        )}
                        {campo.tipo === 'checkbox' && (
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" disabled />
                            <Label>Sim</Label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configurações de Vagas */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Vagas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="usa_limite_sala">Usar capacidade da sala como limite</Label>
                  <p className="text-sm text-gray-500">
                    Se ativado, o limite de vagas será a capacidade da sala onde o evento acontece
                  </p>
                </div>
                <Switch
                  id="usa_limite_sala"
                  checked={formData.usa_limite_sala}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, usa_limite_sala: checked }))}
                />
              </div>

              {!formData.usa_limite_sala && (
                <div>
                  <Label htmlFor="limite_vagas_customizado">Limite de vagas customizado</Label>
                  <Input
                    id="limite_vagas_customizado"
                    type="number"
                    min="1"
                    value={formData.limite_vagas_customizado || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      limite_vagas_customizado: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="Ex: 50"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="aceita_lista_espera">Aceitar lista de espera</Label>
                  <p className="text-sm text-gray-500">
                    Quando as vagas esgotarem, usuários podem entrar na lista de espera
                  </p>
                </div>
                <Switch
                  id="aceita_lista_espera"
                  checked={formData.aceita_lista_espera}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, aceita_lista_espera: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Salvando...' : (template ? 'Atualizar Template' : 'Criar Template')}
            </Button>
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
                Cancelar
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
            )}
          </div>
        </form>

        {/* Modal para adicionar campo personalizado */}
        {showAddCampo && (
          <Dialog open={showAddCampo} onOpenChange={setShowAddCampo}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Campo Personalizado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="campo-label">Label do Campo</Label>
                  <Input
                    id="campo-label"
                    value={novoCampo.label || ''}
                    onChange={(e) => setNovoCampo({ ...novoCampo, label: e.target.value })}
                    placeholder="Ex: Você tem restrição alimentar?"
                  />
                </div>

                <div>
                  <Label htmlFor="campo-tipo">Tipo do Campo</Label>
                  <Select
                    value={novoCampo.tipo}
                    onValueChange={(value: any) => setNovoCampo({ ...novoCampo, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIPOS_CAMPO_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {novoCampo.tipo === 'select' && (
                  <div>
                    <Label htmlFor="campo-opcoes">Opções (uma por linha)</Label>
                    <Textarea
                      id="campo-opcoes"
                      value={novoCampo.opcoes?.join('\n') || ''}
                      onChange={(e) => {
                        const opcoes = e.target.value.split('\n').filter(o => o.trim());
                        setNovoCampo({ ...novoCampo, opcoes });
                      }}
                      placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                      rows={3}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="campo-placeholder">Placeholder (opcional)</Label>
                  <Input
                    id="campo-placeholder"
                    value={novoCampo.placeholder || ''}
                    onChange={(e) => setNovoCampo({ ...novoCampo, placeholder: e.target.value })}
                    placeholder="Texto de ajuda..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="campo-obrigatorio"
                    checked={novoCampo.obrigatorio || false}
                    onCheckedChange={(checked) => setNovoCampo({ ...novoCampo, obrigatorio: checked })}
                  />
                  <Label htmlFor="campo-obrigatorio">Campo obrigatório</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddCampo} className="flex-1">
                    Adicionar Campo
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddCampo(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
