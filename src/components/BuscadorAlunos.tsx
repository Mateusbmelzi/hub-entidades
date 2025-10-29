import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CargoEntidade } from '@/types/membro-entidade';

interface AlunoProfile {
  id: string;
  nome: string;
  email: string;
  curso?: string;
  semestre?: number;
}

interface BuscadorAlunosProps {
  entidadeId: number;
  cargos: CargoEntidade[];
  onAlunoSelecionado: (userId: string, cargoId: string) => void;
  membrosAtuaisIds?: string[];
}

export function BuscadorAlunos({ entidadeId, cargos, onAlunoSelecionado, membrosAtuaisIds = [] }: BuscadorAlunosProps) {
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<AlunoProfile[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<AlunoProfile | null>(null);
  const [cargoSelecionado, setCargoSelecionado] = useState<string>('');

  const buscarAlunos = useCallback(
    async (termo: string) => {
      if (!termo || termo.length < 2) {
        setResultados([]);
        return;
      }

      try {
        setCarregando(true);

        // Buscar alunos que não são membros ativos da entidade
        const { data, error } = await supabase
          .from('profiles')
          .select('id, nome, email, curso, semestre')
          .or(`nome.ilike.%${termo}%,email.ilike.%${termo}%`)
          .not('id', 'in', `(${membrosAtuaisIds.join(',') || 'null'})`)
          .limit(10);

        if (error) throw error;

        setResultados(data || []);
      } catch (err) {
        console.error('Erro ao buscar alunos:', err);
        setResultados([]);
      } finally {
        setCarregando(false);
      }
    },
    [membrosAtuaisIds]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      buscarAlunos(busca);
    }, 300);

    return () => clearTimeout(timer);
  }, [busca, buscarAlunos]);

  const handleSelecionarAluno = (aluno: AlunoProfile) => {
    setAlunoSelecionado(aluno);
    setBusca('');
    setResultados([]);
  };

  const handleAdicionarMembro = () => {
    if (alunoSelecionado && cargoSelecionado) {
      onAlunoSelecionado(alunoSelecionado.id, cargoSelecionado);
      setAlunoSelecionado(null);
      setCargoSelecionado('');
    }
  };

  const handleCancelar = () => {
    setAlunoSelecionado(null);
    setCargoSelecionado('');
    setBusca('');
    setResultados([]);
  };

  return (
    <div className="space-y-4">
      {!alunoSelecionado ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="busca-aluno">Buscar Aluno</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="busca-aluno"
                type="text"
                placeholder="Digite o nome ou e-mail do aluno..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {carregando && (
            <div className="text-sm text-muted-foreground text-center py-4">
              Buscando alunos...
            </div>
          )}

          {resultados.length > 0 && (
            <ScrollArea className="h-[200px] border rounded-md">
              <div className="p-2 space-y-1">
                {resultados.map((aluno) => (
                  <button
                    key={aluno.id}
                    onClick={() => handleSelecionarAluno(aluno)}
                    className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{aluno.nome}</p>
                        <p className="text-xs text-muted-foreground truncate">{aluno.email}</p>
                        {aluno.curso && (
                          <div className="flex items-center gap-1 mt-1">
                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {aluno.curso}
                              {aluno.semestre && ` - ${aluno.semestre}º semestre`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}

          {busca.length >= 2 && !carregando && resultados.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4 border rounded-md">
              Nenhum aluno encontrado
            </div>
          )}
        </>
      ) : (
        <>
          <div className="border rounded-md p-4 bg-accent/50">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{alunoSelecionado.nome}</p>
                <p className="text-sm text-muted-foreground">{alunoSelecionado.email}</p>
                {alunoSelecionado.curso && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {alunoSelecionado.curso}
                    {alunoSelecionado.semestre && ` - ${alunoSelecionado.semestre}º semestre`}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo-select">Selecionar Cargo</Label>
              <Select value={cargoSelecionado} onValueChange={setCargoSelecionado}>
                <SelectTrigger id="cargo-select">
                  <SelectValue placeholder="Escolha um cargo" />
                </SelectTrigger>
                <SelectContent>
                  {cargos
                    .sort((a, b) => a.nivel_hierarquia - b.nivel_hierarquia)
                    .map((cargo) => (
                      <SelectItem key={cargo.id} value={cargo.id}>
                        <div className="flex items-center gap-2">
                          {cargo.cor && (
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: cargo.cor }}
                            />
                          )}
                          <span>{cargo.nome}</span>
                          {cargo.descricao && (
                            <span className="text-xs text-muted-foreground">
                              - {cargo.descricao}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAdicionarMembro}
              disabled={!cargoSelecionado}
              className="flex-1"
            >
              Adicionar Membro
            </Button>
            <Button onClick={handleCancelar} variant="outline">
              Cancelar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

