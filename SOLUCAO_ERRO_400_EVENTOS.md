# 🔧 Solução para Erro 400 na Tabela Eventos

## 📋 **Problema Identificado**

O Dashboard está apresentando erro 400 ao tentar acessar a tabela `eventos`, mesmo com as políticas RLS configuradas corretamente.

## 🔍 **Diagnóstico**

### **Logs de Erro:**
```
Failed to load resource: the server responded with a status of 400 ()
Dashboard.tsx:253 Erro ao buscar eventos: Object
```

### **Políticas RLS Existentes:**
✅ **8 políticas configuradas** para a tabela `eventos`
✅ **Funções personalizadas** `is_entity_leader` e `has_role` definidas
✅ **Usuário autenticado** como super admin

## 🚀 **Soluções Implementadas**

### 1. **Diagnóstico Automático**
- **Logs detalhados** com informações do usuário autenticado
- **Teste de permissões** via botão "Testar Permissões"
- **Consulta alternativa** em caso de erro de permissão

### 2. **Interface Melhorada**
- **Status visual** de conectividade para cada fonte de dados
- **Card de troubleshooting** com diagnóstico específico
- **Botão de recarregamento** para tentar novamente

### 3. **Tratamento de Erros Robusto**
- **Fallback automático** para consultas mais simples
- **Mensagens informativas** sobre limitações
- **Sugestões de ação** para resolver problemas

## 🔧 **Passos para Resolver**

### **Passo 1: Testar Permissões**
1. Acesse o Dashboard
2. Clique no botão **"Testar Permissões"** no card de troubleshooting
3. Verifique os logs no console do navegador (F12)

### **Passo 2: Verificar Funções RPC**
Execute no SQL Editor do Supabase:

```sql
-- Testar função has_role
SELECT has_role('user-id-aqui', 'admin'::app_role);

-- Testar função is_entity_leader  
SELECT is_entity_leader('user-id-aqui', 1);

-- Verificar se as funções existem
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('has_role', 'is_entity_leader');
```

### **Passo 3: Verificar Políticas RLS**
```sql
-- Verificar políticas da tabela eventos
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'eventos'
ORDER BY policyname;
```

### **Passo 4: Testar Consulta Direta**
```sql
-- Testar consulta simples
SELECT id, nome FROM eventos LIMIT 5;

-- Testar com usuário específico
SET LOCAL ROLE authenticated;
SELECT id, nome FROM eventos LIMIT 5;
```

## 🎯 **Possíveis Causas e Soluções**

### **Causa 1: Função RPC com Problema**
**Sintoma:** Erro ao chamar `has_role` ou `is_entity_leader`

**Solução:**
```sql
-- Recriar função has_role
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Recriar função is_entity_leader
CREATE OR REPLACE FUNCTION is_entity_leader(_user_id UUID, _entidade_id BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM entity_leaders 
    WHERE user_id = _user_id AND entidade_id = _entidade_id
  );
$$;
```

### **Causa 2: Política RLS Conflitante**
**Sintoma:** Múltiplas políticas para o mesmo comando

**Solução:**
```sql
-- Remover política duplicada (se existir)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON eventos;

-- Verificar se há conflitos
SELECT policyname, cmd, COUNT(*) 
FROM pg_policies 
WHERE tablename = 'eventos' 
GROUP BY policyname, cmd 
HAVING COUNT(*) > 1;
```

### **Causa 3: Usuário sem Role Definido**
**Sintoma:** Usuário autenticado mas sem role na tabela `user_roles`

**Solução:**
```sql
-- Inserir role para o usuário
INSERT INTO user_roles (user_id, role) 
VALUES ('user-id-aqui', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

## 📊 **Monitoramento**

### **Indicadores de Sucesso:**
- ✅ **Status verde** para eventos no Dashboard
- ✅ **Logs sem erro 400** no console
- ✅ **Função "Testar Permissões"** retorna sucesso

### **Indicadores de Problema:**
- ❌ **Status vermelho** para eventos
- ❌ **Erro 400** persistente
- ❌ **Funções RPC** falhando

## 🔄 **Fluxo de Resolução**

1. **Identificar** o problema via logs do console
2. **Testar** permissões via botão no Dashboard
3. **Executar** queries de diagnóstico no Supabase
4. **Aplicar** correção específica baseada no diagnóstico
5. **Verificar** se o problema foi resolvido
6. **Monitorar** para garantir que não retorne

## 📞 **Suporte**

Se o problema persistir após seguir estes passos:

1. **Coletar logs** do console do navegador
2. **Executar** todas as queries de diagnóstico
3. **Documentar** resultados dos testes
4. **Contatar** administrador do sistema com as informações coletadas

---

**Última atualização:** $(date)
**Versão:** 1.0
**Status:** Implementado ✅ 