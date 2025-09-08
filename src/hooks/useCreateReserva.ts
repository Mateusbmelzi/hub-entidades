import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ReservaFormData, Reserva } from '@/types/reserva';
import { useEntityAuth } from '@/hooks/useEntityAuth';
import { toast } from 'sonner';

export const useCreateReserva = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { entidadeId, isAuthenticated } = useEntityAuth();

  const createReserva = async (formData: ReservaFormData): Promise<Reserva | null> => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se o usuário está autenticado como entidade
      if (!isAuthenticated || !entidadeId) {
        throw new Error('Apenas entidades podem fazer reservas. Faça login como entidade primeiro.');
      }

      // Buscar o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Criar a reserva
      const { data, error } = await supabase
        .from('reservas')
        .insert({
          profile_id: user.id,
          entidade_id: entidadeId,
          evento_id: null, // Será criado após aprovação
          tipo_reserva: formData.tipo_reserva,
          data_reserva: formData.data_reserva,
          horario_inicio: formData.horario_inicio,
          horario_termino: formData.horario_termino,
          quantidade_pessoas: formData.quantidade_pessoas,
          nome_solicitante: formData.nome_solicitante,
          telefone_solicitante: formData.telefone_solicitante,
          motivo_reserva: formData.motivo_reserva,
          titulo_evento_capacitacao: formData.titulo_evento_capacitacao,
          descricao_pautas_evento_capacitacao: formData.descricao_pautas_evento_capacitacao,
          descricao_programacao_evento: formData.descricao_programacao_evento,
          tem_palestrante_externo: formData.tem_palestrante_externo,
          nome_palestrante_externo: formData.nome_palestrante_externo,
          apresentacao_palestrante_externo: formData.apresentacao_palestrante_externo,
          eh_pessoa_publica: formData.eh_pessoa_publica,
          ha_apoio_externo: formData.ha_apoio_externo,
          nome_empresa_parceira: formData.nome_empresa_parceira,
          como_ajudara_organizacao: formData.como_ajudara_organizacao,
          necessidade_sala_plana: formData.necessidade_sala_plana,
          motivo_sala_plana: formData.motivo_sala_plana,
          precisa_sistema_som: formData.precisa_sistema_som,
          precisa_projetor: formData.precisa_projetor,
          precisa_iluminacao_especial: formData.precisa_iluminacao_especial,
          precisa_montagem_palco: formData.precisa_montagem_palco,
          precisa_gravacao: formData.precisa_gravacao,
          motivo_gravacao: formData.motivo_gravacao,
          equipamentos_adicionais: formData.equipamentos_adicionais,
          precisa_suporte_tecnico: formData.precisa_suporte_tecnico,
          detalhes_suporte_tecnico: formData.detalhes_suporte_tecnico,
          configuracao_sala: formData.configuracao_sala,
          motivo_configuracao_sala: formData.motivo_configuracao_sala,
          precisa_alimentacao: formData.precisa_alimentacao,
          detalhes_alimentacao: formData.detalhes_alimentacao,
          custo_estimado_alimentacao: formData.custo_estimado_alimentacao,
          precisa_seguranca: formData.precisa_seguranca,
          detalhes_seguranca: formData.detalhes_seguranca,
          precisa_controle_acesso: formData.precisa_controle_acesso,
          detalhes_controle_acesso: formData.detalhes_controle_acesso,
          precisa_limpeza_especial: formData.precisa_limpeza_especial,
          detalhes_limpeza_especial: formData.detalhes_limpeza_especial,
          precisa_manutencao: formData.precisa_manutencao,
          detalhes_manutencao: formData.detalhes_manutencao,
          observacoes: formData.observacoes,
          status: 'pendente'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Reserva enviada com sucesso! Aguarde a aprovação.');
      return data;
    } catch (err) {
      console.error('Erro ao criar reserva:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar reserva';
      setError(errorMessage);
      toast.error(`Erro ao criar reserva: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createReserva,
    loading,
    error
  };
};
