import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

export interface DashboardSectionProps {
  // Identificação da seção
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  
  // Navegação
  showBackButton?: boolean;
  onBackClick?: () => void;
  showRefreshButton?: boolean;
  onRefreshClick?: () => void;
  
  // Estados
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  
  // Ações adicionais
  actions?: React.ReactNode;
  
  // Conteúdo
  children: React.ReactNode;
  
  // Estilo
  variant?: 'default' | 'gradient' | 'outlined';
  className?: string;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  description,
  icon,
  iconColor,
  showBackButton = false,
  onBackClick,
  showRefreshButton = false,
  onRefreshClick,
  loading = false,
  error = null,
  isEmpty = false,
  emptyMessage = 'Nenhum dado encontrado',
  emptyIcon = <Info className="h-8 w-8 mx-auto text-gray-400 mb-2" />,
  actions,
  children,
  variant = 'default',
  className = ''
}) => {
  // Estados de renderização
  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className={`h-5 w-5 ${iconColor}`}>
              {icon}
            </div>
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          {showRefreshButton && (
            <Skeleton className="h-8 w-24" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className}`}>
        <CardHeader className={`${
          variant === 'gradient' 
            ? `bg-gradient-to-r from-red-50 to-red-100 border-red-200` 
            : ''
        }`}>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <div className={`h-5 w-5 ${iconColor}`}>
              {icon}
            </div>
            {title}
          </CardTitle>
          <p className="text-sm text-red-700">
            {description}
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-center py-8 text-red-600">
            <div className="mb-4">
              <AlertCircle className="h-8 w-8 mx-auto text-red-400 mb-2" />
            </div>
            <div className="text-sm font-medium mb-2">Erro ao carregar dados</div>
            <div className="text-xs mb-3">{error}</div>
            {showRefreshButton && onRefreshClick && (
              <Button onClick={onRefreshClick} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card className={`${className}`}>
        <CardHeader className={`${
          variant === 'gradient' 
            ? `bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200` 
            : ''
        }`}>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <div className={`h-5 w-5 ${iconColor}`}>
              {icon}
            </div>
            {title}
          </CardTitle>
          <p className="text-sm text-gray-700">
            {description}
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-center py-8 text-muted-foreground">
            <div className="mb-4">
              {emptyIcon}
            </div>
            <div className="text-sm font-medium mb-2">{emptyMessage}</div>
            <div className="text-xs">
              Não há dados para exibir no momento.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderização normal
  return (
    <Card className={`${className}`}>
      <CardHeader className={`${
        variant === 'gradient' 
          ? `bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200` 
          : variant === 'outlined'
          ? 'border-2 border-gray-200'
          : ''
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-5 w-5 ${iconColor}`}>
              {icon}
            </div>
            <div>
              <CardTitle className={`${
                variant === 'gradient' ? 'text-blue-800' : 'text-gray-900'
              }`}>
                {title}
              </CardTitle>
              <p className={`text-sm ${
                variant === 'gradient' ? 'text-blue-700' : 'text-gray-600'
              }`}>
                {description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showBackButton && onBackClick && (
              <Button 
                onClick={onBackClick} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            )}
            
            {showRefreshButton && onRefreshClick && (
              <Button 
                onClick={onRefreshClick} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
            )}
            
            {actions}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {children}
      </CardContent>
    </Card>
  );
};

// Componente para estatísticas em cards
export interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  iconColor,
  trend,
  onClick,
  className = ''
}) => {
  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      } ${className}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`h-5 w-5 ${iconColor}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </div>
        <p className="text-xs text-muted-foreground mb-2">{description}</p>
        
        {trend && (
          <div className="flex items-center gap-1 text-xs">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-gray-500">vs. {trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para métricas de status
export interface StatusMetricsProps {
  metrics: Array<{
    label: string;
    value: number;
    color: string;
    bgColor: string;
    textColor: string;
  }>;
  className?: string;
}

export const StatusMetrics: React.FC<StatusMetricsProps> = ({
  metrics,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {metrics.map((metric, index) => (
        <div 
          key={index} 
          className={`text-center p-4 ${metric.bgColor} rounded-lg`}
        >
          <div className={`text-2xl font-bold ${metric.textColor}`}>
            {metric.value.toLocaleString('pt-BR')}
          </div>
          <div className={`text-sm ${metric.textColor}`}>
            {metric.label}
          </div>
        </div>
      ))}
    </div>
  );
};
