import { ProfessorConvidado } from './reserva';

export type TipoEvento = 
  | 'palestra_alunos_insper' 
  | 'palestra_publico_externo' 
  | 'capacitacao' 
  | 'reuniao' 
  | 'processo_seletivo'
  | 'outro';

export const TIPO_EVENTO_LABELS: Record<TipoEvento, string> = {
  palestra_alunos_insper: 'Palestra - Alunos Insper',
  palestra_publico_externo: 'Palestra - Público Externo',
  capacitacao: 'Capacitação',
  reuniao: 'Reunião',
  processo_seletivo: 'Processo Seletivo',
  outro: 'Outro'
};

// Reutilizar a mesma estrutura da reserva
export type PalestranteEvento = ProfessorConvidado;
