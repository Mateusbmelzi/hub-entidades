import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreVertical, Trash2, UserCog, Search, Users, Calendar } from 'lucide-react';
import { useMembrosEntidade } from '@/hooks/useMembrosEntidade';
import { useCargosEntidade } from '@/hooks/useCargosEntidade';
import { usePermissoesUsuario } from '@/hooks/usePermissoesUsuario';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { MembroEntidadeComDetalhes } from '@/types/membro-entidade';

interface GerenciarMembrosEntidadeProps {
  entidadeId: number;
}

export function GerenciarMembrosEntidade({ entidadeId }: GerenciarMembrosEntidadeProps) {
  const { membros, loading, removeMembro, updateMembroCargo, refetch } = useMembrosEntidade({
    entidadeId,
    includeInativos: false,
  });
  const { cargos } = useCargosEntidade({ entidadeId, enabled: true });
  const { hasPermission } = usePermissoesUsuario({ entidadeId });

  const [membroParaRemover, setMembroParaRemover] = useState<MembroEntidadeComDetalhes | null>(null);
  const [membroParaAlterarCargo, setMembroParaAlterarCargo] = useState<MembroEntidadeComDetalhes | null>(null);
  const [novoCargoId, setNovoCargoId] = useState<string>('');
  const [busca, setBusca] = useState('');
  const [cargoFiltro, setCargoFiltro] = useState<string>('todos');

  const podeGerenciarMembros = hasPermission('gerenciar_membros');

  const membrosFiltrados = useMemo(() => {
    return membros.filter((membro) => {
      const matchBusca =
        !busca ||
        membro.profile?.nome.toLowerCase().includes(busca.toLowerCase()) ||
        membro.profile?.email.toLowerCase().includes(busca.toLowerCase());

      const matchCargo = cargoFiltro === 'todos' || membro.cargo_id === cargoFiltro;

      return matchBusca && matchCargo;
    });
  }, [membros, busca, cargoFiltro]);

  const handleConfirmarRemocao = async () => {
    if (!membroParaRemover) return;

    const result = await removeMembro(membroParaRemover.id);
    if (result.success) {
      setMembroParaRemover(null);
    }
  };

  const handleConfirmarAlterarCargo = async () => {
    if (!membroParaAlterarCargo || !novoCargoId) return;

    const result = await updateMembroCargo(membroParaAlterarCargo.id, novoCargoId);
    if (result.success) {
      setMembroParaAlterarCargo(null);
      setNovoCargoId('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Membros da Organização Estudantil
              </CardTitle>
              <CardDescription>
                Gerencie os membros e seus cargos na organização estudantil
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={cargoFiltro} onValueChange={setCargoFiltro}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os cargos</SelectItem>
                {cargos.map((cargo) => (
                  <SelectItem key={cargo.id} value={cargo.id}>
                    {cargo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de membros */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando membros...</div>
          ) : membrosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {busca || cargoFiltro !== 'todos'
                ? 'Nenhum membro encontrado com os filtros aplicados'
                : 'Nenhum membro cadastrado ainda'}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Data de Entrada</TableHead>
                    {podeGerenciarMembros && <TableHead className="text-right">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membrosFiltrados.map((membro) => (
                    <TableRow key={membro.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{membro.profile?.nome || 'Nome não disponível'}</p>
                          <p className="text-sm text-muted-foreground">{membro.profile?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{
                            backgroundColor: membro.cargo?.cor || '#10b981',
                            color: 'white',
                          }}
                        >
                          {membro.cargo?.nome || 'Sem cargo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {membro.profile?.curso || '-'}
                          {membro.profile?.semestre && (
                            <span className="text-muted-foreground">
                              {' '}
                              ({membro.profile.semestre}º sem)
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(membro.data_entrada), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      </TableCell>
                      {podeGerenciarMembros && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setMembroParaAlterarCargo(membro);
                                  setNovoCargoId(membro.cargo_id);
                                }}
                              >
                                <UserCog className="h-4 w-4 mr-2" />
                                Alterar Cargo
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setMembroParaRemover(membro)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remover Membro
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Estatísticas */}
          {membros.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                Total de membros ativos: <span className="font-medium text-foreground">{membros.length}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmação de remoção */}
      <AlertDialog open={!!membroParaRemover} onOpenChange={() => setMembroParaRemover(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{membroParaRemover?.profile?.nome}</strong> da organização
              estudantil? Esta ação pode ser revertida adicionando o membro novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarRemocao} className="bg-destructive">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de alterar cargo */}
      <Dialog open={!!membroParaAlterarCargo} onOpenChange={() => setMembroParaAlterarCargo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Cargo</DialogTitle>
            <DialogDescription>
              Alterar o cargo de <strong>{membroParaAlterarCargo?.profile?.nome}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cargo atual</label>
              <div>
                <Badge
                  style={{
                    backgroundColor: membroParaAlterarCargo?.cargo?.cor || '#10b981',
                    color: 'white',
                  }}
                >
                  {membroParaAlterarCargo?.cargo?.nome}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Novo cargo</label>
              <Select value={novoCargoId} onValueChange={setNovoCargoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o novo cargo" />
                </SelectTrigger>
                <SelectContent>
                  {cargos
                    .sort((a, b) => a.nivel_hierarquia - b.nivel_hierarquia)
                    .map((cargo) => (
                      <SelectItem key={cargo.id} value={cargo.id}>
                        <div className="flex items-center gap-2">
                          {cargo.cor && (
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cargo.cor }} />
                          )}
                          <span>{cargo.nome}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setMembroParaAlterarCargo(null)} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleConfirmarAlterarCargo} disabled={!novoCargoId} className="flex-1">
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

