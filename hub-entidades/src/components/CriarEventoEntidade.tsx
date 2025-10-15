import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar, MapPin, Users, Plus, Target } from 'lucide-react';
import { useCreateEventoAsEntity } from '@/hooks/useCreateEventoAsEntity';
import { useEntityAuth } from '@/hooks/useEntityAuth';
import { supabase } from '@/integrations/supabase/client';
import { AREAS_ATUACAO } from '@/lib/constants';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { parseDateTime, validateDateTime } from '@/lib/datetime-input-utils';

interface CriarEventoEntidadeProps {
  onSuccess?: () => void;
}

export default function CriarEventoEntidade({ onSuccess }: CriarEventoEntidadeProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState('');
  const [dataEvento, setDataEvento] = useState(''); // Agora formato DD/MM/AAAA HH:MM
  const [capacidade, setCapacidade] = useState('');
  const [link_evento, setLinkevento] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [dateTimeError, setDateTimeError] = useState('');
  const [open, setOpen] = useState(false);
  const [showNameWarning, setShowNameWarning] = useState(false);
  const [pendingEventData, setPendingEventData] = useState<any>(null);
  const { createEvento, loading } = useCreateEventoAsEntity();
  const { entidadeId, isAuthenticated } = useEntityAuth();

  // Debug logs
  // console.log('🔍 CriarEventoEntidade Debug:', {
  //   entidadeId,
  //   isAuthenticated,
  //   open,
  //   loading
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
      dataEvento,
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

    if (!local.trim()) {
      console.error('❌ Local é obrigatório');
      return;
    }

    // Validar data e hora
    if (!dataEvento.trim()) {
      console.error('❌ Data e hora são obrigatórias');
      setDateTimeError('Data e hora são obrigatórias');
      return;
    }

    const dateValidation = validateDateTime(dataEvento);
    if (!dateValidation.isValid) {
      console.error('❌ Validação de data falhou:', dateValidation.message);
      setDateTimeError(dateValidation.message || 'Data inválida');
      return;
    }
    
    // Converter para Date e depois para ISO string
    const dateTime = parseDateTime(dataEvento);
    if (!dateTime) {
      console.error('❌ Erro ao processar data e hora');
      setDateTimeError('Erro ao processar data e hora');
      return;
    }

    console.log('✅ Validações passaram, data convertida:', dateTime);

    const eventData = {
      nome,
      descricao,
      local,
      data_evento: dateTime.toISOString(), // Converter para formato ISO
      capacidade: capacidade ? parseInt(capacidade) : undefined,
      area_atuacao: selectedAreas
    };

    console.log('🚀 Chamando createEvento com:', eventData);

    try {
      const result = await createEvento(entidadeId, eventData);
      console.log('📊 Resultado createEvento:', result);

      if (result.success) {
        console.log('✅ Evento criado com sucesso!');
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
    setDataEvento('');
    setCapacidade('');
    setSelectedAreas([]);
    setDateTimeError('');
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

  const handleDateTimeChange = (value: string) => {
    setDataEvento(value);
    // Limpar erro quando usuário começar a digitar
    if (dateTimeError) {
      setDateTimeError('');
    }
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="local" className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  Local
                </Label>
                <Input
                  id="local"
                  type="text"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  placeholder="Ex: Auditório A, Online"
                  required
                />
              </div>

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
              </div>
            </div>

            <DateTimeInput
              id="data-evento"
              label="Data e Hora do Evento"
              value={dataEvento}
              onChange={handleDateTimeChange}
              required
              error={dateTimeError}
              placeholder="Ex: 25/12/2024 14:30"
            />

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
    </>
  );
}