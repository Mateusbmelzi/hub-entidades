import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Reserva, ReservaDetalhada, ReservaFormData, StatusReserva } from '@/types/reserva';

export const useReservas = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservas(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  return {
    reservas,
    loading,
    error,
    refetch: fetchReservas
  };
};

export const useReservasPendentes = () => {
  const [reservasPendentes, setReservasPendentes] = useState<ReservaDetalhada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservasPendentes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservas_pendentes_aprovacao')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReservasPendentes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar reservas pendentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservasPendentes();
  }, []);

  return {
    reservasPendentes,
    loading,
    error,
    refetch: fetchReservasPendentes
  };
};

export const useReservasUsuario = (userId: string) => {
  const [reservasUsuario, setReservasUsuario] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservasUsuario = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          entidades!reservas_entidade_id_fkey (
            id,
            nome,
            contato,
            email_contato
          ),
          eventos!reservas_evento_id_fkey (
            nome,
            descricao,
            sala_id,
            sala_nome,
            sala_predio,
            sala_andar,
            sala_capacidade
          )
        `)
        .eq('profile_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapear os dados para incluir informações da entidade e evento
      const reservasComDetalhes = (data || []).map((reserva: any) => ({
        ...reserva,
        // Dados da entidade
        nome_entidade: reserva.entidades?.nome || null,
        contato_entidade: reserva.entidades?.contato || null,
        email_entidade: reserva.entidades?.email_contato || null,
        // Dados do evento
        nome_evento: reserva.eventos?.nome || null,
        descricao_evento: reserva.eventos?.descricao || null,
        // Dados da sala (do evento)
        sala_id: reserva.eventos?.sala_id || null,
        sala_nome: reserva.eventos?.sala_nome || null,
        sala_predio: reserva.eventos?.sala_predio || null,
        sala_andar: reserva.eventos?.sala_andar || null,
        sala_capacidade: reserva.eventos?.sala_capacidade || null
      }));
      
      setReservasUsuario(reservasComDetalhes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar reservas do usuário');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchReservasUsuario();
    }
  }, [userId]);

  return {
    reservasUsuario,
    loading,
    error,
    refetch: fetchReservasUsuario
  };
};

export const useTodasReservas = (filters?: {
  status?: StatusReserva[];
  tipo_reserva?: string[];
  data_inicio?: string;
  data_fim?: string;
  nome_solicitante?: string;
}) => {
  const [todasReservas, setTodasReservas] = useState<ReservaDetalhada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodasReservas = async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando todas as reservas...');
      
      // Query com JOIN para buscar reservas e dados relacionados
      let query = supabase
        .from('reservas')
        .select(`
          *,
          profiles!reservas_profile_id_fkey (
            nome,
            curso,
            celular
          ),
          entidades!reservas_entidade_id_fkey (
            id,
            nome,
            contato,
            email_contato
          ),
          eventos!reservas_evento_id_fkey (
            nome,
            descricao,
            sala_id,
            sala_nome,
            sala_predio,
            sala_andar,
            sala_capacidade
          )
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters?.tipo_reserva?.length) {
        query = query.in('tipo_reserva', filters.tipo_reserva);
      }

      if (filters?.data_inicio) {
        query = query.gte('data_reserva', filters.data_inicio);
      }

      if (filters?.data_fim) {
        query = query.lte('data_reserva', filters.data_fim);
      }

      if (filters?.nome_solicitante) {
        query = query.ilike('nome_solicitante', `%${filters.nome_solicitante}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar reservas:', error);
        console.error('❌ Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('✅ Reservas encontradas:', data?.length || 0);
      console.log('📊 Primeira reserva (exemplo):', data?.[0]);
      
      // Mapear os dados para o formato ReservaDetalhada
      const reservasDetalhadas: ReservaDetalhada[] = (data || []).map((reserva: any) => ({
        ...reserva,
        // Usar o ID da reserva como reserva_id para compatibilidade
        reserva_id: reserva.id,
        // Dados do usuário
        nome_usuario: reserva.profiles?.nome || null,
        curso_usuario: reserva.profiles?.curso || null,
        celular_usuario: reserva.profiles?.celular || null,
        // Dados da entidade
        nome_entidade: reserva.entidades?.nome || null,
        contato_entidade: reserva.entidades?.contato || null,
        email_entidade: reserva.entidades?.email_contato || null,
        // Dados do evento
        nome_evento: reserva.eventos?.nome || null,
        descricao_evento: reserva.eventos?.descricao || null,
        // Dados da sala (do evento)
        sala_id: reserva.eventos?.sala_id || null,
        sala_nome: reserva.eventos?.sala_nome || null,
        sala_predio: reserva.eventos?.sala_predio || null,
        sala_andar: reserva.eventos?.sala_andar || null,
        sala_capacidade: reserva.eventos?.sala_capacidade || null
      }));
      
      console.log('✅ Reservas mapeadas:', reservasDetalhadas.length);
      setTodasReservas(reservasDetalhadas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar todas as reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodasReservas();
  }, [filters]);

  return {
    todasReservas,
    loading,
    error,
    refetch: fetchTodasReservas
  };
};