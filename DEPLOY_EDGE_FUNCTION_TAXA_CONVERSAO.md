# 🚀 Deploy da Edge Function: Update Taxa Conversao Entidades

## 📋 **Pré-requisitos**

### **1. Supabase CLI Instalado**
```bash
# Instalar Supabase CLI globalmente
npm install -g supabase

# Ou usar npx
npx supabase --version
```

### **2. Projeto Supabase Configurado**
```bash
# Verificar se está na pasta raiz do projeto
cd hub-entidades

# Verificar configuração do Supabase
supabase status
```

### **3. Variáveis de Ambiente**
```bash
# Criar arquivo .env.local na pasta raiz
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
SUPABASE_ANON_KEY=sua-anon-key
```

## 🔧 **Passo a Passo do Deploy**

### **Passo 1: Verificar Estrutura do Projeto**
```bash
# Estrutura esperada:
hub-entidades/
├── supabase/
│   ├── functions/
│   │   └── update-taxa-conversao-entidades/
│   │       ├── index.ts
│   │       └── README.md
│   └── config.toml
├── .env.local
└── package.json
```

### **Passo 2: Testar Localmente (Opcional)**
```bash
# Iniciar Supabase local
supabase start

# Testar função localmente
supabase functions serve update-taxa-conversao-entidades --env-file .env.local

# Em outro terminal, testar a função
curl -X POST http://localhost:54321/functions/v1/update-taxa-conversao-entidades
```

### **Passo 3: Deploy para Produção**
```bash
# Fazer deploy da função
supabase functions deploy update-taxa-conversao-entidades

# Verificar status
supabase functions list
```

### **Passo 4: Testar em Produção**
```bash
# Testar a função deployada
curl -X POST https://seu-projeto.supabase.co/functions/v1/update-taxa-conversao-entidades \
  -H "Authorization: Bearer SEU_ANON_KEY" \
  -H "Content-Type: application/json"
```

## 📊 **Configuração do Cron Job**

### **Passo 1: Acessar SQL Editor**
1. Abra o Dashboard do Supabase
2. Vá para **SQL Editor**
3. Crie uma nova query

### **Passo 2: Executar Script de Configuração**
```sql
-- Copie e cole o conteúdo do arquivo setup-cron-job-taxa-conversao.sql
-- SUBSTITUA as seguintes variáveis:

-- 1. URL do seu projeto
-- De: https://seu-projeto.supabase.co/functions/v1/update-taxa-conversao-entidades
-- Para: https://abcdefghijklmnop.supabase.co/functions/v1/update-taxa-conversao-entidades

-- 2. Chave anônima
-- De: SEU_ANON_KEY
-- Para: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

-- Execute o script completo
```

### **Passo 3: Verificar Configuração**
```sql
-- Verificar se o cron job foi criado
SELECT * FROM cron.job WHERE jobname = 'update-taxa-conversao-entidades';

-- Verificar execuções
SELECT * FROM cron.job_run_details 
WHERE jobid = (
  SELECT jobid FROM cron.job 
  WHERE jobname = 'update-taxa-conversao-entidades'
)
ORDER BY start_time DESC
LIMIT 5;
```

## 🧪 **Testes e Validação**

### **Teste 1: Execução Manual**
```bash
# Chamar a função manualmente
curl -X POST https://seu-projeto.supabase.co/functions/v1/update-taxa-conversao-entidades \
  -H "Authorization: Bearer SEU_ANON_KEY" \
  -H "Content-Type: application/json"
```

### **Teste 2: Verificar Dados**
```sql
-- Verificar se a tabela foi populada
SELECT * FROM taxa_conversao_entidades ORDER BY taxa_conversao DESC;

-- Verificar contagem
SELECT COUNT(*) FROM taxa_conversao_entidades;

-- Verificar dados mais recentes
SELECT *, 
       (taxa_conversao * 100) as taxa_percentual
FROM taxa_conversao_entidades 
ORDER BY taxa_conversao DESC 
LIMIT 10;
```

### **Teste 3: Verificar Logs**
```sql
-- Verificar execuções do cron job
SELECT 
  start_time,
  end_time,
  return_message,
  total_runtime
FROM cron.job_run_details 
WHERE jobid = (
  SELECT jobid FROM cron.job 
  WHERE jobname = 'update-taxa-conversao-entidades'
)
ORDER BY start_time DESC
LIMIT 10;
```

## 🔍 **Monitoramento e Troubleshooting**

### **1. Logs da Edge Function**
- Acesse **Edge Functions** no Dashboard do Supabase
- Clique em **update-taxa-conversao-entidades**
- Vá para a aba **Logs**
- Monitore execuções e erros

### **2. Status do Cron Job**
```sql
-- Verificar status atual
SELECT 
  jobname,
  schedule,
  enabled,
  last_run,
  next_run,
  total_runs,
  total_failures
FROM cron.job 
WHERE jobname = 'update-taxa-conversao-entidades';
```

### **3. Problemas Comuns**

#### **Erro: "Function not found"**
```bash
# Verificar se a função foi deployada
supabase functions list

# Fazer deploy novamente se necessário
supabase functions deploy update-taxa-conversao-entidades
```

#### **Erro: "Permission denied"**
```sql
-- Verificar permissões da tabela
SELECT 
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'taxa_conversao_entidades';
```

#### **Erro: "Cron job not running"**
```sql
-- Verificar se a extensão cron está habilitada
SELECT cron.extension_version();

-- Verificar se o cron job está ativo
SELECT enabled FROM cron.job WHERE jobname = 'update-taxa-conversao-entidades';
```

## 📈 **Otimizações e Ajustes**

### **1. Ajustar Frequência**
```sql
-- Mudar para 30 minutos (economizar recursos)
SELECT cron.alter_job(
  (SELECT jobid FROM cron.job WHERE jobname = 'update-taxa-conversao-entidades'),
  schedule := '*/30 * * * *'
);

-- Mudar para 1 hora (caso de baixo tráfego)
SELECT cron.alter_job(
  (SELECT jobid FROM cron.job WHERE jobname = 'update-taxa-conversao-entidades'),
  schedule := '0 * * * *'
);
```

### **2. Monitorar Performance**
```sql
-- Verificar tempo médio de execução
SELECT 
  AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as tempo_medio_segundos,
  COUNT(*) as total_execucoes
FROM cron.job_run_details 
WHERE jobid = (
  SELECT jobid FROM cron.job 
  WHERE jobname = 'update-taxa-conversao-entidades'
)
AND end_time IS NOT NULL;
```

### **3. Configurar Alertas**
```sql
-- Criar tabela de logs de falhas (opcional)
CREATE TABLE IF NOT EXISTS cron_failure_logs (
  id SERIAL PRIMARY KEY,
  job_name TEXT NOT NULL,
  error_message TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Função para notificar falhas
CREATE OR REPLACE FUNCTION log_cron_failure()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO cron_failure_logs (job_name, error_message)
  VALUES ('update-taxa-conversao-entidades', 'Falha na execução');
END;
$$;
```

## 🎯 **Verificação Final**

### **Checklist de Deploy**
- [ ] Edge function criada e deployada
- [ ] Cron job configurado e ativo
- [ ] Função testada manualmente
- [ ] Dados sendo inseridos na tabela
- [ ] Logs sendo gerados corretamente
- [ ] Dashboard exibindo dados atualizados

### **Comandos de Verificação**
```bash
# 1. Status das funções
supabase functions list

# 2. Status do projeto
supabase status

# 3. Logs da função
supabase functions logs update-taxa-conversao-entidades

# 4. Testar função
curl -X POST https://seu-projeto.supabase.co/functions/v1/update-taxa-conversao-entidades \
  -H "Authorization: Bearer SEU_ANON_KEY"
```

## 🚀 **Próximos Passos**

1. **Monitorar execuções** por alguns dias
2. **Ajustar frequência** conforme necessidade
3. **Configurar alertas** para falhas
4. **Otimizar performance** se necessário
5. **Documentar métricas** de uso

## 📞 **Suporte**

### **Em caso de problemas:**
1. Verifique os logs da edge function
2. Verifique os logs do cron job
3. Teste a função manualmente
4. Verifique permissões das tabelas
5. Consulte a documentação do Supabase

### **Recursos úteis:**
- [Documentação Edge Functions](https://supabase.com/docs/guides/functions)
- [Documentação Cron Jobs](https://supabase.com/docs/guides/database/extensions/cron)
- [Supabase CLI](https://supabase.com/docs/reference/cli)

---

**🎉 Deploy concluído com sucesso!** 

A tabela `taxa_conversao_entidades` será atualizada automaticamente conforme configurado, e os dados estarão disponíveis no Dashboard em tempo real.
