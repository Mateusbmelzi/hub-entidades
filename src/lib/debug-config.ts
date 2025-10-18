// Configuração para controlar logs de debug
export const DEBUG_CONFIG = {
  // Logs de autenticação (muito verbosos - DESABILITADO)
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
  API_LOGS: false,
  
  // Logs de navegação
  NAVIGATION_LOGS: false,
  
  // Logs de notificações
  NOTIFICATION_LOGS: false
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

// Função para logs de autenticação (sempre silenciosa)
export const authLog = (message: string, ...args: any[]) => {
  // Logs de autenticação completamente silenciados
  // Só mostrar em caso de erro crítico
};

// Função para logs de sessão (sempre silenciosa)
export const sessionLog = (message: string, ...args: any[]) => {
  // Logs de sessão completamente silenciados
};

// Função para logs de notificações (sempre silenciosa)
export const notificationLog = (message: string, ...args: any[]) => {
  // Logs de notificações completamente silenciados
};
