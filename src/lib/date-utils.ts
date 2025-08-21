/**
 * Utilitários para manipulação de datas no formato DD/MM/AAAA
 */

/**
 * Converte uma data do formato DD/MM/AAAA para ISO string (YYYY-MM-DD)
 */
export const formatDateToISO = (dateStr: string): string => {
  if (!dateStr || dateStr.length !== 10) return '';
  
  const parts = dateStr.split('/');
  if (parts.length !== 3) return '';
  
  const day = parts[0];
  const month = parts[1];
  const year = parts[2];
  
  return `${year}-${month}-${day}`;
};

/**
 * Converte uma data do formato ISO (YYYY-MM-DD) para DD/MM/AAAA
 */
export const formatDateFromISO = (isoDate: string): string => {
  if (!isoDate) return '';
  
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  
  return `${day}/${month}/${year}`;
};

/**
 * Valida se uma data no formato DD/MM/AAAA é válida
 */
export const isValidDate = (dateStr: string): boolean => {
  if (!dateStr || dateStr.length !== 10) return false;
  
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const year = parseInt(parts[2]);
  
  // Validações básicas
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2100) return false;
  
  // Validação de meses com 30 dias
  const monthsWith30Days = [4, 6, 9, 11];
  if (monthsWith30Days.includes(month) && day > 30) return false;
  
  // Validação de fevereiro
  if (month === 2) {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    if (isLeapYear && day > 29) return false;
    if (!isLeapYear && day > 28) return false;
  }
  
  return true;
};

/**
 * Formata uma data para exibição no formato DD/MM/AAAA
 */
export const formatDateForDisplay = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear().toString();
  
  return `${day}/${month}/${year}`;
}; 

// Funções utilitárias para trabalhar com data e horário separados

/**
 * Combina data e horário em um timestamp
 */
export function combineDataHorario(data: string, horario?: string | null): Date {
  // Para evitar problemas de timezone, vamos criar a data usando componentes locais
  const [year, month, day] = data.split('-').map(Number);
  
  if (!horario) {
    // Se não há horário, criar data com horário 00:00
    return new Date(year, month - 1, day, 0, 0);
  }
  
  // Se há horário, criar data com o horário especificado
  const [hour, minute] = horario.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

/**
 * Formata data e horário para exibição
 */
export function formatDataHorario(data: string, horario?: string | null): string {
  const date = combineDataHorario(data, horario);
  return date.toLocaleString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formata apenas a data para exibição
 */
export function formatData(data: string): string {
  // Para evitar problemas de timezone, vamos criar a data usando componentes locais
  const [year, month, day] = data.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  return localDate.toLocaleDateString('pt-BR');
}

/**
 * Formata apenas o horário para exibição
 */
export function formatHorario(horario?: string | null): string {
  if (!horario) return '';
  return new Date(`2000-01-01T${horario}`).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Verifica se um evento está ativo (data futura)
 */
export function isEventoAtivo(data: string, horario?: string | null): boolean {
  const eventDate = combineDataHorario(data, horario);
  return eventDate > new Date();
}

/**
 * Obtém o status de um evento baseado na data
 */
export function getEventoStatus(data: string, horario?: string | null): 'futuro' | 'proximo' | 'finalizado' {
  const eventDate = combineDataHorario(data, horario);
  const now = new Date();
  const diffInHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 0) return 'finalizado';
  if (diffInHours <= 24) return 'proximo';
  return 'futuro';
} 