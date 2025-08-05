import React from 'react';
import { useEventosSimple } from '@/hooks/useEventosSimple';

const TestEventos = () => {
  const { eventos, loading, error } = useEventosSimple();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-insper-red/20 border-t-insper-red mx-auto mb-4"></div>
          <p className="text-insper-dark-gray">Carregando eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar eventos</h1>
          <p className="text-insper-dark-gray">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-insper-black mb-8">
          Página de Eventos - Teste
        </h1>
        
        <div className="grid gap-6">
          {eventos.map((evento) => (
            <div key={evento.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-insper-black mb-2">
                {evento.titulo}
              </h2>
              <p className="text-insper-dark-gray mb-4">
                {evento.descricao}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-insper-red/10 text-insper-red rounded-full text-sm">
                  {evento.data_inicio}
                </span>
                <span className="px-3 py-1 bg-insper-blue/10 text-insper-blue rounded-full text-sm">
                  {evento.entidade?.nome || 'Entidade não especificada'}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {eventos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-insper-dark-gray text-lg">
              Nenhum evento encontrado
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestEventos; 