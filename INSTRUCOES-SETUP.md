# Instruções para Configurar a Funcionalidade de Alterar Sala

## ⚠️ IMPORTANTE: Execute o Script SQL Primeiro

Para que a funcionalidade de alterar sala funcione corretamente, você precisa executar o script SQL no Supabase para adicionar os campos necessários à tabela `reservas`.

### 📋 Passos para Executar:

1. **Acesse o Supabase Dashboard**
   - Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Faça login na sua conta
   - Selecione o projeto do hub-entidades

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o Script**
   - Copie todo o conteúdo do arquivo `fix-reservas-table.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar

4. **Verifique se Funcionou**
   - O script deve mostrar mensagens de sucesso para cada coluna adicionada
   - Verifique se as colunas aparecem na consulta final

### 🔧 Script SQL (fix-reservas-table.sql)

```sql
-- Script para corrigir a tabela reservas adicionando campos de sala
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar se as colunas já existem
DO $$
BEGIN
    -- Verificar e adicionar sala_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reservas' AND column_name = 'sala_id') THEN
        ALTER TABLE reservas ADD COLUMN sala_id BIGINT REFERENCES salas(id);
        RAISE NOTICE 'Coluna sala_id adicionada';
    ELSE
        RAISE NOTICE 'Coluna sala_id já existe';
    END IF;

    -- Verificar e adicionar sala_nome se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reservas' AND column_name = 'sala_nome') THEN
        ALTER TABLE reservas ADD COLUMN sala_nome TEXT;
        RAISE NOTICE 'Coluna sala_nome adicionada';
    ELSE
        RAISE NOTICE 'Coluna sala_nome já existe';
    END IF;

    -- Verificar e adicionar sala_predio se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reservas' AND column_name = 'sala_predio') THEN
        ALTER TABLE reservas ADD COLUMN sala_predio TEXT;
        RAISE NOTICE 'Coluna sala_predio adicionada';
    ELSE
        RAISE NOTICE 'Coluna sala_predio já existe';
    END IF;

    -- Verificar e adicionar sala_andar se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reservas' AND column_name = 'sala_andar') THEN
        ALTER TABLE reservas ADD COLUMN sala_andar TEXT;
        RAISE NOTICE 'Coluna sala_andar adicionada';
    ELSE
        RAISE NOTICE 'Coluna sala_andar já existe';
    END IF;

    -- Verificar e adicionar sala_capacidade se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reservas' AND column_name = 'sala_capacidade') THEN
        ALTER TABLE reservas ADD COLUMN sala_capacidade INTEGER;
        RAISE NOTICE 'Coluna sala_capacidade adicionada';
    ELSE
        RAISE NOTICE 'Coluna sala_capacidade já existe';
    END IF;
END $$;

-- 2. Criar índice para sala_id se não existir
CREATE INDEX IF NOT EXISTS idx_reservas_sala_id ON reservas(sala_id);

-- 3. Verificar estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reservas'
AND column_name IN ('sala_id', 'sala_nome', 'sala_predio', 'sala_andar', 'sala_capacidade')
ORDER BY column_name;

-- 4. Mostrar todas as colunas da tabela reservas
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'reservas'
ORDER BY ordinal_position;
```

### ✅ Após Executar o Script

1. **Recarregue a aplicação** - A funcionalidade de alterar sala estará disponível
2. **Teste a funcionalidade**:
   - Vá para o Dashboard
   - Clique na seção "Calendário"
   - Clique em uma reserva aprovada
   - Clique em "Alterar Sala"
   - Selecione uma nova sala e confirme

### 🚨 Se Ainda Houver Problemas

Se mesmo após executar o script ainda houver erros:

1. **Verifique se o script foi executado completamente**
2. **Confirme que as colunas foram criadas** executando:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'reservas' 
   AND column_name LIKE 'sala_%';
   ```
3. **Verifique os logs do Supabase** para erros de permissão

### 📞 Suporte

Se precisar de ajuda, verifique:
- Logs do console do navegador
- Logs do Supabase
- Mensagens de erro específicas
