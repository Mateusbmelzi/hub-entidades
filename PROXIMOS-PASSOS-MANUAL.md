# Próximos Passos Manuais - Separação Eventos/Reservas

## ✅ Já Implementado

- ✅ Migração SQL criada (`apply-separar-eventos-reservas.sql`)
- ✅ Hooks criados (useVincularEventoReserva, useEventosSemReserva, useReservasSemEvento)
- ✅ Componente VincularEventoReserva criado
- ✅ Componente PreencherReservaComEvento criado
- ✅ ReservaSalaFormV2 atualizado com opção de preencher
- ✅ ReservaAuditorioFormV3 atualizado com opção de preencher
- ✅ CriarEventoEntidade atualizado com switch "precisa espaço físico"
- ✅ Funções helper de badges criadas (`src/lib/evento-reserva-status.tsx`)

## 🔧 Passos Manuais Necessários

### 1. Executar Migração SQL (OBRIGATÓRIO)

Execute o arquivo `apply-separar-eventos-reservas.sql` no Supabase Dashboard:

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. SQL Editor → New Query
4. Copie conteúdo de `apply-separar-eventos-reservas.sql`
5. Execute

### 2. Executar Fix da Função aprovar_evento (OBRIGATÓRIO)

Execute o arquivo `fix-aprovar-evento-final.sql` no Supabase Dashboard:

1. Mesmos passos acima
2. Arquivo: `fix-aprovar-evento-final.sql`
3. Isso corrige o erro "stack depth limit exceeded"

### 3. Atualizar EntidadeDetalhes.tsx

**Este arquivo é muito grande (1538 linhas). Aqui está o que adicionar:**

#### a) Adicionar imports no topo:

```tsx
import { getStatusBadgeEvento, getStatusBadgeReserva, eventoNecessitaReserva, reservaPodeSerVinculada } from '@/lib/evento-reserva-status';
import { Link2 } from 'lucide-react';
```

#### b) Localizar a seção de "Eventos" (linha ~849)

Substituir o Card de "Eventos" por uma estrutura com Tabs:

```tsx
<Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
  <CardHeader className="pb-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Calendar className="w-5 h-5 text-red-600" />
        <CardTitle className="text-2xl text-gray-900">Eventos e Reservas</CardTitle>
      </div>
      <div className="flex items-center gap-2">
        {isOwner && (
          <Button size="sm" variant="outline" onClick={() => navigate(`/entidades/${id}/calendario`)}>
            <Calendar className="mr-2 h-4 w-4" />
            Ver calendário
          </Button>
        )}
      </div>
    </div>
  </CardHeader>
  
  <CardContent>
    <Tabs defaultValue="eventos" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="eventos">
          Eventos ({allEventos?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="reservas">
          Reservas ({reservasEntidade?.length || 0})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="eventos" className="space-y-4 mt-4">
        {/* Conteúdo atual de eventos, mas adicionar badges e botão vincular */}
        {allEventos?.map((evento) => (
          <div key={evento.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{evento.nome}</h3>
                <div className="flex gap-2 mt-2">
                  {getStatusBadgeEvento(evento, reservasEntidade)}
                  {/* Outros badges existentes */}
                </div>
              </div>
              
              {/* Botão de vincular se evento aprovado sem reserva */}
              {isOwner && evento.status_aprovacao === 'aprovado' && !evento.reserva_id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedEventoVincular(evento);
                    setShowVincularDialog(true);
                  }}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Vincular a Reserva
                </Button>
              )}
              
              {/* Botão de desvincular se evento tem reserva */}
              {isOwner && evento.reserva_id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedEventoVincular(evento);
                    setShowVincularDialog(true);
                  }}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Gerenciar Reserva
                </Button>
              )}
            </div>
            
            {/* Resto do conteúdo do evento */}
          </div>
        ))}
      </TabsContent>

      <TabsContent value="reservas" className="space-y-4 mt-4">
        {reservasEntidade?.map((reserva) => (
          <div key={reserva.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">
                  {reserva.titulo_evento_capacitacao || reserva.sala_nome || 'Reserva'}
                </h3>
                <p className="text-sm text-gray-600">
                  {format(new Date(reserva.data_reserva), 'dd/MM/yyyy', { locale: ptBR })}
                  {' • '}
                  {reserva.horario_inicio} - {reserva.horario_termino}
                </p>
                <div className="mt-2">
                  {getStatusBadgeReserva(reserva)}
                </div>
              </div>
              
              {/* Botão de vincular se reserva aprovada sem evento */}
              {isOwner && reserva.status_reserva === 'aprovada' && !reserva.evento_id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedReservaVincular(reserva);
                    setShowVincularDialog(true);
                  }}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Vincular a Evento
                </Button>
              )}
              
              {/* Botão criar evento (fluxo existente) */}
              {isOwner && reserva.status_reserva === 'aprovada' && !reserva.evento_id && (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedReserva(reserva);
                    setShowCreateEventFromReservaDialog(true);
                  }}
                >
                  Criar Evento
                </Button>
              )}
            </div>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  </CardContent>
</Card>
```

#### c) Adicionar Dialog de Vinculação (após outros dialogs, linha ~1400+)

```tsx
{/* Dialog de Vinculação Evento-Reserva */}
<Dialog open={showVincularDialog} onOpenChange={setShowVincularDialog}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>
        {selectedEventoVincular ? 'Vincular Evento a Reserva' : 'Vincular Reserva a Evento'}
      </DialogTitle>
    </DialogHeader>
    <VincularEventoReserva
      evento={selectedEventoVincular}
      reserva={selectedReservaVincular}
      entidadeId={entidade?.id || 0}
      onSuccess={() => {
        setShowVincularDialog(false);
        setSelectedEventoVincular(null);
        setSelectedReservaVincular(null);
        refetchEventos();
        refetchReservas();
        toast({
          title: 'Sucesso',
          description: 'Vinculação realizada com sucesso!',
        });
      }}
    />
  </DialogContent>
</Dialog>
```

### 4. Atualizar useEventos.ts (Visibilidade Pública)

**Arquivo:** `src/hooks/useEventos.ts`

Localizar a query que busca eventos e adicionar JOIN com reservas + filtro:

```tsx
const { data, error } = await supabase
  .from('eventos')
  .select(`
    *,
    reservas!eventos_reserva_id_fkey (
      id,
      status_reserva
    )
  `)
  .eq('status_aprovacao', 'aprovado')
  // Adicionar filtro: sem reserva OU com reserva aprovada
  .or('reserva_id.is.null,reservas.status_reserva.eq.aprovada')
  .order('data_evento', { ascending: false });
```

### 5. Atualizar Tipos (se necessário)

**Arquivo:** `src/integrations/supabase/types.ts`

Após executar a migração SQL, atualize os tipos executando no terminal:

```bash
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

Ou adicione manualmente:

```tsx
eventos: {
  // ... campos existentes
  reserva_id: string | null;
}
```

## 🧪 Como Testar

### Teste 1: Executar Migrações
```bash
# No Supabase Dashboard SQL Editor
# Executar: apply-separar-eventos-reservas.sql
# Executar: fix-aprovar-evento-final.sql
```

### Teste 2: Criar Evento sem Reserva
1. Login como entidade
2. Criar novo evento
3. Desmarcar "precisa espaço físico"
4. Criar evento
5. Admin deve aprovar
6. Evento deve aparecer publicamente

### Teste 3: Preencher Reserva com Evento
1. Criar evento primeiro
2. Admin aprova
3. Ir em criar reserva de sala
4. No step 1, clicar em "Preencher com evento"
5. Campos devem ser preenchidos automaticamente

### Teste 4: Vincular Evento a Reserva
1. Ter evento aprovado sem reserva
2. Ter reserva aprovada sem evento
3. Em EntidadeDetalhes, aba Eventos
4. Clicar "Vincular a Reserva"
5. Selecionar reserva e confirmar
6. Badge deve mudar para "Evento Ativo"

## 📊 Checklist de Implementação

- [x] Migração SQL criada
- [x] Hooks criados
- [x] Componente VincularEventoReserva criado
- [x] Componente PreencherReservaComEvento criado
- [x] ReservaSalaFormV2 atualizado
- [x] ReservaAuditorioFormV3 atualizado
- [x] CriarEventoEntidade atualizado
- [x] Funções helper de badges criadas
- [ ] EntidadeDetalhes.tsx atualizado (MANUAL)
- [ ] useEventos.ts atualizado (MANUAL)
- [ ] Migrações SQL executadas (MANUAL)
- [ ] Tipos atualizados (MANUAL se necessário)
- [ ] Testes realizados

## ⚠️ Atenções Importantes

1. **EntidadeDetalhes.tsx** é muito grande. As modificações devem ser feitas com cuidado
2. **Backup** recomendado antes de modificar EntidadeDetalhes.tsx
3. **Testar cada fluxo** separadamente após implementação
4. **RLS policies** podem demorar alguns segundos para aplicar

## 🎯 Resultado Final Esperado

- Entidades podem criar eventos sem reserva (online/externos)
- Entidades podem criar reservas sem evento
- Admin aprova eventos e reservas separadamente
- Entidades podem vincular/desvincular eventos de reservas
- Reservas podem ser preenchidas rapidamente com dados de eventos
- Badges visuais mostram status claro de cada evento/reserva
- Eventos só aparecem publicamente se aprovados E (sem reserva OU com reserva aprovada)

