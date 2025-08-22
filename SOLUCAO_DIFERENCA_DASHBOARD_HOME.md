# Solução para Diferença de Números entre Dashboard e Home

## 🔍 Problema Identificado

**Sintoma:** Os números exibidos no Dashboard e na Home estão diferentes:
- **Home:** 422 alunos
- **Dashboard:** 417 alunos

## 🎯 Causa Raiz

A diferença ocorre porque as duas páginas usam **fontes de dados diferentes**:

### 📊 Home (useStats)
- **Hook:** `useStats`
- **Fonte:** Consultas diretas às tabelas `profiles` e `entidades`
- **Atualização:** Em tempo real, sempre mostra dados atuais
- **Resultado:** 422 alunos

### 📈 Dashboard (useIndicadoresGerais)
- **Hook:** `useIndicadoresGerais`
- **Fonte:** Tabela `indicadores_gerais`
- **Atualização:** Apenas quando a edge function é executada manualmente
- **Resultado:** 417 alunos (dados desatualizados)

## 🛠️ Solução Implementada

### 1. Cron Job Automático
Criado o arquivo `setup-cron-indicadores-gerais.sql` que configura um cron job para:
- Executar a cada **15 minutos**
- Chamar automaticamente a edge function `update-indicadores-gerais`
- Manter os indicadores sempre atualizados

### 2. Configuração do Cron Job
```sql
SELECT cron.schedule(
  'update-indicadores-gerais',           -- Nome do job
  '*/15 * * * *',                       -- A cada 15 minutos
  'SELECT net.http_post(...);'           -- Chama a edge function
);
```

## 📋 Passos para Implementar

### Passo 1: Executar o Script SQL
1. Abra o **SQL Editor** do Supabase
2. Execute o arquivo `setup-cron-indicadores-gerais.sql`
3. **IMPORTANTE:** Substitua as variáveis:
   - `YOUR_PROJECT_REF` pela referência do seu projeto
   - `YOUR_SERVICE_ROLE_KEY` pela sua service role key

### Passo 1.5: Atualizar Credenciais (Se necessário)
Se o cron job foi criado com as variáveis placeholder, execute o arquivo `atualizar-cron-job-credentials.sql`:
1. Substitua as variáveis pelas suas credenciais reais
2. Execute o script no SQL Editor
3. O job será recriado com as credenciais corretas

### Passo 2: Verificar Configuração
```sql
-- Verificar se o job foi criado
SELECT * FROM cron.job WHERE jobname = 'update-indicadores-gerais';
```

### Passo 3: Testar Manualmente (Opcional)
```sql
-- Executar o job manualmente para teste
SELECT cron.run('update-indicadores-gerais');
```

## ✅ Resultado Esperado

Após a implementação:
- **Dashboard e Home** mostrarão os **mesmos números**
- **Atualização automática** a cada 15 minutos
- **Consistência** entre todas as páginas
- **Dados sempre atualizados** no dashboard

## 🔧 Como Obter as Credenciais

### Project Reference ID
1. Vá para **Settings > General** no Supabase
2. Copie a **"Reference ID"**

### Service Role Key
1. Vá para **Settings > API** no Supabase
2. Copie a **"service_role" key** (não a anon key)

## 📝 Arquivos Criados/Modificados

- ✅ `setup-cron-indicadores-gerais.sql` - Script do cron job
- ✅ `atualizar-cron-job-credentials.sql` - Script para atualizar credenciais
- ✅ `SOLUCAO_DIFERENCA_DASHBOARD_HOME.md` - Este arquivo de instruções

## 🚨 Importante

- **Nunca** compartilhe a service role key
- O cron job será executado automaticamente a cada 15 minutos
- Os dados do dashboard serão sempre consistentes com a home
- A solução resolve o problema de forma definitiva

## 🔄 Monitoramento

Para verificar se está funcionando:
1. Execute o job manualmente uma vez
2. Compare os números entre Dashboard e Home
3. Aguarde 15 minutos e verifique se os dados foram atualizados
4. Monitore os logs da edge function no Supabase
