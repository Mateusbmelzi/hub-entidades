import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { EventoPorArea } from '@/hooks/useEventosPorArea';

interface EventosPorAreaChartProps {
  eventosPorArea: EventoPorArea[];
  loading: boolean;
  error: string | null;
  onRefetch: () => void;
}

export const EventosPorAreaChart: React.FC<EventosPorAreaChartProps> = ({
  eventosPorArea,
  loading,
  error,
  onRefetch
}) => {
  // Cores para o gráfico de pizza
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
  ];

  // Calcular ângulos para o gráfico de pizza
  const totalEventos = eventosPorArea.reduce((sum, item) => sum + item.total_eventos, 0);
  const calculateAngles = () => {
    let currentAngle = 0;
    return eventosPorArea.map((item, index) => {
      const percentage = item.total_eventos / totalEventos;
      const startAngle = currentAngle;
      const endAngle = currentAngle + (percentage * 360);
      currentAngle = endAngle;
      
      return {
        ...item,
        startAngle,
        endAngle,
        percentage,
        color: colors[index % colors.length]
      };
    });
  };

  const pieData = calculateAngles();

  // Função para gerar o path SVG do gráfico de pizza
  const createPieSlice = (startAngle: number, endAngle: number, radius: number) => {
    const startRadians = (startAngle - 90) * (Math.PI / 180);
    const endRadians = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = radius * Math.cos(startRadians);
    const y1 = radius * Math.sin(startRadians);
    const x2 = radius * Math.cos(endRadians);
    const y2 = radius * Math.sin(endRadians);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    return [
      `M 0 0`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-600" />
            Eventos por Área de Atuação
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribuição dos eventos por área
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-600" />
            Eventos por Área de Atuação
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribuição dos eventos por área
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            <div className="mb-4">
              <TrendingDown className="h-8 w-8 mx-auto text-red-400 mb-2" />
            </div>
            <div className="text-sm font-medium mb-2">Erro ao carregar dados</div>
            <div className="text-xs mb-3">{error}</div>
            <Button onClick={onRefetch} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (eventosPorArea.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-600" />
            Eventos por Área de Atuação
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribuição dos eventos por área
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="mb-4">
              <PieChart className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            </div>
            <div className="text-sm font-medium mb-2">Nenhum dado encontrado</div>
            <div className="text-xs">
              Não há eventos com áreas de atuação definidas.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-blue-600" />
          Eventos por Área de Atuação
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribuição dos eventos por área
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Gráfico de Pizza */}
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <svg width="200" height="200" viewBox="-100 -100 200 200" className="transform -rotate-90">
                {pieData.map((slice, index) => (
                  <path
                    key={index}
                    d={createPieSlice(slice.startAngle, slice.endAngle, 80)}
                    fill={slice.color}
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    title={`${slice.area_atuacao}: ${slice.total_eventos} eventos (${(slice.percentage * 100).toFixed(1)}%)`}
                  />
                ))}
              </svg>
              
              {/* Centro do gráfico com total */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{totalEventos}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Legenda */}
          <div className="flex-1">
            <div className="space-y-3">
              {pieData.map((slice, index) => (
                <div key={index} className="flex items-center gap-3">
                  {/* Indicador de cor */}
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: slice.color }}
                  />
                  
                  {/* Nome da área */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {slice.area_atuacao}
                    </div>
                    <div className="text-xs text-gray-500">
                      {slice.total_eventos} evento{slice.total_eventos !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  {/* Porcentagem */}
                  <div className="text-sm font-bold text-gray-700">
                    {(slice.percentage * 100).toFixed(1)}%
                  </div>
                  
                  {/* Ranking para top 3 */}
                  {index < 3 && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Resumo */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Total de Áreas: {eventosPorArea.length}
                  </p>
                  <p className="text-xs text-blue-600">
                    Área com mais eventos: {eventosPorArea[0]?.area_atuacao} ({eventosPorArea[0]?.total_eventos} eventos)
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
