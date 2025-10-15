import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Clock, Users, Filter, Eye, Sparkles, Target, Award, TrendingUp, Building2, Calendar, GraduationCap, BookOpen, RefreshCw, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useEntidade } from '@/hooks/useEntidade';
import { useEntityAuth } from '@/hooks/useEntityAuth';
import { usePageTrackingContext } from '@/components/PageTrackingProvider';
import { supabase } from '@/integrations/supabase/client';
import { supabaseWithRetry } from '@/lib/supabase-utils';
import { toast } from 'sonner';

interface DemonstracaoInteresse {
  id: number;
  entidade_id: number;
  nome_estudante: string;
  email_estudante: string;
  curso_estudante: string;
  semestre_estudante: number;
  area_interesse: string;
  mensagem?: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  created_at: string;
  updated_at: string;
}

const DemonstracoesInteresse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { entidadeId, isAuthenticated } = useEntityAuth();
  const { entidade, loading: entidadeLoading } = useEntidade(id);
  const { logPageView } = usePageTrackingContext();

  const [demonstracoes, setDemonstracoes] = useState<DemonstracaoInteresse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Log da página
  useEffect(() => {
    if (entidade) {
      logPageView('Demonstrações de Interesse', { entidade_id: entidade.id, entidade_nome: entidade.nome });
    }
  }, [entidade, logPageView]);

  // Verificar se é entidade logada
  useEffect(() => {
    // Verificar se está autenticado como entidade
    if (!isAuthenticated || !entidadeId) {
      // Se não está autenticado como entidade, verificar se é usuário normal
      if (!user) {
        navigate('/auth');
        return;
      }

      if (profile && !profile.profile_completed) {
        navigate('/profile-setup');
        return;
      }

      // Verificar se o usuário é a entidade dona desta página
      if (entidade && user.email !== entidade.email_contato) {
        toast.error('Você não tem permissão para acessar esta página');
        navigate('/entidades');
        return;
      }
    } else {
      // Se está autenticado como entidade, verificar se é a entidade correta
      if (entidade && entidadeId !== entidade.id) {
        toast.error('Você não tem permissão para acessar esta página');
        navigate('/entidades');
        return;
      }
    }
  }, [user, profile, entidade, navigate, isAuthenticated, entidadeId]);

  // Buscar demonstrações
  const fetchDemonstracoes = async () => {
    if (!entidade?.id) return;

    try {
      setLoading(true);
      console.log('🔄 Buscando demonstrações de interesse para entidade:', entidade.id);
      
      const { data, error } = await supabaseWithRetry<DemonstracaoInteresse[]>(
        () => supabase
          .from('demonstracoes_interesse')
          .select('*')
          .eq('entidade_id', entidade.id)
          .order('created_at', { ascending: false }),
        { maxRetries: 3, delay: 1000 }
      );

      if (error) {
        throw error;
      }

      console.log('📥 Demonstrações recebidas:', data?.length || 0);
      setDemonstracoes(data || []);
    } catch (error: any) {
      console.error('❌ Erro ao buscar demonstrações:', error);
      toast.error('Erro ao carregar demonstrações de interesse. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemonstracoes();
  }, [entidade?.id]);

  // Atualizar status da demonstração
  const updateStatus = async (demonstracaoId: number, newStatus: 'aprovada' | 'rejeitada') => {
    try {
      console.log(`🔄 Atualizando status da demonstração ${demonstracaoId} para ${newStatus}`);
      
      const { error } = await supabaseWithRetry(
        () => supabase
          .from('demonstracoes_interesse')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', demonstracaoId),
        { maxRetries: 2, delay: 500 }
      );

      if (error) {
        throw error;
      }

      toast.success(`Demonstração ${newStatus === 'aprovada' ? 'aprovada' : 'rejeitada'} com sucesso!`);
      
      // Atualizar lista
      setDemonstracoes(prev => 
        prev.map(d => 
          d.id === demonstracaoId 
            ? { ...d, status: newStatus, updated_at: new Date().toISOString() }
            : d
        )
      );
    } catch (error: any) {
      console.error('❌ Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status da demonstração. Tente novamente.');
    }
  };

  const filteredDemonstracoes = demonstracoes.filter(d => {
    if (statusFilter === 'todos') return true;
    return d.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejeitada':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovada':
        return <Check className="w-4 h-4" />;
      case 'rejeitada':
        return <X className="w-4 h-4" />;
      case 'pendente':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (entidadeLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando entidade...</p>
        </div>
      </div>
    );
  }

  if (!entidade) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Entidade não encontrada</h2>
          <p className="text-gray-600 mb-6">A entidade que você está procurando não existe ou foi removida.</p>
          <Link to="/entidades">
            <Button className="bg-red-600 hover:bg-red-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Entidades
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to={`/entidades/${entidade.id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para {entidade.nome}
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Demonstrações de Interesse
              </h1>
              <p className="text-gray-600">
                Gerencie as demonstrações de interesse recebidas para {entidade.nome}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Button 
                onClick={fetchDemonstracoes} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{demonstracoes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {demonstracoes.filter(d => d.status === 'pendente').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {demonstracoes.filter(d => d.status === 'aprovada').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejeitadas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {demonstracoes.filter(d => d.status === 'rejeitada').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="aprovada">Aprovadas</SelectItem>
                <SelectItem value="rejeitada">Rejeitadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Demonstrações */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDemonstracoes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma demonstração encontrada
              </h3>
              <p className="text-gray-600">
                {statusFilter === 'todos' 
                  ? 'Ainda não há demonstrações de interesse para esta entidade.'
                  : `Não há demonstrações com status "${statusFilter}".`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDemonstracoes.map((demonstracao) => (
              <Card key={demonstracao.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {demonstracao.nome_estudante}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {demonstracao.email_estudante}
                          </p>
                        </div>
                        
                        <Badge className={`${getStatusColor(demonstracao.status)} flex items-center space-x-1`}>
                          {getStatusIcon(demonstracao.status)}
                          <span className="capitalize">{demonstracao.status}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Curso</p>
                          <p className="text-sm text-gray-600">{demonstracao.curso_estudante}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700">Semestre</p>
                          <p className="text-sm text-gray-600">{demonstracao.semestre_estudante}º</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700">Área de Interesse</p>
                          <p className="text-sm text-gray-600">{demonstracao.area_interesse}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700">Data</p>
                          <p className="text-sm text-gray-600">
                            {new Date(demonstracao.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      {demonstracao.mensagem && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Mensagem</p>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                            {demonstracao.mensagem}
                          </p>
                        </div>
                      )}
                    </div>

                    {demonstracao.status === 'pendente' && (
                      <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-4">
                        <Button
                          onClick={() => updateStatus(demonstracao.id, 'aprovada')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Aprovar
                        </Button>
                        
                        <Button
                          onClick={() => updateStatus(demonstracao.id, 'rejeitada')}
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DemonstracoesInteresse; 