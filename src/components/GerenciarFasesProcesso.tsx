import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Users, CheckCircle, XCircle, FileText, MapPin } from 'lucide-react';
import { useFasesProcesso } from '@/hooks/useFasesProcesso';
import { useTemplatesFormularios } from '@/hooks/useTemplatesFormularios';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { FaseProcessoSeletivo } from '@/types/processo-seletivo';
import { VincularReservasFase } from '@/components/VincularReservasFase';

interface GerenciarFasesProcessoProps {
  entidadeId: number;
}

interface CardFaseProps {
  fase: FaseProcessoSeletivo;
  datasEditadas: Record<string, { data_inicio: string; data_fim: string }>;
  onAtualizarData: (faseId: string, campo: 'data_inicio' | 'data_fim', valor: string) => void;
  onSalvarDatas: (fase: FaseProcessoSeletivo) => Promise<void>;
  onDeletar: (fase: FaseProcessoSeletivo) => void;
  validarPeriodoProcesso: (dataInicio: string, dataFim: string) => string | null;
  validarSequenciaFases: (ordem: number, dataInicio: string, faseIdExcluir?: string) => string | null;
  fases: FaseProcessoSeletivo[];
}

function CardFase({ 
  fase, 
  datasEditadas, 
  onAtualizarData, 
  onSalvarDatas, 
  onDeletar,
  validarPeriodoProcesso,
  validarSequenciaFases,
  fases
}: CardFaseProps) {
  const { toast } = useToast();
  const dataInicioEdit = datasEditadas[fase.id]?.data_inicio ?? (fase.data_inicio ? format(new Date(fase.data_inicio), 'yyyy-MM-dd') : '');
  const dataFimEdit = datasEditadas[fase.id]?.data_fim ?? (fase.data_fim ? format(new Date(fase.data_fim), 'yyyy-MM-dd') : '');

  const handleAtualizarData = (campo: 'data_inicio' | 'data_fim', valor: string) => {
    onAtualizarData(fase.id, campo, valor);
  };

  const handleSalvarDatas = async () => {
    const novaDataInicio = datasEditadas[fase.id]?.data_inicio ?? dataInicioEdit;
    const novaDataFim = datasEditadas[fase.id]?.data_fim ?? dataFimEdit;

    if (!novaDataInicio || !novaDataFim) {
      toast({
        title: 'Erro',
        description: 'As datas de início e fim são obrigatórias.',
        variant: 'destructive',
      });
      return;
    }

    // Validar período do processo seletivo
    const erroPeriodo = validarPeriodoProcesso(novaDataInicio, novaDataFim);
    if (erroPeriodo) {
      toast({
        title: 'Erro de validação',
        description: erroPeriodo,
        variant: 'destructive',
      });
      return;
    }

    // Validar sequência de fases
    const erroSequencia = validarSequenciaFases(fase.ordem, novaDataInicio, fase.id);
    if (erroSequencia) {
      toast({
        title: 'Erro de validação',
        description: erroSequencia,
        variant: 'destructive',
      });
      return;
    }

    await onSalvarDatas({
      ...fase,
      data_inicio: novaDataInicio,
      data_fim: novaDataFim,
    } as FaseProcessoSeletivo);
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{fase.nome}</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDeletar(fase)}
            disabled={fase.ordem === 1}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Reservas Vinculadas */}
        {fase.presencial && fase.reservas && fase.reservas.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-muted-foreground">Reservas Vinculadas:</div>
            {fase.reservas.map(reserva => (
              <div key={reserva.id} className="text-sm bg-gray-50 p-3 rounded border">
                {reserva.sala_nome && (
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {reserva.sala_nome}
                      {reserva.sala_predio && ` - ${reserva.sala_predio}`}
                      {reserva.sala_andar && ` - ${reserva.sala_andar}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(reserva.data_reserva), "dd/MM/yyyy", { locale: ptBR })}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{reserva.horario_inicio} - {reserva.horario_termino}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Configuração de Datas */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-muted-foreground">Período da Fase:</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`inicio-${fase.id}`} className="text-xs">Data de Início</Label>
              <Input
                id={`inicio-${fase.id}`}
                type="date"
                value={dataInicioEdit}
                onChange={(e) => handleAtualizarData('data_inicio', e.target.value)}
                onBlur={handleSalvarDatas}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor={`fim-${fase.id}`} className="text-xs">Data de Fim</Label>
              <Input
                id={`fim-${fase.id}`}
                type="date"
                value={dataFimEdit}
                onChange={(e) => handleAtualizarData('data_fim', e.target.value)}
                onBlur={handleSalvarDatas}
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GerenciarFasesProcesso({ entidadeId }: GerenciarFasesProcessoProps) {
  const { fases, loading, criarFase, atualizarFase, deletarFase, refetch } = useFasesProcesso(entidadeId);
  const { getTemplatesByTipoProcessoSeletivo } = useTemplatesFormularios(entidadeId);
  const { toast } = useToast();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [faseParaEditar, setFaseParaEditar] = useState<FaseProcessoSeletivo | null>(null);
  const [faseParaDeletar, setFaseParaDeletar] = useState<FaseProcessoSeletivo | null>(null);
  const [faseParaGerenciarReservas, setFaseParaGerenciarReservas] = useState<FaseProcessoSeletivo | null>(null);
  const [dadosEntidade, setDadosEntidade] = useState<{
    abertura_processo_seletivo?: string | null;
    fechamento_processo_seletivo?: string | null;
  } | null>(null);
  
  const [datasEditadas, setDatasEditadas] = useState<Record<string, { data_inicio: string; data_fim: string }>>({});
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'outro' as const,
    ordem: 1,
    data_inicio: '',
    data_fim: '',
    ativa: true,
    presencial: false,
    template_formulario_id: undefined as string | undefined,
    criterios_aprovacao: { tipo: 'manual' as const, regras: {} }
  });

  // Buscar dados da entidade para validações
  useEffect(() => {
    const fetchDadosEntidade = async () => {
      const { data, error } = await supabase
        .from('entidades')
        .select('abertura_processo_seletivo, fechamento_processo_seletivo')
        .eq('id', entidadeId)
        .single();

      if (!error && data) {
        setDadosEntidade(data);
      }
    };

    if (entidadeId) {
      fetchDadosEntidade();
    }
  }, [entidadeId]);
  
  const templatesProcessoSeletivo = getTemplatesByTipoProcessoSeletivo();

  // Validar se a fase está dentro do período do processo seletivo
  const validarPeriodoProcesso = (dataInicio: string, dataFim: string): string | null => {
    if (!dadosEntidade?.abertura_processo_seletivo || !dadosEntidade?.fechamento_processo_seletivo) {
      return 'O período do processo seletivo (abertura e fechamento) deve estar configurado antes de criar fases.';
    }

    const aberturaProcesso = new Date(dadosEntidade.abertura_processo_seletivo);
    const fechamentoProcesso = new Date(dadosEntidade.fechamento_processo_seletivo);
    const inicioFase = new Date(dataInicio);
    const fimFase = new Date(dataFim);

    // Zerar horas para comparar apenas datas
    aberturaProcesso.setHours(0, 0, 0, 0);
    fechamentoProcesso.setHours(23, 59, 59, 999);
    inicioFase.setHours(0, 0, 0, 0);
    fimFase.setHours(23, 59, 59, 999);

    if (inicioFase < aberturaProcesso || fimFase > fechamentoProcesso) {
      return `A fase deve estar dentro do período do processo seletivo (${format(aberturaProcesso, 'dd/MM/yyyy', { locale: ptBR })} a ${format(fechamentoProcesso, 'dd/MM/yyyy', { locale: ptBR })}).`;
    }

    return null;
  };

  // Validar se a fase não começa antes da anterior terminar
  const validarSequenciaFases = (ordem: number, dataInicio: string, faseIdExcluir?: string): string | null => {
    if (ordem === 1) {
      // Primeira fase não precisa validar sequência
      return null;
    }

    const fasesOrdenadas = [...fases]
      .filter(f => f.id !== faseIdExcluir) // Excluir a fase sendo editada
      .sort((a, b) => a.ordem - b.ordem);

    const faseAnterior = fasesOrdenadas.find(f => f.ordem === ordem - 1);

    if (!faseAnterior) {
      return null; // Se não há fase anterior, não há problema
    }

    if (!faseAnterior.data_fim) {
      return `A fase anterior (${faseAnterior.nome}) precisa ter uma data de fim definida antes de criar uma nova fase.`;
    }

    const fimFaseAnterior = new Date(faseAnterior.data_fim);
    const inicioNovaFase = new Date(dataInicio);

    // Zerar horas para comparar apenas datas
    fimFaseAnterior.setHours(23, 59, 59, 999);
    inicioNovaFase.setHours(0, 0, 0, 0);

    if (inicioNovaFase < fimFaseAnterior) {
      return `A fase não pode começar antes que a fase anterior (${faseAnterior.nome}) termine. A fase anterior termina em ${format(fimFaseAnterior, 'dd/MM/yyyy', { locale: ptBR })}.`;
    }

    return null;
  };

  const handleCreateFase = async () => {
    if (!formData.data_inicio || !formData.data_fim) {
      toast({
        title: 'Erro',
        description: 'As datas de início e fim são obrigatórias.',
        variant: 'destructive',
      });
      return;
    }

    // Validar período do processo seletivo
    const erroPeriodo = validarPeriodoProcesso(formData.data_inicio, formData.data_fim);
    if (erroPeriodo) {
      toast({
        title: 'Erro de validação',
        description: erroPeriodo,
        variant: 'destructive',
      });
      return;
    }

    // Validar sequência de fases
    const erroSequencia = validarSequenciaFases(formData.ordem, formData.data_inicio);
    if (erroSequencia) {
      toast({
        title: 'Erro de validação',
        description: erroSequencia,
        variant: 'destructive',
      });
      return;
    }

    const result = await criarFase(formData);
    if (result.success) {
      setShowCreateDialog(false);
      resetForm();
    }
  };

  const handleUpdateFase = async () => {
    if (!faseParaEditar) return;

    if (!formData.data_inicio || !formData.data_fim) {
      toast({
        title: 'Erro',
        description: 'As datas de início e fim são obrigatórias.',
        variant: 'destructive',
      });
      return;
    }

    // Validar período do processo seletivo
    const erroPeriodo = validarPeriodoProcesso(formData.data_inicio, formData.data_fim);
    if (erroPeriodo) {
      toast({
        title: 'Erro de validação',
        description: erroPeriodo,
        variant: 'destructive',
      });
      return;
    }

    // Validar sequência de fases (excluindo a fase sendo editada)
    const erroSequencia = validarSequenciaFases(formData.ordem, formData.data_inicio, faseParaEditar.id);
    if (erroSequencia) {
      toast({
        title: 'Erro de validação',
        description: erroSequencia,
        variant: 'destructive',
      });
      return;
    }
    
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
      presencial: false,
      template_formulario_id: undefined,
      criterios_aprovacao: { tipo: 'manual', regras: {} }
    });
  };

  const handleAtualizarData = (faseId: string, campo: 'data_inicio' | 'data_fim', valor: string) => {
    setDatasEditadas(prev => {
      const fase = fases.find(f => f.id === faseId);
      if (!fase) return prev;
      
      const estadoAtual = prev[faseId];
      const dataInicioBase = estadoAtual?.data_inicio ?? (fase.data_inicio ? format(new Date(fase.data_inicio), 'yyyy-MM-dd') : '');
      const dataFimBase = estadoAtual?.data_fim ?? (fase.data_fim ? format(new Date(fase.data_fim), 'yyyy-MM-dd') : '');
      
      return {
        ...prev,
        [faseId]: {
          data_inicio: dataInicioBase,
          data_fim: dataFimBase,
          [campo]: valor
        }
      };
    });
  };

  const handleSalvarDatas = async (faseAtualizada: FaseProcessoSeletivo) => {
    const result = await atualizarFase(faseAtualizada.id, faseAtualizada);
    
    if (result.success) {
      // Limpar estado de edição após salvar
      setDatasEditadas(prev => {
        const novo = { ...prev };
        delete novo[faseAtualizada.id];
        return novo;
      });
      refetch();
    }
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
      presencial: fase.presencial || false,
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

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="presencial"
                      checked={formData.presencial}
                      onChange={(e) => setFormData({ ...formData, presencial: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="presencial">Fase presencial</Label>
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
                <CardFase
                  key={fase.id}
                  fase={fase}
                  datasEditadas={datasEditadas}
                  onAtualizarData={handleAtualizarData}
                  onSalvarDatas={handleSalvarDatas}
                  onDeletar={setFaseParaDeletar}
                  validarPeriodoProcesso={validarPeriodoProcesso}
                  validarSequenciaFases={validarSequenciaFases}
                  fases={fases}
                />
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-presencial"
                checked={formData.presencial}
                onChange={(e) => setFormData({ ...formData, presencial: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit-presencial">Fase presencial</Label>
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

      {/* Dialog de Gerenciamento de Reservas */}
      {faseParaGerenciarReservas && (
        <VincularReservasFase
          faseId={faseParaGerenciarReservas.id}
          entidadeId={entidadeId}
          isOpen={!!faseParaGerenciarReservas}
          onClose={() => setFaseParaGerenciarReservas(null)}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
}
