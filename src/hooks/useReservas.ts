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
        .select('*')
        .eq('profile_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservasUsuario(data || []);
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
      let query = supabase
        .from('reservas_detalhadas')
        .select('*')
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

      if (error) throw error;
      setTodasReservas(data || []);
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