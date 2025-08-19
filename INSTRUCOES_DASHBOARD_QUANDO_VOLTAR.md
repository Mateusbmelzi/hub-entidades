# 📋 **Instruções para Quando Tiver Acesso ao Dashboard**

## 🔄 **Situação Atual:**
- ✅ **Frontend funcionando** - Modificado para usar update direto na tabela
- ❌ **Função RPC não criada** - Precisa ser criada no Supabase Dashboard

## 🎯 **O que Fazer Quando Tiver Acesso:**

### **1. Acessar o Supabase Dashboard:**
- Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Faça login na sua conta
- Selecione o projeto `hub-entidades`

### **2. Criar a Função RPC:**
- No menu lateral, clique em **"SQL Editor"**
- Clique em **"New query"**
- Cole o SQL do arquivo `create-update-event-function.sql`
- Clique em **"Run"**

### **3. Verificar se Funcionou:**
```sql
-- Verificar se a função foi criada
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'update_event_as_entity';
```

### **4. Reverter o Hook para RPC:**
Após criar a função RPC, reverta o arquivo `src/hooks/useUpdateEventoAsEntity.ts` para usar a função RPC novamente.

---

## 🚀 **Benefícios da Função RPC:**

1. **Segurança** - Validações no banco
2. **Performance** - Execução otimizada
3. **Auditoria** - Logs de todas as operações
4. **Manutenibilidade** - Lógica centralizada

---

## 📝 **Arquivos Envolvidos:**

- `src/hooks/useUpdateEventoAsEntity.ts` - Hook temporariamente modificado
- `create-update-event-function.sql` - SQL para criar a função RPC
- `src/components/EditarEventoEntidade.tsx` - Componente de edição
- `src/pages/EntidadeDetalhes.tsx` - Página com modal de edição

---

## 🔍 **Teste Após Criar a Função RPC:**

1. **Reverta o hook** para usar RPC
2. **Teste a edição** de um evento
3. **Verifique os logs** no console
4. **Confirme** que o modal fecha e lista recarrega

---

## 📞 **Suporte:**
Se precisar de ajuda para reverter o hook ou criar a função RPC, me avise!
