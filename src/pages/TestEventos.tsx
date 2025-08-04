import React from 'react';
import { useEventosSimple } from '@/hooks/useEventosSimple';

const TestEventos = () => {
  const { eventos, loading, error, refetch } = useEventosSimple();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-2xl">❌</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar eventos</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={refetch}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Teste de Eventos</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Resultados do Debug</h2>
          <div className="space-y-4">
            <div>
              <span className="font-medium">Total de eventos encontrados:</span> {eventos.length}
            </div>
            <div>
              <span className="font-medium">Status:</span> {loading ? 'Carregando...' : error ? 'Erro' : 'Sucesso'}
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <span className="font-medium text-red-800">Erro:</span> {error}
              </div>
            )}
          </div>
        </div>

        {eventos.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Eventos Encontrados</h2>
            <div className="space-y-4">
              {eventos.map((evento, index) => (
                <div key={evento.id || index} className="border border-gray-200 rounded p-4">
                  <h3 className="font-semibold text-lg">{evento.nome}</h3>
                  <p className="text-gray-600">{evento.descricao}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <div>Data: {evento.data_evento}</div>
                    <div>Local: {evento.local}</div>
                    <div>Status: {evento.status_aprovacao}</div>
                    {evento.entidades && (
                      <div>Entidade: {evento.entidades.nome}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <button 
            onClick={refetch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Recarregar Eventos
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestEventos; 