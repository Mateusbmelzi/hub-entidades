import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DadosEvento } from '@/components/PreencherReservaComEvento';

export const ReservaSalaFormV2Debug: React.FC = () => {
  const navigate = useNavigate();
  const { entidadeId: entidadeIdFromParams } = useParams<{ entidadeId: string }>();
  const location = useLocation();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [debugInfo, setDebugInfo] = useState<any>({});

  // Teste hooks um por um
  const [hooksStatus, setHooksStatus] = useState({
    useCreateReserva: 'loading',
    useEntidades: 'loading',
    useEntityAuth: 'loading',
    useAuth: 'loading',
    useSalas: 'loading'
  });

  useEffect(() => {
    console.log('🧹 LOGS DE AUTENTICAÇÃO SILENCIADOS - Testando hooks...');
    
    // Teste 1: useCreateReserva
    import('@/hooks/useCreateReserva')
      .then(() => {
        setHooksStatus(prev => ({ ...prev, useCreateReserva: 'success' }));
      })
      .catch((err) => {
        console.error('❌ useCreateReserva error:', err);
        setHooksStatus(prev => ({ ...prev, useCreateReserva: 'error' }));
      });

    // Teste 2: useEntidades
    import('@/hooks/useEntidades')
      .then(() => {
        setHooksStatus(prev => ({ ...prev, useEntidades: 'success' }));
      })
      .catch((err) => {
        console.error('❌ useEntidades error:', err);
        setHooksStatus(prev => ({ ...prev, useEntidades: 'error' }));
      });

    // Teste 3: useEntityAuth
    import('@/hooks/useEntityAuth')
      .then(() => {
        setHooksStatus(prev => ({ ...prev, useEntityAuth: 'success' }));
      })
      .catch((err) => {
        console.error('❌ useEntityAuth error:', err);
        setHooksStatus(prev => ({ ...prev, useEntityAuth: 'error' }));
      });

    // Teste 4: useAuth
    import('@/hooks/useAuth')
      .then(() => {
        setHooksStatus(prev => ({ ...prev, useAuth: 'success' }));
      })
      .catch((err) => {
        console.error('❌ useAuth error:', err);
        setHooksStatus(prev => ({ ...prev, useAuth: 'error' }));
      });

    // Teste 5: useSalas
    import('@/hooks/useSalas')
      .then(() => {
        setHooksStatus(prev => ({ ...prev, useSalas: 'success' }));
      })
      .catch((err) => {
        console.error('❌ useSalas error:', err);
        setHooksStatus(prev => ({ ...prev, useSalas: 'error' }));
      });

    // Aplicar dados do evento se vieram via navegação
    const state = location.state as { dadosEvento?: DadosEvento };
    if (state?.dadosEvento) {
      setDebugInfo(prev => ({
        ...prev,
        dadosEvento: state.dadosEvento,
        aplicadoEm: new Date().toISOString()
      }));
      // Limpar o state para não reaplicar se voltar
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Debug - ReservaSalaFormV2 (Logs Limpos)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Parâmetros da URL:</h3>
                <p><strong>entidadeId:</strong> {entidadeIdFromParams}</p>
              </div>

              <div>
                <h3 className="font-semibold">Status dos Hooks:</h3>
                <div className="space-y-2">
                  {Object.entries(hooksStatus).map(([hook, status]) => (
                    <div key={hook} className="flex items-center gap-2">
                      <span className="font-mono text-sm">{hook}:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        status === 'success' ? 'bg-green-100 text-green-800' :
                        status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold">Dados do Evento:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold">Location State:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(location.state, null, 2)}
                </pre>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => navigate(-1)}>
                  Voltar
                </Button>
                <Button onClick={() => setCurrentStep(prev => prev + 1)}>
                  Próximo Passo (Debug)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
