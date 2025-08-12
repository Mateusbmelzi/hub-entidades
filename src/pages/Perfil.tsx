import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateInput } from '@/components/ui/date-input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Mail, Calendar, GraduationCap, BookOpen, Edit, Save, X, LogOut, Settings, Sparkles, Target, Award, Shield, ArrowLeft, Building2, Check, Clock, X as XIcon, Trash2, AlertTriangle, MapPin, Users, ExternalLink, RefreshCw, Phone } from 'lucide-react';
import { formatDateToISO, formatDateFromISO, formatDateForDisplay } from '@/lib/date-utils';

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
  entidade_nome: string;
  entidade_area_atuacao?: string;
}

interface InscricaoEvento {
  id: string;
  evento_id: string;
  nome_participante: string;
  email: string;
  telefone?: string;
  status_participacao: 'confirmado' | 'pendente' | 'cancelado';
  data_inscricao: string;
  evento_nome: string;
  evento_descricao?: string;
  evento_data?: string;
  evento_local?: string;
  evento_entidade_nome?: string;
}

export default function Perfil() {
  const { user, profile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demonstracoes, setDemonstracoes] = useState<DemonstracaoInteresse[]>([]);
  const [loadingDemonstracoes, setLoadingDemonstracoes] = useState(true);
  const [editingDemonstracao, setEditingDemonstracao] = useState<number | null>(null);
  const [newAreaInteresse, setNewAreaInteresse] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [inscricoesEventos, setInscricoesEventos] = useState<InscricaoEvento[]>([]);
  const [loadingInscricoes, setLoadingInscricoes] = useState(true);

  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [curso, setCurso] = useState('');
  const [semestre, setSemestre] = useState(1);
  const [areaInteresse, setAreaInteresse] = useState('');
  const [celular, setCelular] = useState('');

  if (!user) return <Navigate to="/auth" replace />;
  if (!profile?.profile_completed) return <Navigate to="/profile-setup" replace />;

  useEffect(() => {
    if (profile) {
      setNome(profile.nome || '');
      setDataNascimento(profile.data_nascimento 
        ? (() => {
            const [y, m, d] = profile.data_nascimento.split("-");
            // forçando horário meio-dia para evitar problema do timezone
            const date = new Date(+y, +m - 1, +d + 1, 12, 0);
            // aqui você pode formatar para dd/mm/yyyy para exibir, por exemplo:
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          })()
        : '');
      setCurso(profile.curso || '');
      setSemestre(profile.semestre || 1);
      setAreaInteresse(profile.area_interesse || '');
      setCelular(profile.celular || '');
    }
  }, [profile]);

  // Função para buscar demonstrações
  const fetchDemonstracoes = async () => {
    if (!user?.email) return;

    try {
      setLoadingDemonstracoes(true);
      console.log('🔄 Buscando demonstrações para:', user.email);
      
      const { data, error } = await supabase
        .from('demonstracoes_interesse')
        .select('*')
        .eq('email_estudante', user.email)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('📥 Demonstrações encontradas:', data?.length || 0);

      // Buscar informações das entidades separadamente
      if (data && data.length > 0) {
        const entidadeIds = [...new Set(data.map(d => d.entidade_id))];
        const { data: entidadesData, error: entidadesError } = await supabase
          .from('entidades')
          .select('id, nome, area_atuacao')
          .in('id', entidadeIds);

        if (entidadesError) {
          console.error('❌ Erro ao buscar entidades:', entidadesError);
        } else {
          // Criar um mapa de entidades para acesso rápido
          const entidadesMap = new Map();
          entidadesData?.forEach(entidade => {
            entidadesMap.set(entidade.id, entidade);
          });

          // Combinar os dados
          const demonstracoesComEntidade = data.map(d => {
            const entidade = entidadesMap.get(d.entidade_id);
            return {
              ...d,
              entidade_nome: entidade?.nome || 'Organização não encontrada',
              entidade_area_atuacao: entidade?.area_atuacao
            };
          });

          setDemonstracoes(demonstracoesComEntidade);
          console.log('✅ Demonstrações carregadas:', demonstracoesComEntidade.length);
        }
      } else {
        setDemonstracoes([]);
        console.log('📭 Nenhuma demonstração encontrada');
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar demonstrações:', error);
      toast.error('Erro ao carregar seus processos seletivos');
      setDemonstracoes([]);
    } finally {
      setLoadingDemonstracoes(false);
    }
  };

  // Buscar demonstrações de interesse do usuário
  useEffect(() => {
    fetchDemonstracoes();
  }, [user?.email]);

  // Função para recarregar demonstrações
  const recarregarDemonstracoes = () => {
    console.log('🔄 Recarregando demonstrações...');
    fetchDemonstracoes();
  };

  // Buscar inscrições em eventos do usuário
  useEffect(() => {
    const fetchInscricoesEventos = async () => {
      if (!user?.email) return;

      try {
        setLoadingInscricoes(true);
        console.log('🔍 Buscando inscrições para:', user.email);
        
        const { data, error } = await supabase
          .from('participantes_evento')
          .select('*')
          .eq('email', user.email)
          .order('data_inscricao', { ascending: false });

        if (error) {
          console.error('❌ Erro na consulta participantes_evento:', error);
          throw error;
        }

        // console.log('✅ Inscrições encontradas:', data?.length || 0);

        // Buscar informações dos eventos separadamente
        if (data && data.length > 0) {
          const eventoIds = [...new Set(data.map(d => d.evento_id))];
          // console.log('🔍 Buscando eventos:', eventoIds);
          
          const { data: eventosData, error: eventosError } = await supabase
            .from('eventos')
            .select(`
              id, 
              nome, 
              descricao, 
              data,
        horario, 
              local,
              entidade_id
            `)
            .in('id', eventoIds);

          if (eventosError) {
            console.error('❌ Erro na consulta eventos:', eventosError);
            throw eventosError;
          }

          console.log('✅ Eventos encontrados:', eventosData?.length || 0);

          // Buscar informações das entidades
          const entidadeIds = [...new Set(eventosData?.map(e => e.entidade_id).filter(Boolean))];
          let entidadesMap = new Map();
          
          if (entidadeIds.length > 0) {
            console.log('🔍 Buscando entidades:', entidadeIds);
            
            const { data: entidadesData, error: entidadesError } = await supabase
              .from('entidades')
              .select('id, nome')
              .in('id', entidadeIds);

            if (entidadesError) {
              console.error('❌ Erro na consulta entidades:', entidadesError);
              // Não vamos falhar aqui, apenas logar o erro
            } else if (entidadesData) {
              console.log('✅ Entidades encontradas:', entidadesData.length);
              entidadesData.forEach(entidade => {
                entidadesMap.set(entidade.id, entidade);
              });
            }
          }

          // Criar um mapa de eventos para acesso rápido
          const eventosMap = new Map();
          eventosData?.forEach(evento => {
            eventosMap.set(evento.id, evento);
          });

          // Combinar os dados
          const inscricoesComEvento = data.map(d => {
            const evento = eventosMap.get(d.evento_id);
            const entidade = evento?.entidade_id ? entidadesMap.get(evento.entidade_id) : null;
            
            return {
              ...d,
              evento_nome: evento?.nome || 'Evento não encontrado',
              evento_descricao: evento?.descricao,
              evento_data: evento?.data,
        evento_horario: evento?.horario,
              evento_local: evento?.local,
              evento_entidade_nome: entidade?.nome,
              status_participacao: d.status_participacao as 'confirmado' | 'pendente' | 'cancelado'
            };
          });

          console.log('✅ Inscrições processadas:', inscricoesComEvento.length);
          setInscricoesEventos(inscricoesComEvento);
        } else {
          console.log('ℹ️ Nenhuma inscrição encontrada');
          setInscricoesEventos([]);
        }
      } catch (error: any) {
        console.error('❌ Erro geral ao buscar inscrições em eventos:', error);
        toast.error('Erro ao carregar suas inscrições em eventos');
        setInscricoesEventos([]);
      } finally {
        setLoadingInscricoes(false);
      }
    };

    fetchInscricoesEventos();
  }, [user?.email]);

  const cursos = ['Administração', 'Economia', 'Engenharia', 'Direito', 'Psicologia', 'Ciência da Computação', 'Design', 'Outros'];
  const areas = ['consultoria e negocios', 'tecnologia', 'finanças', 'direito', 'educação', 'cultura', 'entretenimento'];

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setNome(profile.nome || '');
      setDataNascimento(profile.data_nascimento
        ? (() => {
            const [y, m, d] = profile.data_nascimento.split("-");
            const date = new Date(+y, +m - 1, +d + 1, 12, 0);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          })()
        : '');      
      setCurso(profile.curso || '');
      setSemestre(profile.semestre || 1);
      setAreaInteresse(profile.area_interesse || '');
    }
  };

  const handleSave = async () => {
    // Validação dos campos obrigatórios
    if (!nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!dataNascimento) {
      toast.error('Data de nascimento é obrigatória');
      return;
    }
    if (!curso) {
      toast.error('Curso é obrigatório');
      return;
    }
    if (!celular.trim()) {
      toast.error('Celular é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome,
          data_nascimento: dataNascimento
            ? (() => {
                const [day, month, year] = dataNascimento.split('/');
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              })()
            : null,
          curso,
          semestre,
          area_interesse: areaInteresse,
          celular,
        })
        .eq('id', user.id);

      if (error) {
        toast.error('Erro ao atualizar perfil');
      } else {
        toast.success('Perfil atualizado com sucesso!');
        setIsEditing(false);
      }
    } catch {
      toast.error('Erro ao atualizar perfil');
    }
    setLoading(false);
  };

  // Função para editar área de interesse de uma demonstração
  const handleEditAreaInteresse = (demonstracaoId: number, currentArea: string) => {
    setEditingDemonstracao(demonstracaoId);
    setNewAreaInteresse(currentArea);
  };

  // Função para salvar a nova área de interesse
  const handleSaveAreaInteresse = async (demonstracaoId: number) => {
    if (!newAreaInteresse.trim()) {
      toast.error('Área de interesse não pode estar vazia');
      return;
    }

    setLoadingAction(true);
    try {
      const { error } = await supabase
        .from('demonstracoes_interesse')
        .update({ 
          area_interesse: newAreaInteresse,
          updated_at: new Date().toISOString()
        })
        .eq('id', demonstracaoId);

      if (error) {
        throw error;
      }

      // Atualizar a lista local
      setDemonstracoes(prev => 
        prev.map(d => 
          d.id === demonstracaoId 
            ? { ...d, area_interesse: newAreaInteresse, updated_at: new Date().toISOString() }
            : d
        )
      );

      toast.success('Área de interesse atualizada com sucesso!');
      setEditingDemonstracao(null);
      setNewAreaInteresse('');
    } catch (error: any) {
      console.error('Erro ao atualizar área de interesse:', error);
      toast.error('Erro ao atualizar área de interesse');
    } finally {
      setLoadingAction(false);
    }
  };

  // Função para cancelar edição
  const handleCancelEdit = () => {
    setEditingDemonstracao(null);
    setNewAreaInteresse('');
  };

  // Função para cancelar inscrição
  const handleCancelarInscricao = async (demonstracaoId: number) => {
    if (!confirm('Tem certeza que deseja cancelar esta inscrição? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoadingAction(true);
    try {
      console.log('🔄 Tentando cancelar inscrição ID:', demonstracaoId);
      console.log('👤 Usuário atual:', user?.email);
      console.log('🔑 Auth status:', !!user);
      console.log('🆔 User ID:', user?.id);
      
      // Verificar se a demonstração existe e pertence ao usuário
      const demonstracao = demonstracoes.find(d => d.id === demonstracaoId);
      if (!demonstracao) {
        throw new Error('Demonstração não encontrada');
      }
      
      console.log('📋 Demonstração encontrada:', {
        id: demonstracao.id,
        email_estudante: demonstracao.email_estudante,
        pertence_ao_usuario: demonstracao.email_estudante === user?.email,
        user_id: user?.id,
        email_match: demonstracao.email_estudante === user?.email
      });
      
      if (demonstracao.email_estudante !== user?.email) {
        throw new Error('Você não tem permissão para cancelar esta inscrição');
      }
      
      const { data, error } = await supabase
        .from('demonstracoes_interesse')
        .delete()
        .eq('id', demonstracaoId)
        .select(); // Adicionar .select() para ver o que foi deletado

      console.log('📥 Resposta do Supabase:', { data, error });

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        console.error('❌ Código do erro:', error.code);
        console.error('❌ Mensagem do erro:', error.message);
        console.error('❌ Detalhes do erro:', error.details);
        console.error('❌ Hint do erro:', error.hint);
        
        // Verificar se é um erro de permissão
        if (error.code === '42501' || error.message?.includes('permission')) {
          throw new Error('Você não tem permissão para cancelar esta inscrição. Entre em contato com o suporte.');
        }
        
        // Verificar se é um erro de RLS
        if (error.code === 'PGRST116' || error.message?.includes('new row violates row-level security policy')) {
          throw new Error('Política de segurança bloqueou a operação. Verifique suas permissões.');
        }
        
        throw error;
      }

      console.log('✅ Inscrição cancelada com sucesso');
      console.log('📊 Dados deletados:', data);
      
      // Remover da lista local
      setDemonstracoes(prev => prev.filter(d => d.id !== demonstracaoId));

      toast.success('Inscrição cancelada com sucesso!');
      
      // Forçar recarregamento da lista após 1 segundo
      setTimeout(() => {
        console.log('🔄 Forçando recarregamento da lista...');
        fetchDemonstracoes();
      }, 1000);
    } catch (error: any) {
      console.error('❌ Erro ao cancelar inscrição:', error);
      console.error('❌ Tipo do erro:', typeof error);
      console.error('❌ Stack trace:', error.stack);
      
      // Mensagem de erro mais específica
      const errorMessage = error.message || 'Erro ao cancelar inscrição. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setLoadingAction(false);
    }
  };

  // Função para cancelar inscrição em evento
  const handleCancelarInscricaoEvento = async (inscricaoId: string) => {
    if (!confirm('Tem certeza que deseja cancelar sua inscrição neste evento? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoadingAction(true);
    try {
      const { error } = await supabase
        .from('participantes_evento')
        .delete()
        .eq('id', inscricaoId);

      if (error) {
        throw error;
      }

      // Remover da lista local
      setInscricoesEventos(prev => prev.filter(i => i.id !== inscricaoId));

      toast.success('Inscrição no evento cancelada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao cancelar inscrição no evento:', error);
      toast.error('Erro ao cancelar inscrição no evento');
    } finally {
      setLoadingAction(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    return formatDateForDisplay(date);
  };

  const getAreaColor = (area: string) => {
    const colors = {
      'consultoria e negocios': 'bg-blue-100 text-blue-800 border-blue-200',
      'tecnologia': 'bg-purple-100 text-purple-800 border-purple-200',
      'finanças': 'bg-green-100 text-green-800 border-green-200',
      'direito': 'bg-red-100 text-red-800 border-red-200',
      'educação': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'cultura': 'bg-pink-100 text-pink-800 border-pink-200',
      'entretenimento': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[area as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

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
        return <XIcon className="w-4 h-4" />;
      case 'pendente':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Home
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e visualize seus processos seletivos e eventos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações Pessoais */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-red-600" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Suas informações básicas e acadêmicas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input
                          id="nome"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          placeholder="Seu nome completo"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                        <DateInput
                          id="dataNascimento"
                          value={dataNascimento}
                          onChange={setDataNascimento}
                          placeholder="dd/mm/aaaa"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="curso">Curso</Label>
                        <Select value={curso} onValueChange={setCurso}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione seu curso" />
                          </SelectTrigger>
                          <SelectContent>
                            {cursos.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="semestre">Semestre</Label>
                        <Select value={semestre.toString()} onValueChange={(value) => setSemestre(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                              <SelectItem key={s} value={s.toString()}>
                                {s}º Semestre
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="areaInteresse">Área de Interesse</Label>
                      <Select value={areaInteresse} onValueChange={setAreaInteresse}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione sua área de interesse" />
                        </SelectTrigger>
                        <SelectContent>
                          {areas.map((area) => (
                            <SelectItem key={area} value={area}>
                              {area.charAt(0).toUpperCase() + area.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="celular">Celular</Label>
                      <Input
                        id="celular"
                        value={celular}
                        onChange={(e) => setCelular(e.target.value)}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={handleSave} disabled={loading} className="bg-red-600 hover:bg-red-700">
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? 'Salvando...' : 'Salvar'}
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <User className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Nome</p>
                          <p className="text-sm text-gray-900">{profile?.nome || 'Não informado'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Calendar className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Data de Nascimento</p>
                          <p className="text-sm text-gray-900">
                            {profile?.data_nascimento ? formatDate(profile.data_nascimento) : 'Não informado'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <GraduationCap className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Curso</p>
                          <p className="text-sm text-gray-900">{profile?.curso || 'Não informado'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <BookOpen className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Semestre</p>
                          <p className="text-sm text-gray-900">{profile?.semestre || '1'}º Semestre</p>
                        </div>
                      </div>
                    </div>

                    {profile?.area_interesse && (
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Target className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Área de Interesse</p>
                          <Badge className={getAreaColor(profile.area_interesse)}>
                            {profile.area_interesse.charAt(0).toUpperCase() + profile.area_interesse.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Mail className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Email</p>
                        <p className="text-sm text-gray-900">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Phone className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Celular</p>
                        <p className="text-sm text-gray-900">{profile?.celular || 'Não informado'}</p>
                      </div>
                    </div>

                    <Button onClick={handleEdit} variant="outline" className="bg-red-600 hover:bg-red-700 text-white">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar Perfil
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-red-600" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Processos Seletivos</span>
                  <span className="text-lg font-bold text-gray-900">{demonstracoes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pendentes</span>
                  <span className="text-lg font-bold text-yellow-600">
                    {demonstracoes.filter(d => d.status === 'pendente').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Aprovados</span>
                  <span className="text-lg font-bold text-green-600">
                    {demonstracoes.filter(d => d.status === 'aprovada').length}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Eventos Inscritos</span>
                    <span className="text-lg font-bold text-blue-600">{inscricoesEventos.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-red-600" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/entidades">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="mr-2 h-4 w-4" />
                    Explorar Organizações
                  </Button>
                </Link>
                <Link to="/eventos">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Ver Eventos
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Sair */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-red-600" />
                  Conta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  onClick={signOut}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Processos Seletivos */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5 text-red-600" />
                    Meus Processos Seletivos
                  </CardTitle>
                  <CardDescription>
                    Demonstrações de interesse enviadas para organizações
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={recarregarDemonstracoes}
                  disabled={loadingDemonstracoes}
                  className="ml-4"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loadingDemonstracoes ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingDemonstracoes ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando seus processos seletivos...</p>
                </div>
              ) : demonstracoes.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum processo seletivo encontrado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Você ainda não demonstrou interesse em nenhuma organização.
                  </p>
                  <Link to="/entidades">
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Building2 className="mr-2 h-4 w-4" />
                      Explorar Organizações
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {demonstracoes.map((demonstracao) => (
                    <div key={demonstracao.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {demonstracao.entidade_nome}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-600">
                              Área de interesse:
                            </p>
                            {editingDemonstracao === demonstracao.id ? (
                              <div className="flex items-center space-x-2">
                                <Select value={newAreaInteresse} onValueChange={setNewAreaInteresse}>
                                  <SelectTrigger className="w-48">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {areas.map((area) => (
                                      <SelectItem key={area} value={area}>
                                        {area.charAt(0).toUpperCase() + area.slice(1)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveAreaInteresse(demonstracao.id)}
                                  disabled={loadingAction}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  disabled={loadingAction}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Badge className={getAreaColor(demonstracao.area_interesse)}>
                                  {demonstracao.area_interesse.charAt(0).toUpperCase() + demonstracao.area_interesse.slice(1)}
                                </Badge>
                                {demonstracao.status === 'pendente' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditAreaInteresse(demonstracao.id, demonstracao.area_interesse)}
                                    disabled={loadingAction}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(demonstracao.status)} flex items-center space-x-1`}>
                            {getStatusIcon(demonstracao.status)}
                            <span className="capitalize">{demonstracao.status}</span>
                          </Badge>
                          
                          {demonstracao.status === 'pendente' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelarInscricao(demonstracao.id)}
                              disabled={loadingAction}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Curso</p>
                          <p className="text-sm text-gray-900">{demonstracao.curso_estudante}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Semestre</p>
                          <p className="text-sm text-gray-900">{demonstracao.semestre_estudante}º</p>
                        </div>
                      </div>

                      {demonstracao.mensagem && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Mensagem</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                            {demonstracao.mensagem}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Enviado em {new Date(demonstracao.created_at).toLocaleDateString('pt-BR')}</span>
                        {demonstracao.status !== 'pendente' && (
                          <span>Atualizado em {new Date(demonstracao.updated_at).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Eventos Inscritos */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-red-600" />
                Meus Eventos Inscritos
              </CardTitle>
              <CardDescription>
                Eventos em que você se inscreveu
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInscricoes ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando seus eventos inscritos...</p>
                </div>
              ) : inscricoesEventos.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum evento inscrito encontrado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Você ainda não se inscreveu em nenhum evento.
                  </p>
                  <Link to="/eventos">
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Calendar className="mr-2 h-4 w-4" />
                      Ver Eventos
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {inscricoesEventos.map((inscricao) => (
                    <div key={inscricao.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {inscricao.evento_nome}
                          </h3>
                          {inscricao.evento_entidade_nome && (
                            <p className="text-sm text-gray-600 mb-2">
                              Organizado por: {inscricao.evento_entidade_nome}
                            </p>
                          )}
                          {inscricao.evento_descricao && (
                            <p className="text-sm text-gray-700 mb-2">
                              {inscricao.evento_descricao}
                            </p>
                          )}
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelarInscricaoEvento(inscricao.id)}
                          disabled={loadingAction}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        {inscricao.evento_data && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs font-medium text-gray-500">Data</p>
                              <p className="text-sm text-gray-900">
                                {new Date(inscricao.evento_data).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        )}
                        

                        
                        {inscricao.evento_local && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs font-medium text-gray-500">Local</p>
                              <p className="text-sm text-gray-900">{inscricao.evento_local}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Inscrito em {new Date(inscricao.data_inscricao).toLocaleDateString('pt-BR')}</span>
                        <Link 
                          to={`/eventos/${inscricao.evento_id}`}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Ver detalhes</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
