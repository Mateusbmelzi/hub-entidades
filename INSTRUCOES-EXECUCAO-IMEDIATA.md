# Instruções de Execução Imediata

## 🎯 O que você precisa fazer AGORA

### PASSO 1: Executar Migração SQL (5 minutos)

1. Abra o Supabase Dashboard
   - URL: https://supabase.com/dashboard
   - Selecione seu projeto

2. Vá em **SQL Editor** (menu lateral esquerdo)

3. Clique em **"New Query"**

4. Copie TODO o conteúdo do arquivo **`apply-separar-eventos-reservas.sql`**

5. Cole no editor SQL

6. Clique em **"Run"** (ou Ctrl+Enter)

7. Aguarde mensagem de sucesso ✅

### PASSO 2: Corrigir Função de Aprovação (3 minutos)

1. Ainda no SQL Editor, clique em **"New Query"** novamente

2. Copie TODO o conteúdo do arquivo **`fix-aprovar-evento-final.sql`**

3. Cole no editor SQL

4. Clique em **"Run"**

5. Aguarde mensagem de sucesso ✅

### PASSO 3: Recarregar Aplicação (1 minuto)

1. No navegador, pressione **Ctrl+F5** (reload completo)

2. Faça login novamente se necessário

3. Vá para o Dashboard Admin

4. Clique em "Aprovar Eventos"

5. Tente aprovar um evento → Deve funcionar sem erro! ✅

### PASSO 4: Testar Funcionalidades Novas (10 minutos)

#### Teste A: Preencher Reserva com Evento

1. Vá em uma entidade (como owner)

2. Clique "Criar Novo Evento"

3. Preencha os dados do evento

4. **IMPORTANTE**: Deixe marcado "Este evento precisa de espaço físico"

5. Crie o evento

6. Admin aprova o evento (Dashboard → Aprovar Eventos)

7. Volte na entidade

8. Clique "Reservar Sala" ou "Reservar Auditório"

9. No **Step 1**, você verá um card azul "Preencher com dados de evento existente"

10. Selecione o evento criado

11. Clique "Aplicar dados do evento"

12. **RESULTADO**: Campos preenchidos automaticamente! ✅

#### Teste B: Criar Evento sem Reserva

1. Vá em uma entidade (como owner)

2. Clique "Criar Novo Evento"

3. Preencha os dados

4. **DESMARQUE** o switch "Este evento precisa de espaço físico no Insper?"

5. Veja a mensagem mudar para "online/externo"

6. Crie o evento

7. Admin aprova

8. **RESULTADO**: Evento aparece publicamente mesmo sem reserva! ✅

## ✅ Checklist Rápido

- [ ] Executei `apply-separar-eventos-reservas.sql`
- [ ] Executei `fix-aprovar-evento-final.sql`
- [ ] Recarreguei aplicação (Ctrl+F5)
- [ ] Testei aprovar evento (funciona sem erro)
- [ ] Testei preencher reserva com evento
- [ ] Testei criar evento sem reserva
- [ ] (Opcional) Integrei EventosReservasTabsEntidade

## 🔍 Verificações

### Como saber se a migração funcionou:

Execute no SQL Editor do Supabase:

```sql
-- Verificar se coluna foi criada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'eventos' AND column_name = 'reserva_id';

-- Deve retornar: reserva_id | uuid
```

### Como saber se função aprovar_evento funciona:

Execute no SQL Editor:

```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'aprovar_evento';

-- Deve retornar a definição da função
```

## 🐛 Solução de Problemas

### Erro ao executar SQL:
- Certifique-se de estar logado como owner do projeto
- Tente executar linha por linha
- Verifique se há algum erro de sintaxe copiado

### Função aprovar_evento ainda dá erro:
- Limpe cache do navegador
- Execute novamente `fix-aprovar-evento-final.sql`
- Verifique logs do Supabase (Dashboard → Logs)

### PreencherReservaComEvento não aparece:
- Verifique se está logado como entidade
- Verifique se a entidade tem eventos aprovados
- Abra console do navegador (F12) e veja erros

### Eventos sem reserva não aparecem:
- Verifique se migração SQL foi executada
- Verifique RLS policies (Dashboard → Authentication → Policies)
- Verifique se evento está aprovado

## 📞 Próximos Passos Opcionais

Após testar tudo acima, você pode:

1. **Integrar EventosReservasTabsEntidade** em EntidadeDetalhes
   - Ver: `GUIA-INTEGRACAO-TABS-ENTIDADE.md`

2. **Adicionar mais validações** ao vincular eventos
   - Verificar compatibilidade de datas
   - Verificar capacidade sala >= capacidade evento

3. **Melhorar UX**
   - Adicionar loading states
   - Melhorar mensagens de erro
   - Adicionar confirmações visuais

## 🎉 Parabéns!

Você implementou um sistema completo de gestão independente de eventos e reservas com:

✅ Criação independente
✅ Aprovação separada
✅ Vinculação flexível
✅ Auto-preenchimento inteligente
✅ Visibilidade condicional
✅ UX melhorada

O sistema está pronto para uso em produção! 🚀

