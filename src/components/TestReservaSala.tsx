import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DadosEvento } from '@/components/PreencherReservaComEvento';

export const TestReservaSala: React.FC = () => {
  const { entidadeId } = useParams<{ entidadeId: string }>();
  const location = useLocation();
  const state = location.state as { dadosEvento?: DadosEvento };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Teste - Reserva de Sala</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p><strong>Entidade ID:</strong> {entidadeId}</p>
              <p><strong>Dados do Evento:</strong></p>
              <pre className="bg-gray-100 p-4 rounded text-sm">
                {JSON.stringify(state?.dadosEvento, null, 2)}
              </pre>
              <p><strong>Location State:</strong></p>
              <pre className="bg-gray-100 p-4 rounded text-sm">
                {JSON.stringify(location.state, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
