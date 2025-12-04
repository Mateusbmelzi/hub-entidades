import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Users, Plus, X, Crown } from 'lucide-react';
import { useMembrosEntidade } from '@/hooks/useMembrosEntidade';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VincularMembrosProjetoProps {
  projetoId: string;
  entidadeId: number;
  onUpdate?: () => void;
}

interface ProjetoMembro {
  id: string;
  projeto_id: string;
  membro_id: string;
  eh_responsavel: boolean;
  funcao?: string | null;
  membro?: {
    id: string;
    profile?: {
      nome?: string;
      email?: string;
    };
  };
}

export const VincularMembrosProjeto: React.FC<VincularMembrosProjetoProps> = ({
  projetoId,
  entidadeId,
  onUpdate
}) => {
  const { membros, loading: membrosLoading } = useMembrosEntidade({
    entidadeId,
    includeInativos: false,
  });
  const [projetoMembros, setProjetoMembros] = useState<ProjetoMembro[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMembroId, setSelectedMembroId] = useState<string>('');
  const [funcao, setFuncao] = useState<string>('');
  const [ehResponsavel, setEhResponsavel] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  // Carregar membros do projeto
  useEffect(() => {
    const fetchProjetoMembros = async () => {
      try {
        setLoading(true);
        // Buscar projeto_membros com membros_entidade
        const { data: projetoMembrosData, error: projetoMembrosError } = await supabase
          .from('projeto_membros')
          .select(`
            *,
            membro:membros_entidade!inner(
              id,
              user_id
            )
          `)
          .eq('projeto_id', projetoId)
          .order('eh_responsavel', { ascending: false })
          .order('created_at', { ascending: true });

        if (projetoMembrosError) throw projetoMembrosError;

        // Buscar profiles separadamente
        const userIds = (projetoMembrosData || [])
          .map((pm: any) => pm.membro?.user_id)
          .filter(Boolean) as string[];

        let profilesMap = new Map();
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, nome, email')
            .in('id', userIds);

          if (!profilesError && profilesData) {
            profilesMap = new Map(profilesData.map((p: any) => [p.id, p]));
          }
        }

        // Combinar dados
        const membrosComDetalhes = (projetoMembrosData || []).map((pm: any) => ({
          ...pm,
          membro: {
            ...pm.membro,
            profile: pm.membro?.user_id ? profilesMap.get(pm.membro.user_id) : undefined,
          },
        }));

        setProjetoMembros(membrosComDetalhes);
      } catch (error) {
        console.error('Erro ao carregar membros do projeto:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os membros do projeto.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (projetoId) {
      fetchProjetoMembros();
    }
  }, [projetoId, toast]);

  const handleAdicionarMembro = async () => {
    if (!selectedMembroId) {
      toast({
        title: 'Selecione um membro',
        description: 'Por favor, selecione um membro para adicionar ao projeto.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('projeto_membros')
        .insert({
          projeto_id: projetoId,
          membro_id: selectedMembroId,
          eh_responsavel: ehResponsavel,
          funcao: funcao || null,
        });

      if (error) throw error;

      toast({
        title: 'Membro adicionado',
        description: 'O membro foi adicionado ao projeto com sucesso.',
      });

      setSelectedMembroId('');
      setFuncao('');
      setEhResponsavel(false);
      setShowDialog(false);
      
      // Recarregar membros
      const fetchProjetoMembros = async () => {
        const { data: projetoMembrosData, error: projetoMembrosError } = await supabase
          .from('projeto_membros')
          .select(`
            *,
            membro:membros_entidade!inner(
              id,
              user_id
            )
          `)
          .eq('projeto_id', projetoId)
          .order('eh_responsavel', { ascending: false })
          .order('created_at', { ascending: true });

        if (projetoMembrosError) return;

        // Buscar profiles separadamente
        const userIds = (projetoMembrosData || [])
          .map((pm: any) => pm.membro?.user_id)
          .filter(Boolean) as string[];

        let profilesMap = new Map();
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, nome, email')
            .in('id', userIds);

          if (profilesData) {
            profilesMap = new Map(profilesData.map((p: any) => [p.id, p]));
          }
        }

        // Combinar dados
        const membrosComDetalhes = (projetoMembrosData || []).map((pm: any) => ({
          ...pm,
          membro: {
            ...pm.membro,
            profile: pm.membro?.user_id ? profilesMap.get(pm.membro.user_id) : undefined,
          },
        }));

        setProjetoMembros(membrosComDetalhes);
      };
      await fetchProjetoMembros();
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o membro ao projeto.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoverMembro = async (membroId: string) => {
    try {
      const { error } = await supabase
        .from('projeto_membros')
        .delete()
        .eq('projeto_id', projetoId)
        .eq('membro_id', membroId);

      if (error) throw error;

      toast({
        title: 'Membro removido',
        description: 'O membro foi removido do projeto com sucesso.',
      });

      // Recarregar membros
      const fetchProjetoMembros = async () => {
        const { data: projetoMembrosData, error: projetoMembrosError } = await supabase
          .from('projeto_membros')
          .select(`
            *,
            membro:membros_entidade!inner(
              id,
              user_id
            )
          `)
          .eq('projeto_id', projetoId)
          .order('eh_responsavel', { ascending: false })
          .order('created_at', { ascending: true });

        if (projetoMembrosError) return;

        // Buscar profiles separadamente
        const userIds = (projetoMembrosData || [])
          .map((pm: any) => pm.membro?.user_id)
          .filter(Boolean) as string[];

        let profilesMap = new Map();
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, nome, email')
            .in('id', userIds);

          if (profilesData) {
            profilesMap = new Map(profilesData.map((p: any) => [p.id, p]));
          }
        }

        // Combinar dados
        const membrosComDetalhes = (projetoMembrosData || []).map((pm: any) => ({
          ...pm,
          membro: {
            ...pm.membro,
            profile: pm.membro?.user_id ? profilesMap.get(pm.membro.user_id) : undefined,
          },
        }));

        setProjetoMembros(membrosComDetalhes);
      };
      await fetchProjetoMembros();

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o membro do projeto.',
        variant: 'destructive',
      });
    }
  };

  // Membros disponíveis (não já vinculados)
  const membrosDisponiveis = membros.filter(membro => 
    !projetoMembros.some(pm => pm.membro_id === membro.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium">Membros do Projeto</span>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Membro ao Projeto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="membro-select">Membro</Label>
                <Select value={selectedMembroId} onValueChange={setSelectedMembroId}>
                  <SelectTrigger id="membro-select">
                    <SelectValue placeholder="Selecione um membro" />
                  </SelectTrigger>
                  <SelectContent>
                    {membrosDisponiveis.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Nenhum membro disponível
                      </div>
                    ) : (
                      membrosDisponiveis.map((membro) => (
                        <SelectItem key={membro.id} value={membro.id}>
                          {membro.profile?.nome || membro.profile?.email || 'Membro sem nome'}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="funcao-input">Função no Projeto</Label>
                <Input
                  id="funcao-input"
                  placeholder="Ex: Desenvolvedor, Designer, Gerente..."
                  value={funcao}
                  onChange={(e) => setFuncao(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Função ou cargo do membro neste projeto (opcional)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="eh-responsavel"
                  checked={ehResponsavel}
                  onCheckedChange={(checked) => setEhResponsavel(checked === true)}
                />
                <Label
                  htmlFor="eh-responsavel"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <Crown className="h-4 w-4 text-yellow-600" />
                  Membro responsável principal
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => {
                  setShowDialog(false);
                  setSelectedMembroId('');
                  setFuncao('');
                  setEhResponsavel(false);
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleAdicionarMembro}>
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Carregando membros...</div>
      ) : projetoMembros.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-4">
          Nenhum membro vinculado a este projeto ainda.
        </div>
      ) : (
        <div className="space-y-2">
          {projetoMembros.map((pm) => (
            <div
              key={pm.id}
              className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1">
                {pm.eh_responsavel && (
                  <Crown className="h-4 w-4 text-yellow-600" title="Responsável principal" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {pm.membro?.profile?.nome || pm.membro?.profile?.email || 'Membro'}
                  </div>
                  {pm.funcao && (
                    <div className="text-xs text-muted-foreground">
                      {pm.funcao}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleRemoverMembro(pm.membro_id)}
                title="Remover membro"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

