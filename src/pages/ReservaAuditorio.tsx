import React from 'react';
import { ReservaAuditorioFormV3 } from '@/components/ReservaAuditorioFormV3';

const ReservaAuditorio: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Reserva de Auditório
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Preencha o formulário abaixo para solicitar a reserva do auditório. 
            Siga os passos indicados e forneça todas as informações necessárias.
          </p>
        </div>
        
        <ReservaAuditorioFormV3 />
      </div>
    </div>
  );
};

export default ReservaAuditorio;
