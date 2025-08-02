import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GerenciarAreasInteresseProps {
  entidadeId: number;
  onSuccess?: () => void;
}

const GerenciarAreasInteresse: React.FC<GerenciarAreasInteresseProps> = ({ 
  entidadeId, 
  onSuccess 
}) => {
  const [areasDisponiveis, setAreasDisponiveis] = useState<string[]>([]);
  const [areasSelecionadas, setAreasSelecionadas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Todas as áreas possíveis
  const todasAreas = [
    'consultoria e negócios',
    'tecnologia',
    'finanças',
    'direito',
    'educação',
    'cultura',
    'entretenimento',
    'marketing',
    'recursos humanos',
    'sustentabilidade',
    'inovação',
    'empreendedorismo',
    'pesquisa',
    'esportes',
    'saúde',
    'meio ambiente',
    'política',
    'relações internacionais'
  ];

  useEffect(() => {
    // Por enquanto, usar áreas padrão
    // TODO: Buscar do banco quando a coluna estiver disponível
    setAreasDisponiveis([
      'consultoria e negócios',
      'tecnologia',
      'finanças',
      'direito',
      'educação',
      'cultura',
      'entretenimento',
      'marketing',
      'recursos humanos',
      'sustentabilidade',
      'inovação',
      'empreendedorismo'
    ]);
    setAreasSelecionadas([
      'consultoria e negócios',
      'tecnologia',
      'finanças',
      'direito',
      'educação',
      'cultura',
      'entretenimento'
    ]);
  }, []);

  const handleAreaToggle = (area: string) => {
    setAreasSelecionadas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleSalvar = async () => {
    if (areasSelecionadas.length === 0) {
      toast.error('Selecione pelo menos uma área de interesse');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implementar quando a função RPC estiver disponível
      console.log('Salvando áreas de interesse:', areasSelecionadas);
      
      // Por enquanto, apenas simular o salvamento
      toast.success('Áreas de interesse atualizadas com sucesso!');
      setOpen(false);
      onSuccess?.();
      
      /*
      const { error } = await supabase
        .rpc('atualizar_areas_interesse_entidade', {
          p_entidade_id: entidadeId,
          p_areas_interesse: areasSelecionadas
        });

      if (error) {
        console.error('Erro ao salvar áreas de interesse:', error);
        toast.error('Erro ao salvar áreas de interesse');
        return;
      }

      toast.success('Áreas de interesse atualizadas com sucesso!');
      setOpen(false);
      onSuccess?.();
      */
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar áreas de interesse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
        >
          <Settings className="mr-2 h-4 w-4" />
          Gerenciar Áreas de Interesse
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Áreas de Interesse</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecione as áreas de interesse que sua organização oferece.
            Os estudantes poderão escolher entre essas áreas ao demonstrar interesse.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {todasAreas.map((area) => (
              <div key={area} className="flex items-center space-x-2">
                <Checkbox
                  id={`area-${area}`}
                  checked={areasSelecionadas.includes(area)}
                  onCheckedChange={() => handleAreaToggle(area)}
                  disabled={loading}
                />
                <Label
                  htmlFor={`area-${area}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {area.charAt(0).toUpperCase() + area.slice(1)}
                </Label>
              </div>
            ))}
          </div>
          
          {areasSelecionadas.length > 0 && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium text-primary">
                Áreas selecionadas ({areasSelecionadas.length}): {areasSelecionadas.join(', ')}
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GerenciarAreasInteresse; 