# 🔧 Troubleshooting Atualizado: Botão "Criar Evento" Não Funciona

## 🚨 **PROBLEMA IDENTIFICADO E CORRIGIDO!**

### **🔍 Causa Raiz:**
A tabela `eventos` usa **`status_aprovacao`** (não `status`) para controlar aprovação:
- ❌ **`status`**: padrão `'ativo'` (estado do evento)
- ✅ **`status_aprovacao`**: padrão `'pendente'` (status de aprovação)

### **✅ Correções Implementadas:**
1. **Campo correto**: `status_aprovacao: 'pendente'`
2. **Função RPC**: Criada com estrutura correta
3. **Inserção direta**: Usa campos corretos da tabela

## 🧪 Como Testar Agora

### **Passo 1: Executar Scripts SQL**
1. **Execute primeiro** `create_rpc_function.sql` para criar a função RPC
2. **Depois teste** com `test_insert_evento.sql`

### **Passo 2: Testar no Frontend**
1. Abra o console (F12)
2. Clique em "Criar Evento"
3. Use os botões de debug:
   - 🧪 **"Testar Conexão"** (agora deve funcionar)
   - 🧪 **"Testar Inserção"** (deve inserir corretamente)

### **Passo 3: Verificar Logs**
Agora você deve ver:
```
🧪 Testando conexão com banco...
📊 Teste tabela eventos: {...}
📊 Teste RPC: {...} (deve funcionar agora)
```

## 🛠️ Scripts SQL para Executar

### **1. Criar Função RPC (OBRIGATÓRIO)**
```sql
-- Execute create_rpc_function.sql no Supabase
-- Isso criará a função que estava faltando
```

### **2. Testar Inserção Direta**
```sql
-- Execute test_insert_evento.sql no Supabase
-- Deve funcionar agora com os campos corretos
```

## 🎯 Estrutura Correta da Tabela

Baseado na sua tabela, os campos corretos são:
- ✅ `entidade_id`: BIGINT
- ✅ `nome`: TEXT (obrigatório)
- ✅ `descricao`: TEXT (opcional)
- ✅ `local`: TEXT (opcional)
- ✅ `data`: DATE (obrigatório)
- ✅ `horario`: TIME (opcional)
- ✅ `capacidade`: INTEGER (opcional)
- ✅ `link_evento`: TEXT (opcional)
- ✅ `area_atuacao`: TEXT[] (opcional)
- ✅ `status_aprovacao`: TEXT (padrão 'pendente')

## 🚀 Resultado Esperado Agora

Com as correções:
1. ✅ **Função RPC funcionará** (se executar o script)
2. ✅ **Inserção direta funcionará** (campos corretos)
3. ✅ **Botão "Criar Evento" funcionará** (via RPC ou inserção direta)

## 📋 Próximos Passos

1. **Execute** `create_rpc_function.sql` no Supabase
2. **Teste** os botões de debug no frontend
3. **Verifique** se o botão "Criar Evento" funciona
4. **Reporte** o resultado final

**Agora deve funcionar perfeitamente!** 🎉
