import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GerenciarAreasProcessoSeletivoProps {
  entidadeId: number;
  areasInternas: string[];
  areasPS: string[];
  onSuccess?: () => void;
}

const GerenciarAreasProcessoSeletivo: React.FC<GerenciarAreasProcessoSeletivoProps> = ({
  entidadeId,
  areasInternas,
  areasPS,
  onSuccess
}) => {
  const [areasSelecionadas, setAreasSelecionadas] = useState<string[]>(areasPS);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setAreasSelecionadas(areasPS);
  }, [areasPS]);

  const toggleArea = (area: string) => {
    setAreasSelecionadas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleSalvar = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('entidades')
        .update({ areas_processo_seletivo: areasSelecionadas })
        .eq('id', entidadeId);

      if (error) throw error;

      toast.success('Áreas do processo seletivo atualizadas!');
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao atualizar áreas:', error);
      toast.error('Erro ao atualizar áreas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Gerenciar Áreas do PS
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Áreas com Vagas no Processo Seletivo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecione quais áreas internas da sua organização têm vagas abertas neste processo seletivo.
          </p>

          {areasInternas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma área interna cadastrada.</p>
              <p className="text-sm mt-1">
                Cadastre áreas internas primeiro na seção "Áreas Internas".
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {areasInternas.map(area => (
                <div key={area} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={`area-${area}`}
                    checked={areasSelecionadas.includes(area)}
                    onCheckedChange={() => toggleArea(area)}
                  />
                  <label
                    htmlFor={`area-${area}`}
                    className="flex-1 text-sm font-medium cursor-pointer"
                  >
                    {area}
                  </label>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Como funciona:</strong> Apenas as áreas selecionadas aparecerão
              como opção para os candidatos no formulário de inscrição.
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={loading || areasInternas.length === 0}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GerenciarAreasProcessoSeletivo;

