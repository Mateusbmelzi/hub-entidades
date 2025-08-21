# 🚀 Deploy Rápido - Edge Functions

## ⚡ Passo a Passo Rápido

### 1. **Acessar Supabase Dashboard**
- URL: https://supabase.com/dashboard
- Projeto: `hub-entidades` (ID: `lddtackcnpzdswndqgfs`)

### 2. **Criar Nova Edge Function**
- Menu: **Edge Functions**
- Botão: **"Create a new function"**
- Nome: `update-indicadores-gerais`

### 3. **Copiar Código**
- Arquivo: `supabase/functions/update-indicadores-gerais/index.ts`
- Cole no editor da edge function

### 4. **Deploy**
- Clique em **"Deploy"**
- Aguarde confirmação

### 5. **Testar**
- Execute o script PowerShell:
```powershell
.\deploy-edge-functions.ps1 -AnonKey "sua_chave_aqui"
```

### 6. **Configurar Cron Jobs**
- Execute o SQL: `setup-cron-top-eventos.sql`
- No SQL Editor do Supabase

## 🔑 Obter Chave Anônima
1. **Settings** > **API**
2. Copie **"anon public"** key
3. Use no script de teste

## ✅ Verificação Final
- [ ] Edge function criada
- [ ] Deploy bem-sucedido
- [ ] Teste funcionando
- [ ] Cron jobs configurados
- [ ] Dashboard atualizando dados

---

**Tempo estimado**: 5-10 minutos
**Status**: Pronto para deploy! 🚀
