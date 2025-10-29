import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GerenciarAreasInternasProps {
  entidadeId: number;
  areasAtuais?: string[];
  onSuccess?: () => void;
  variant?: 'default' | 'header'; // 'default' para fundos claros, 'header' para fundos escuros
}

const GerenciarAreasInternas: React.FC<GerenciarAreasInternasProps> = ({ 
  entidadeId, 
  areasAtuais = [],
  onSuccess,
  variant = 'default'
}) => {
  const [areasInternas, setAreasInternas] = useState<string[]>(areasAtuais);
  const [novaArea, setNovaArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setAreasInternas(areasAtuais);
  }, [areasAtuais]);

  const handleAdicionarArea = () => {
    if (!novaArea.trim()) {
      toast.error('Digite o nome da área');
      return;
    }

    if (areasInternas.includes(novaArea.trim())) {
      toast.error('Esta área já existe');
      return;
    }

    setAreasInternas(prev => [...prev, novaArea.trim()]);
    setNovaArea('');
  };

  const handleRemoverArea = (area: string) => {
    setAreasInternas(prev => prev.filter(a => a !== area));
  };

  const handleSalvar = async () => {
    if (areasInternas.length === 0) {
      toast.error('Adicione pelo menos uma área interna');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('entidades')
        .update({ areas_estrutura_organizacional: areasInternas })
        .eq('id', entidadeId);

      if (error) {
        console.error('Erro ao salvar áreas internas:', error);
        toast.error('Erro ao salvar áreas internas');
        return;
      }

      toast.success('Áreas internas atualizadas com sucesso!');
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar áreas internas');
    } finally {
      setLoading(false);
    }
  };

  const buttonClassName = variant === 'header'
    ? "bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
    : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={buttonClassName}
        >
          <Settings className="mr-2 h-4 w-4" />
          Gerenciar Áreas Internas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Áreas Internas</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure as áreas internas da sua organização que estarão disponíveis
            para os estudantes escolherem durante o processo seletivo.
          </p>
          
          {/* Adicionar nova área */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="nova-area" className="sr-only">Nova área</Label>
              <Input
                id="nova-area"
                value={novaArea}
                onChange={(e) => setNovaArea(e.target.value)}
                placeholder="Ex: Desenvolvimento, Design, Marketing..."
                onKeyPress={(e) => e.key === 'Enter' && handleAdicionarArea()}
              />
            </div>
            <Button 
              onClick={handleAdicionarArea}
              size="sm"
              disabled={!novaArea.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Lista de áreas */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Áreas configuradas:</Label>
            {areasInternas.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Nenhuma área configurada. Adicione áreas para que os estudantes possam escolher.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {areasInternas.map((area, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <span>{area}</span>
                    <button
                      onClick={() => handleRemoverArea(area)}
                      className="ml-1 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Informações */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Como funciona:</strong> Os estudantes poderão escolher uma dessas áreas 
              quando demonstrarem interesse no processo seletivo da sua organização.
            </p>
          </div>
          
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

export default GerenciarAreasInternas; 