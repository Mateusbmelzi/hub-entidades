# 🔧 Guia para Resolver Issues Restantes

## 📋 **Issues Identificados**

### 1. **Activities Table - Permission Denied (Tabela Users Não Existe)**
- **Erro**: `permission denied for table users` (code: 42501)
- **Causa**: A tabela `activities` está tentando acessar uma tabela `users` que **NÃO EXISTE**
- **Solução**: Corrigir as políticas de segurança (RLS) da tabela activities para não depender da tabela users

### 2. **Function Overloading Issues**
- **Erro**: `PGRST203` - Could not choose the best candidate function
- **Causa**: Múltiplas funções com o mesmo nome mas tipos de parâmetros diferentes
- **Solução**: Recriar as funções com nomes únicos e aliases

## 🚀 **Passos para Resolver**

### **Passo 1: Executar Verificação e Correção da Activities Table**

1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Execute o arquivo `VERIFY_AND_FIX_ACTIVITIES.sql`

```sql
-- Execute este arquivo no SQL Editor do Supabase
-- VERIFY_AND_FIX_ACTIVITIES.sql
```

**Este script irá:**
- ✅ Verificar se a tabela activities existe
- ✅ Remover referências à tabela users (que não existe)
- ✅ Criar políticas corretas sem depender da tabela users
- ✅ Ativar RLS corretamente

### **Passo 2: Executar Correção das Funções RPC**

1. No mesmo SQL Editor
2. Execute o arquivo `FIX_RPC_FUNCTIONS_FINAL.sql`

```sql
-- Execute este arquivo no SQL Editor do Supabase
-- FIX_RPC_FUNCTIONS_FINAL.sql
```

### **Passo 3: Verificar Resultados**

Após executar os scripts, verifique:

1. **Activities Table**:
   - ✅ Tabela deve estar acessível para super admin
   - ✅ Políticas de segurança corretas (sem depender de users)
   - ✅ RLS ativado
   - ✅ Sem referências à tabela users

2. **RPC Functions**:
   - ✅ `has_role` funcionando sem erros
   - ✅ `is_entity_leader` funcionando sem erros
   - ✅ Sem erros de function overloading

### **Passo 4: Testar no Frontend**

1. Recarregue a página do Dashboard
2. Verifique os logs no console:
   - ✅ Activities carregando sem erros
   - ✅ Funções RPC funcionando
   - ✅ Dados sendo exibidos corretamente

## 🔍 **Verificações de Debug**

### **Verificar Activities Table**
```sql
-- Verificar se a tabela existe
SELECT * FROM activities LIMIT 1;

-- Verificar políticas
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'activities';

-- Verificar se há referências à tabela users
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'activities'
AND ccu.table_name = 'users';
```

### **Verificar RPC Functions**
```sql
-- Verificar funções has_role
SELECT proname, proargtypes::regtype[]
FROM pg_proc 
WHERE proname = 'has_role';

-- Verificar funções is_entity_leader
SELECT proname, proargtypes::regtype[]
FROM pg_proc 
WHERE proname = 'is_entity_leader';
```

### **Testar Funções**
```sql
-- Testar has_role
SELECT has_role('user-id-here', 'admin');

-- Testar is_entity_leader
SELECT is_entity_leader('user-id-here', 1);
```

## 📊 **Resultados Esperados**

Após a correção, você deve ver:

### **Console Logs**
```
✅ Activities carregadas com sucesso: X registros
👑 has_role(admin): true null
🏛️ is_entity_leader(1): false null
```

### **Dashboard Funcionando**
- ✅ Dados carregando sem erros
- ✅ Gráficos e estatísticas exibidas
- ✅ Navegação funcionando
- ✅ Autenticação funcionando

## 🆘 **Se Ainda Houver Problemas**

### **Activities Table**
1. ✅ **Verificar se a tabela `users` existe** (confirmado que NÃO existe)
2. ✅ **Remover referências à tabela users** (feito no script)
3. ✅ **Verificar se o super admin tem permissões corretas**
4. ✅ **Verificar se RLS está configurado corretamente**

### **RPC Functions**
1. Verificar se as funções foram criadas corretamente
2. Verificar se os tipos de parâmetros estão corretos
3. Verificar se não há conflitos de nomes

### **Dashboard**
1. Limpar cache do navegador
2. Verificar se o usuário está autenticado corretamente
3. Verificar logs de erro no console

## 📞 **Suporte**

Se ainda houver problemas após seguir este guia:

1. Verifique os logs de erro no console
2. Execute as verificações de debug
3. Verifique se todos os scripts foram executados corretamente
4. Consulte a documentação do Supabase para RLS e RPC functions

## 🎯 **Resumo da Solução**

O problema principal era que a tabela `activities` estava tentando acessar uma tabela `users` que **não existe**. A solução:

1. **Remove referências à tabela users** da tabela activities
2. **Cria políticas corretas** que não dependem da tabela users
3. **Usa auth.users** (tabela interna do Supabase) para verificar permissões
4. **Mantém funcionalidade** sem depender de tabelas inexistentes 