import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEventosDebug } from '@/hooks/useEventosDebug';
import { RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const TestEventos = () => {
  const { eventos, loading, error, debugInfo, refetch } = useEventosDebug();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'aprovado':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejeitado':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'aprovado':
        return 'bg-green-100 text-green-800';
      case 'rejeitado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>🧪 Testando Conexão com Eventos...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-4" />
                <p>Carregando dados de teste...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">❌ Erro no Teste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 mx-auto text-red-600 mb-4" />
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <Button onClick={refetch} className="bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>🧪 Teste de Conexão - Eventos</CardTitle>
              <Button onClick={refetch} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refazer Teste
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{eventos.length}</div>
                <div className="text-sm text-blue-700">Total de Eventos</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {eventos.filter(e => e.status_aprovacao === 'aprovado').length}
                </div>
                <div className="text-sm text-green-700">Aprovados</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {eventos.filter(e => e.status_aprovacao === 'pendente').length}
                </div>
                <div className="text-sm text-yellow-700">Pendentes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Eventos */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Eventos Encontrados</CardTitle>
          </CardHeader>
          <CardContent>
            {eventos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum evento encontrado na base de dados.</p>
                <p className="text-sm mt-2">Verifique se a tabela 'eventos' existe e possui dados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {eventos.map((evento, index) => (
                  <div key={evento.id || index} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {evento.nome || `Evento ${index + 1}`}
                          </h3>
                          <Badge className={getStatusColor(evento.status_aprovacao)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(evento.status_aprovacao)}
                              <span className="capitalize">
                                {evento.status_aprovacao || 'sem status'}
                              </span>
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">ID:</span> {evento.id || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Entidade:</span> {evento.entidades?.nome || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Data Evento:</span> {evento.data_evento || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Criado em:</span> {evento.created_at || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações de Debug */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">🔍 Informações de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Status:</strong> {error ? 'Erro detectado' : 'Conexão testada com sucesso'}</p>
              <p><strong>Eventos carregados:</strong> {eventos.length}</p>
              <p><strong>Última atualização:</strong> {new Date().toLocaleString('pt-BR')}</p>
              <p><strong>Console:</strong> Verifique o console do navegador para logs detalhados</p>
              
              {debugInfo && Object.keys(debugInfo).length > 0 && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="font-medium mb-2">Debug Info:</p>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestEventos; 