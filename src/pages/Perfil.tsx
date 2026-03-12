import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useInscricoesProcessoUsuario } from '@/hooks/useInscricoesProcessoUsuario';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Mail, Calendar, GraduationCap, BookOpen, Edit, Save, X, LogOut, Settings, Sparkles, Target, Award, Shield, ArrowLeft, Building2, Check, Clock, X as XIcon, Trash2, AlertTriangle, MapPin, Users, ExternalLink, RefreshCw, Phone, Users2, FileText } from 'lucide-react';

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
  entidade_area_atuacao?: string[] | string;
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
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { inscricoes: inscricoesProcesso, loading: loadingProcesso, error: errorProcesso, refetch: refetchProcesso, cancelarInscricao } = useInscricoesProcessoUsuario();
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
  const [areasInteresse, setAreasInteresse] = useState<string[]>([]);
  const [celular, setCelular] = useState('');
  const [celularError, setCelularError] = useState('');
  const [nomeError, setNomeError] = useState('');

  // Função para verificar se os campos foram modificados
  const hasChanges = () => {
    if (!profile) return false;
    
    const originalDataNascimento = profile.data_nascimento
      ? (() => {
          const [y, m, d] = profile.data_nascimento.split("-");
          return new Date(+y, +m - 1, +d).toLocaleDateString("pt-BR");
        })()
      : '';
    
    // Comparar arrays de áreas de interesse
    const originalAreas = profile.areas_interesse || [];
    const areasChanged = areasInteresse.length !== originalAreas.length || 
      areasInteresse.some((area, index) => area !== originalAreas[index]);
    
    return (
      nome !== (profile.nome || '') ||
      dataNascimento !== originalDataNascimento ||
      curso !== (profile.curso || '') ||
      semestre !== (profile.semestre || 1) ||
      areasChanged ||
      celular !== (profile.celular || '')
    );
  };

  // Aviso ao sair da página com mudanças não salvas
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditing && hasChanges()) {
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas. Tem certeza que deseja sair?';
        return 'Você tem alterações não salvas. Tem certeza que deseja sair?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditing, hasChanges]);

  // Função para formatar celular
  const formatCelular = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // Função para validar celular
  const validateCelular = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.length >= 10 && numbers.length <= 11;
  };

  if (!user) return <Navigate to="/auth" replace />;
  if (!profile?.profile_completed) return <Navigate to="/profile-setup" replace />;

  useEffect(() => {
    if (profile) {
      setNome(profile.nome || '');
      setDataNascimento(profile.data_nascimento 
        ? (() => {
            const [y, m, d] = profile.data_nascimento.split("-");
            return new Date(+y, +m - 1, +d).toLocaleDateString("pt-BR");
          })()
        : '');
      setCurso(profile.curso || '');
      setSemestre(profile.semestre || 1);
      setAreasInteresse(profile.areas_interesse || []);
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
    // Limpar erros de validação
    setNomeError('');
    setCelularError('');
    
    if (profile) {
      setNome(profile.nome || '');
      setDataNascimento(profile.data_nascimento
        ? (() => {
            const [y, m, d] = profile.data_nascimento.split("-");
            return new Date(+y, +m - 1, +d).toLocaleDateString("pt-BR");
          })()
        : '');
      setCurso(profile.curso || '');
      setSemestre(profile.semestre || 1);
      setAreasInteresse(profile.areas_interesse || []);
      setCelular(profile.celular || '');
    }
  };

  const handleSave = async () => {
    // Limpar erros anteriores
    setNomeError('');
    setCelularError('');
    
    // Validação dos campos obrigatórios
    if (!nome.trim()) {
      setNomeError('Nome é obrigatório');
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
      setCelularError('Celular é obrigatório');
      toast.error('Celular é obrigatório');
      return;
    }
    
    if (!validateCelular(celular)) {
      setCelularError('Celular deve ter 10 ou 11 dígitos (com DDD)');
      toast.error('Celular deve ter 10 ou 11 dígitos (com DDD)');
      return;
    }
    
    if (areasInteresse.length === 0) {
      toast.error('Selecione pelo menos uma área de interesse');
      return;
    }

    // Validação da data de nascimento
    if (dataNascimento) {
      const [day, month, year] = dataNascimento.split('/');
      const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 16 || age > 100) {
        toast.error('Data de nascimento inválida. Você deve ter entre 16 e 100 anos.');
        return;
      }
      
      if (birthDate > today) {
        toast.error('Data de nascimento não pode ser no futuro');
        return;
      }
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: nome.trim(),
          data_nascimento: dataNascimento
            ? (() => {
                const [day, month, year] = dataNascimento.split('/');
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              })()
            : null,
          curso,
          semestre,
          area_interesse: areasInteresse.length > 0 ? areasInteresse[0] : null, // Primeira área como principal
          areas_interesse: areasInteresse.length > 0 ? areasInteresse : null,
          celular: celular.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast.error(`Erro ao atualizar perfil: ${error.message || 'Tente novamente'}`);
      } else {
        toast.success('Perfil atualizado com sucesso!');
        setIsEditing(false);
        
        // Atualizar o perfil no contexto de autenticação
        try {
          await refreshProfile();
        } catch (refreshError) {
          console.error('Erro ao atualizar perfil no contexto:', refreshError);
          // Não mostrar erro para o usuário, apenas logar
        }
      }
    } catch (error: any) {
      console.error('Erro inesperado ao atualizar perfil:', error);
      toast.error('Erro inesperado ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
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

      // Verificar se o status permite cancelamento
      if (demonstracao.status !== 'pendente') {
        throw new Error('Apenas processos seletivos pendentes podem ser cancelados');
      }
      
      // Tentar exclusão com retry e melhor tratamento de erro
      let deleteResult;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          console.log(`🔄 Tentativa ${retryCount + 1} de exclusão...`);
          
          deleteResult = await supabase
            .from('demonstracoes_interesse')
            .delete()
            .eq('id', demonstracaoId)
            .eq('email_estudante', user.email) // Dupla verificação de segurança
            .select();

          console.log('📥 Resposta do Supabase:', deleteResult);
          
          if (deleteResult.error) {
            throw deleteResult.error;
          }
          
          // Se chegou aqui, a exclusão foi bem-sucedida
          break;
          
        } catch (error: any) {
          retryCount++;
          console.error(`❌ Tentativa ${retryCount} falhou:`, error);
          
          if (retryCount >= maxRetries) {
            throw error;
          }
          
          // Aguardar antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      if (!deleteResult || deleteResult.error) {
        throw new Error('Falha na exclusão após múltiplas tentativas');
      }

      console.log('✅ Inscrição cancelada com sucesso');
      console.log('📊 Dados deletados:', deleteResult.data);
      
      // Remover da lista local
      setDemonstracoes(prev => prev.filter(d => d.id !== demonstracaoId));

      toast.success('Inscrição cancelada com sucesso!');
      
      // Recarregar a lista para garantir sincronização
      setTimeout(() => {
        console.log('🔄 Recarregando lista após exclusão...');
        fetchDemonstracoes();
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Erro ao cancelar inscrição:', error);
      console.error('❌ Tipo do erro:', typeof error);
      console.error('❌ Stack trace:', error.stack);
      
      // Mensagens de erro mais específicas baseadas no tipo de erro
      let errorMessage = 'Erro ao cancelar inscrição. Tente novamente.';
      
      if (error.code === '42501') {
        errorMessage = 'Você não tem permissão para cancelar esta inscrição. Entre em contato com o suporte.';
      } else if (error.code === 'PGRST116') {
        errorMessage = 'Política de segurança bloqueou a operação. Verifique suas permissões.';
      } else if (error.code === '23503') {
        errorMessage = 'Esta inscrição não pode ser cancelada devido a restrições do sistema.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Se for erro de permissão, tentar recarregar a lista
      if (error.code === '42501' || error.code === 'PGRST116') {
        setTimeout(() => {
          console.log('🔄 Recarregando lista após erro de permissão...');
          fetchDemonstracoes();
        }, 1000);
      }
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

  // Função para cancelar inscrição no processo seletivo
  const handleCancelarInscricaoProcesso = async (inscricaoId: string) => {
    const inscricao = inscricoesProcesso.find(i => i.id === inscricaoId);
    const nomeEntidade = inscricao?.entidade_nome || 'esta organização';
    
    if (!confirm(`Você está prestes a cancelar sua inscrição no processo seletivo da ${nomeEntidade}.\n\nEsta ação removerá sua candidatura e você precisará se inscrever novamente se mudar de ideia.\n\nTem certeza que deseja continuar?`)) {
      return;
    }

    setLoadingAction(true);
    try {
      const result = await cancelarInscricao(inscricaoId);
      
      if (result.success) {
        toast.success('Inscrição cancelada com sucesso!');
        refetchProcesso(); // Recarregar lista
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Erro ao cancelar inscrição:', error);
      toast.error(error.message || 'Erro ao cancelar inscrição. Tente novamente.');
    } finally {
      setLoadingAction(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    // Usar o mesmo padrão que funcionou no Perfil
    const [y, m, d] = date.split('-');
    return new Date(+y, +m - 1, +d).toLocaleDateString('pt-BR');
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
          
          {isEditing && hasChanges() && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center text-yellow-800">
                <AlertTriangle className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">
                  Você tem alterações não salvas. Clique em "Salvar" para confirmar as mudanças.
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações Pessoais */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-red-600" />
                    Informações Pessoais
                  </div>
                  {isEditing && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <Edit className="mr-1 h-3 w-3" />
                      Editando
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isEditing 
                    ? 'Edite suas informações pessoais e acadêmicas'
                    : 'Suas informações básicas e acadêmicas'
                  }
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
                          onChange={(e) => {
                            setNome(e.target.value);
                            if (nomeError) setNomeError('');
                          }}
                          placeholder="Seu nome completo"
                          className={`${nomeError ? 'border-red-500' : ''} ${
                            nome !== (profile?.nome || '') ? 'border-blue-300 bg-blue-50' : ''
                          }`}
                        />
                        {nomeError && (
                          <p className="text-xs text-red-500 mt-1">{nomeError}</p>
                        )}
                        {nome !== (profile?.nome || '') && !nomeError && (
                          <p className="text-xs text-blue-600 mt-1">Campo modificado</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                        <Input
                          id="dataNascimento"
                          value={dataNascimento}
                          onChange={(e) => setDataNascimento(e.target.value)}
                          placeholder="dd/mm/aaaa"
                          maxLength={10}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Digite no formato dd/mm/aaaa
                        </p>
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
                      <Label htmlFor="areasInteresse">Áreas de Interesse</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {areas.map((area) => (
                          <div key={area} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`area-${area}`}
                              checked={areasInteresse.includes(area)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAreasInteresse([...areasInteresse, area]);
                                } else {
                                  setAreasInteresse(areasInteresse.filter(a => a !== area));
                                }
                              }}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <label htmlFor={`area-${area}`} className="text-sm text-gray-700">
                              {area.charAt(0).toUpperCase() + area.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Selecione uma ou mais áreas de interesse
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="celular">Celular</Label>
                      <Input
                        id="celular"
                        value={celular}
                        onChange={(e) => {
                          const formatted = formatCelular(e.target.value);
                          setCelular(formatted);
                          if (celularError) setCelularError('');
                        }}
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                        required
                        className={`${celularError ? 'border-red-500' : ''} ${
                          celular !== (profile?.celular || '') ? 'border-blue-300 bg-blue-50' : ''
                        }`}
                      />
                      {celularError ? (
                        <p className="text-xs text-red-500 mt-1">{celularError}</p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">
                          Digite apenas os números, a formatação será aplicada automaticamente
                        </p>
                      )}
                      {celular !== (profile?.celular || '') && !celularError && (
                        <p className="text-xs text-blue-600 mt-1">Campo modificado</p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSave} 
                        disabled={loading || !hasChanges()} 
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? 'Salvando...' : 'Salvar'}
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                    
                    {!hasChanges() && isEditing && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Nenhuma alteração detectada
                      </p>
                    )}
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

                    {profile?.areas_interesse && profile.areas_interesse.length > 0 && (
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Target className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Áreas de Interesse</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {profile.areas_interesse.map((area, index) => (
                              <Badge key={index} className={getAreaColor(area)}>
                                {area.charAt(0).toUpperCase() + area.slice(1)}
                              </Badge>
                            ))}
                          </div>
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
                    <Users2 className="mr-2 h-5 w-5 text-red-600" />
                    Meus Processos Seletivos
                  </CardTitle>
                  <CardDescription>
                    Inscrições em processos seletivos de organizações estudantis
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={refetchProcesso}
                  disabled={loadingProcesso}
                  className="ml-4"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loadingProcesso ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingProcesso ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando seus processos seletivos...</p>
                </div>
              ) : errorProcesso ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Erro ao carregar processos seletivos
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {errorProcesso}
                  </p>
                  <Button onClick={refetchProcesso} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tentar novamente
                  </Button>
                </div>
              ) : !inscricoesProcesso || inscricoesProcesso.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum processo seletivo encontrado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Você ainda não se inscreveu em nenhum processo seletivo.
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
                  {inscricoesProcesso?.map((inscricao) => (
                    <div key={inscricao.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {inscricao.entidade_nome}
                          </h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="text-sm text-gray-600">
                              Área de interesse:
                            </p>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {inscricao.area_interesse?.charAt(0).toUpperCase() + inscricao.area_interesse?.slice(1) || 'Não especificada'}
                            </Badge>
                          </div>
                          
                          {/* Fase atual */}
                          {inscricao.fase_atual && (
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-gray-600">
                                Fase atual:
                              </p>
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                <Users className="w-3 h-3 mr-1" />
                                {inscricao.fase_atual.nome} (Ordem {inscricao.fase_atual.ordem})
                              </Badge>
                              <Badge variant="outline" className={
                                inscricao.fase_atual.status === 'aprovado' ? 'bg-green-50 text-green-700 border-green-200' :
                                inscricao.fase_atual.status === 'reprovado' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                              }>
                                {inscricao.fase_atual.status === 'aprovado' ? 'Aprovado' :
                                 inscricao.fase_atual.status === 'reprovado' ? 'Reprovado' : 'Pendente'}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(inscricao.status)} flex items-center space-x-1`}>
                            {getStatusIcon(inscricao.status)}
                            <span className="capitalize">{inscricao.status}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      {inscricao.mensagem && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">
                            <strong>Mensagem:</strong> {inscricao.mensagem}
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(inscricao.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(inscricao.created_at).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        {inscricao.status === 'aprovado' && (
                          <div className="flex items-center text-green-600">
                            <Check className="w-3 h-3 mr-1" />
                            <span className="font-medium">Aprovado</span>
                          </div>
                        )}
                        
                        {inscricao.status === 'reprovado' && (
                          <div className="flex items-center text-red-600">
                            <XIcon className="w-3 h-3 mr-1" />
                            <span className="font-medium">Reprovado</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Botão de cancelar - apenas enquanto status estiver pendente */}
                      {inscricao.status === 'pendente' && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelarInscricaoProcesso(inscricao.id)}
                            disabled={loadingAction}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Cancelar Inscrição
                          </Button>
                        </div>
                      )}
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
