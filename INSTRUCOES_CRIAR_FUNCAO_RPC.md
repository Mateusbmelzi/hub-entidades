# 🚀 **Instruções para Criar a Função RPC no Supabase**

## ❌ **Problema Identificado:**
A função RPC `update_event_as_entity` não existe no banco de dados, causando erro 404.

## ✅ **Solução:**
Criar a função RPC no Supabase Dashboard.

---

## 📋 **Passo a Passo:**

### **1. Acessar o Supabase Dashboard**
- Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Faça login na sua conta
- Selecione o projeto `hub-entidades`

### **2. Abrir o SQL Editor**
- No menu lateral esquerdo, clique em **"SQL Editor"**
- Clique em **"New query"** para criar uma nova consulta

### **3. Executar o SQL**
- Copie todo o conteúdo do arquivo `create-update-event-function.sql`
- Cole no SQL Editor
- Clique em **"Run"** para executar

### **4. Verificar se Funcionou**
- Após executar, você deve ver uma mensagem de sucesso
- A função deve aparecer na lista de funções RPC

---

## 🔍 **Verificação:**

### **Opção 1: SQL Editor**
```sql
-- Verificar se a função foi criada
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'update_event_as_entity';
```

### **Opção 2: Interface Gráfica**
- No menu lateral, clique em **"Database"**
- Clique em **"Functions"**
- Procure por `update_event_as_entity`

---

## 🧪 **Teste da Função:**

Após criar a função, você pode testá-la com:

```sql
-- Substitua os valores pelos reais do seu banco
SELECT update_event_as_entity(
    'evento-id-aqui',  -- ID do evento
    60,                 -- ID da entidade (60 no seu caso)
    'Nome Atualizado',  -- Novo nome
    'Nova descrição',   -- Nova descrição
    'Novo local',       -- Novo local
    '2025-01-20',       -- Nova data
    '14:00:00',         -- Novo horário
    50,                 -- Nova capacidade
    'https://exemplo.com', -- Novo link
    'ativo'             -- Novo status
);
```

---

## 🎯 **Resultado Esperado:**

Após criar a função, quando você tentar editar um evento:

1. ✅ **Modal abre corretamente**
2. ✅ **Formulário é submetido**
3. ✅ **Função RPC é executada**
4. ✅ **Evento é atualizado no banco**
5. ✅ **Modal fecha e lista é recarregada**

---

## 🚨 **Se ainda não funcionar:**

1. **Verifique se a função foi criada:**
   - Execute o SQL de verificação
   - Confirme que aparece na lista de funções

2. **Verifique as permissões:**
   - A função deve ter permissão para usuários autenticados
   - O usuário deve estar logado

3. **Verifique os logs:**
   - Abra o console do navegador
   - Tente editar um evento
   - Verifique se há erros diferentes

---

## 📞 **Suporte:**
Se ainda houver problemas, compartilhe:
- Screenshot do SQL Editor após executar
- Novos logs do console
- Mensagens de erro específicas
