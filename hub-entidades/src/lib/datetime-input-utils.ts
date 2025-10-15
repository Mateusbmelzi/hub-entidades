// Utilitários para input de data e hora com formatação automática

/**
 * Formata automaticamente o input do usuário para DD/MM/AAAA HH:MM
 */
export const formatDateTimeInput = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Se não há números, retorna vazio
  if (!numbers) return '';
  
  let formatted = '';
  
  // Formato: DDMMAAAAHHMM
  if (numbers.length <= 2) {
    // Apenas dia
    formatted = numbers;
  } else if (numbers.length <= 4) {
    // Dia e mês
    formatted = `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  } else if (numbers.length <= 8) {
    // Dia, mês e ano
    formatted = `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
  } else if (numbers.length <= 10) {
    // Dia, mês, ano e hora
    formatted = `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)} ${numbers.slice(8)}`;
  } else {
    // Dia, mês, ano, hora e minutos
    formatted = `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)} ${numbers.slice(8, 10)}:${numbers.slice(10, 12)}`;
  }
  
  return formatted;
};

/**
 * Valida se a data e hora estão no formato correto
 */
export const validateDateTime = (value: string): { isValid: boolean; message?: string } => {
  // Regex para DD/MM/AAAA HH:MM
  const dateTimeRegex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;
  
  if (!value.trim()) {
    return { isValid: false, message: 'Data e hora são obrigatórias' };
  }
  
  const match = value.match(dateTimeRegex);
  
  if (!match) {
    return { isValid: false, message: 'Formato deve ser DD/MM/AAAA HH:MM (ex: 25/12/2024 14:30)' };
  }
  
  const [, day, month, year, hour, minute] = match;
  
  // Validar dia (1-31)
  const dayNum = parseInt(day);
  if (dayNum < 1 || dayNum > 31) {
    return { isValid: false, message: 'Dia deve estar entre 01 e 31' };
  }
  
  // Validar mês (1-12)
  const monthNum = parseInt(month);
  if (monthNum < 1 || monthNum > 12) {
    return { isValid: false, message: 'Mês deve estar entre 01 e 12' };
  }
  
  // Validar ano (mínimo ano atual)
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  if (yearNum < currentYear) {
    return { isValid: false, message: `Ano deve ser ${currentYear} ou posterior` };
  }
  
  // Validar hora (0-23)
  const hourNum = parseInt(hour);
  if (hourNum < 0 || hourNum > 23) {
    return { isValid: false, message: 'Hora deve estar entre 00 e 23' };
  }
  
  // Validar minuto (0-59)
  const minuteNum = parseInt(minute);
  if (minuteNum < 0 || minuteNum > 59) {
    return { isValid: false, message: 'Minuto deve estar entre 00 e 59' };
  }
  
  // Validar se a data existe (ex: 31/02 não existe)
  const date = new Date(yearNum, monthNum - 1, dayNum, hourNum, minuteNum);
  if (
    date.getDate() !== dayNum ||
    date.getMonth() !== monthNum - 1 ||
    date.getFullYear() !== yearNum ||
    date.getHours() !== hourNum ||
    date.getMinutes() !== minuteNum
  ) {
    return { isValid: false, message: 'Data inválida' };
  }
  
  // Validar se a data não está no passado
  const now = new Date();
  if (date < now) {
    return { isValid: false, message: 'Data e hora devem estar no futuro' };
  }
  
  return { isValid: true };
};

/**
 * Converte DD/MM/AAAA HH:MM para formato ISO para datetime-local
 */
export const convertToDateTimeLocal = (value: string): string => {
  const dateTimeRegex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;
  const match = value.match(dateTimeRegex);
  
  if (!match) return '';
  
  const [, day, month, year, hour, minute] = match;
  
  // Formato YYYY-MM-DDTHH:MM para datetime-local
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

/**
 * Converte formato datetime-local para DD/MM/AAAA HH:MM
 */
export const convertFromDateTimeLocal = (value: string): string => {
  if (!value) return '';
  
  try {
    const date = new Date(value);
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hour}:${minute}`;
  } catch {
    return '';
  }
};

/**
 * Converte DD/MM/AAAA HH:MM para objeto Date
 */
export const parseDateTime = (value: string): Date | null => {
  const dateTimeRegex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;
  const match = value.match(dateTimeRegex);
  
  if (!match) return null;
  
  const [, day, month, year, hour, minute] = match;
  
  return new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute)
  );
};

/**
 * Obtém sugestões de data/hora baseadas no input parcial
 */
export const getDateTimeSuggestions = (value: string): string[] => {
  const now = new Date();
  const suggestions: string[] = [];
  
  // Se está vazio, sugerir horários comuns para hoje e amanhã
  if (!value) {
    const today = now;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const commonHours = ['09:00', '14:00', '19:00'];
    
    commonHours.forEach(time => {
      suggestions.push(formatDateFromDate(today) + ` ${time}`);
      suggestions.push(formatDateFromDate(tomorrow) + ` ${time}`);
    });
    
    return suggestions;
  }
  
  // Se está digitando uma data, sugerir horários comuns
  if (value.includes('/') && !value.includes(' ')) {
    const commonHours = ['09:00', '10:00', '14:00', '15:00', '16:00', '19:00', '20:00'];
    commonHours.forEach(time => {
      suggestions.push(`${value} ${time}`);
    });
    return suggestions;
  }
  
  return suggestions;
};

/**
 * Formata Date para DD/MM/AAAA
 */
const formatDateFromDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  
  return `${day}/${month}/${year}`;
};
