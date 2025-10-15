import React from 'react';
import { ReservaSalaFormV2 } from '@/components/ReservaSalaFormV2';

const ReservaSala: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reserva de Sala
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Preencha o formulário abaixo para solicitar a reserva de uma sala. 
            Siga os passos indicados e forneça todas as informações necessárias.
          </p>
        </div>
        
        <ReservaSalaFormV2 />
      </div>
    </div>
  );
};

export default ReservaSala;
