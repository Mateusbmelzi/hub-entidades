import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Calendar, 
  Building2, 
  GraduationCap, 
  TrendingUp,
  Users,
  Target,
  Activity,
  History,
  Clock,
  CalendarDays,
  Building
} from 'lucide-react';

export interface DashboardNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  stats?: {
    totalAlunos?: number;
    totalEntidades?: number;
    totalEventos?: number;
    totalDemonstracoes?: number;
    totalReservas?: number;
    reservasPendentes?: number;
    totalEmpresas?: number;
  };
  className?: string;
}

export const DashboardNavigation: React.FC<DashboardNavigationProps> = ({
  activeSection,
  onSectionChange,
  stats = {},
  className = ''
}) => {
  const sections = [
    {
      id: 'overview',
      title: 'Visão Geral',
      description: 'Indicadores principais e resumo',
      icon: <BarChart3 className="h-5 w-5" />,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      stat: stats.totalAlunos || 0,
      statLabel: 'Alunos'
    },
    {
      id: 'eventos',
      title: 'Aprovações',
      description: 'Gestão de reservas pendentes',
      icon: <Clock className="h-5 w-5" />,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-800',
      stat: stats.reservasPendentes || 0,
      statLabel: 'Pendentes'
    },
    {
      id: 'reservas',
      title: 'Reservas',
      description: 'Histórico completo de reservas',
      icon: <History className="h-5 w-5" />,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      stat: stats.totalReservas || 0,
      statLabel: 'Total'
    },
    {
      id: 'calendario',
      title: 'Calendário',
      description: 'Visualização de eventos',
      icon: <CalendarDays className="h-5 w-5" />,
      iconColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      textColor: 'text-cyan-800',
      stat: stats.totalReservas || 0,
      statLabel: 'Eventos'
    },
    {
      id: 'organizacoes',
      title: 'Organizações',
      description: 'Entidades e demonstrações',
      icon: <Building2 className="h-5 w-5" />,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      stat: stats.totalEntidades || 0,
      statLabel: 'Entidades'
    },
    {
      id: 'alunos',
      title: 'Alunos',
      description: 'Distribuição e análise',
      icon: <GraduationCap className="h-5 w-5" />,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-800',
      stat: stats.totalAlunos || 0,
      statLabel: 'Alunos'
    },
    {
      id: 'empresas',
      title: 'Empresas Parceiras',
      description: 'Gerenciar empresas parceiras',
      icon: <Building className="h-5 w-5" />,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      stat: stats.totalEmpresas || 0,
      statLabel: 'Empresas'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mb-6 ${className}`}>
      {sections.map((section) => {
        const isActive = activeSection === section.id;
        
        return (
          <div
            key={section.id}
            className={`
              relative cursor-pointer transition-all duration-200 hover:scale-105
              ${isActive 
                ? `${section.bgColor} ${section.borderColor} border-2 shadow-lg` 
                : 'bg-white hover:shadow-lg border border-gray-200'
              }
              rounded-lg p-4
            `}
            onClick={() => onSectionChange(section.id)}
          >
            {/* Indicador de seção ativa */}
            {isActive && (
              <div className={`absolute top-2 right-2 w-3 h-3 ${section.bgColor.replace('bg-', 'bg-')} rounded-full border-2 border-white shadow-sm`} />
            )}
            
            {/* Header do card */}
            <div className="flex items-center justify-between mb-3">
              <div className={`${section.iconColor}`}>
                {section.icon}
              </div>
              {isActive && (
                <Badge variant="secondary" className={`${section.textColor} ${section.bgColor}`}>
                  Ativo
                </Badge>
              )}
            </div>
            
            {/* Conteúdo do card */}
            <div className="space-y-2">
              <h3 className={`font-semibold text-lg ${
                isActive ? section.textColor : 'text-gray-900'
              }`}>
                {section.title}
              </h3>
              
              <p className={`text-sm ${
                isActive ? section.textColor.replace('text-', 'text-').replace('-800', '-700') : 'text-gray-600'
              }`}>
                {section.description}
              </p>
              
              {/* Estatística */}
              <div className="pt-2">
                <div className={`text-2xl font-bold ${
                  isActive ? section.textColor : 'text-gray-900'
                }`}>
                  {section.stat.toLocaleString('pt-BR')}
                </div>
                <div className={`text-xs ${
                  isActive ? section.textColor.replace('text-', 'text-').replace('-800', '-600') : 'text-gray-500'
                }`}>
                  {section.statLabel}
                </div>
              </div>
            </div>
            
            {/* Hover effect */}
            <div className={`
              absolute inset-0 rounded-lg transition-opacity duration-200
              ${isActive ? 'opacity-0' : 'opacity-0 hover:opacity-100'}
              ${section.bgColor} ${section.borderColor} border-2
            `} />
          </div>
        );
      })}
    </div>
  );
};

// Componente para breadcrumb de navegação
export interface DashboardBreadcrumbProps {
  sections: Array<{
    id: string;
    title: string;
    icon?: React.ReactNode;
  }>;
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  className?: string;
}

export const DashboardBreadcrumb: React.FC<DashboardBreadcrumbProps> = ({
  sections,
  activeSection,
  onSectionClick,
  className = ''
}) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {sections.map((section, index) => {
        const isActive = activeSection === section.id;
        const isLast = index === sections.length - 1;
        
        return (
          <React.Fragment key={section.id}>
            <button
              onClick={() => onSectionClick(section.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md transition-colors
                ${isActive 
                  ? 'bg-blue-100 text-blue-800 font-medium' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              {section.icon && <span className="h-4 w-4">{section.icon}</span>}
              {section.title}
            </button>
            
            {!isLast && (
              <span className="text-gray-400">/</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// Componente para ações de seção
export interface DashboardSectionActionsProps {
  title: string;
  description?: string;
  actions: React.ReactNode;
  className?: string;
}

export const DashboardSectionActions: React.FC<DashboardSectionActionsProps> = ({
  title,
  description,
  actions,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {actions}
      </div>
    </div>
  );
};
