# 🔧 Troubleshooting: Botão "Criar Evento" Não Funciona

## 🚨 Problema Identificado
O botão "Criar Evento" não está respondendo quando clicado.

## 🔍 Possíveis Causas e Soluções

### 1. **Verificar Console do Navegador**
1. Abra o DevTools (F12)
2. Vá para a aba "Console"
3. Tente criar um evento
4. Verifique se há mensagens de erro

### 2. **Verificar Se a Função RPC Existe**
Execute este script SQL no seu banco Supabase:

```sql
-- Verificar se a função RPC existe
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'create_event_as_entity_pending';
```

**Se não retornar nada**: A função RPC não existe.

### 3. **Verificar Estrutura da Tabela Eventos**
```sql
-- Verificar estrutura da tabela
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'eventos'
ORDER BY ordinal_position;
```

### 4. **Solução Implementada**
Implementei uma solução que:
1. **Tenta usar a função RPC primeiro**
2. **Se falhar, insere diretamente na tabela**
3. **Adiciona logs detalhados para debug**

## 🧪 Como Testar

### **Passo 1: Abrir Console**
- Pressione F12
- Vá para aba "Console"

### **Passo 2: Tentar Criar Evento**
1. Clique em "Criar Evento"
2. Preencha o formulário:
   - **Nome**: "Teste Evento"
   - **Descrição**: "Descrição de teste"
   - **Local**: "Local de teste"
   - **Data/Hora**: Digite "25122024 1430" (será formatado para "25/12/2024 14:30")
   - **Áreas**: Selecione pelo menos uma área

### **Passo 3: Verificar Logs**
No console, você deve ver:
```
📝 Submetendo formulário de evento: {...}
✅ Validações passaram, data convertida: Date {...}
🚀 Chamando createEvento com: {...}
```

### **Passo 4: Verificar Resultado**
- **Se RPC funcionar**: "✅ Evento criado via RPC, ID: X"
- **Se RPC falhar**: "🔄 Tentando inserção direta na tabela eventos..."
- **Se inserção direta funcionar**: "✅ Evento criado diretamente na tabela, ID: X"

## 🛠️ Soluções Alternativas

### **Opção 1: Criar Função RPC**
Se a função RPC não existir, execute este SQL:

```sql
-- Criar função para criar eventos
CREATE OR REPLACE FUNCTION create_event_as_entity_pending(
  _entidade_id INTEGER,
  _nome TEXT,
  _data_evento TIMESTAMP,
  _descricao TEXT DEFAULT NULL,
  _local TEXT DEFAULT NULL,
  _capacidade INTEGER DEFAULT NULL,
  _link_evento TEXT DEFAULT NULL,
  _area_atuacao TEXT[] DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  _evento_id INTEGER;
BEGIN
  -- Separar data e horário
  INSERT INTO eventos (
    entidade_id, nome, descricao, local, 
    data, horario, capacidade, link_evento, 
    area_atuacao, status
  ) VALUES (
    _entidade_id, _nome, _descricao, _local,
    _data_evento::date, _data_evento::time, _capacidade, _link_evento,
    _area_atuacao, 'pendente'
  ) RETURNING id INTO _evento_id;
  
  RETURN _evento_id;
END;
$$;
```

### **Opção 2: Usar Inserção Direta (Já Implementada)**
A solução atual já tenta inserção direta se a RPC falhar.

## 🔍 Debug Adicional

### **Verificar Autenticação**
```typescript
// No console do navegador
console.log('🔍 Estado da autenticação:', {
  entidadeId: window.entidadeId, // Se existir
  isAuthenticated: window.isAuthenticated // Se existir
});
```

### **Verificar Dados do Formulário**
```typescript
// No console do navegador
console.log('📝 Dados do formulário:', {
  nome: document.getElementById('nome')?.value,
  descricao: document.getElementById('descricao')?.value,
  local: document.getElementById('local')?.value,
  dataEvento: document.getElementById('data-evento')?.value
});
```

## 📋 Checklist de Verificação

- [ ] Console do navegador aberto
- [ ] Formulário preenchido completamente
- [ ] Data no formato correto (DD/MM/AAAA HH:MM)
- [ ] Pelo menos uma área selecionada
- [ ] Logs aparecem no console
- [ ] Função RPC existe no banco (ou inserção direta funciona)

## 🚀 Próximos Passos

1. **Teste o formulário** seguindo os passos acima
2. **Verifique os logs** no console
3. **Execute o script SQL** para verificar a função RPC
4. **Reporte os resultados** para continuarmos o debug

## 📞 Suporte

Se o problema persistir, forneça:
- Screenshot do console com erros
- Resultado do script SQL
- Passos exatos que você seguiu
- Qualquer mensagem de erro específica
