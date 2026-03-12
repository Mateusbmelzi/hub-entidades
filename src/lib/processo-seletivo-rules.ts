export type StatusInscricaoProcesso =
  | 'pendente'
  | 'aprovado'
  | 'reprovado'
  | 'cancelado';

export interface ElegibilidadeInscricaoInput {
  processoSeletivoAtivo: boolean;
  abertura?: string | null;
  fechamento?: string | null;
  agora?: Date;
}

function isValidDateString(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isInscricaoElegivel({
  processoSeletivoAtivo,
  abertura,
  fechamento,
  agora,
}: ElegibilidadeInscricaoInput): boolean {
  if (!processoSeletivoAtivo) return false;

  const agoraDate = agora ?? new Date();
  const currentDate = agoraDate.toISOString().slice(0, 10);

  const aberturaValida = isValidDateString(abertura ?? null);
  const fechamentoValido = isValidDateString(fechamento ?? null);

  if (aberturaValida && currentDate < abertura) {
    return false;
  }

  if (fechamentoValido && currentDate > fechamento) {
    return false;
  }

  return true;
}

export function canCancelarInscricao(status: StatusInscricaoProcesso): boolean {
  return status === 'pendente';
}

export type FormularioFaseStrategy = 'template' | 'proprio' | 'nenhum';

export interface FormularioFaseInput {
  templateFormularioId?: string | number | null;
  hasFormularioProprio: boolean;
}

export function getFormularioFaseStrategy({
  templateFormularioId,
  hasFormularioProprio,
}: FormularioFaseInput): FormularioFaseStrategy {
  if (templateFormularioId != null) {
    return 'template';
  }

  if (hasFormularioProprio) {
    return 'proprio';
  }

  return 'nenhum';
}

