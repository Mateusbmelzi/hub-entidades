import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar, MapPin, Users, Plus } from 'lucide-react';
import { useCreateEventoAsEntity } from '@/hooks/useCreateEventoAsEntity';
import { useEntityAuth } from '@/hooks/useEntityAuth';
import { supabase } from '@/integrations/supabase/client';

interface CriarEventoEntidadeProps {
  onSuccess?: () => void;
}

export default function CriarEventoEntidade({ onSuccess }: CriarEventoEntidadeProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [open, setOpen] = useState(false);
  const [showNameWarning, setShowNameWarning] = useState(false);
  const [pendingEventData, setPendingEventData] = useState<any>(null);
  
  const { createEvento, loading } = useCreateEventoAsEntity();
  const { entidadeId, isAuthenticated } = useEntityAuth();

  // Debug logs
  console.log('🔍 CriarEventoEntidade Debug:', {
    entidadeId,
    isAuthenticated,
    open,
    loading
  });

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
        _capacidade: 10
      });
      
      console.log('📊 Teste RPC:', { rpcTest, rpcError });
      
    } catch (error) {
      console.error('❌ Erro no teste de conexão:', error);
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
      capacidade
    });
    
    if (!entidadeId) {
      console.error('❌ entidadeId não encontrado');
      // Testar conexão com banco para debug
      await testDatabaseConnection();
      return;
    }

    const eventData = {
      nome,
      descricao,
      local,
      data_evento: dataEvento,
      capacidade: capacidade ? parseInt(capacidade) : undefined
    };

    console.log('🚀 Chamando createEvento com:', eventData);

    const result = await createEvento(entidadeId, eventData);

    console.log('📊 Resultado createEvento:', result);

    if (result.success) {
      resetForm();
      onSuccess?.();
    } else if (result.nameExists) {
      setPendingEventData(eventData);
      setShowNameWarning(true);
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

            <div className="space-y-2">
              <Label htmlFor="data-evento">Data e Hora do Evento</Label>
              <Input
                id="data-evento"
                type="datetime-local"
                value={dataEvento}
                onChange={(e) => setDataEvento(e.target.value)}
                required
              />
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
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}