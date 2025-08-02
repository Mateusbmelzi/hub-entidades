# 🚀 Deploy na Vercel - Instruções

## ✅ O que já foi configurado

- ✅ Arquivo `vercel.json` criado
- ✅ Configuração do Supabase atualizada para usar variáveis de ambiente
- ✅ Vite configurado para produção
- ✅ Build testado e funcionando

## 📋 Passos para fazer o deploy

### 1. **Preparar o repositório**
```bash
# Certifique-se de que todas as mudanças estão commitadas
git add .
git commit -m "Preparando para deploy na Vercel"
git push origin main
```

### 2. **Conectar com a Vercel**

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub/GitLab
3. Clique em "New Project"
4. Importe seu repositório
5. A Vercel detectará automaticamente que é um projeto Vite

### 3. **Configurar variáveis de ambiente**

Na Vercel, vá em **Settings > Environment Variables** e adicione:

| Nome | Valor |
|------|-------|
| `VITE_SUPABASE_URL` | `https://lddtackcnpzdswndqgfs.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZHRhY2tjbnB6ZHN3bmRxZ2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTY5MDgsImV4cCI6MjA2Njk3MjkwOH0.NPN6E-4RttputzXcVavoOTRGiM9c3T5bLaLPTtJJM4s` |

### 4. **Configurar Supabase para produção**

Após o deploy, você receberá uma URL como: `https://seu-projeto.vercel.app`

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá em **Authentication > URL Configuration**
3. Atualize:
   - **Site URL**: `https://seu-projeto.vercel.app`
   - **Redirect URLs**: Adicione `https://seu-projeto.vercel.app/auth/callback`

### 5. **Fazer o deploy**

1. Clique em **Deploy** na Vercel
2. Aguarde o build completar (deve demorar 2-3 minutos)
3. Acesse a URL fornecida

### 6. **Verificar se tudo está funcionando**

✅ Aplicação carrega sem erros
✅ Autenticação funciona
✅ Conexão com Supabase está funcionando
✅ Rotas funcionam corretamente

## 🔧 Configurações adicionais (opcional)

### Domínio personalizado
1. Vá em **Settings > Domains**
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções da Vercel

### Configurações de cache
O `vercel.json` já está configurado com cache otimizado para assets.

## 🐛 Troubleshooting

### Erro de build
- Verifique se todas as dependências estão no `package.json`
- Execute `npm run build` localmente para testar

### Erro de autenticação
- Verifique se as variáveis de ambiente estão configuradas
- Confirme se a URL do Supabase está correta

### Erro de CORS
- Verifique se a URL de produção está nas configurações do Supabase

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs na Vercel
2. Teste localmente com `npm run build`
3. Verifique as configurações do Supabase

---

**🎉 Sua aplicação está pronta para produção!** 