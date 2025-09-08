import React from 'react';
import { DashboardAprovacaoReservas } from '@/components/DashboardAprovacaoReservas';

const AprovarReservas: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <DashboardAprovacaoReservas />
      </div>
    </div>
  );
};

export default AprovarReservas;
