import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Loader2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Entidade } from '@/hooks/useEntidade';

interface EditarProcessoSeletivoProps {
  entidade: Entidade;
  onSuccess?: () => void;
}

const EditarProcessoSeletivo: React.FC<EditarProcessoSeletivoProps> = ({
  entidade,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    processo_seletivo_ativo: entidade.processo_seletivo_ativo || false,
    abertura_processo_seletivo: entidade.abertura_processo_seletivo || '',
    fechamento_processo_seletivo: entidade.fechamento_processo_seletivo || '',
    data_primeira_fase: entidade.data_primeira_fase || '',
    encerramento_primeira_fase: entidade.encerramento_primeira_fase || '',
    data_segunda_fase: entidade.data_segunda_fase || '',
    encerramento_segunda_fase: entidade.encerramento_segunda_fase || '',
    data_terceira_fase: entidade.data_terceira_fase || '',
    encerramento_terceira_fase: entidade.encerramento_terceira_fase || '',
  });

  // Atualizar form quando entidade mudar
  useEffect(() => {
    setFormData({
      processo_seletivo_ativo: entidade.processo_seletivo_ativo || false,
      abertura_processo_seletivo: entidade.abertura_processo_seletivo || '',
      fechamento_processo_seletivo: entidade.fechamento_processo_seletivo || '',
      data_primeira_fase: entidade.data_primeira_fase || '',
      encerramento_primeira_fase: entidade.encerramento_primeira_fase || '',
      data_segunda_fase: entidade.data_segunda_fase || '',
      encerramento_segunda_fase: entidade.encerramento_segunda_fase || '',
      data_terceira_fase: entidade.data_terceira_fase || '',
      encerramento_terceira_fase: entidade.encerramento_terceira_fase || '',
    });
  }, [entidade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('entidades')
        .update({
          processo_seletivo_ativo: formData.processo_seletivo_ativo,
          abertura_processo_seletivo: formData.abertura_processo_seletivo || null,
          fechamento_processo_seletivo: formData.fechamento_processo_seletivo || null,
          data_primeira_fase: formData.data_primeira_fase || null,
          encerramento_primeira_fase: formData.encerramento_primeira_fase || null,
          data_segunda_fase: formData.data_segunda_fase || null,
          encerramento_segunda_fase: formData.encerramento_segunda_fase || null,
          data_terceira_fase: formData.data_terceira_fase || null,
          encerramento_terceira_fase: formData.encerramento_terceira_fase || null,
        })
        .eq('id', entidade.id);

      if (error) throw error;

      toast({
        title: '✅ Processo seletivo atualizado!',
        description: 'As configurações foram salvas com sucesso.',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao atualizar processo seletivo:', error);
      toast({
        title: '❌ Erro ao atualizar',
        description: 'Não foi possível atualizar o processo seletivo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Editar Processo Seletivo</h2>
        <DialogDescription className="mt-2">
          Configure as datas e períodos do processo seletivo da sua organização
        </DialogDescription>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Toggle de Ativação */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-0.5">
            <Label htmlFor="processo_ativo" className="text-base font-semibold">
              Processo Seletivo Ativo
            </Label>
            <p className="text-sm text-muted-foreground">
              Ative para permitir que estudantes se inscrevam
            </p>
          </div>
          <Switch
            id="processo_ativo"
            checked={formData.processo_seletivo_ativo}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, processo_seletivo_ativo: checked })
            }
          />
        </div>

        {/* Período de Inscrições */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Período de Inscrições</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="abertura">Data de Abertura</Label>
              <Input
                id="abertura"
                type="date"
                value={formData.abertura_processo_seletivo}
                onChange={(e) =>
                  setFormData({ ...formData, abertura_processo_seletivo: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="fechamento">Data de Fechamento</Label>
              <Input
                id="fechamento"
                type="date"
                value={formData.fechamento_processo_seletivo}
                onChange={(e) =>
                  setFormData({ ...formData, fechamento_processo_seletivo: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Primeira Fase */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Primeira Fase</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inicio_primeira">Início</Label>
              <Input
                id="inicio_primeira"
                type="date"
                value={formData.data_primeira_fase}
                onChange={(e) =>
                  setFormData({ ...formData, data_primeira_fase: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="fim_primeira">Encerramento</Label>
              <Input
                id="fim_primeira"
                type="date"
                value={formData.encerramento_primeira_fase}
                onChange={(e) =>
                  setFormData({ ...formData, encerramento_primeira_fase: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Segunda Fase */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Segunda Fase</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inicio_segunda">Início</Label>
              <Input
                id="inicio_segunda"
                type="date"
                value={formData.data_segunda_fase}
                onChange={(e) =>
                  setFormData({ ...formData, data_segunda_fase: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="fim_segunda">Encerramento</Label>
              <Input
                id="fim_segunda"
                type="date"
                value={formData.encerramento_segunda_fase}
                onChange={(e) =>
                  setFormData({ ...formData, encerramento_segunda_fase: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Terceira Fase */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Terceira Fase</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inicio_terceira">Início</Label>
              <Input
                id="inicio_terceira"
                type="date"
                value={formData.data_terceira_fase}
                onChange={(e) =>
                  setFormData({ ...formData, data_terceira_fase: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="fim_terceira">Encerramento</Label>
              <Input
                id="fim_terceira"
                type="date"
                value={formData.encerramento_terceira_fase}
                onChange={(e) =>
                  setFormData({ ...formData, encerramento_terceira_fase: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Nota Informativa */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Dica:</strong> As datas são opcionais. Configure apenas as fases que sua
            organização utiliza. Para gerenciar as fases detalhadamente, use a aba "Fases".
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditarProcessoSeletivo;

