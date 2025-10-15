import React from 'react';
import { MinhasReservas } from '@/components/MinhasReservas';

const MinhasReservasPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <MinhasReservas />
      </div>
    </div>
  );
};

export default MinhasReservasPage;
