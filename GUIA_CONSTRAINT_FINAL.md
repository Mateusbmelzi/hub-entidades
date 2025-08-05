# 🔧 Adicionar Constraint Única - user_roles

## 📋 **Problema Identificado**

❌ **Erro:** `invalid input syntax for type uuid: "user-id"`  
✅ **Causa:** Exemplo usado UUID inválido  
✅ **Solução:** Arquivo SQL correto para adicionar constraint  

## 🔧 **Solução**

### **Arquivo:** `ADD_CONSTRAINT_USER_ROLES.sql`

Este arquivo:
- ✅ **Verifica** se a constraint já existe
- ✅ **Adiciona** constraint única no campo `user_id`
- ✅ **Testa** o `ON CONFLICT` com UUID válido
- ✅ **Verifica** se tudo funcionou

## 📋 **Passo a Passo**

### **1. Executar no Supabase**
```sql
-- Copie todo o conteúdo de ADD_CONSTRAINT_USER_ROLES.sql
-- Cole no SQL Editor do Supabase
-- Clique em "Run"
```

### **2. Verificar Resultado**
Deve aparecer:
- ✅ Lista das constraints existentes
- ✅ `ON CONFLICT funcionou! Role de admin configurado para: [UUID]`
- ✅ `Admin role configurado:` com os dados

### **3. Testar no Dashboard**
- Acesse o Dashboard
- Clique em **"Testar Permissões"**

## ✅ **Resultado Esperado**

```
🔍 Testando permissões do usuário...
👤 Usuário: admin@admin
🔑 Metadata: {role: "admin"}
👑 has_role(admin): true null
🏛️ is_entity_leader(1): false null
📊 Teste eventos: [{count: 5}] null
👑 É admin por email/metadata: true
```

## 🎯 **Benefícios da Constraint**

### **Antes:**
- ❌ `ON CONFLICT` não funcionava
- ❌ Precisava usar `DELETE + INSERT`
- ❌ Código mais complexo

### **Depois:**
- ✅ `ON CONFLICT` funciona perfeitamente
- ✅ Código mais limpo e eficiente
- ✅ Operações mais rápidas

## 🚨 **Se Houver Problemas**

### **Erro de Constraint Já Existente:**
- O arquivo verifica se já existe
- Se existir, apenas testa o `ON CONFLICT`

### **Erro de Sintaxe:**
- Execute linha por linha
- Verifique se a tabela `user_roles` existe

### **Usuário Não Encontrado:**
- Verifique se `admin@admin` existe
- Crie o usuário se necessário

## 📊 **Monitoramento**

### **Indicadores de Sucesso:**
- ✅ Constraint criada com sucesso
- ✅ `ON CONFLICT` funcionando
- ✅ Role de admin configurado
- ✅ Dashboard carregando dados

### **Indicadores de Problema:**
- ❌ Erro ao criar constraint
- ❌ `ON CONFLICT` ainda falhando
- ❌ Role não configurado

## 🔄 **Fluxo de Resolução**

1. **Execute** `ADD_CONSTRAINT_USER_ROLES.sql`
2. **Verifique** se a constraint foi criada
3. **Confirme** que `ON CONFLICT` funciona
4. **Teste** no Dashboard
5. **Monitore** logs do console

## 🏆 **Próximos Passos**

Após adicionar a constraint:
- ✅ **Código mais limpo** para futuras operações
- ✅ **Melhor performance** nas operações
- ✅ **Mais flexibilidade** para gerenciar roles

---

**Arquivo:** `ADD_CONSTRAINT_USER_ROLES.sql`  
**Status:** ✅ Pronto para execução  
**Benefício:** Código mais limpo e eficiente 