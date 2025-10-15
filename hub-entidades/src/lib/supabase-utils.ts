import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Interface para configuração de retry
interface RetryConfig {
  maxRetries?: number;
  delay?: number;
  backoffMultiplier?: number;
}

// Configuração padrão
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  delay: 1000,
  backoffMultiplier: 2
};

// Função utilitária para fazer requisições com retry
export const supabaseWithRetry = async <T>(
  operation: () => { data: T | null; error: any } | Promise<{ data: T | null; error: any }>,
  config: RetryConfig = {}
): Promise<{ data: T | null; error: any }> => {
  const { maxRetries, delay, backoffMultiplier } = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries} - Executando operação Supabase...`);
      
      const result = await operation();
      
      // Se não há erro, retorna o resultado
      if (!result.error) {
        console.log(`✅ Operação bem-sucedida na tentativa ${attempt}`);
        return result;
      }
      
      // Verificar se é um erro que deve ser retryado
      const shouldRetry = isRetryableError(result.error);
      
      if (shouldRetry && attempt < maxRetries) {
        lastError = result.error;
        const waitTime = delay * Math.pow(backoffMultiplier, attempt - 1);
        
        console.warn(`⚠️ Tentativa ${attempt} falhou, tentando novamente em ${waitTime}ms...`, {
          error: result.error.message,
          code: result.error.code
        });
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // Se não deve fazer retry ou é a última tentativa, retorna o erro
      return result;
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(backoffMultiplier, attempt - 1);
        console.warn(`⚠️ Tentativa ${attempt} falhou com exceção, tentando novamente em ${waitTime}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
    }
  }
  
  console.error(`❌ Todas as ${maxRetries} tentativas falharam`, lastError);
  return { data: null, error: lastError };
};

// Função para verificar se um erro deve ser retryado
function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toString() || '';
  
  // Erros de rede que devem ser retryados
  const retryablePatterns = [
    'fetch',
    'timeout',
    'network',
    'connection',
    'econnreset',
    'enotfound',
    'econnrefused',
    'etimedout'
  ];
  
  // Códigos de erro do Supabase que devem ser retryados
  const retryableCodes = [
    'PGRST301', // Timeout
    'PGRST302', // Connection error
    'PGRST303'  // Network error
  ];
  
  // Verificar se a mensagem contém padrões retryáveis
  const hasRetryablePattern = retryablePatterns.some(pattern => 
    errorMessage.includes(pattern)
  );
  
  // Verificar se o código é retryável
  const hasRetryableCode = retryableCodes.includes(errorCode);
  
  return hasRetryablePattern || hasRetryableCode;
}

// Função para verificar a conectividade com o Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabaseWithRetry(
      () => supabase.from('entidades').select('count').limit(1),
      { maxRetries: 2, delay: 500 }
    );
    
    return !error;
  } catch (error) {
    console.error('❌ Erro ao verificar conectividade com Supabase:', error);
    return false;
  }
};

// Função para verificação manual de conectividade (sem usar o hook)
export const checkConnectionManually = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('entidades')
      .select('count')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('❌ Erro na verificação manual de conectividade:', error);
    return false;
  }
};

// Função para fazer logout e limpar cache em caso de problemas
export const forceLogout = () => {
  console.log('🔄 Forçando logout devido a problemas de conectividade...');
  
  // Limpar localStorage
  localStorage.removeItem('entity_session');
  localStorage.removeItem('supabase.auth.token');
  
  // Fazer logout do Supabase
  supabase.auth.signOut();
  
  // Recarregar a página
  window.location.reload();
};

// Hook para monitorar a conectividade
export const useConnectionMonitor = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
      setLastCheck(new Date());
      
      if (!connected) {
        console.warn('⚠️ Problemas de conectividade detectados');
      }
    };

    // Verificar a cada 60 segundos (reduzido para evitar sobrecarga)
    const interval = setInterval(checkConnection, 60000);
    
    // Verificar imediatamente
    checkConnection();

    return () => clearInterval(interval);
  }, []);

  return { isConnected, lastCheck };
}; 