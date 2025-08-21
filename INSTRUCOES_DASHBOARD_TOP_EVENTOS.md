# 🏆 Dashboard Top Eventos - Instruções de Implementação

## 📋 O que foi feito

✅ **Dashboard limpo criado** - Removemos todos os indicadores complexos  
✅ **Hook useTopEventos criado** - Para buscar dados da tabela top_eventos  
✅ **Arquivo de teste HTML criado** - Para verificar se a tabela funciona  
✅ **Script SQL criado** - Para criar a tabela e função RPC  

## 🚀 Próximos passos

### 1. **Criar a tabela no Supabase**
- Acesse: https://supabase.com/dashboard/project/lddtackcnpzdswndqgfs
- Vá em **SQL Editor**
- Execute o arquivo `create-top-eventos-table.sql`

### 2. **Popular a tabela com dados**
```sql
-- Execute esta função para popular a tabela
SELECT atualizar_top_eventos();

-- Verifique se funcionou
SELECT * FROM top_eventos ORDER BY total_inscricoes DESC;
```

### 3. **Testar a tabela**
- Abra o arquivo `test-top-eventos.html` no navegador
- Clique em "Testar Tabela Top Eventos"
- Verifique se os dados aparecem

### 4. **Testar o dashboard React**
- Execute `npm run dev`
- Acesse o dashboard
- Verifique se a tabela aparece corretamente

## 🔧 Estrutura da tabela top_eventos

```sql
CREATE TABLE top_eventos (
    id SERIAL PRIMARY KEY,
    nome_evento TEXT NOT NULL,
    total_inscricoes BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📊 Dados esperados

A tabela deve conter:
- **nome_evento**: Nome do evento
- **total_inscricoes**: Número total de inscrições
- Ordenados por inscrições (maior para menor)
- Limitado aos top 10 eventos

## 🎯 Funcionalidades do dashboard

✅ **Tabela responsiva** com top 10 eventos  
✅ **Ranking visual** com medalhas (🥇🥈🥉)  
✅ **Contador de inscrições** com ícone de usuários  
✅ **Botão de recarregar** para atualizar dados  
✅ **Estados de loading e erro**  
✅ **Design limpo e moderno**  

## 🔄 Atualização automática

Para manter os dados sempre atualizados:

### Opção 1: Manual
```sql
SELECT atualizar_top_eventos();
```

### Opção 2: Via Edge Function
- Use a função `update-dashboard` que criamos
- Configure para executar periodicamente

### Opção 3: Cron Job no Supabase
- Configure um cron job para executar a função automaticamente

## 🐛 Solução de problemas

### Tabela não existe
- Execute o script SQL completo
- Verifique se não há erros de sintaxe

### Tabela vazia
- Execute `SELECT atualizar_top_eventos();`
- Verifique se há eventos aprovados no sistema
- Verifique se há inscrições nos eventos

### Erro de permissão
- Verifique as políticas RLS da tabela
- Confirme se o usuário anônimo tem acesso de leitura

### Dashboard não carrega
- Verifique o console do navegador
- Confirme se o hook `useTopEventos` está funcionando
- Teste com o arquivo HTML primeiro

## 📱 Teste final

1. ✅ Tabela criada no Supabase
2. ✅ Dados populados com `atualizar_top_eventos()`
3. ✅ Teste HTML funcionando
4. ✅ Dashboard React carregando dados
5. ✅ Tabela responsiva e visualmente atrativa

## 🎉 Resultado esperado

Um dashboard limpo e focado mostrando:
- **Header** com título e botões de ação
- **Tabela principal** com top 10 eventos
- **Ranking visual** com medalhas
- **Contadores** de inscrições
- **Informações** sobre a visualização
- **Design responsivo** e moderno

---

**Status**: ✅ Dashboard limpo criado, aguardando implementação da tabela no Supabase
