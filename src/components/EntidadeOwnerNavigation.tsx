import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Calendar, 
  FolderOpen, 
  Users, 
  Target,
  ClipboardList,
  Settings
} from 'lucide-react';

export interface EntidadeOwnerNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  stats?: {
    totalProjetos?: number;
    totalEventos?: number;
    totalMembros?: number;
    totalTemplates?: number;
    processoAtivo?: boolean;
    totalAreas?: number;
  };
  className?: string;
}

export const EntidadeOwnerNavigation: React.FC<EntidadeOwnerNavigationProps> = ({
  activeSection,
  onSectionChange,
  stats = {},
  className = ''
}) => {
  const sections = [
    {
      id: 'visao-geral',
      title: 'Visão Geral',
      description: 'Informações e perfil da organização',
      icon: <BarChart3 className="h-5 w-5" />,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      stat: 1,
      statLabel: 'Perfil'
    },
    {
      id: 'eventos',
      title: 'Eventos e Reservas',
      description: 'Gestão de eventos e reservas',
      icon: <Calendar className="h-5 w-5" />,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-800',
      stat: stats.totalEventos || 0,
      statLabel: 'Eventos'
    },
    {
      id: 'projetos',
      title: 'Projetos',
      description: 'Lista e gerenciamento de projetos',
      icon: <FolderOpen className="h-5 w-5" />,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      stat: stats.totalProjetos || 0,
      statLabel: 'Projetos'
    },
    {
      id: 'gestao',
      title: 'Gestão de Membros',
      description: 'Membros, cargos e fases',
      icon: <Users className="h-5 w-5" />,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      stat: stats.totalMembros || 0,
      statLabel: 'Membros'
    },
    {
      id: 'processo',
      title: 'Processo Seletivo',
      description: 'Configuração do processo seletivo',
      icon: <Target className="h-5 w-5" />,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-800',
      stat: stats.processoAtivo ? 1 : 0,
      statLabel: stats.processoAtivo ? 'Ativo' : 'Inativo'
    },
    {
      id: 'templates',
      title: 'Templates',
      description: 'Formulários e templates',
      icon: <ClipboardList className="h-5 w-5" />,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      stat: stats.totalTemplates || 0,
      statLabel: 'Templates'
    },
    {
      id: 'areas',
      title: 'Áreas Internas',
      description: 'Gerenciar áreas e empresas',
      icon: <Settings className="h-5 w-5" />,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-800',
      stat: stats.totalAreas || 0,
      statLabel: 'Áreas'
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
              group relative cursor-pointer transition-all duration-200 hover:scale-105
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
            
            {/* Hover effect - apenas para cards não ativos */}
            {!isActive && (
              <div className={`
                absolute inset-0 rounded-lg transition-opacity duration-200 pointer-events-none
                opacity-0 group-hover:opacity-100
                ${section.bgColor} ${section.borderColor} border-2
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
};