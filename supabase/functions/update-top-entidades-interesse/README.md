# Edge Function: update-top-entidades-interesse

Esta edge function atualiza a tabela `top_entidades_interesse` com as organizações que mais despertam interesse dos estudantes.

## 🎯 Objetivo

Calcular e armazenar as top 10 organizações com mais demonstrações de interesse, baseado na tabela `demonstracoes_interesse`.

## 📊 Funcionamento

1. **Limpeza**: Remove todos os dados existentes da tabela `top_entidades_interesse`
2. **Cálculo**: Conta as demonstrações de interesse por entidade ativa
3. **Ordenação**: Ordena por total de demonstrações (decrescente)
4. **Seleção**: Seleciona as top 10 entidades
5. **Inserção**: Insere os dados calculados na tabela

## 🗄️ Estrutura da Tabela

A tabela `top_entidades_interesse` deve ter a seguinte estrutura:

```sql
CREATE TABLE top_entidades_interesse (
  id SERIAL PRIMARY KEY,
  nome_entidade TEXT NOT NULL,
  total_demonstracoes BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Configuração

### Variáveis de Ambiente

- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase (com permissões de escrita)

### Permissões Necessárias

A edge function precisa de permissões para:
- Ler da tabela `demonstracoes_interesse`
- Ler da tabela `entidades`
- Escrever na tabela `top_entidades_interesse`

## 🚀 Deploy

```bash
# Deploy da edge function
supabase functions deploy update-top-entidades-interesse

# Verificar status
supabase functions list
```

## 📡 Uso

### Chamada HTTP

```bash
curl -X POST "https://[PROJECT_REF].supabase.co/functions/v1/update-top-entidades-interesse" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json"
```

### Resposta de Sucesso

```json
{
  "success": true,
  "message": "Tabela top_entidades_interesse atualizada com sucesso",
  "records_processed": 150,
  "records_inserted": 10,
  "final_count": 10,
  "top_entidades": [
    {
      "nome_entidade": "Empresa A",
      "total_demonstracoes": 25
    },
    {
      "nome_entidade": "Empresa B", 
      "total_demonstracoes": 20
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Resposta de Erro

```json
{
  "success": false,
  "error": "Descrição do erro",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## ⏰ Agendamento

Recomenda-se executar esta função periodicamente via cron job:

```sql
-- Executar a cada 15 minutos
SELECT cron.schedule(
  'update-top-entidades-interesse',
  '*/15 * * * *',
  'SELECT net.http_post(
    url := ''https://[PROJECT_REF].supabase.co/functions/v1/update-top-entidades-interesse'',
    headers := ''{"Authorization": "Bearer [ANON_KEY]", "Content-Type": "application/json"}''::jsonb
  );'
);
```

## 🔍 Monitoramento

A função registra logs detalhados para monitoramento:

- ✅ Início da execução
- 🗑️ Limpeza de dados existentes
- 🧮 Cálculo das estatísticas
- 📥 Inserção de novos dados
- 🎯 Verificação dos resultados
- 🎉 Conclusão da execução

## 🚨 Tratamento de Erros

- Erros de conexão com o banco
- Erros de permissão
- Erros de inserção de dados
- Validação de dados

## 📈 Performance

- Processa apenas entidades ativas
- Limita resultado a top 10
- Usa JOINs otimizados
- Logs estruturados para debugging

## 🔗 Integração

Esta edge function é utilizada pelo dashboard para exibir:
- Top 10 organizações com mais demonstrações de interesse
- Ranking visual com medalhas (🥇🥈🥉)
- Contadores de demonstrações por organização
