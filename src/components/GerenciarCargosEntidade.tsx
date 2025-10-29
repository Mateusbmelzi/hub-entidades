import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Shield, Users, AlertCircle } from 'lucide-react';
import { useCargosEntidade } from '@/hooks/useCargosEntidade';
import { usePermissoesUsuario } from '@/hooks/usePermissoesUsuario';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { PERMISSAO_LABELS, PERMISSAO_DESCRIPTIONS, CARGO_CORES_SUGERIDAS } from '@/types/membro-entidade';
import type { CargoComPermissoes, Permissao, CreateCargoData, UpdateCargoData } from '@/types/membro-entidade';

interface GerenciarCargosEntidadeProps {
  entidadeId: number;
  // Quando o usuário está autenticado como entidade (owner), permitimos exibir o botão
  // mesmo que o hook de permissões não conceda 'gerenciar_cargos'
  isOwner?: boolean;
}

const PERMISSOES_DISPONIVEIS: Permissao[] = [
  'visualizar',
  'criar_eventos',
  'editar_projetos',
  'editar_entidade',
  'aprovar_conteudo',
  'gerenciar_membros',
  'gerenciar_cargos',
];

export function GerenciarCargosEntidade({ entidadeId, isOwner = false }: GerenciarCargosEntidadeProps) {
  const { cargos, loading, createCargo, updateCargo, deleteCargo } = useCargosEntidade({
    entidadeId,
    includePermissoes: true,
    includeTotalMembros: true,
  });
  const { hasPermission } = usePermissoesUsuario({ entidadeId });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [cargoParaEditar, setCargoParaEditar] = useState<CargoComPermissoes | null>(null);
  const [cargoParaExcluir, setCargoParaExcluir] = useState<CargoComPermissoes | null>(null);

  // Form state
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [nivelHierarquia, setNivelHierarquia] = useState('3');
  const [cor, setCor] = useState('#10b981');
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<Permissao[]>(['visualizar']);

  const podeGerenciarCargos = isOwner || hasPermission('gerenciar_cargos');

  const resetForm = () => {
    setNome('');
    setDescricao('');
    setNivelHierarquia('3');
    setCor('#10b981');
    setPermissoesSelecionadas(['visualizar']);
  };

  const loadCargoToEdit = (cargo: CargoComPermissoes) => {
    setCargoParaEditar(cargo);
    setNome(cargo.nome);
    setDescricao(cargo.descricao || '');
    setNivelHierarquia(cargo.nivel_hierarquia.toString());
    setCor(cargo.cor || '#10b981');
    setPermissoesSelecionadas(cargo.permissoes?.map((p) => p.permissao) || ['visualizar']);
    setShowEditDialog(true);
  };

  const handleCreateCargo = async () => {
    if (!nome.trim()) return;

    const data: CreateCargoData = {
      entidade_id: entidadeId,
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      nivel_hierarquia: parseInt(nivelHierarquia),
      cor,
      permissoes: permissoesSelecionadas,
    };

    const result = await createCargo(data);
    if (result.success) {
      setShowCreateDialog(false);
      resetForm();
    }
  };

  const handleUpdateCargo = async () => {
    if (!cargoParaEditar || !nome.trim()) return;

    const data: UpdateCargoData = {
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      nivel_hierarquia: parseInt(nivelHierarquia),
      cor,
      permissoes: permissoesSelecionadas,
    };

    const result = await updateCargo(cargoParaEditar.id, data);
    if (result.success) {
      setShowEditDialog(false);
      setCargoParaEditar(null);
      resetForm();
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!cargoParaExcluir) return;

    const result = await deleteCargo(cargoParaExcluir.id);
    if (result.success) {
      setCargoParaExcluir(null);
    }
  };

  const togglePermissao = (permissao: Permissao) => {
    setPermissoesSelecionadas((prev) =>
      prev.includes(permissao) ? prev.filter((p) => p !== permissao) : [...prev, permissao]
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Cargos da Organização Estudantil
              </CardTitle>
              <CardDescription>Configure os cargos e suas permissões</CardDescription>
            </div>
            {podeGerenciarCargos && (
              <Dialog open={showCreateDialog} onOpenChange={(open) => {
                setShowCreateDialog(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Cargo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Cargo</DialogTitle>
                    <DialogDescription>
                      Defina o nome, nível hierárquico e permissões do cargo
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do Cargo *</Label>
                      <Input
                        id="nome"
                        placeholder="Ex: Diretor de Marketing"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        placeholder="Descreva as responsabilidades deste cargo..."
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nivel">Nível Hierárquico *</Label>
                        <Input
                          id="nivel"
                          type="number"
                          min="1"
                          max="10"
                          value={nivelHierarquia}
                          onChange={(e) => setNivelHierarquia(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          1 = mais alto (Presidente), 10 = mais baixo
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Cor do Badge</Label>
                        <div className="flex gap-2 flex-wrap">
                          {CARGO_CORES_SUGERIDAS.map((corSugerida) => (
                            <button
                              key={corSugerida.valor}
                              type="button"
                              onClick={() => setCor(corSugerida.valor)}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                cor === corSugerida.valor ? 'border-foreground scale-110' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: corSugerida.valor }}
                              title={corSugerida.nome}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label>Permissões *</Label>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Selecione as permissões que este cargo terá na organização estudantil
                        </AlertDescription>
                      </Alert>
                      <div className="space-y-3">
                        {PERMISSOES_DISPONIVEIS.map((permissao) => (
                          <div key={permissao} className="flex items-start space-x-3 border rounded-md p-3">
                            <Checkbox
                              id={`perm-${permissao}`}
                              checked={permissoesSelecionadas.includes(permissao)}
                              onCheckedChange={() => togglePermissao(permissao)}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`perm-${permissao}`}
                                className="text-sm font-medium leading-none cursor-pointer"
                              >
                                {PERMISSAO_LABELS[permissao]}
                              </label>
                              <p className="text-xs text-muted-foreground mt-1">
                                {PERMISSAO_DESCRIPTIONS[permissao]}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowCreateDialog(false)} variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateCargo} disabled={!nome.trim()} className="flex-1">
                      Criar Cargo
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando cargos...</div>
          ) : cargos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum cargo cadastrado</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Membros</TableHead>
                    <TableHead>Permissões</TableHead>
                    {podeGerenciarCargos && <TableHead className="text-right">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cargos.map((cargo) => (
                    <TableRow key={cargo.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge style={{ backgroundColor: cargo.cor || '#10b981', color: 'white' }}>
                              {cargo.nome}
                            </Badge>
                          </div>
                          {cargo.descricao && (
                            <p className="text-xs text-muted-foreground">{cargo.descricao}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{cargo.nivel_hierarquia}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{cargo.total_membros || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {cargo.permissoes && cargo.permissoes.length > 0 ? (
                            cargo.permissoes.slice(0, 3).map((p) => (
                              <Badge key={p.id} variant="secondary" className="text-xs">
                                {PERMISSAO_LABELS[p.permissao]}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Nenhuma</span>
                          )}
                          {cargo.permissoes && cargo.permissoes.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{cargo.permissoes.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      {podeGerenciarCargos && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadCargoToEdit(cargo)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCargoParaExcluir(cargo)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de edição (reutiliza o mesmo form do criar) */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open);
        if (!open) {
          setCargoParaEditar(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cargo</DialogTitle>
            <DialogDescription>Atualize as informações e permissões do cargo</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome do Cargo *</Label>
              <Input
                id="edit-nome"
                placeholder="Ex: Diretor de Marketing"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Textarea
                id="edit-descricao"
                placeholder="Descreva as responsabilidades deste cargo..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nivel">Nível Hierárquico *</Label>
                <Input
                  id="edit-nivel"
                  type="number"
                  min="1"
                  max="10"
                  value={nivelHierarquia}
                  onChange={(e) => setNivelHierarquia(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  1 = mais alto (Presidente), 10 = mais baixo
                </p>
              </div>

              <div className="space-y-2">
                <Label>Cor do Badge</Label>
                <div className="flex gap-2 flex-wrap">
                  {CARGO_CORES_SUGERIDAS.map((corSugerida) => (
                    <button
                      key={corSugerida.valor}
                      type="button"
                      onClick={() => setCor(corSugerida.valor)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        cor === corSugerida.valor ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: corSugerida.valor }}
                      title={corSugerida.nome}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Permissões *</Label>
              <div className="space-y-3">
                {PERMISSOES_DISPONIVEIS.map((permissao) => (
                  <div key={permissao} className="flex items-start space-x-3 border rounded-md p-3">
                    <Checkbox
                      id={`edit-perm-${permissao}`}
                      checked={permissoesSelecionadas.includes(permissao)}
                      onCheckedChange={() => togglePermissao(permissao)}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`edit-perm-${permissao}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {PERMISSAO_LABELS[permissao]}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {PERMISSAO_DESCRIPTIONS[permissao]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowEditDialog(false)} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleUpdateCargo} disabled={!nome.trim()} className="flex-1">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!cargoParaExcluir} onOpenChange={() => setCargoParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cargo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cargo <strong>{cargoParaExcluir?.nome}</strong>?
              {cargoParaExcluir && cargoParaExcluir.total_membros && cargoParaExcluir.total_membros > 0 && (
                <div className="mt-2 p-2 bg-destructive/10 rounded-md text-destructive">
                  Este cargo possui {cargoParaExcluir.total_membros} membro(s) ativo(s). Você não poderá
                  excluir até transferir ou remover estes membros.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarExclusao} className="bg-destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

