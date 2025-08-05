# 🚀 Guia Rápido - Executar Correção SQL

## 📋 **Passo a Passo**

### 1. **Acessar Supabase**
- Vá para [supabase.com](https://supabase.com)
- Acesse seu projeto
- Clique em **"SQL Editor"** no menu lateral

### 2. **Executar Correção**
- Abra o arquivo `FIX_ADMIN_PERMISSIONS_SIMPLE.sql`
- Copie todo o conteúdo
- Cole no SQL Editor do Supabase
- Clique em **"Run"** (ou pressione Ctrl+Enter)

### 3. **Verificar Resultado**
- Deve aparecer: `Políticas criadas com sucesso!`
- Lista das políticas criadas na tabela `eventos`

### 4. **Testar no Dashboard**
- Volte para a aplicação
- Faça logout e login novamente como admin
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

## 🚨 **Se Ainda Houver Problemas**

### **Erro de Sintaxe:**
- Use apenas o arquivo `FIX_ADMIN_PERMISSIONS_SIMPLE.sql`
- Execute linha por linha se necessário

### **Usuário Ainda Undefined:**
- Verifique se está logado como `admin@admin`
- Tente fazer logout/login novamente
- Limpe o cache do navegador

### **Funções RPC com Erro:**
- Execute apenas as linhas 4-5 do arquivo SQL
- Verifique se as tabelas `user_roles` e `entity_leaders` existem

## 📞 **Suporte**

Se o problema persistir:
1. **Colete os logs** do console (F12)
2. **Execute** as queries de verificação
3. **Documente** os erros específicos
4. **Contate** o administrador com essas informações

---

**Arquivo:** `FIX_ADMIN_PERMISSIONS_SIMPLE.sql`  
**Status:** ✅ Pronto para execução 