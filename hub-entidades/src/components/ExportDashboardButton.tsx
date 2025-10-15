import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { exportDashboardToExcel, DashboardDataForExport } from '@/lib/excel-export';
import { useToast } from '@/hooks/use-toast';

interface ExportDashboardButtonProps {
  data: DashboardDataForExport;
  disabled?: boolean;
  className?: string;
}

export const ExportDashboardButton: React.FC<ExportDashboardButtonProps> = ({
  data,
  disabled = false,
  className = ''
}) => {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      // Mostrar loading
      toast({
        title: 'Gerando relatório...',
        description: 'Preparando Excel com os indicadores do Dashboard',
        duration: 2000
      });

      // Pequeno delay para mostrar o toast
      await new Promise(resolve => setTimeout(resolve, 500));

      // Exportar Excel
      const fileName = exportDashboardToExcel(data);

      // Sucesso
      toast({
        title: 'Relatório exportado!',
        description: `Excel salvo como "${fileName}"`,
        duration: 5000
      });

    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      
      toast({
        title: 'Erro ao exportar',
        description: 'Não foi possível gerar o relatório em Excel',
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled}
      className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
      size="lg"
    >
      <FileDown className="w-5 h-5 mr-2" />
      Exportar Relatório
    </Button>
  );
};
