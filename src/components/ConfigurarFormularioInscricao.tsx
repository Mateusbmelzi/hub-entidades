import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, Eye, Settings } from 'lucide-react';
import { useFormularioInscricao, CampoPersonalizado } from '@/hooks/useFormularioInscricao';
import { useTemplatesFormularios } from '@/hooks/useTemplatesFormularios';
import { useToast } from '@/hooks/use-toast';

interface ConfigurarFormularioInscricaoProps {
  eventoId: string;
  entidadeId: number;
  capacidadeSala?: number;
  onSave?: () => void;
}

export function ConfigurarFormularioInscricao({ 
  eventoId, 
  entidadeId, 
  capacidadeSala,
  onSave 
}: ConfigurarFormularioInscricaoProps) {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [showAddCampo, setShowAddCampo] = useState(false);
  const [templateSelecionado, setTemplateSelecionado] = useState<string>('');
  const [novoCampo, setNovoCampo] = useState<Partial<CampoPersonalizado>>({
    label: '',
    tipo: 'text',
    obrigatorio: false,
    placeholder: ''
  });

  const {
    formulario,
    setFormulario,
    loading,
    saving,
    saveFormulario,
    addCampoPersonalizado,
    removeCampoPersonalizado,
    updateCampoPersonalizado,
    reorderCampos,
    aplicarTemplate
  } = useFormularioInscricao(eventoId);

  const { templates } = useTemplatesFormularios(entidadeId);

  const handleSelecionarTemplate = async (templateId: string) => {
    if (!templateId || templateId === 'nenhum') {
      setTemplateSelecionado('');
      // Reset formulário para estado inicial
      if (formulario) {
        setFormulario({
          ...formulario,
          campos_personalizados: [],
          limite_vagas: capacidadeSala || null,
          aceita_lista_espera: false
        });
      }
      return;
    }

    // Usar a função do hook para aplicar o template
    await aplicarTemplate(templateId, capacidadeSala);
    setTemplateSelecionado(templateId);
  };

  const handleSalvarComoTemplate = () => {
    // Esta funcionalidade será implementada quando necessário
    toast({
      title: 'Funcionalidade em desenvolvimento',
      description: 'Salvar como template será implementado em breve.',
      variant: 'destructive'
    });
  };

  const handleSave = async () => {
    if (!formulario) return;

    const formularioCompleto = {
      ...formulario,
      entidade_id: entidadeId
    };

    const result = await saveFormulario(formularioCompleto);
    if (result.success && onSave) {
      onSave();
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

    addCampoPersonalizado({
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

  const handleUpdateCampo = (campoId: string, field: keyof CampoPersonalizado, value: any) => {
    updateCampoPersonalizado(campoId, { [field]: value });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-20 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!formulario) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Erro ao carregar configuração do formulário.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seleção de Template */}
      <Card>
        <CardHeader>
          <CardTitle>Usar Template Salvo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template-select">Selecionar template</Label>
            <Select value={templateSelecionado || 'nenhum'} onValueChange={handleSelecionarTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Criar formulário do zero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Criar formulário do zero</SelectItem>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome_template}
                    {t.tipo_evento && ` (${t.tipo_evento})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {templateSelecionado && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSalvarComoTemplate}>
                Salvar como novo template
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setTemplateSelecionado('');
                  // Reset formulário para estado inicial
                  if (formulario) {
                    setFormulario({
                      ...formulario,
                      campos_personalizados: [],
                      limite_vagas: capacidadeSala || null,
                      aceita_lista_espera: false
                    });
                  }
                }}
              >
                Limpar template
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Inscrição
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ativar formulário */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="formulario-ativo">Habilitar formulário de inscrição</Label>
              <p className="text-sm text-gray-500">
                Permite que usuários se inscrevam no evento
              </p>
            </div>
            <Switch
              id="formulario-ativo"
              checked={formulario.ativo}
              onCheckedChange={(checked) => {
                // Atualizar o formulário localmente
                const novoFormulario = { ...formulario, ativo: checked };
                setFormulario(novoFormulario);
              }}
            />
          </div>

          {formulario.ativo && (
            <>
              <Separator />
              
              {/* Limite de vagas */}
              <div className="space-y-2">
                <Label htmlFor="limite-vagas">Limite de vagas</Label>
                <Input
                  id="limite-vagas"
                  type="number"
                  min="1"
                  value={formulario.limite_vagas || ''}
                  onChange={(e) => {
                    const valor = e.target.value ? parseInt(e.target.value) : null;
                    setFormulario({ ...formulario, limite_vagas: valor });
                  }}
                  placeholder={capacidadeSala ? `Capacidade da sala: ${capacidadeSala}` : 'Ex: 50'}
                />
                {capacidadeSala && !formulario.limite_vagas && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormulario({ ...formulario, limite_vagas: capacidadeSala })}
                  >
                    Usar capacidade da sala ({capacidadeSala})
                  </Button>
                )}
                <p className="text-xs text-gray-500">
                  Deixe vazio para permitir inscrições ilimitadas
                </p>
              </div>

              {/* Lista de espera */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="lista-espera">Aceitar lista de espera</Label>
                  <p className="text-sm text-gray-500">
                    Quando as vagas esgotarem, usuários podem entrar na lista de espera
                  </p>
                </div>
                <Switch
                  id="lista-espera"
                  checked={formulario.aceita_lista_espera}
                  onCheckedChange={(checked) => {
                    setFormulario({ ...formulario, aceita_lista_espera: checked });
                  }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Campos Personalizados */}
      {formulario.ativo && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Campos Personalizados</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Ocultar' : 'Preview'}
                </Button>
                <Dialog open={showAddCampo} onOpenChange={setShowAddCampo}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Campo
                    </Button>
                  </DialogTrigger>
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
                            <SelectItem value="text">Texto Curto</SelectItem>
                            <SelectItem value="textarea">Texto Longo</SelectItem>
                            <SelectItem value="select">Múltipla Escolha</SelectItem>
                            <SelectItem value="checkbox">Sim/Não</SelectItem>
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {formulario.campos_personalizados.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum campo personalizado adicionado.</p>
                <p className="text-sm">Clique em "Adicionar Campo" para começar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formulario.campos_personalizados.map((campo, index) => (
                  <div key={campo.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{campo.label}</span>
                        {campo.obrigatorio && (
                          <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {campo.tipo === 'text' && 'Texto'}
                          {campo.tipo === 'textarea' && 'Texto Longo'}
                          {campo.tipo === 'select' && 'Múltipla Escolha'}
                          {campo.tipo === 'checkbox' && 'Sim/Não'}
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
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCampoPersonalizado(campo.id)}
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
                  <div>
                    <Label>Nome Completo *</Label>
                    <Input placeholder="Seu nome completo" disabled />
                  </div>
                  
                  <div>
                    <Label>Email *</Label>
                    <Input placeholder="seu.email@exemplo.com" disabled />
                  </div>
                  
                  <div>
                    <Label>Curso</Label>
                    <Input placeholder="Ex: Engenharia de Computação" disabled />
                  </div>
                  
                  <div>
                    <Label>Semestre</Label>
                    <Input type="number" placeholder="Ex: 5" disabled />
                  </div>

                  {formulario.campos_personalizados.map((campo) => (
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
      )}

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Configuração'}
        </Button>
      </div>
    </div>
  );
}
