import React from 'react';
import { ReservasHistoricas } from '@/components/ReservasHistoricas';
import { ExportReservasButton } from '@/components/ExportReservasButton';
import { ReservaDetalhada } from '@/types/reserva';

const HistoricoReservas: React.FC = () => {
  const handleExport = (reservas: ReservaDetalhada[]) => {
    // A lógica de exportação será tratada pelo componente ExportReservasButton
    console.log('Exportando reservas:', reservas.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <ReservasHistoricas onExport={handleExport} />
      </div>
    </div>
  );
};

export default HistoricoReservas;
