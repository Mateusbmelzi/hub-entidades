import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Entidade {
  id: number;
  nome: string;
}

export default function CriarEvento() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [entidadeId, setEntidadeId] = useState('');
  const [entidades, setEntidades] = useState<Entidade[]>([]);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEntityLeader, isAdmin, entityLeaderships, canCreateEvents } = useUserRole();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!canCreateEvents) {
      toast.error('Você não tem permissão para criar eventos');
      navigate('/');
      return;
    }

    fetchEntidades();
  }, [user, canCreateEvents, navigate]);

  const fetchEntidades = async () => {
    try {
      if (isAdmin) {
        // Admin can create events for any entity
        const { data, error } = await supabase
          .from('entidades')
          .select('id, nome')
          .order('nome');
        
        if (error) throw error;
        setEntidades(data || []);
      } else if (isEntityLeader) {
        // Entity leaders can only create events for their entities
        const { data, error } = await supabase
          .from('entidades')
          .select('id, nome')
          .in('id', entityLeaderships.map(el => el.entidade_id))
          .order('nome');
        
        if (error) throw error;
        setEntidades(data || []);
      }
    } catch (error) {
      console.error('Error fetching entities:', error);
      toast.error('Erro ao carregar entidades');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('eventos')
        .insert({
          nome,
          descricao,
          local,
          data_evento: dataEvento, // Mantemos para compatibilidade com a função RPC
          capacidade: capacidade ? parseInt(capacidade) : null,
          entidade_id: parseInt(entidadeId),
          status: 'ativo'
        });

      if (error) throw error;

      toast.success('Evento criado com sucesso!');
      navigate('/eventos');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Erro ao criar evento');
    }

    setLoading(false);
  };

  if (!canCreateEvents) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para criar eventos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pt-20">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button 
            onClick={() => navigate(-1)} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold mb-2">Criar Novo Evento</h1>
          <p className="text-muted-foreground">
            Preencha as informações do evento que você deseja criar
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Informações do Evento
            </CardTitle>
            <CardDescription>
              Todos os campos são obrigatórios exceto capacidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="entidade">Entidade Organizadora</Label>
                <Select value={entidadeId} onValueChange={setEntidadeId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a entidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {entidades.map((entidade) => (
                      <SelectItem key={entidade.id} value={entidade.id.toString()}>
                        {entidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}