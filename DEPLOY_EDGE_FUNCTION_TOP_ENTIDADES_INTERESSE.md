# 🚀 Deploy da Edge Function: update-top-entidades-interesse

Este guia explica como criar, configurar e deployar a edge function que atualiza a tabela `top_entidades_interesse`.

## 📋 Pré-requisitos

- [x] Projeto Supabase configurado
- [x] CLI do Supabase instalado
- [x] Acesso ao projeto com permissões de admin
- [x] Tabela `top_entidades_interesse` criada no banco

## 🗄️ 1. Criar a Tabela no Banco

Execute este SQL no SQL Editor do Supabase:

```sql
-- Criar tabela top_entidades_interesse
CREATE TABLE IF NOT EXISTS top_entidades_interesse (
  id SERIAL PRIMARY KEY,
  nome_entidade TEXT NOT NULL,
  total_demonstracoes BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_top_entidades_interesse_nome ON top_entidades_interesse(nome_entidade);
CREATE INDEX IF NOT EXISTS idx_top_entidades_interesse_total ON top_entidades_interesse(total_demonstracoes DESC);

-- Verificar se a tabela foi criada
SELECT * FROM top_entidades_interesse LIMIT 5;
```

## 🔧 2. Configurar Edge Function

### 2.1 Verificar Estrutura

A edge function já foi criada em:
```
supabase/functions/update-top-entidades-interesse/
├── index.ts
└── README.md
```

### 2.2 Verificar Configuração do Supabase

Certifique-se de que o arquivo `supabase/config.toml` está configurado corretamente.

## 🚀 3. Deploy da Edge Function

### 3.1 Login no Supabase (se necessário)

```bash
supabase login
```

### 3.2 Link do Projeto (se necessário)

```bash
supabase link --project-ref [SEU_PROJECT_REF]
```

### 3.3 Deploy da Função

```bash
# Deploy da edge function
supabase functions deploy update-top-entidades-interesse

# Verificar status
supabase functions list
```

### 3.4 Verificar Deploy

```bash
# Testar a função
curl -X POST "https://[PROJECT_REF].supabase.co/functions/v1/update-top-entidades-interesse" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json"
```

## ⏰ 4. Configurar Cron Job

### 4.1 Executar Script SQL

Execute o arquivo `setup-cron-top-entidades-interesse.sql` no SQL Editor do Supabase.

**IMPORTANTE**: Substitua os placeholders:
- `[PROJECT_REF]` pela referência do seu projeto
- `[ANON_KEY]` pela sua chave anônima

### 4.2 Verificar Cron Job

```sql
-- Verificar se foi criado
SELECT * FROM cron.job WHERE jobname = 'update-top-entidades-interesse';

-- Listar todos os cron jobs
SELECT * FROM cron.job;
```

## 🧪 5. Testar a Implementação

### 5.1 Teste Manual

```bash
# Chamar a edge function manualmente
curl -X POST "https://[PROJECT_REF].supabase.co/functions/v1/update-top-entidades-interesse" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json"
```

### 5.2 Verificar Dados

```sql
-- Verificar se a tabela foi populada
SELECT * FROM top_entidades_interesse ORDER BY total_demonstracoes DESC;

-- Verificar contagem
SELECT COUNT(*) FROM top_entidades_interesse;
```

### 5.3 Testar Dashboard

1. Acesse o dashboard
2. Verifique se o novo indicador aparece
3. Confirme se os dados estão sendo exibidos corretamente

## 📊 6. Monitoramento

### 6.1 Logs da Edge Function

Acesse o dashboard do Supabase > Edge Functions > Logs para ver os logs de execução.

### 6.2 Logs do Cron Job

```sql
-- Verificar execuções do cron job
SELECT 
  jobid,
  runid,
  run_status,
  return_message,
  start_time,
  end_time,
  total_runtime
FROM cron.job_run 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'update-top-entidades-interesse')
ORDER BY start_time DESC
LIMIT 10;
```

### 6.3 Verificar Dados em Tempo Real

```sql
-- Verificar última atualização
SELECT 
  nome_entidade,
  total_demonstracoes,
  created_at
FROM top_entidades_interesse 
ORDER BY created_at DESC, total_demonstracoes DESC;
```

## 🔧 7. Configurações Avançadas

### 7.1 Alterar Frequência do Cron Job

```sql
-- Alterar para executar a cada 30 minutos
SELECT cron.alter_job(
  (SELECT jobid FROM cron.job WHERE jobname = 'update-top-entidades-interesse'),
  schedule := '*/30 * * * *'
);
```

### 7.2 Pausar/Reativar Cron Job

```sql
-- Pausar
SELECT cron.alter_job(
  (SELECT jobid FROM cron.job WHERE jobname = 'update-top-entidades-interesse'),
  enabled := false
);

-- Reativar
SELECT cron.alter_job(
  (SELECT jobid FROM cron.job WHERE jobname = 'update-top-entidades-interesse'),
  enabled := true
);
```

### 7.3 Remover Cron Job

```sql
-- Remover completamente
SELECT cron.unschedule('update-top-entidades-interesse');
```

## 🚨 8. Troubleshooting

### 8.1 Erro de Permissão

Se houver erro de permissão, verifique:
- Se a `SUPABASE_SERVICE_ROLE_KEY` está configurada
- Se as políticas RLS permitem acesso às tabelas

### 8.2 Erro de Tabela Não Encontrada

```sql
-- Verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'top_entidades_interesse';
```

### 8.3 Erro de Extensão Não Habilitada

```sql
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "cron";
CREATE EXTENSION IF NOT EXISTS "http";
```

### 8.4 Verificar Logs de Erro

```sql
-- Verificar erros recentes do cron job
SELECT 
  runid,
  run_status,
  return_message,
  start_time
FROM cron.job_run 
WHERE run_status = 'failed'
  AND jobid = (SELECT jobid FROM cron.job WHERE jobname = 'update-top-entidades-interesse')
ORDER BY start_time DESC;
```

## ✅ 9. Checklist de Verificação

- [ ] Tabela `top_entidades_interesse` criada
- [ ] Edge function deployada com sucesso
- [ ] Cron job configurado e ativo
- [ ] Função testada manualmente
- [ ] Dados sendo inseridos na tabela
- [ ] Dashboard exibindo o novo indicador
- [ ] Logs sendo gerados corretamente
- [ ] Cron job executando periodicamente

## 🎯 10. Resultado Esperado

Após o deploy bem-sucedido:

1. **Dashboard**: Novo indicador "Top Organizações com Mais Demonstrações de Interesse"
2. **Dados**: Tabela `top_entidades_interesse` atualizada a cada 15 minutos
3. **Performance**: Ranking das top 10 organizações sempre atualizado
4. **Monitoramento**: Logs detalhados para acompanhamento

## 🔗 11. Links Úteis

- [Documentação Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Extensão Cron do Supabase](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [CLI do Supabase](https://supabase.com/docs/reference/cli)
- [Dashboard do Projeto](https://app.supabase.com)
