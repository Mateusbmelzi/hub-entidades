import React from 'react';
import { DashboardAprovacaoReservas } from '@/components/DashboardAprovacaoReservas';
import { EventEditRequestsPanel } from '@/components/EventEditRequestsPanel';

const AprovarReservas: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-6">
        <DashboardAprovacaoReservas />
        <EventEditRequestsPanel />
      </div>
    </div>
  );
};

export default AprovarReservas;
