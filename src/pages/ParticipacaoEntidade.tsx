import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Users, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ParticipacaoEntidade = () => {
  const { id } = useParams();
  const [isInWaitlist, setIsInWaitlist] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Dados mockados - em uma aplicação real, viria do Supabase
  const entidadeData = {
    1: {
      name: 'Insper Code',
      description: 'Entidade focada no desenvolvimento de software, programação competitiva e projetos de tecnologia.',
      color: 'bg-red-500',
      processoSeletivo: {
        status: 'aberto', // 'aberto', 'fechado', 'em_breve'
        dataInicio: '2024-01-15',
        dataFim: '2024-01-30',
        proximaData: '2024-02-15',
        vagasDisponiveis: 15,
        totalVagas: 20
      },
      topicosEstudo: [
        'JavaScript fundamentals',
        'React e componentes funcionais',
        'Algoritmos e estruturas de dados',
        'Git e controle de versão',
        'APIs REST e integração'
      ],
      requisitos: [
        'Conhecimento básico em programação',
        'Disponibilidade de 6 horas semanais',
        'Interesse em projetos colaborativos'
      ]
    },
    2: {
      name: 'Insper DATA',
      description: 'Especializada em ciência de dados, machine learning e análise estatística.',
      color: 'bg-green-500',
      processoSeletivo: {
        status: 'fechado',
        dataInicio: '2024-01-15',
        dataFim: '2024-01-30',
        proximaData: '2024-03-01',
        vagasDisponiveis: 0,
        totalVagas: 12
      },
      topicosEstudo: [
        'Python para análise de dados',
        'Pandas e NumPy',
        'Estatística descritiva e inferencial',
        'Machine Learning básico',
        'Visualização de dados com Matplotlib/Seaborn'
      ],
      requisitos: [
        'Conhecimento básico em Python',
        'Noções de estatística',
        'Disponibilidade de 8 horas semanais'
      ]
    },
    3: {
      name: 'Insper Junior',
      description: 'Empresa júnior de consultoria empresarial que oferece soluções estratégicas.',
      color: 'bg-red-100 text-red-800',
      processoSeletivo: {
        status: 'em_breve',
        dataInicio: '2024-02-01',
        dataFim: '2024-02-15',
        proximaData: '2024-02-01',
        vagasDisponiveis: 10,
        totalVagas: 10
      },
      topicosEstudo: [
        'Fundamentos de estratégia empresarial',
        'Análise SWOT e Canvas',
        'Apresentações executivas',
        'Excel avançado',
        'Conceitos de marketing digital'
      ],
      requisitos: [
        'Interesse em consultoria empresarial',
        'Habilidades de comunicação',
        'Disponibilidade de 10 horas semanais'
      ]
    }
  };

  // Convert string id to number for proper lookup
  const numericId = id ? parseInt(id, 10) : null;
  const entidade = numericId && entidadeData[numericId as keyof typeof entidadeData];

  if (!entidade) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Organização não encontrada</h1>
          <Link to="/entidades">
            <Button variant="outline">Voltar às Organizações</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusInfo = () => {
    switch (entidade.processoSeletivo.status) {
      case 'aberto':
        return {
          status: 'Inscrições Abertas',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          buttonText: 'Quero participar',
          buttonAction: () => setHasApplied(true)
        };
      case 'fechado':
        return {
          status: 'Próximo processo em breve',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          buttonText: 'Entrar na lista de espera',
          buttonAction: () => setIsInWaitlist(true)
        };
      case 'em_breve':
        return {
          status: 'Em breve',
          color: 'bg-blue-100 text-blue-800',
          icon: AlertCircle,
          buttonText: 'Entrar na lista de espera',
          buttonAction: () => setIsInWaitlist(true)
        };
      default:
        return {
          status: 'Status não definido',
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle,
          buttonText: 'Entrar na lista de espera',
          buttonAction: () => setIsInWaitlist(true)
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center mb-6">
            <Link to="/entidades" className="mr-4">
              <Button variant="outline" size="sm" className="secondary-action">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div className={`w-12 h-12 rounded-lg ${entidade.color} flex items-center justify-center text-white font-bold text-lg mr-4`}>
              {entidade.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{entidade.name}</h1>
              <p className="text-muted-foreground">{entidade.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Informações do Processo Seletivo */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-foreground">
                    <Calendar className="mr-2 h-5 w-5" />
                    Processo Seletivo
                  </CardTitle>
                  <Badge variant={
                    entidade.processoSeletivo.status === 'aberto' ? 'success' :
                    entidade.processoSeletivo.status === 'fechado' ? 'warning' : 'secondary'
                  }>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {statusInfo.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Data do próximo processo</h4>
                    <p className="text-muted-foreground">
                      {new Date(entidade.processoSeletivo.proximaData).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Vagas disponíveis</h4>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {entidade.processoSeletivo.vagasDisponiveis} de {entidade.processoSeletivo.totalVagas} vagas
                      </span>
                    </div>
                  </div>
                </div>

                {entidade.processoSeletivo.status === 'aberto' && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-success mr-2" />
                      <span className="text-success font-medium">
                        Inscrições abertas até {new Date(entidade.processoSeletivo.dataFim).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tópicos de Estudo */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Tópicos para Preparação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entidade.topicosEstudo.map((topico, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-muted-foreground">{topico}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requisitos */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entidade.requisitos.map((requisito, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-muted-foreground">{requisito}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com ação */}
          <div className="space-y-6">
            <Card className="bg-card">
              <CardContent className="p-6">
                {hasApplied ? (
                  <div className="text-center space-y-4">
                    <CheckCircle className="w-12 h-12 text-success mx-auto" />
                    <h3 className="text-lg font-semibold text-success">Inscrição Realizada!</h3>
                    <p className="text-sm text-muted-foreground">
                      Você receberá um e-mail com os próximos passos em breve.
                    </p>
                  </div>
                ) : isInWaitlist ? (
                  <div className="text-center space-y-4">
                    <Clock className="w-12 h-12 text-warning mx-auto" />
                    <h3 className="text-lg font-semibold text-warning">Na Lista de Espera</h3>
                    <p className="text-sm text-muted-foreground">
                      Você será notificado quando as inscrições abrirem.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-center text-foreground">Pronto para participar?</h3>
                    <Button 
                      className="w-full primary-cta"
                      onClick={statusInfo.buttonAction}
                    >
                      {statusInfo.buttonText}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      {entidade.processoSeletivo.status === 'aberto' 
                        ? 'Ao clicar, você será redirecionado para o formulário de inscrição.'
                        : 'Você será notificado quando as inscrições abrirem.'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações adicionais */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Informações Importantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <strong className="text-foreground">Duração:</strong>
                  <br />
                  Semestre letivo completo
                </div>
                <div>
                  <strong className="text-foreground">Contato:</strong>
                  <br />
                  {entidade.name.toLowerCase().replace(' ', '')}@insper.edu.br
                </div>
                <div>
                  <strong className="text-foreground">Modalidade:</strong>
                  <br />
                  Presencial e remoto
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipacaoEntidade;
