import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Search, ClipboardCheck, Sparkles, Building2, Award, Target, BookOpen, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRedirectDestination } from '@/hooks/useRedirectDestination';
import { useStatsExtended } from '@/hooks/useStatsExtended';

export default function Welcome() {
  const { destination, clearDestination } = useRedirectDestination();
  const navigate = useNavigate();
  const { totalAlunos, totalEntidades, totalEventos, totalProcessosSeletivos, loading: statsLoading } = useStatsExtended();

  const handleStartExploration = () => {
    if (destination) {
      const targetRoute = destination;
      clearDestination();
      navigate(targetRoute);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Bem-vindo ao Insper!
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Hub de Entidades Insper! 🦊
            </h1>
            
            <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto mb-8">
              Sua jornada acadêmica está apenas começando. Descubra organizações estudantis, participe de eventos e conecte-se com a comunidade do Insper.
            </p>
            
            <Button 
              size="lg" 
              className="bg-white text-red-600 hover:bg-gray-50 text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleStartExploration}
            >
              Começar Exploração
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Organizações Estudantis</h3>
              <p className="text-red-100 text-sm">
                Descubra organizações que combinam com seus interesses e valores
              </p>
            </div>
            
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Eventos e Apresentações</h3>
              <p className="text-red-100 text-sm">
                Participe de eventos exclusivos e conheça as organizações estudantis de perto
              </p>
            </div>
            
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Processos Seletivos</h3>
              <p className="text-red-100 text-sm">
                Inscreva-se e participe dos processos seletivos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            O que você gostaria de fazer?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Escolha sua próxima ação e comece a explorar o ecossistema do Insper
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Search,
              title: 'Explorar Organizações',
              description: 'Mergulhe no ecossistema do Insper e descubra organizações estudantis que combinam com seus interesses, valores e paixões.',
              link: '/entidades',
              color: 'bg-red-50 text-red-600',
              bgColor: 'bg-red-100',
              features: ['Perfis detalhados', 'Áreas de atuação', 'Informações de contato']
            },
            {
              icon: Users,
              title: 'Participar das Apresentações',
              description: 'Conecte-se com quem faz acontecer: participe das apresentações, tire dúvidas e viva a cultura das organizações estudantis de perto.',
              link: '/apresentacoes',
              color: 'bg-green-50 text-green-600',
              bgColor: 'bg-green-100',
              features: ['Apresentações ao vivo', 'Q&A interativo', 'Networking']
            },
            {
              icon: ClipboardCheck,
              title: 'Inscrição',
              description: 'Mostre que está pronto para fazer parte! Inscreva-se nas organizações estudantis que mais te inspiraram e avance no processo seletivo.',
              link: '/processo-seletivo',
              color: 'bg-purple-50 text-purple-600',
              bgColor: 'bg-purple-100',
              features: ['Formulários simples', 'Acompanhamento', 'Feedback rápido']
            },
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} to={action.link} className="group">
                <Card className="h-full hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border-0 shadow-lg bg-white overflow-hidden">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-20 h-20 ${action.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={40} className={action.color} />
                    </div>
                    <CardTitle className="text-2xl text-gray-900 group-hover:text-red-600 transition-colors duration-300">
                      {action.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <p className="text-gray-600 text-center mb-6 leading-relaxed">
                      {action.description}
                    </p>
                    
                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      {action.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white group-hover:shadow-lg transition-all duration-300">
                      Começar
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Números do Ecossistema
            </h2>
            <p className="text-lg text-gray-600">
              Conheça a dimensão da comunidade de organizações estudantis do Insper
            </p>
          </div>
          
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
             {[
               { 
                 icon: Building2, 
                 label: 'Organizações Ativas', 
                 value: statsLoading ? '...' : `${totalEntidades}+`, 
                 color: 'text-red-600' 
               },
               { 
                 icon: Users, 
                 label: 'Membros', 
                 value: statsLoading ? '...' : `${totalAlunos}+`, 
                 color: 'text-blue-600' 
               },
               { 
                 icon: Calendar, 
                 label: 'Eventos/Ano', 
                 value: statsLoading ? '...' : `${totalEventos}+`, 
                 color: 'text-green-600' 
               },
               { 
                 icon: Award, 
                 label: 'Processos Seletivos', 
                 value: statsLoading ? '...' : `${totalProcessosSeletivos}+`, 
                 color: 'text-purple-600' 
               }
             ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-600">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            O ecossistema do Insper está esperando por você. Descubra oportunidades incríveis e conecte-se com pessoas que compartilham seus interesses.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-red-600 hover:bg-gray-50 text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleStartExploration}
          >
            Explorar Agora
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}