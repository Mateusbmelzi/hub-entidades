import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Download, FileSpreadsheet, FileText, FileImage } from 'lucide-react';
import { ReservaDetalhada } from '@/types/reserva';
import { exportReservas, ExportOptions, generateReservasStats } from '@/lib/reservas-export';
import { toast } from 'sonner';

interface ExportReservasButtonProps {
  reservas: ReservaDetalhada[];
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const ExportReservasButton: React.FC<ExportReservasButtonProps> = ({
  reservas,
  disabled = false,
  variant = 'outline',
  size = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    includeDetails: false
  });

  const handleExport = async () => {
    if (reservas.length === 0) {
      toast.error('Nenhuma reserva para exportar');
      return;
    }

    setIsExporting(true);
    try {
      await exportReservas(reservas, exportOptions);
      toast.success(`Reservas exportadas com sucesso! (${reservas.length} registros)`);
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao exportar reservas:', error);
      toast.error('Erro ao exportar reservas');
    } finally {
      setIsExporting(false);
    }
  };

  const stats = generateReservasStats(reservas);

  const formatOptions = [
    { value: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
    { value: 'csv', label: 'CSV (.csv)', icon: FileText },
    { value: 'pdf', label: 'PDF (.pdf)', icon: FileImage }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || reservas.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar ({reservas.length})
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Reservas
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Resumo das Reservas</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Total: <strong>{stats.total}</strong></div>
              <div>Pendentes: <strong>{stats.pendentes}</strong></div>
              <div>Aprovadas: <strong>{stats.aprovadas}</strong></div>
              <div>Rejeitadas: <strong>{stats.rejeitadas}</strong></div>
            </div>
          </div>

          {/* Formato de exportação */}
          <div className="space-y-2">
            <Label htmlFor="format">Formato de Exportação</Label>
            <Select
              value={exportOptions.format}
              onValueChange={(value: 'excel' | 'csv' | 'pdf') => 
                setExportOptions(prev => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Opções adicionais */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeDetails"
                checked={exportOptions.includeDetails}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeDetails: !!checked }))
                }
              />
              <Label htmlFor="includeDetails" className="text-sm">
                Incluir detalhes completos (equipamentos, configurações, etc.)
              </Label>
            </div>
          </div>

          {/* Filtro por data (opcional) */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Filtro por Data (Opcional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateStart" className="text-xs">Data Início</Label>
                <Input
                  id="dateStart"
                  type="date"
                  value={exportOptions.dateRange?.start || ''}
                  onChange={(e) => 
                    setExportOptions(prev => ({ 
                      ...prev, 
                      dateRange: { 
                        ...prev.dateRange, 
                        start: e.target.value 
                      } 
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateEnd" className="text-xs">Data Fim</Label>
                <Input
                  id="dateEnd"
                  type="date"
                  value={exportOptions.dateRange?.end || ''}
                  onChange={(e) => 
                    setExportOptions(prev => ({ 
                      ...prev, 
                      dateRange: { 
                        ...prev.dateRange, 
                        end: e.target.value 
                      } 
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Informações sobre o formato */}
          <div className="text-xs text-muted-foreground space-y-1">
            {exportOptions.format === 'excel' && (
              <p>• Excel: Formato compatível com Microsoft Excel e Google Sheets</p>
            )}
            {exportOptions.format === 'csv' && (
              <p>• CSV: Formato de texto simples, compatível com qualquer planilha</p>
            )}
            {exportOptions.format === 'pdf' && (
              <p>• PDF: Relatório formatado para impressão e visualização</p>
            )}
            {exportOptions.includeDetails && (
              <p>• Incluirá todos os campos detalhados da reserva</p>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isExporting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
