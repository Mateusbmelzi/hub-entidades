import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EntityCredential {
  id: string;
  entidade_id: number;
  username: string;
  password_hash: string;
  created_at: string;
  last_login: string | null;
  entidade_nome?: string;
}

interface Entidade {
  id: number;
  nome: string;
}

const AdminCredenciais = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();

  const [credentials, setCredentials] = useState<EntityCredential[]>([]);
  const [entidades, setEntidades] = useState<Entidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Form states
  const [selectedEntidadeId, setSelectedEntidadeId] = useState<string>('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/');
      return;
    }
    if (isAdmin) {
      fetchCredentials();
      fetchEntidades();
    }
  }, [isAdmin, roleLoading, navigate]);

  const fetchCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('entidade_credentials')
        .select(`
          *,
          entidades:entidade_id (
            nome
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        ...item,
        entidade_nome: item.entidades?.nome || 'Entidade não encontrada'
      })) || [];

      setCredentials(formattedData);
    } catch (error) {
      console.error('Erro ao carregar credenciais:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar credenciais das entidades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEntidades = async () => {
    try {
      const { data, error } = await supabase
        .from('entidades')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setEntidades(data || []);
    } catch (error) {
      console.error('Erro ao carregar entidades:', error);
    }
  };

  const createCredential = async () => {
    if (!selectedEntidadeId || !username || !password) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    setFormLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('entidade_credentials')
        .insert({
          entidade_id: parseInt(selectedEntidadeId),
          username,
          password_hash: password // Em produção, usar hash real
        })
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Credenciais criadas com sucesso",
      });

      setShowCreateDialog(false);
      setSelectedEntidadeId('');
      setUsername('');
      setPassword('');
      fetchCredentials();
    } catch (error: any) {
      setError(error.message || 'Erro ao criar credenciais');
    } finally {
      setFormLoading(false);
    }
  };

  const deleteCredential = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta credencial?')) return;

    try {
      const { error } = await supabase
        .from('entidade_credentials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Credencial removida com sucesso",
      });

      fetchCredentials();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover credencial",
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (roleLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Admin Header */}
      <div className="bg-card border-b border-border mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <span>Dashboard</span>
            <span>/</span>
            <span>Credenciais</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Credenciais de Entidades</h1>
          <p className="text-muted-foreground">Gerencie as credenciais de login das entidades</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Gerenciar Credenciais</h2>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Credencial
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Credencial</DialogTitle>
              <DialogDescription>
                Crie credenciais de login para uma entidade
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="entidade">Entidade</Label>
                <Select value={selectedEntidadeId} onValueChange={setSelectedEntidadeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma entidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {entidades.map(entidade => (
                      <SelectItem key={entidade.id} value={entidade.id.toString()}>
                        {entidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nome de usuário</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: entidade1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite uma senha segura"
                />
              </div>

              <Button 
                onClick={createCredential} 
                disabled={formLoading}
                className="w-full"
              >
                {formLoading ? 'Criando...' : 'Criar Credencial'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credenciais Existentes</CardTitle>
          <CardDescription>
            Lista de todas as credenciais de entidades cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Carregando credenciais...</div>
          ) : credentials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma credencial cadastrada ainda
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Senha</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Último login</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credentials.map((credential) => (
                  <TableRow key={credential.id}>
                    <TableCell className="font-medium">
                      {credential.entidade_nome}
                    </TableCell>
                    <TableCell>{credential.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {showPasswords[credential.id] 
                            ? credential.password_hash 
                            : '••••••••'
                          }
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(credential.id)}
                        >
                          {showPasswords[credential.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(credential.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {credential.last_login 
                        ? new Date(credential.last_login).toLocaleDateString('pt-BR')
                        : 'Nunca'
                      }
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCredential(credential.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCredenciais;