// Configuração para controlar logs de debug
export const DEBUG_CONFIG = {
  // Logs de autenticação (muito verbosos)
  AUTH_LOGS: false,
  
  // Logs de criação de eventos
  EVENT_CREATION_LOGS: false,
  
  // Logs de hooks de eventos
  EVENT_HOOKS_LOGS: false,
  
  // Logs de componentes gerais
  COMPONENT_LOGS: false,
  
  // Logs de erro (sempre mostrar)
  ERROR_LOGS: true,
  
  // Logs de API/Supabase
  API_LOGS: false
};

// Função helper para logs condicionais
export const debugLog = (category: keyof typeof DEBUG_CONFIG, message: string, ...args: any[]) => {
  if (DEBUG_CONFIG[category]) {
    console.log(message, ...args);
  }
};

// Função para logs de erro (sempre mostrar)
export const errorLog = (message: string, error?: any) => {
  console.error('❌', message, error);
};
