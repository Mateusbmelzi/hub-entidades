import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Code, ExternalLink, FolderOpen, Building2, Target, Sparkles, Users, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProjeto } from '@/hooks/useProjeto';
import { useProjetoEmpresasParceiras } from '@/hooks/useProjetoEmpresasParceiras';
import { useProjetoMembros } from '@/hooks/useProjetoMembros';
import { GerenciarEmpresasParceirasProjeto } from '@/components/GerenciarEmpresasParceirasProjeto';
import { VincularMembrosProjeto } from '@/components/VincularMembrosProjeto';
import { useEntityAuth } from '@/hooks/useEntityAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ProjetoDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const { projeto, loading, error, refetch: refetchProjeto } = useProjeto(id);
  const { empresasAssociadas: empresasParceiras, loading: loadingEmpresas, refetch: refetchEmpresas } = useProjetoEmpresasParceiras(id);
  const { membros: membrosProjeto, loading: loadingMembros, refetch: refetchMembros } = useProjetoMembros(id);
  const { entidadeId, isAuthenticated } = useEntityAuth();
  
  // Verificar se o usuário é membro da entidade do projeto
  const isOwner = isAuthenticated && projeto && projeto.entidade_id && entidadeId === projeto.entidade_id;
  
  // Recarregar projeto quando a página ganha foco (após voltar de edição)
  React.useEffect(() => {
    const handleFocus = () => {
      if (id) {
        console.log('🔄 Página ganhou foco, recarregando projeto...');
        refetchProjeto();
        refetchEmpresas();
        refetchMembros();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [id, refetchProjeto, refetchEmpresas, refetchMembros]);

  // Log para debug da imagem
  React.useEffect(() => {
    if (projeto) {
      console.log('📸 Projeto carregado - imagem_url:', projeto.imagem_url);
      console.log('📸 Projeto completo:', { 
        id: projeto.id, 
        nome: projeto.nome, 
        imagem_url: projeto.imagem_url,
        temImagem: !!projeto.imagem_url 
      });
      
      // Testar se a imagem está acessível
      if (projeto.imagem_url) {
        console.log('🖼️ Testando acesso à imagem:', projeto.imagem_url);
        const img = new Image();
        img.onload = () => {
          console.log('✅ Imagem carregada com sucesso e está acessível!');
          console.log('   URL:', projeto.imagem_url);
        };
        img.onerror = (error) => {
          console.error('❌ Erro ao carregar imagem:', projeto.imagem_url);
          console.error('   Possíveis causas:');
          console.error('   - Bucket não está público');
          console.error('   - URL incorreta');
          console.error('   - Problema de CORS');
          console.error('   Erro detalhado:', error);
        };
        img.src = projeto.imagem_url;
      } else {
        console.warn('⚠️ Projeto não tem imagem_url definida');
      }
    }
  }, [projeto?.imagem_url, projeto?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'em_desenvolvimento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'concluido':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pausado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'em_desenvolvimento':
        return 'Em Desenvolvimento';
      case 'concluido':
        return 'Concluído';
      case 'pausado':
        return 'Pausado';
      default:
        return status || 'Ativo';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-insper-red/20 border-t-insper-red mx-auto mb-6"></div>
          <p className="text-insper-dark-gray text-lg">Carregando projeto...</p>
          <p className="text-insper-dark-gray/60 text-sm mt-2">Preparando os detalhes para você</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-insper-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-10 h-10 text-insper-red" />
          </div>
          <h1 className="text-2xl font-bold text-insper-black mb-4">Erro ao carregar projeto</h1>
          <p className="text-insper-dark-gray mb-6">
            {error || 'Erro desconhecido'}
          </p>
          <Button asChild className="bg-insper-red hover:bg-red-700 text-white">
            <Link to="/entidades">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!projeto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-insper-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-10 h-10 text-insper-red" />
          </div>
          <h1 className="text-2xl font-bold text-insper-black mb-4">Projeto não encontrado</h1>
          <p className="text-insper-dark-gray mb-6">O projeto que você está procurando não existe ou foi removido.</p>
          <Button asChild className="bg-insper-red hover:bg-red-700 text-white">
            <Link to="/entidades">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const entidade = (projeto as any).entidades;

  return (
    <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white">
      {/* Hero Header */}
      <div className={`relative text-white overflow-hidden ${projeto.imagem_url ? '' : 'bg-insper-red'}`}>
        {/* Background Image with Overlay */}
        {projeto.imagem_url ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${projeto.imagem_url})`,
              }}
            />
            {/* Dark Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-insper-red/90 via-insper-red/80 to-insper-red/70" />
            {/* Additional overlay for better contrast */}
            <div className="absolute inset-0 bg-black/30" />
          </>
        ) : (
          /* Background Pattern (only when no image) */
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
        )}
        
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${projeto.imagem_url ? 'py-16 md:py-24' : 'py-8'}`}>
          {/* Navigation */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="text-white hover:bg-white/20 backdrop-blur-sm">
              <Link to={entidade ? `/entidades/${entidade.id}` : '/entidades'}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </div>

          {/* Hero Content */}
          <div className={`flex flex-col ${projeto.imagem_url ? 'lg:flex-row lg:items-center' : 'lg:flex-row lg:items-start'} lg:justify-between gap-8`}>
            <div className="flex-1">
              <div className="mb-6">
                <h1 className={`text-4xl md:text-5xl font-bold mb-6 leading-tight ${projeto.imagem_url ? 'text-white drop-shadow-lg' : ''}`}>
                  {projeto.nome}
                </h1>
                
                {/* Categoria */}
                {projeto.categoria && (
                  <div className="mb-6">
                    <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-2 font-medium">
                      {projeto.categoria}
                    </Badge>
                  </div>
                )}
                
                <div className={`flex flex-wrap items-center gap-6 mb-6 ${projeto.imagem_url ? 'text-white drop-shadow-lg' : 'text-red-100'}`}>
                  {projeto.data_inicio && (
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Início: {format(new Date(projeto.data_inicio), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </div>
                  )}
                  {projeto.data_fim && (
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Fim: {format(new Date(projeto.data_fim), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </div>
                  )}
                </div>

                {projeto.descricao && (
                  <p className={`text-xl leading-relaxed max-w-3xl ${projeto.imagem_url ? 'text-white drop-shadow-lg' : 'text-red-100'}`}>
                    {projeto.descricao}
                  </p>
                )}
              </div>
            </div>

            {/* Action Card */}
            <div className="lg:w-96">
              <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-gray-900">Informações do Projeto</CardTitle>
                    <Badge
                      className={`${getStatusColor(projeto.status || 'ativo')} text-sm px-3 py-1`}
                    >
                      {getStatusLabel(projeto.status || 'ativo')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {projeto.repositorio_url && (
                    <div className="pt-4">
                      <Button 
                        className="w-full bg-white text-red-600 hover:bg-gray-50 border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300"
                        asChild
                      >
                        <a 
                          href={projeto.repositorio_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver Repositório
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tecnologias */}
            {projeto.tecnologias && projeto.tecnologias.length > 0 && (
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <Code className="w-5 h-5 text-red-600" />
                    <CardTitle className="text-xl">Tecnologias Utilizadas</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {projeto.tecnologias.map((tech, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-sm bg-gray-50 px-4 py-2"
                      >
                        <Code className="h-3 w-3 mr-2" />
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empresas Parceiras */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-red-600" />
                  <CardTitle className="text-xl">Empresas Parceiras do Projeto</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isOwner && projeto && projeto.entidade_id ? (
                  <GerenciarEmpresasParceirasProjeto
                    projetoId={projeto.id}
                    entidadeId={projeto.entidade_id}
                    onSuccess={() => {
                      refetchEmpresas();
                      refetchProjeto();
                    }}
                  />
                ) : (
                  <>
                    {loadingEmpresas ? (
                      <div className="text-center py-6">
                        <p className="text-sm text-gray-600">Carregando empresas parceiras...</p>
                      </div>
                    ) : empresasParceiras && empresasParceiras.length > 0 ? (
                      <div className="flex flex-wrap gap-4">
                        {empresasParceiras.map((empresa) => (
                          <div
                            key={empresa.id}
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 hover:border-red-300 transition-colors"
                          >
                            {empresa.logo && (
                              <img
                                src={empresa.logo}
                                alt={empresa.nome}
                                className="w-12 h-12 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {empresa.nome}
                              </h4>
                              {empresa.descricao && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {empresa.descricao}
                                </p>
                              )}
                              {empresa.link && (
                                <a
                                  href={empresa.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1 mt-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Visitar site
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Nenhuma empresa parceira associada a este projeto
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Membros do Projeto */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-red-600" />
                  <CardTitle className="text-xl">Integrantes do Projeto</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isOwner && projeto && projeto.entidade_id ? (
                  <VincularMembrosProjeto
                    projetoId={projeto.id}
                    entidadeId={projeto.entidade_id}
                    onUpdate={() => {
                      refetchMembros();
                      refetchProjeto();
                    }}
                  />
                ) : (
                  <>
                    {loadingMembros ? (
                      <div className="text-center py-6">
                        <p className="text-sm text-gray-600">Carregando integrantes...</p>
                      </div>
                    ) : membrosProjeto && membrosProjeto.length > 0 ? (
                      <div className="space-y-3">
                        {membrosProjeto.map((membroProjeto) => (
                          <div
                            key={membroProjeto.id}
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                              {membroProjeto.membro?.profile?.nome
                                ? membroProjeto.membro.profile.nome.charAt(0).toUpperCase()
                                : membroProjeto.membro?.profile?.email
                                ? membroProjeto.membro.profile.email.charAt(0).toUpperCase()
                                : '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {membroProjeto.membro?.profile?.nome || 
                                   membroProjeto.membro?.profile?.email || 
                                   'Membro sem nome'}
                                </h4>
                                {membroProjeto.eh_responsavel && (
                                  <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                                    Responsável
                                  </Badge>
                                )}
                              </div>
                              {membroProjeto.funcao && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {membroProjeto.funcao}
                                </p>
                              )}
                              {membroProjeto.membro?.profile?.email && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {membroProjeto.membro.profile.email}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Nenhum integrante associado a este projeto
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-red-600" />
                  <CardTitle className="text-xl">Detalhes do Projeto</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {projeto.data_inicio && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-2 h-4 w-4" />
                      Data de Início
                    </div>
                    <span className="font-semibold text-gray-900">
                      {format(new Date(projeto.data_inicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}
                {projeto.data_fim && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-2 h-4 w-4" />
                      Data de Término
                    </div>
                    <span className="font-semibold text-gray-900">
                      {format(new Date(projeto.data_fim), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-sm text-gray-600">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Status
                  </div>
                  <Badge className={getStatusColor(projeto.status || 'ativo')}>
                    {getStatusLabel(projeto.status || 'ativo')}
                  </Badge>
                </div>
                {projeto.categoria && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600">
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Categoria
                    </div>
                    <span className="font-semibold text-gray-900">{projeto.categoria}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Entity Information */}
            {entidade && (
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-red-600" />
                    <CardTitle className="text-xl">Organização Responsável</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200">
                    <h3 className="font-bold text-lg mb-3 text-gray-900">
                      <Link 
                        to={`/entidades/${entidade.id}`}
                        className="hover:text-red-600 transition-colors"
                      >
                        {entidade.nome}
                      </Link>
                    </h3>
                    {entidade.descricao_curta && (
                      <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        {entidade.descricao_curta}
                      </p>
                    )}
                    {entidade.contato && (
                      <div className="flex items-center text-sm text-gray-600">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {entidade.contato}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50" asChild>
                    <Link to={`/entidades/${entidade.id}`}>
                      Ver Perfil da Organização
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Repositório */}
            {projeto.repositorio_url && (
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="w-5 h-5 text-red-600" />
                    <CardTitle className="text-xl">Repositório</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    asChild
                  >
                    <a 
                      href={projeto.repositorio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Acessar Repositório
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Link de Apresentação */}
            {projeto.link_apresentacao && (
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <Presentation className="w-5 h-5 text-red-600" />
                    <CardTitle className="text-xl">Apresentação</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    asChild
                  >
                    <a 
                      href={projeto.link_apresentacao} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Presentation className="mr-2 h-4 w-4" />
                      Ver Apresentação
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjetoDetalhes;

