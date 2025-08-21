# 🚀 Deploy das Edge Functions - Hub de Entidades

## 📋 Pré-requisitos

- Projeto Supabase ativo (ID: `lddtackcnpzdswndqgfs`)
- Acesso ao dashboard do Supabase
- Todas as edge functions implementadas localmente

## 🔧 Método 1: Deploy via Interface Web (Recomendado)

### Passo 1: Acessar o Dashboard do Supabase
1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione o projeto `hub-entidades`

### Passo 2: Navegar para Edge Functions
1. No menu lateral, clique em **"Edge Functions"**
2. Você verá as funções existentes

### Passo 3: Deploy da Nova Edge Function
1. Clique em **"Create a new function"**
2. Nome: `update-indicadores-gerais`
3. Copie o código do arquivo `supabase/functions/update-indicadores-gerais/index.ts`
4. Cole no editor
5. Clique em **"Deploy"**

### Passo 4: Verificar Todas as Edge Functions
Confirme que estas 5 edge functions estão ativas:
- ✅ `update-dashboard` (existente)
- ✅ `update-top-eventos` (existente)
- ✅ `update-afinidade-curso-area` (existente)
- ✅ `update-indicadores-profiles` (existente)
- ✅ `update-taxa-conversao-entidades` (existente)
- ✅ `update-indicadores-gerais` (nova)

## 🔧 Método 2: Deploy via Supabase CLI (Alternativo)

Se conseguir instalar o CLI posteriormente:

```bash
# 1. Fazer login
supabase login

# 2. Linkar ao projeto
supabase link --project-ref lddtackcnpzdswndqgfs

# 3. Deploy de todas as edge functions
supabase functions deploy update-indicadores-gerais
supabase functions deploy update-top-eventos
supabase functions deploy update-afinidade-curso-area
supabase functions deploy update-indicadores-profiles
supabase functions deploy update-taxa-conversao-entidades
```

## 🔧 Método 3: Deploy Individual via cURL

### Deploy da Nova Edge Function
```bash
# Substitua [YOUR_ANON_KEY] pela sua chave anônima
curl -X POST 'https://lddtackcnpzdswndqgfs.supabase.co/functions/v1/update-indicadores-gerais' \
  -H 'Authorization: Bearer [YOUR_ANON_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 📊 Verificação do Deploy

### 1. Testar Edge Functions
Após o deploy, teste cada função:

```bash
# Testar indicadores gerais
curl -X POST 'https://lddtackcnpzdswndqgfs.supabase.co/functions/v1/update-indicadores-gerais' \
  -H 'Authorization: Bearer [YOUR_ANON_KEY]' \
  -H 'Content-Type: application/json'

# Testar top eventos
curl -X POST 'https://lddtackcnpzdswndqgfs.supabase.co/functions/v1/update-top-eventos' \
  -H 'Authorization: Bearer [YOUR_ANON_KEY]' \
  -H 'Content-Type: application/json'

# Testar afinidade curso-área
curl -X POST 'https://lddtackcnpzdswndqgfs.supabase.co/functions/v1/update-afinidade-curso-area' \
  -H 'Authorization: Bearer [YOUR_ANON_KEY]' \
  -H 'Content-Type: application/json'

# Testar indicadores profiles
curl -X POST 'https://lddtackcnpzdswndqgfs.supabase.co/functions/v1/update-indicadores-profiles' \
  -H 'Authorization: Bearer [YOUR_ANON_KEY]' \
  -H 'Content-Type: application/json'

# Testar taxa conversão entidades
curl -X POST 'https://lddtackcnpzdswndqgfs.supabase.co/functions/v1/update-taxa-conversao-entidades' \
  -H 'Authorization: Bearer [YOUR_ANON_KEY]' \
  -H 'Content-Type: application/json'
```

### 2. Verificar Logs
No dashboard do Supabase:
1. Vá para **Edge Functions**
2. Clique em uma função
3. Clique em **"Logs"**
4. Verifique se há erros ou sucessos

### 3. Verificar Tabelas
Execute no SQL Editor do Supabase:

```sql
-- Verificar se as tabelas foram criadas e populadas
SELECT COUNT(*) FROM indicadores_gerais;
SELECT COUNT(*) FROM top_eventos;
SELECT COUNT(*) FROM afinidade_curso_area;
SELECT COUNT(*) FROM indicadores_profiles;
SELECT COUNT(*) FROM taxa_conversao_entidades;
```

## 🚨 Troubleshooting

### Erro: "Function not found"
- Verifique se o nome da função está correto
- Confirme se o deploy foi bem-sucedido

### Erro: "Unauthorized"
- Verifique se está usando a chave anônima correta
- Confirme se a função está configurada para aceitar requisições anônimas

### Erro: "Internal server error"
- Verifique os logs da edge function
- Confirme se as tabelas de destino existem
- Verifique se as variáveis de ambiente estão configuradas

## 📈 Próximos Passos Após o Deploy

1. ✅ **Configurar Cron Jobs**: Executar o script SQL `setup-cron-top-eventos.sql`
2. ✅ **Testar Dashboard**: Verificar se os dados estão sendo carregados
3. ✅ **Monitorar Logs**: Acompanhar execução das edge functions
4. ✅ **Otimizar Performance**: Ajustar queries se necessário

## 🔑 Chaves Necessárias

Para testar as edge functions, você precisará da **chave anônima** do projeto:

1. No dashboard do Supabase, vá para **Settings > API**
2. Copie a **anon public** key
3. Use essa chave nos headers de autorização

---

**Status**: Pronto para deploy 🚀
**Projeto**: `lddtackcnpzdswndqgfs`
**Edge Functions**: 6 total (5 existentes + 1 nova)
