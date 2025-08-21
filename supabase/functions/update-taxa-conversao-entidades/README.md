# 🔄 Edge Function: Update Taxa Conversao Entidades

## 📋 **Descrição**

Esta edge function atualiza automaticamente a tabela `taxa_conversao_entidades` calculando as taxas de conversão de todas as entidades ativas.

## 🎯 **Funcionalidade**

### **O que faz:**
1. **Limpa** dados existentes da tabela
2. **Calcula** taxas de conversão para cada entidade ativa
3. **Insere** novos dados calculados
4. **Verifica** o resultado final

### **Fórmula da Taxa de Conversão:**
```
Taxa = Total de Participantes em Eventos / Total de Demonstrações de Interesse
```

## 🚀 **Deploy**

### **1. Deploy Local (Desenvolvimento)**
```bash
# Na pasta raiz do projeto
supabase functions serve update-taxa-conversao-entidades --env-file .env.local
```

### **2. Deploy para Produção**
```bash
# Na pasta raiz do projeto
supabase functions deploy update-taxa-conversao-entidades
```

### **3. Verificar Status**
```bash
supabase functions list
```

## 🔧 **Configuração**

### **Variáveis de Ambiente Necessárias:**
```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### **Permissões Necessárias:**
A função precisa de acesso às seguintes tabelas:
- `entidades` (SELECT)
- `demonstracoes_interesse` (SELECT)
- `participantes_evento` (SELECT)
- `eventos` (SELECT)
- `taxa_conversao_entidades` (DELETE, INSERT)

## 📡 **Como Usar**

### **1. Chamada HTTP**
```bash
curl -X POST https://seu-projeto.supabase.co/functions/v1/update-taxa-conversao-entidades \
  -H "Authorization: Bearer SEU_ANON_KEY" \
  -H "Content-Type: application/json"
```

### **2. JavaScript/TypeScript**
```typescript
const { data, error } = await supabase.functions.invoke('update-taxa-conversao-entidades')

if (error) {
  console.error('Erro:', error)
} else {
  console.log('Sucesso:', data)
}
```

### **3. Cron Job (Recomendado)**
```bash
# Executar a cada 15 minutos
*/15 * * * * curl -X POST https://seu-projeto.supabase.co/functions/v1/update-taxa-conversao-entidades
```

## 📊 **Resposta da API**

### **Sucesso (200):**
```json
{
  "success": true,
  "message": "Tabela taxa_conversao_entidades atualizada com sucesso",
  "records_processed": 25,
  "records_inserted": 25,
  "final_count": 25,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### **Erro (500):**
```json
{
  "success": false,
  "error": "Mensagem de erro específica",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔍 **Logs e Monitoramento**

### **Logs de Sucesso:**
```
🔄 Iniciando atualização da tabela taxa_conversao_entidades...
🗑️ Limpando dados existentes...
✅ Dados existentes removidos com sucesso
🧮 Calculando taxas de conversão...
📊 Encontradas 25 entidades ativas
✅ Entidade A: 15 demonstrações, 8 participantes, taxa: 53.33%
✅ Entidade B: 12 demonstrações, 6 participantes, taxa: 50.00%
📥 Inserindo 25 registros...
✅ Dados inseridos com sucesso
🎯 Tabela atualizada com 25 registros
🎉 Atualização concluída com sucesso!
```

### **Logs de Erro:**
```
❌ Erro ao processar entidade Nome: Erro específico
❌ Erro na edge function: Erro geral
```

## 🚨 **Tratamento de Erros**

### **1. Erros de Conexão**
- Função para e retorna erro 500
- Logs detalhados para debugging

### **2. Erros de Dados**
- Entidades com erro são puladas
- Processamento continua para outras entidades
- Logs específicos para cada falha

### **3. Validação**
- Verifica se entidade está ativa
- Valida contadores antes do cálculo
- Arredonda taxa para 4 casas decimais

## ⚡ **Performance**

### **Otimizações Implementadas:**
- **Contadores eficientes** usando `count: 'exact'`
- **Processamento em lote** para inserção
- **Logs condicionais** para produção
- **Tratamento de erros** sem parar o processo

### **Tempo Estimado:**
- **25 entidades**: ~5-10 segundos
- **50 entidades**: ~10-20 segundos
- **100 entidades**: ~20-40 segundos

## 🔄 **Agendamento Automático**

### **1. Supabase Cron Jobs (Recomendado)**
```sql
-- No SQL Editor do Supabase
SELECT cron.schedule(
  'update-taxa-conversao-entidades',
  '*/15 * * * *', -- A cada 15 minutos
  'SELECT net.http_post(
    url := ''https://seu-projeto.supabase.co/functions/v1/update-taxa-conversao-entidades'',
    headers := ''{"Authorization": "Bearer SEU_ANON_KEY"}''
  );'
);
```

### **2. Cron do Sistema**
```bash
# Adicionar ao crontab
*/15 * * * * curl -X POST https://seu-projeto.supabase.co/functions/v1/update-taxa-conversao-entidades
```

### **3. GitHub Actions**
```yaml
# .github/workflows/update-taxa-conversao.yml
name: Update Taxa Conversao
on:
  schedule:
    - cron: '*/15 * * * *'
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Update Taxa Conversao
        run: |
          curl -X POST ${{ secrets.SUPABASE_FUNCTION_URL }}
```

## 🧪 **Testes**

### **1. Teste Local**
```bash
# Deploy local
supabase functions serve update-taxa-conversao-entidades

# Testar
curl -X POST http://localhost:54321/functions/v1/update-taxa-conversao-entidades
```

### **2. Teste de Produção**
```bash
# Deploy
supabase functions deploy update-taxa-conversao-entidades

# Testar
curl -X POST https://seu-projeto.supabase.co/functions/v1/update-taxa-conversao-entidades
```

### **3. Verificar Resultado**
```sql
-- No SQL Editor do Supabase
SELECT * FROM taxa_conversao_entidades ORDER BY taxa_conversao DESC;
```

## 📝 **Manutenção**

### **1. Logs de Produção**
- Acesse o Dashboard do Supabase
- Vá para Edge Functions > Logs
- Monitore execuções e erros

### **2. Atualizações**
- Modifique o código local
- Teste com deploy local
- Faça deploy para produção

### **3. Troubleshooting**
- Verifique variáveis de ambiente
- Confirme permissões das tabelas
- Analise logs de erro

## 🎯 **Próximos Passos**

1. **Deploy da função** para o Supabase
2. **Configurar cron job** para execução automática
3. **Monitorar execuções** e logs
4. **Testar no Dashboard** para ver dados atualizados
5. **Ajustar frequência** conforme necessidade

A edge function está pronta para deploy e uso! 🚀
