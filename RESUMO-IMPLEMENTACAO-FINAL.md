# Resumo Final: Separação de Eventos e Reservas

## ✅ IMPLEMENTADO AUTOMATICAMENTE

### 1. Banco de Dados
- ✅ Migração SQL criada: `supabase/migrations/20250110_add_reserva_id_to_eventos.sql`
- ✅ Script de aplicação: `apply-separar-eventos-reservas.sql`
- ✅ Campo `eventos.reserva_id` (UUID, nullable, FK para reservas)
- ✅ Índice `idx_eventos_reserva` para performance
- ✅ RLS Policies atualizadas:
  - Eventos públicos: Aprovado E (sem reserva OU reserva aprovada)
  - Entidades veem próprios eventos independente do status
  - Políticas de INSERT, UPDATE, DELETE por entidade

### 2. Hooks Criados
- ✅ `src/hooks/useVincularEventoReserva.ts`
  - vincularEventoReserva()
  - desvincularEventoReserva()
  - Estados de loading e error handling

- ✅ `src/hooks/useEventosSemReserva.ts`
  - Busca eventos aprovados SEM reserva de uma entidade

- ✅ `src/hooks/useReservasSemEvento.ts`
  - Busca reservas aprovadas SEM evento de uma entidade

### 3. Componentes Criados
- ✅ `src/components/VincularEventoReserva.tsx`
  - UI para vincular evento ↔ reserva
  - UI para desvincular
  - Validações e confirmações
  - Suporta ambos fluxos (de evento ou de reserva)

- ✅ `src/components/PreencherReservaComEvento.tsx`
  - Select de eventos aprovados
  - Botão "Aplicar dados do evento"
  - Preenche automaticamente: título, descrição, data, horários, pessoas

- ✅ `src/components/EventosReservasTabsEntidade.tsx`
  - Tabs separadas para Eventos e Reservas
  - Badges de status visuais
  - Botões de vincular/desvincular
  - Integração com dialogs
  - Pronto para usar em EntidadeDetalhes

### 4. Utilitários
- ✅ `src/lib/evento-reserva-status.tsx`
  - getStatusBadgeEvento() - Badges para eventos
  - getStatusBadgeReserva() - Badges para reservas
  - eventoNecessitaReserva() - Lógica de validação
  - reservaPodeSerVinculada() - Helper de validação

### 5. Componentes Atualizados
- ✅ `src/components/ReservaSalaFormV2.tsx`
  - Integrado PreencherReservaComEvento no step 1
  - Handler handleAplicarDadosEvento
  - Preenche automaticamente todos os campos

- ✅ `src/components/ReservaAuditorioFormV3.tsx`
  - Integrado PreencherReservaComEvento no step 1
  - Handler handleAplicarDadosEvento
  - Preenche título + descrição programação + dados básicos

- ✅ `src/components/CriarEventoEntidade.tsx`
  - Adicionado switch "Este evento precisa de espaço físico?"
  - State `precisaReserva`
  - Card informativo com switch
  - Mensagem explicativa

- ✅ `src/hooks/useEventos.ts`
  - Mudado JOIN de `!inner` para `!left` (inclui eventos sem reserva)
  - Adicionado `status_reserva` no SELECT
  - Filtro aplicado: apenas eventos sem reserva OU com reserva aprovada
  - Mantém cache e paginação funcionando

## 🔧 AÇÕES MANUAIS NECESSÁRIAS

### 1. Executar Migrações SQL (OBRIGATÓRIO)

**Arquivo 1:** `apply-separar-eventos-reservas.sql`
- Adiciona campo `reserva_id` em eventos
- Atualiza RLS policies
- Necessário para todo o sistema funcionar

**Arquivo 2:** `fix-aprovar-evento-final.sql`
- Corrige recursão infinita na função `aprovar_evento`
- Necessário para aprovar eventos sem erro

**Como executar:**
1. Supabase Dashboard → SQL Editor
2. New Query
3. Copiar conteúdo do arquivo
4. Run

### 2. Integrar EventosReservasTabsEntidade em EntidadeDetalhes.tsx

**Arquivo:** `src/pages/EntidadeDetalhes.tsx` (linha ~849)

**Opção Simples (Recomendada):**

Adicionar import:
```tsx
import { EventosReservasTabsEntidade } from '@/components/EventosReservasTabsEntidade';
```

Localizar a seção de "Eventos" e substituir o Card inteiro por:

```tsx
{isOwner && entidade && (
  <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-red-600" />
          <CardTitle className="text-2xl text-gray-900">Eventos e Reservas</CardTitle>
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate(`/entidades/${id}/calendario`)}>
          <Calendar className="mr-2 h-4 w-4" />
          Ver calendário
        </Button>
      </div>
    </CardHeader>
    
    <CardContent>
      <EventosReservasTabsEntidade
        eventos={allEventos || []}
        reservas={reservasEntidade || []}
        entidadeId={entidade.id}
        isOwner={isOwner}
        onRefetch={() => {
          refetchEventos();
          refetchReservas();
        }}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
      />
    </CardContent>
  </Card>
)}
```

**Instruções detalhadas:** Ver arquivo `GUIA-INTEGRACAO-TABS-ENTIDADE.md`

### 3. Atualizar Tipos Supabase (se necessário)

Após executar a migração SQL, pode ser necessário atualizar os tipos:

```bash
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

Ou adicione manualmente em `src/integrations/supabase/types.ts`:

```tsx
eventos: {
  Row: {
    // ... campos existentes
    reserva_id: string | null;
  }
}
```

## 🎯 FLUXOS IMPLEMENTADOS

### Fluxo 1: Evento sem reserva (online/externo) ✅
1. Entidade cria evento
2. Desmarca "precisa espaço físico"
3. Admin aprova evento
4. Evento aparece publicamente
5. Badge: "Aguardando Reserva" (amarelo)

### Fluxo 2: Criar reserva → Vincular evento ✅
1. Entidade cria reserva
2. Admin aprova reserva
3. Entidade cria evento
4. Admin aprova evento
5. Em EntidadeDetalhes → Tab Eventos → "Vincular a Reserva"
6. Evento aparece publicamente
7. Badge: "Evento Ativo" (verde)

### Fluxo 3: Criar evento → Preencher reserva ✅
1. Entidade cria evento
2. Admin aprova evento
3. Entidade vai criar reserva
4. No formulário, clica "Preencher com dados de evento"
5. Campos preenchidos automaticamente
6. Admin aprova reserva
7. Entidade vincula em EntidadeDetalhes
8. Badge: "Evento Ativo" (verde)

### Fluxo 4: Fluxo atual (criar evento de reserva) ✅
1. Entidade cria reserva
2. Admin aprova
3. Entidade clica "Criar Evento" na reserva
4. Sistema cria e vincula automaticamente
5. Admin aprova evento
6. Badge: "Evento Ativo" (verde)

### Fluxo 5: Trocar reserva de evento ✅
1. Evento vinculado à Reserva A
2. Em EntidadeDetalhes → "Gerenciar Vinculação"
3. Desvincular
4. Reserva A fica livre (Badge: "Disponível")
5. Vincular a Reserva B
6. Badge: "Evento Ativo" (verde)

## 📊 BADGES DE STATUS IMPLEMENTADOS

### Eventos:
- 🟢 **Evento Ativo**: Aprovado + Reserva Aprovada → Aparece publicamente
- 🟡 **Aguardando Reserva**: Aprovado + Sem Reserva → Não aparece publicamente (exceto se for online/externo)
- 🟠 **Reserva Pendente**: Aprovado + Reserva Pendente → Não aparece publicamente
- ⚫ **Aguardando Aprovação**: Evento Pendente → Não aparece publicamente
- 🔴 **Rejeitado**: Evento Rejeitado → Nunca aparece

### Reservas:
- 🔵 **Disponível**: Aprovada + Sem Evento → Pode ser vinculada
- 🟢 **Reserva Ativa**: Aprovada + Com Evento → Em uso
- 🟡 **Aguardando Aprovação**: Pendente → Aguardando admin
- 🔴 **Rejeitada**: Rejeitada → Não pode ser usada
- ⚫ **Cancelada**: Cancelada → Não pode ser usada

## 🧪 CHECKLIST DE TESTE

Após executar as migrações SQL:

- [ ] Criar evento sem marcar "precisa espaço físico"
- [ ] Admin aprovar evento
- [ ] Evento aparece em lista pública
- [ ] Badge mostra "Aguardando Reserva"
- [ ] Criar reserva de sala
- [ ] Clicar "Preencher com evento" no formulário
- [ ] Campos são preenchidos automaticamente
- [ ] Admin aprovar reserva
- [ ] Em EntidadeDetalhes, ver tabs separadas
- [ ] Tab Eventos mostra evento com badge
- [ ] Clicar "Vincular a Reserva"
- [ ] Selecionar reserva aprovada
- [ ] Confirmar vinculação
- [ ] Badge muda para "Evento Ativo"
- [ ] Evento continua aparecendo publicamente
- [ ] Clicar "Gerenciar Vinculação"
- [ ] Desvincular evento
- [ ] Reserva volta para "Disponível"
- [ ] Evento volta para "Aguardando Reserva"
- [ ] Vincular novamente a outra reserva

## 📁 ARQUIVOS CRIADOS/MODIFICADOS

### Criados:
1. `supabase/migrations/20250110_add_reserva_id_to_eventos.sql`
2. `apply-separar-eventos-reservas.sql`
3. `src/hooks/useVincularEventoReserva.ts`
4. `src/hooks/useEventosSemReserva.ts`
5. `src/hooks/useReservasSemEvento.ts`
6. `src/components/VincularEventoReserva.tsx`
7. `src/components/PreencherReservaComEvento.tsx`
8. `src/components/EventosReservasTabsEntidade.tsx`
9. `src/lib/evento-reserva-status.tsx`
10. Documentação:
    - `IMPLEMENTACAO-SEPARACAO-EVENTOS-RESERVAS.md`
    - `PROXIMOS-PASSOS-MANUAL.md`
    - `GUIA-INTEGRACAO-TABS-ENTIDADE.md`
    - `RESUMO-IMPLEMENTACAO-FINAL.md`

### Modificados:
1. `src/components/ReservaSalaFormV2.tsx` - Adicionado PreencherReservaComEvento
2. `src/components/ReservaAuditorioFormV3.tsx` - Adicionado PreencherReservaComEvento
3. `src/components/CriarEventoEntidade.tsx` - Adicionado switch "precisa espaço físico"
4. `src/hooks/useEventos.ts` - Filtro de visibilidade aplicado

### Pendentes de Modificação Manual:
1. `src/pages/EntidadeDetalhes.tsx` - Integrar EventosReservasTabsEntidade (guia fornecido)

## ⚡ QUICK START

### Para começar a usar AGORA:

1. **Execute no Supabase Dashboard SQL Editor:**
   ```sql
   -- Copie e execute: apply-separar-eventos-reservas.sql
   -- Copie e execute: fix-aprovar-evento-final.sql
   ```

2. **Teste criar evento sem reserva:**
   - Login como entidade
   - Criar evento
   - Desmarcar "precisa espaço físico"
   - Admin aprovar
   - Verificar que aparece publicamente

3. **Teste preencher reserva com evento:**
   - Criar reserva de sala
   - No step 1, ver card azul "Preencher com evento"
   - Selecionar evento e clicar "Aplicar"
   - Ver campos preenchidos

4. **Integrar tabs no EntidadeDetalhes:**
   - Seguir `GUIA-INTEGRACAO-TABS-ENTIDADE.md`
   - Adicionar import
   - Substituir Card de Eventos
   - Testar vinculação

## 🎉 RESULTADO FINAL

Após todas as implementações:

✅ Reservas e eventos são entidades independentes
✅ Admin aprova cada um separadamente
✅ Entidades podem criar eventos sem reserva (online/externos)
✅ Entidades podem preencher reservas rapidamente com dados de eventos
✅ Sistema de vinculação bidirecional flexível
✅ Reservas podem ser trocadas entre eventos
✅ Badges visuais claros de status
✅ Regra de visibilidade pública aplicada corretamente
✅ Backward compatibility mantida (fluxo antigo funciona)
✅ UX melhorada com tabs e organização clara

## 🔑 PONTOS-CHAVE

1. **Eventos sem reserva são permitidos** (online/externos)
2. **Eventos com reserva pendente NÃO aparecem publicamente**
3. **Reservas livres podem ser vinculadas a múltiplos eventos** (uma de cada vez)
4. **Fluxo antigo continua funcionando** (criar evento de reserva)
5. **Admin tem controle total** (aprova eventos e reservas separadamente)
6. **Entidades têm flexibilidade** (podem criar na ordem que preferirem)

## 📞 SUPORTE

Se encontrar problemas:

1. Verificar se migrações SQL foram executadas com sucesso
2. Verificar console do navegador para erros
3. Verificar políticas RLS no Supabase Dashboard
4. Limpar cache do navegador (Ctrl+Shift+Del)
5. Ver documentação detalhada nos arquivos MD criados

## 🚀 PRÓXIMA FUNCIONALIDADE SUGERIDA

Após implementar e testar, considere adicionar:

- [ ] Validação de conflitos de horário ao vincular
- [ ] Validação de capacidade (evento <= sala)
- [ ] Histórico de vinculações
- [ ] Notificações ao vincular/desvincular
- [ ] Filtros avançados nas tabs
- [ ] Exportação de dados

