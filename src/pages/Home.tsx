import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, BarChart3, Users, ArrowRight, Target, TrendingUp, UserPlus, Eye, Award, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useRedirectDestination } from '@/hooks/useRedirectDestination';
import { useStats } from '@/hooks/useStats';

const Home = () => {
  const { user } = useAuth();
  const { setDestination } = useRedirectDestination();
  const navigate = useNavigate();
  const { totalAlunos, totalEntidades, loading: statsLoading, error: statsError } = useStats();

  const handleProtectedNavigation = (route: string) => {
    if (!user) {
      // Se não está logado, salva a rota de destino e vai para auth
      setDestination(route);
      navigate('/auth');
    } else {
      // Se está logado, navega diretamente
      navigate(route);
    }
  };

  const features = [{
    icon: Search,
    title: 'Descobrir Organizações',
    description: 'Explore todas as organizações estudantis do Insper e encontre aquelas que combinam com seu perfil e interesses.',
    color: 'bg-insper-red/10 text-insper-red',
    link: '/entidades'
  }, {
    icon: UserPlus,
    title: 'Processos Seletivos',
    description: 'Demonstre interesse e participe dos processos seletivos das organizações que mais te interessam.',
    color: 'bg-insper-green/10 text-insper-green',
    link: '/eventos'
  }, {
    icon: Eye,
    title: 'Eventos e Apresentações',
    description: 'Assista às apresentações e participe de eventos para conhecer melhor as organizações estudantis.',
    color: 'bg-insper-purple/10 text-insper-purple',
    link: '/eventos'
  }];

  const stats = [
    { 
      number: statsLoading ? '...' : `${totalEntidades}+`, 
      label: 'Organizações Estudantis', 
      icon: Building2 
    },
    { 
      number: statsLoading ? '...' : `${totalAlunos}+`, 
      label: 'Alunos Ativos', 
      icon: Users 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white">
      {/* Hero Section */}
      <div className="relative bg-insper-red text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Hub de Entidades
              <span className="block text-red-200">Insper</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-red-100 max-w-4xl mx-auto leading-relaxed">
              Conecte-se com organizações estudantis, participe de processos seletivos, inscreva-se em eventos e faça parte da comunidade que move o Insper.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-8 py-4 bg-white text-insper-red hover:bg-gray-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 button-mobile"
                onClick={() => handleProtectedNavigation('/entidades')}
              >
                Explorar Organizações
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button 
                size="lg" 
                variant="yellow"
                className="text-lg px-8 py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 button-mobile"
                onClick={() => handleProtectedNavigation('/eventos')}
              >
                <Calendar className="mr-2" size={20} />
                Ver Eventos
              </Button>
            </div>

             {/* Stats */}
             <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
               {statsError ? (
                 <div className="col-span-2 text-center">
                   <div className="text-sm text-red-200">
                     Dados temporariamente indisponíveis
                   </div>
                 </div>
               ) : (
                 stats.map((stat, index) => {
                   const Icon = stat.icon;
                   return (
                     <div key={index} className="text-center">
                       <div className="flex items-center justify-center mb-2">
                         <Icon className="w-6 h-6 text-red-200" />
                       </div>
                       <div className="text-3xl font-bold text-white">{stat.number}</div>
                       <div className="text-sm text-red-200">{stat.label}</div>
                     </div>
                   );
                 })
               )}
             </div>
           </div>
         </div>
       </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ferramentas inteligentes criadas para potencializar sua jornada acadêmica e aproximar você do que o Insper tem de melhor.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group">
                <Card 
                  className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-0 shadow-lg bg-white card-mobile"
                  onClick={() => handleProtectedNavigation(feature.link)}
                >
                  <CardHeader className="text-center pb-6">
                    <div className={`w-20 h-20 rounded-2xl ${feature.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon size={36} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6">
              Sobre o Projeto
            </h2>
            <div className="w-24 h-1 bg-red-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="space-y-8 text-lg text-gray-300 leading-relaxed">
            <p className="text-center text-xl">
              O <strong className="text-white">Hub de Entidades Insper</strong> é uma plataforma desenvolvida de forma independente por <strong className="text-white">Gabriel Pradyumna</strong> (Ciência da Computação - Insper) e <strong className="text-white">Mateus Melzi</strong> (Administração - Insper).
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4">Nossa Missão</h3>
                <p className="text-gray-300">
                  Criar uma ponte entre calouros e as diversas organizações estudantis do Insper, oferecendo uma experiência acessível, centralizada e intuitiva.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4">Nossa Visão</h3>
                <p className="text-gray-300">
                  Evoluir a plataforma para se tornar um espaço completo de conexão, pertencimento e protagonismo estudantil na comunidade Insper.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Logo e Descrição */}
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/logo-hub-entidades.svg" 
                  alt="Hub de Entidades Insper" 
                  className="w-10 h-10"
                />
                <span className="text-2xl font-bold text-gray-900">Hub de Entidades</span>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed max-w-md">
                Conectando alunos às organizações estudantis do Insper através de uma plataforma moderna e intuitiva.
              </p>
            </div>
            
            {/* Links Rápidos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Links Rápidos</h3>
              <div className="space-y-2">
                <Link to="/entidades" className="block text-gray-600 hover:text-red-600 transition-colors nav-link-mobile">
                  Organizações
                </Link>
                <Link to="/eventos" className="block text-gray-600 hover:text-red-600 transition-colors nav-link-mobile">
                  Eventos
                </Link>
                <Link to="/auth" className="block text-gray-600 hover:text-red-600 transition-colors nav-link-mobile">
                  Entrar
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8">
            <div className="footer-mobile-layout">
              <div className="footer-text-mobile">
                <div className="mb-2">
                  © 2025 Hub de Entidades Insper. Desenvolvido por:
                </div>
                <div className="footer-links-mobile">
                  <a 
                    href="https://www.linkedin.com/in/gabriel-pradyumna-alencar-costa-8887a6201/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="footer-link-mobile"
                  >
                    Gabriel Pradyumna
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/mateus-bellon-melzi-6381111a9/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="footer-link-mobile"
                  >
                    Mateus Melzi
                  </a>
                </div>
                <div className="mt-2">
                  <a 
                    href="https://www.instagram.com/hubdeentidades/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="footer-link-mobile"
                  >
                    Siga-nos no Instagram
                  </a>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-500">
                  Plataforma não oficial • Projeto independente
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;