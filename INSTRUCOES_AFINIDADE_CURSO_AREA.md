# 🎯 Afinidade Curso-Área - Implementação Completa

## 📋 O que foi criado

✅ **Edge Function** `update-afinidade-curso-area`  
✅ **Função SQL** `calcular_afinidade_curso_area()`  
✅ **Hook React** `useAfinidadeCursoArea`  
✅ **Dashboard atualizado** com visualização de afinidades  

## 🚀 Passos para implementar

### **1. Criar a função SQL no Supabase**

Execute no **SQL Editor** do Supabase:

```sql
-- Criar função para calcular afinidades
CREATE OR REPLACE FUNCTION calcular_afinidade_curso_area()
RETURNS TABLE (
  curso_estudante TEXT,
  area_atuacao TEXT,
  total_interesses BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.curso as curso_estudante,
    e.area_atuacao[1] as area_atuacao,
    COUNT(d.id) as total_interesses
  FROM usuarios u
  INNER JOIN demonstracoes_interesse d ON u.id = d.usuario_id
  INNER JOIN entidades e ON d.entidade_id = e.id
  WHERE u.role = 'student'
    AND e.status = 'ativo'
    AND e.area_atuacao IS NOT NULL
    AND e.area_atuacao != '{}'
  GROUP BY u.curso, e.area_atuacao[1]
  HAVING COUNT(d.id) > 0
  ORDER BY total_interesses DESC;
END;
$$;

-- Testar a função
SELECT * FROM calcular_afinidade_curso_area() LIMIT 10;
```

### **2. Deploy da Edge Function**

```bash
# Deploy da função
npx supabase functions deploy update-afinidade-curso-area

# Verificar se foi deployada
npx supabase functions list
```

### **3. Configurar cron job para execução automática**

Execute no **SQL Editor**:

```sql
-- Criar cron job para atualizar afinidades a cada 15 minutos
SELECT cron.schedule(
  'atualizar-afinidade-curso-area',
  '*/15 * * * *',
  'SELECT net.http_post(
    url := ''https://lddtackcnpzdswndqgfs.supabase.co/functions/v1/update-afinidade-curso-area'',
    headers := ''{"Authorization": "Bearer ' || current_setting(''app.settings.service_role_key'') || '", "Content-Type": "application/json"}''::jsonb
  );'
);

-- Verificar cron jobs ativos
SELECT * FROM cron.job WHERE jobname LIKE '%afinidade%';
```

### **4. Testar manualmente**

```bash
# Testar a Edge Function
curl -X POST "https://lddtackcnpzdswndqgfs.supabase.co/functions/v1/update-afinidade-curso-area" \
  -H "Authorization: Bearer SEU_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

## 🔧 Estrutura esperada das tabelas

### **usuarios**
- `id` (UUID)
- `curso` (TEXT)
- `role` (TEXT) - deve ser 'student'

### **entidades**
- `id` (UUID)
- `area_atuacao` (TEXT[]) - array de áreas
- `status` (TEXT) - deve ser 'ativo'

### **demonstracoes_interesse**
- `id` (UUID)
- `usuario_id` (UUID) - FK para usuarios
- `entidade_id` (UUID) - FK para entidades

## 🚨 Se der erro na função SQL

### **Versão alternativa mais flexível:**

```sql
CREATE OR REPLACE FUNCTION calcular_afinidade_curso_area_alternativa()
RETURNS TABLE (
  curso_estudante TEXT,
  area_atuacao TEXT,
  total_interesses BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(u.curso, 'Curso não informado') as curso_estudante,
    COALESCE(e.area_atuacao::TEXT, 'Área não informada') as area_atuacao,
    COUNT(d.id) as total_interesses
  FROM demonstracoes_interesse d
  LEFT JOIN usuarios u ON d.usuario_id = u.id
  LEFT JOIN entidades e ON d.entidade_id = e.id
  GROUP BY u.curso, e.area_atuacao
  HAVING COUNT(d.id) > 0
  ORDER BY total_interesses DESC;
END;
$$;
```

## 📊 Verificar se está funcionando

### **1. Verificar dados na tabela:**
```sql
SELECT * FROM afinidade_curso_area ORDER BY total_interesses DESC;
```

### **2. Verificar cron jobs:**
```sql
SELECT * FROM cron.job;
```

### **3. Verificar logs da Edge Function:**
- Vá em **Edge Functions** no Dashboard
- Clique em **update-afinidade-curso-area**
- Verifique os logs de execução

## 🎯 Resultado esperado

Após implementar, você terá:

✅ **Função SQL** calculando afinidades automaticamente  
✅ **Edge Function** atualizando a tabela via HTTP  
✅ **Cron job** executando a cada 15 minutos  
✅ **Dashboard** mostrando afinidades em tempo real  
✅ **Dados sempre atualizados** sem intervenção manual  

## 🔄 Fluxo de atualização

1. **Cron job** executa a cada 15 minutos
2. **Chama Edge Function** via HTTP POST
3. **Edge Function** executa função SQL
4. **Função SQL** calcula afinidades
5. **Edge Function** atualiza tabela `afinidade_curso_area`
6. **Dashboard** mostra dados atualizados

## 🚀 Execute e me diga o resultado!

**Quer que eu ajude com algum passo específico?** 🎯

