# Debug da Página de Eventos

## Passos para identificar o problema:

### 1. Verificar Console do Navegador
1. Abra a página de eventos: `http://localhost:5173/eventos`
2. Pressione F12 para abrir as ferramentas de desenvolvedor
3. Vá na aba "Console"
4. Verifique se há erros vermelhos

### 2. Verificar Network Tab
1. Na aba "Network" das ferramentas de desenvolvedor
2. Recarregue a página
3. Procure por requisições para o Supabase que falharam
4. Verifique o status code das requisições

### 3. Testar Conexão com Supabase
Execute o script `test-connection.sql` no SQL Editor do Supabase para verificar:
- Se as tabelas existem
- Se há dados
- Se as políticas RLS estão corretas

### 4. Possíveis Problemas Identificados:

#### Problema 1: Políticas RLS muito restritivas
**Solução**: Execute o script `fix-entidades-policies.sql`

#### Problema 2: Falta de dados de exemplo
**Solução**: Execute este SQL no Supabase:
```sql
-- Inserir entidades se não existirem
INSERT INTO entidades (nome, descricao_curta, area_atuacao) 
VALUES 
('Tech Club', 'Clube de tecnologia', 'Tecnologia'),
('Finance Society', 'Sociedade de finanças', 'Finanças')
ON CONFLICT (nome) DO NOTHING;

-- Inserir eventos aprovados se não existirem
INSERT INTO eventos (nome, descricao, data_evento, local, entidade_id, capacidade, status_aprovacao) 
VALUES 
('Workshop React', 'Workshop prático sobre React', '2024-12-15 19:00:00+00', 'Lab 302', 1, 30, 'aprovado'),
('Hackathon 2024', 'Competição de programação', '2024-12-20 09:00:00+00', 'Auditório', 1, 100, 'aprovado')
ON CONFLICT (nome) DO NOTHING;
```

#### Problema 3: Tipos TypeScript desatualizados
**Solução**: Regenerar os tipos do Supabase:
```bash
npx supabase gen types typescript --project-id seu-project-id > src/integrations/supabase/types.ts
```

#### Problema 4: Variáveis de ambiente incorretas
**Solução**: Verificar arquivo `.env`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-public
```

### 5. Teste Rápido
Para testar se o problema é com a consulta específica, execute este SQL no Supabase:
```sql
SELECT 
  e.id,
  e.nome,
  e.descricao,
  e.data_evento,
  e.local,
  e.capacidade,
  e.status_aprovacao,
  ent.nome as entidade_nome
FROM eventos e
LEFT JOIN entidades ent ON e.entidade_id = ent.id
WHERE e.status_aprovacao = 'aprovado'
ORDER BY e.data_evento
LIMIT 10;
```

### 6. Logs de Debug
Adicione logs temporários no hook `useEventos.ts`:
```typescript
console.log('Fetching eventos with options:', options);
console.log('Query result:', { data, error });
```

### 7. Verificar se o problema é específico da página
Teste acessando outras páginas que usam o Supabase para ver se o problema é geral ou específico da página de eventos. 