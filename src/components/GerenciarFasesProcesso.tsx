import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Users, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useFasesProcesso } from '@/hooks/useFasesProcesso';
import { useTemplatesFormularios } from '@/hooks/useTemplatesFormularios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { FaseProcessoSeletivo } from '@/types/processo-seletivo';

interface GerenciarFasesProcessoProps {
  entidadeId: number;
}

export function GerenciarFasesProcesso({ entidadeId }: GerenciarFasesProcessoProps) {
  const { fases, loading, criarFase, atualizarFase, deletarFase } = useFasesProcesso(entidadeId);
  const { getTemplatesByTipoProcessoSeletivo } = useTemplatesFormularios(entidadeId);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [faseParaEditar, setFaseParaEditar] = useState<FaseProcessoSeletivo | null>(null);
  const [faseParaDeletar, setFaseParaDeletar] = useState<FaseProcessoSeletivo | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'outro' as const,
    ordem: 1,
    data_inicio: '',
    data_fim: '',
    ativa: true,
    template_formulario_id: undefined as string | undefined,
    criterios_aprovacao: { tipo: 'manual' as const, regras: {} }
  });
  
  const templatesProcessoSeletivo = getTemplatesByTipoProcessoSeletivo();

  const handleCreateFase = async () => {
    const result = await criarFase(formData);
    if (result.success) {
      setShowCreateDialog(false);
      resetForm();
    }
  };

  const handleUpdateFase = async () => {
    if (!faseParaEditar) return;
    
    const result = await atualizarFase(faseParaEditar.id, formData);
    if (result.success) {
      setFaseParaEditar(null);
      resetForm();
    }
  };

  const handleDeleteFase = async () => {
    if (!faseParaDeletar) return;
    
    const result = await deletarFase(faseParaDeletar.id);
    if (result.success) {
      setFaseParaDeletar(null);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      tipo: 'outro',
      ordem: fases.length + 1,
      data_inicio: '',
      data_fim: '',
      ativa: true,
      template_formulario_id: undefined,
      criterios_aprovacao: { tipo: 'manual', regras: {} }
    });
  };

  const openEditDialog = (fase: FaseProcessoSeletivo) => {
    setFaseParaEditar(fase);
    setFormData({
      nome: fase.nome,
      descricao: fase.descricao || '',
      tipo: fase.tipo,
      ordem: fase.ordem,
      data_inicio: fase.data_inicio ? format(new Date(fase.data_inicio), 'yyyy-MM-dd') : '',
      data_fim: fase.data_fim ? format(new Date(fase.data_fim), 'yyyy-MM-dd') : '',
      ativa: fase.ativa,
      template_formulario_id: fase.template_formulario_id,
      criterios_aprovacao: fase.criterios_aprovacao || { tipo: 'manual', regras: {} }
    });
  };

  const getTipoBadge = (tipo: string) => {
    const tipos = {
      triagem: { label: 'Triagem', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      entrevista: { label: 'Entrevista', color: 'bg-green-50 text-green-700 border-green-200' },
      dinamica: { label: 'Dinâmica', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      case: { label: 'Case', color: 'bg-orange-50 text-orange-700 border-orange-200' },
      outro: { label: 'Outro', color: 'bg-gray-50 text-gray-700 border-gray-200' }
    };
    
    const tipoInfo = tipos[tipo as keyof typeof tipos] || tipos.outro;
    return (
      <Badge variant="outline" className={tipoInfo.color}>
        {tipoInfo.label}
      </Badge>
    );
  };

  const getStatusBadge = (fase: FaseProcessoSeletivo) => {
    if (!fase.ativa) {
      return <Badge variant="outline" className="bg-gray-50 text-gray-500"><EyeOff className="w-3 h-3 mr-1" />Inativa</Badge>;
    }
    
    const now = new Date();
    const inicio = fase.data_inicio ? new Date(fase.data_inicio) : null;
    const fim = fase.data_fim ? new Date(fase.data_fim) : null;
    
    if (inicio && now < inicio) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Calendar className="w-3 h-3 mr-1" />Aguardando</Badge>;
    }
    
    if (fim && now > fim) {
      return <Badge variant="outline" className="bg-red-50 text-red-700"><XCircle className="w-3 h-3 mr-1" />Encerrada</Badge>;
    }
    
    return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Ativa</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando fases...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Fases do Processo Seletivo
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie as fases do processo seletivo da sua organização estudantil
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Fase
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Fase</DialogTitle>
                  <DialogDescription>
                    Configure uma nova fase para o processo seletivo
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome da Fase</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Ex: Entrevista Individual"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ordem">Ordem</Label>
                      <Input
                        id="ordem"
                        type="number"
                        value={formData.ordem}
                        onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 1 })}
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descreva o que acontece nesta fase..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo">Tipo de Fase</Label>
                      <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="triagem">Triagem</SelectItem>
                          <SelectItem value="entrevista">Entrevista</SelectItem>
                          <SelectItem value="dinamica">Dinâmica</SelectItem>
                          <SelectItem value="case">Case</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="criterios">Critérios de Aprovação</Label>
                      <Select 
                        value={formData.criterios_aprovacao.tipo} 
                        onValueChange={(value: 'manual' | 'automatico') => 
                          setFormData({ 
                            ...formData, 
                            criterios_aprovacao: { ...formData.criterios_aprovacao, tipo: value }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="automatico">Automático</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="template">Formulário da Fase (opcional)</Label>
                    <Select 
                      value={formData.template_formulario_id || 'none'} 
                      onValueChange={(value) => setFormData({...formData, template_formulario_id: value === 'none' ? undefined : value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sem formulário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum formulário</SelectItem>
                        {templatesProcessoSeletivo.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              <FileText className="h-3 w-3" />
                              {template.nome_template}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.template_formulario_id && (
                      <p className="text-xs text-muted-foreground">
                        O candidato deverá preencher este formulário para avançar nesta fase
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="data_inicio">Data de Início</Label>
                      <Input
                        id="data_inicio"
                        type="date"
                        value={formData.data_inicio}
                        onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="data_fim">Data de Fim</Label>
                      <Input
                        id="data_fim"
                        type="date"
                        value={formData.data_fim}
                        onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="ativa"
                      checked={formData.ativa}
                      onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="ativa">Fase ativa</Label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateFase}>
                    Criar Fase
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {fases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma fase criada ainda. Crie a primeira fase do processo seletivo.
            </div>
          ) : (
            <div className="space-y-4">
              {fases.map((fase) => (
                <div key={fase.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{fase.nome}</h3>
                        {getTipoBadge(fase.tipo)}
                        {getStatusBadge(fase)}
                      </div>
                      
                      {fase.descricao && (
                        <p className="text-sm text-muted-foreground">{fase.descricao}</p>
                      )}
                      
                      {fase.template_formulario_id && (
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <FileText className="h-4 w-4" />
                          <span>Formulário customizado vinculado</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Ordem: {fase.ordem}</span>
                        {fase.data_inicio && (
                          <span>Início: {format(new Date(fase.data_inicio), "dd/MM/yyyy", { locale: ptBR })}</span>
                        )}
                        {fase.data_fim && (
                          <span>Fim: {format(new Date(fase.data_fim), "dd/MM/yyyy", { locale: ptBR })}</span>
                        )}
                        <span>Aprovação: {fase.criterios_aprovacao?.tipo === 'manual' ? 'Manual' : 'Automática'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(fase)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setFaseParaDeletar(fase)}
                        disabled={fase.ordem === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={!!faseParaEditar} onOpenChange={() => setFaseParaEditar(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Fase</DialogTitle>
            <DialogDescription>
              Atualize as informações da fase
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-nome">Nome da Fase</Label>
                <Input
                  id="edit-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-ordem">Ordem</Label>
                <Input
                  id="edit-ordem"
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Textarea
                id="edit-descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-tipo">Tipo de Fase</Label>
                <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="triagem">Triagem</SelectItem>
                    <SelectItem value="entrevista">Entrevista</SelectItem>
                    <SelectItem value="dinamica">Dinâmica</SelectItem>
                    <SelectItem value="case">Case</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-criterios">Critérios de Aprovação</Label>
                <Select 
                  value={formData.criterios_aprovacao.tipo} 
                  onValueChange={(value: 'manual' | 'automatico') => 
                    setFormData({ 
                      ...formData, 
                      criterios_aprovacao: { ...formData.criterios_aprovacao, tipo: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatico">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-template">Formulário da Fase (opcional)</Label>
              <Select 
                value={formData.template_formulario_id || 'none'} 
                onValueChange={(value) => setFormData({...formData, template_formulario_id: value === 'none' ? undefined : value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sem formulário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum formulário</SelectItem>
                  {templatesProcessoSeletivo.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        {template.nome_template}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.template_formulario_id && (
                <p className="text-xs text-muted-foreground">
                  O candidato deverá preencher este formulário para avançar nesta fase
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-data_inicio">Data de Início</Label>
                <Input
                  id="edit-data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-data_fim">Data de Fim</Label>
                <Input
                  id="edit-data_fim"
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-ativa"
                checked={formData.ativa}
                onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit-ativa">Fase ativa</Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setFaseParaEditar(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateFase}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!faseParaDeletar} onOpenChange={() => setFaseParaDeletar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a fase "{faseParaDeletar?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFase}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
