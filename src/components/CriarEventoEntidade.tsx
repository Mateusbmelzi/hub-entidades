import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar, MapPin, Users, Plus, Target, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateEventoAsEntity } from '@/hooks/useCreateEventoAsEntity';
import { useEntityAuth } from '@/hooks/useEntityAuth';
import { supabase } from '@/integrations/supabase/client';
import { AREAS_ATUACAO } from '@/lib/constants';
import { PalestranteEvento, TipoEvento, TIPO_EVENTO_LABELS } from '@/types/evento';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { TemplateFormulario } from '@/types/template-formulario';
import { TemplatePreview } from '@/components/TemplatePreview';
import { CriarEditarTemplate } from '@/components/CriarEditarTemplate';

interface CriarEventoEntidadeProps {
  onSuccess?: () => void;
}

export default function CriarEventoEntidade({ onSuccess }: CriarEventoEntidadeProps) {
  console.log('🚀 CriarEventoEntidade component rendering...');
  
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [link_evento, setLinkevento] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [tipoEvento, setTipoEvento] = useState<TipoEvento | ''>('');
  const [palestrantes, setPalestrantes] = useState<PalestranteEvento[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [open, setOpen] = useState(false);
  const [showNameWarning, setShowNameWarning] = useState(false);
  const [pendingEventData, setPendingEventData] = useState<any>(null);
  const [precisaReserva, setPrecisaReserva] = useState(true);
  const [configurarFormularioAgora, setConfigurarFormularioAgora] = useState(false);
  const [eventoIdCriado, setEventoIdCriado] = useState<string | null>(null);
  const [mostrarConfigFormulario, setMostrarConfigFormulario] = useState(false);
  const [templateSelecionado, setTemplateSelecionado] = useState<string>('padrao');
  const [mostrarDialogNovoTemplate, setMostrarDialogNovoTemplate] = useState(false);
  const [templatesCriados, setTemplatesCriados] = useState<TemplateFormulario[]>([]);
  const { createEvento, loading } = useCreateEventoAsEntity();
  const { entidadeId, isAuthenticated } = useEntityAuth();
  const { toast } = useToast();

  // Debug logs (comentados para reduzir spam)
  // console.log('🔍 CriarEventoEntidade Debug:', {
  //   entidadeId,
  //   isAuthenticated,
  //   open,
  //   loading,
  //   tipoEvento,
  //   palestrantes,
  //   observacoes,
  //   configurarFormularioAgora
  // });

  // Carregar áreas de atuação da entidade quando o componente montar
  useEffect(() => {
    const loadEntidadeAreas = async () => {
      if (!entidadeId) return;
      
      try {
        const { data, error } = await supabase
          .from('entidades')
          .select('area_atuacao')
          .eq('id', entidadeId)
          .single();
        
        if (error) throw error;
        
        // Presetar com as áreas da entidade
        if (data?.area_atuacao && Array.isArray(data.area_atuacao)) {
          setSelectedAreas(data.area_atuacao);
        }
      } catch (err) {
        console.error('Erro ao carregar áreas da entidade:', err);
      }
    };

    loadEntidadeAreas();
  }, [entidadeId]);

  // Buscar templates da entidade
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!entidadeId) return;
      
      try {
        const { data, error } = await supabase
          .from('templates_formularios')
          .select('*')
          .eq('entidade_id', entidadeId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setTemplatesCriados(data);
        }
      } catch (err) {
        console.error('Erro ao carregar templates da entidade:', err);
      }
    };

    fetchTemplates();
  }, [entidadeId]);

  // Handler para seleção "Criar Novo Template"
  useEffect(() => {
    if (templateSelecionado === 'criar-novo') {
      setMostrarDialogNovoTemplate(true);
    }
  }, [templateSelecionado]);

  // Callback ao criar novo template
  const handleNovoTemplateCriado = (novoTemplate: TemplateFormulario) => {
    setTemplatesCriados([novoTemplate, ...templatesCriados]);
    setTemplateSelecionado(novoTemplate.id);
    setMostrarDialogNovoTemplate(false);
    
    toast({
      title: 'Template criado!',
      description: `Template "${novoTemplate.nome_template}" foi criado e selecionado.`
    });
  };

  // Função para testar a conexão com o banco
  const testDatabaseConnection = async () => {
    try {
      console.log('🧪 Testando conexão com banco...');
      
      // Teste 1: Verificar se a tabela eventos existe
      const { data: eventos, error: eventosError } = await supabase
        .from('eventos')
        .select('count')
        .limit(1);
      
      console.log('📊 Teste tabela eventos:', { eventos, eventosError });
      
      // Teste 2: Verificar se a função RPC existe
      const { data: rpcTest, error: rpcError } = await supabase.rpc('create_event_as_entity_pending', {
        _entidade_id: 1,
        _nome: 'TESTE',
        _data_evento: new Date().toISOString(),
        _descricao: 'Teste de função',
        _local: 'Teste',
        _capacidade: 10,
        _link_evento: ''
      });
      
      console.log('📊 Teste RPC:', { rpcTest, rpcError });
      
    } catch (error) {
      console.error('❌ Erro no teste de conexão:', error);
    }
  };

  // Função para testar inserção direta
  const testDirectInsert = async () => {
    if (!entidadeId) {
      console.error('❌ entidadeId não encontrado para teste');
      return;
    }

    try {
      console.log('🧪 Testando inserção direta na tabela eventos...');
      
      const testData = {
        entidade_id: entidadeId,
        nome: 'TESTE INSERÇÃO DIRETA',
        descricao: 'Teste de inserção direta',
        local: 'Local de teste',
        data: '2024-12-25',
        horario: '14:30',
        status_aprovacao: 'pendente', // Campo correto para aprovação
        link_evento: '' // Campo obrigatório
      };

      console.log('📝 Dados de teste:', testData);

      const { data: insertResult, error: insertError } = await supabase
        .from('eventos')
        .insert(testData)
        .select('id, nome, status')
        .single();

      if (insertError) {
        console.error('❌ Erro na inserção de teste:', insertError);
        console.error('🔍 Detalhes do erro:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
      } else {
        console.log('✅ Inserção de teste bem-sucedida:', insertResult);
        
        // Limpar o teste
        const { error: deleteError } = await supabase
          .from('eventos')
          .delete()
          .eq('id', insertResult.id);
        
        if (deleteError) {
          console.error('⚠️ Erro ao limpar teste:', deleteError);
        } else {
          console.log('🧹 Teste limpo com sucesso');
        }
      }
    } catch (error) {
      console.error('❌ Erro inesperado no teste:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 Submetendo formulário de evento:', {
      entidadeId,
      nome,
      descricao,
      local,
      capacidade,
      link_evento,
      selectedAreas
    });
    
    if (!entidadeId) {
      console.error('❌ entidadeId não encontrado');
      // Testar conexão com banco para debug
      await testDatabaseConnection();
      return;
    }

    // Validar campos obrigatórios
    if (!nome.trim()) {
      console.error('❌ Nome é obrigatório');
      return;
    }

    if (!descricao.trim()) {
      console.error('❌ Descrição é obrigatória');
      return;
    }

    // Local só é obrigatório para eventos online/externos
    if (!precisaReserva && !local.trim()) {
      console.error('❌ Local é obrigatório para eventos online/externos');
      return;
    }

    console.log('✅ Validações passaram');

    const eventData = {
      nome,
      descricao,
      local: precisaReserva ? 'A definir (será definido pela reserva)' : local, // Local vazio para eventos presenciais
      data_evento: null, // Data será definida pela reserva quando necessário
      capacidade: capacidade ? parseInt(capacidade) : undefined,
      area_atuacao: selectedAreas,
      tipo_evento: tipoEvento || null,
      palestrantes_convidados: palestrantes,
      observacoes: observacoes || null
    };

    // console.log('🚀 Chamando createEvento com:', eventData);
    // console.log('🔍 Debug tipoEvento:', {
    //   tipoEvento,
    //   tipoEventoValue: tipoEvento || 'undefined',
    //   isEmpty: !tipoEvento,
    //   eventDataTipoEvento: eventData.tipo_evento
    // });

    try {
      const result = await createEvento(entidadeId, eventData);
      console.log('📊 Resultado createEvento:', result);

      if (result.success) {
        console.log('✅ Evento criado com sucesso!');
        
        // Se optou por configurar formulário, criar automaticamente
        if (configurarFormularioAgora && entidadeId && result.data?.id) {
          try {
            let templateParaAplicar = null;
            
            if (templateSelecionado === 'padrao') {
              // Buscar template padrão
              const { data } = await supabase
                .from('templates_formularios')
                .select('*')
                .is('entidade_id', null)
                .eq('nome_template', 'Template Padrão')
                .single();
              templateParaAplicar = data;
            } else {
              // Buscar template selecionado
              const { data } = await supabase
                .from('templates_formularios')
                .select('*')
                .eq('id', templateSelecionado)
                .single();
              templateParaAplicar = data;
            }
            
            const formularioData = {
              evento_id: result.data.id,
              entidade_id: entidadeId,
              ativo: false,
              limite_vagas: templateParaAplicar?.usa_limite_sala 
                ? (capacidade ? parseInt(capacidade) : null)
                : templateParaAplicar?.limite_vagas_customizado,
              aceita_lista_espera: templateParaAplicar?.aceita_lista_espera || false,
              campos_basicos_visiveis: templateParaAplicar?.campos_basicos_visiveis || 
                ['nome_completo', 'email', 'curso', 'semestre'],
              campos_personalizados: templateParaAplicar?.campos_personalizados || [],
              template_id: templateParaAplicar?.id || null
            };

            const { error: formError } = await supabase
              .from('formularios_inscricao')
              .insert(formularioData);

            if (formError) {
              console.error('❌ Erro ao criar formulário:', formError);
            } else {
              console.log('✅ Formulário criado com template selecionado');
              
              // Atualizar coluna formulario_ativo na tabela eventos
              const { error: eventoError } = await supabase
                .from('eventos')
                .update({
                  formulario_ativo: formularioData.ativo,
                  limite_vagas: formularioData.limite_vagas
                })
                .eq('id', result.data.id);

              if (eventoError) {
                console.error('❌ Erro ao atualizar formulario_ativo no evento:', eventoError);
              } else {
                console.log('✅ Campo formulario_ativo atualizado no evento');
              }
            }
          } catch (error) {
            console.error('❌ Erro ao criar formulário:', error);
            // Não falhar a criação do evento se o formulário falhar
          }
        }
        
        toast({
          title: 'Evento criado com sucesso!',
          description: configurarFormularioAgora 
            ? 'Evento criado e formulário de inscrição configurado com template padrão.'
            : 'Evento criado. Você pode configurar o formulário de inscrição depois.',
        });
        
        resetForm();
        onSuccess?.();
      } else if (result.nameExists) {
        console.log('⚠️ Nome do evento já existe, mostrando diálogo');
        setPendingEventData(eventData);
        setShowNameWarning(true);
      } else {
        console.error('❌ Falha ao criar evento:', result.error);
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao criar evento:', error);
    }
  };

  const handleForceCreate = async () => {
    if (!entidadeId || !pendingEventData) return;
    
    const result = await createEvento(entidadeId, pendingEventData, true);
    
    if (result.success) {
      resetForm();
      setShowNameWarning(false);
      setPendingEventData(null);
      onSuccess?.();
    }
  };

  const resetForm = () => {
    setNome('');
    setDescricao('');
    setLocal('');
    setCapacidade('');
    setSelectedAreas([]);
    setTipoEvento('');
    setPalestrantes([]);
    setObservacoes('');
    setConfigurarFormularioAgora(false);
    setTemplateSelecionado('padrao');
    setOpen(false);
  };

  const handleButtonClick = () => {
    console.log('🔘 Botão "Criar Evento" clicado');
    console.log('🔍 Estado atual:', {
      entidadeId,
      isAuthenticated,
      open
    });
  };

  const addAreaAtuacao = (area: string) => {
    if (!selectedAreas.includes(area)) {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const removeAreaAtuacao = (areaToRemove: string) => {
    setSelectedAreas(selectedAreas.filter(area => area !== areaToRemove));
  };


  return (
    <>
      <AlertDialog open={showNameWarning} onOpenChange={setShowNameWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Evento com nome duplicado</AlertDialogTitle>
            <AlertDialogDescription>
              Já existe um evento com o nome "{pendingEventData?.nome}" nesta entidade. 
              Deseja criar mesmo assim um segundo evento com o mesmo nome?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowNameWarning(false);
              setPendingEventData(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleForceCreate}>
              Criar mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            className="flex items-center gap-2"
            onClick={handleButtonClick}
          >
            <Plus className="h-4 w-4" />
            Criar Evento
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Criar Novo Evento
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do evento que você deseja criar para sua entidade
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Evento</Label>
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Workshop de React"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o evento, objetivos e o que os participantes podem esperar..."
                rows={4}
                required
              />
            </div>

            {/* Tipo de Evento */}
            <div className="space-y-2">
              <Label htmlFor="tipo-evento">Tipo de Evento</Label>
              <Select value={tipoEvento} onValueChange={(value) => setTipoEvento(value as TipoEvento)}>
                <SelectTrigger id="tipo-evento">
                  <SelectValue placeholder="Selecione o tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_EVENTO_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Categorize seu evento para melhor organização
              </p>
            </div>

            {/* Palestrantes/Convidados - reutilizar componente existente */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Professores/Palestrantes Convidados
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const novoPalestrante: PalestranteEvento = {
                      id: `prof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                      nomeCompleto: '',
                      apresentacao: '',
                      ehPessoaPublica: false,
                      haApoioExterno: false,
                      comoAjudaraOrganizacao: ''
                    };
                    setPalestrantes([...palestrantes, novoPalestrante]);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Professor
                </Button>
              </div>

              {palestrantes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum professor convidado adicionado</p>
                  <p className="text-sm">Clique em "Adicionar Professor" para começar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {palestrantes.map((palestrante, index) => (
                    <Card key={palestrante.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Professor {index + 1}
                          </CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setPalestrantes(palestrantes.filter(p => p.id !== palestrante.id))}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            ×
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`nome_${palestrante.id}`}>
                            Nome Completo do Professor/Palestrante *
                          </Label>
                          <Input
                            id={`nome_${palestrante.id}`}
                            value={palestrante.nomeCompleto}
                            onChange={(e) => {
                              setPalestrantes(palestrantes.map(p => 
                                p.id === palestrante.id ? { ...p, nomeCompleto: e.target.value } : p
                              ));
                            }}
                            placeholder="Ex: Dr. Maria Silva Santos"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`apresentacao_${palestrante.id}`}>
                            Breve Apresentação do Convidado *
                          </Label>
                          <Textarea
                            id={`apresentacao_${palestrante.id}`}
                            rows={3}
                            value={palestrante.apresentacao}
                            onChange={(e) => {
                              setPalestrantes(palestrantes.map(p => 
                                p.id === palestrante.id ? { ...p, apresentacao: e.target.value } : p
                              ));
                            }}
                            placeholder="Ex: Professor de Ciência da Computação na USP, especialista em Machine Learning..."
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Observações (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Informações adicionais sobre o evento..."
                rows={3}
              />
            </div>

            {/* Opção de evento sem reserva */}
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="precisa-reserva" className="text-blue-900 font-medium">
                      Este evento precisa de espaço físico no Insper?
                    </Label>
                    <p className="text-sm text-blue-700 mt-1">
                      {precisaReserva 
                        ? 'Local, data e horário serão definidos pela reserva. Você poderá vincular após aprovação.'
                        : 'Evento será criado como online/externo. Preencha o local (ex: Zoom, Google Meet).'
                      }
                    </p>
                  </div>
                  <Switch
                    id="precisa-reserva"
                    checked={precisaReserva}
                    onCheckedChange={setPrecisaReserva}
                  />
                </div>
              </div>
            </div>

            {/* Local - apenas para eventos online/externos */}
            {!precisaReserva && (
              <div className="space-y-2">
                <Label htmlFor="local" className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  Local (Link ou Plataforma)
                </Label>
                <Input
                  id="local"
                  type="text"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  placeholder="Ex: Zoom, Google Meet, YouTube Live"
                  required={!precisaReserva}
                />
                <p className="text-xs text-gray-500">
                  Para eventos online, informe a plataforma ou link
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="capacidade" className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                Capacidade (opcional)
              </Label>
              <Input
                id="capacidade"
                type="number"
                value={capacidade}
                onChange={(e) => setCapacidade(e.target.value)}
                placeholder="Ex: 50"
                min="1"
              />
              <p className="text-xs text-gray-500">
                Para eventos presenciais, a capacidade será definida pela sala reservada
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area-atuacao" className="flex items-center">
                <Target className="mr-1 h-4 w-4" />
                Áreas de Atuação
              </Label>
              
              {/* Áreas disponíveis como checkboxes */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                {AREAS_ATUACAO.map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`area-${area}`}
                      checked={selectedAreas.includes(area)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          addAreaAtuacao(area);
                        } else {
                          removeAreaAtuacao(area);
                        }
                      }}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor={`area-${area}`} className="text-sm text-gray-700">
                      {area}
                    </label>
                  </div>
                ))}
              </div>

              {/* Áreas selecionadas como badges */}
              {selectedAreas.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">
                    Áreas selecionadas ({selectedAreas.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAreas.map((area) => (
                      <div
                        key={area}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() => removeAreaAtuacao(area)}
                          className="ml-1 hover:bg-red-200 rounded-full p-0.5 transition-colors"
                          title="Remover área"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Seção de Configuração de Formulário de Inscrição */}
            <Card className="border-2 border-dashed border-gray-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                      Formulário de Inscrição (Opcional)
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Configure como os participantes vão se inscrever no evento
                    </CardDescription>
                  </div>
                  <Switch
                    checked={configurarFormularioAgora}
                    onCheckedChange={setConfigurarFormularioAgora}
                  />
                </div>
              </CardHeader>
              
              {configurarFormularioAgora && (
                <CardContent>
                  {/* Seleção de Template */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-select">Escolher Template</Label>
                      <Select value={templateSelecionado} onValueChange={setTemplateSelecionado}>
                        <SelectTrigger id="template-select">
                          <SelectValue placeholder="Selecione um template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="padrao">Template Padrão (Sistema)</SelectItem>
                          <SelectItem value="criar-novo">➕ Criar Novo Template</SelectItem>
                          {templatesCriados.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.nome_template}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Preview do Template Selecionado */}
                    <TemplatePreview templateId={templateSelecionado} entidadeId={entidadeId || 0} />
                  </div>
                </CardContent>
              )}
            </Card>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Criando...' : 'Criar Evento'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>

            {/* Botões de teste para debug */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Debug (remover em produção):</p>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={testDatabaseConnection}
                  className="text-xs"
                >
                  🧪 Testar Conexão
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={testDirectInsert}
                  className="text-xs"
                >
                  🧪 Testar Inserção
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para criar novo template */}
      <Dialog open={mostrarDialogNovoTemplate} onOpenChange={(open) => {
        setMostrarDialogNovoTemplate(open);
        if (!open && templateSelecionado === 'criar-novo') {
          setTemplateSelecionado('padrao');
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Template de Formulário</DialogTitle>
            <DialogDescription>
              Crie um template reutilizável para formulários de inscrição
            </DialogDescription>
          </DialogHeader>
          
          <CriarEditarTemplate
            entidadeId={entidadeId!}
            onSuccess={handleNovoTemplateCriado}
            onCancel={() => {
              setMostrarDialogNovoTemplate(false);
              setTemplateSelecionado('padrao');
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}