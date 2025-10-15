# Implementação: Separação de Eventos e Reservas

## ✅ Concluído

### 1. Migração SQL
- ✅ Criado `supabase/migrations/20250110_add_reserva_id_to_eventos.sql`
- ✅ Criado `apply-separar-eventos-reservas.sql` para execução no dashboard
- ✅ Adicionado campo `reserva_id` em `eventos` (bidirecional)
- ✅ Criado índice `idx_eventos_reserva` para performance
- ✅ Atualizado RLS policies para visibilidade condicional

### 2. Hooks Criados
- ✅ `src/hooks/useVincularEventoReserva.ts` - Vincular/desvincular
- ✅ `src/hooks/useEventosSemReserva.ts` - Listar eventos sem reserva
- ✅ `src/hooks/useReservasSemEvento.ts` - Listar reservas sem evento

### 3. Componentes Criados
- ✅ `src/components/VincularEventoReserva.tsx` - UI para vincular/desvincular
- ✅ `src/components/PreencherReservaComEvento.tsx` - Preencher reserva com dados de evento

## 📋 Próximos Passos

### 1. Executar Migração SQL
**AÇÃO NECESSÁRIA:** Execute o script SQL no Supabase Dashboard

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em SQL Editor
4. Copie todo o conteúdo de `apply-separar-eventos-reservas.sql`
5. Cole e execute

### 2. Atualizar Componentes de Reserva
Ainda precisam ser modificados:
- `src/components/ReservaSalaFormV2.tsx`
- `src/components/ReservaAuditorioFormV3.tsx`

**Modificações necessárias:**
```tsx
// Adicionar no início do formulário (antes dos steps)
<PreencherReservaComEvento
  entidadeId={entidadeId}
  onAplicar={(dados) => {
    // Preencher campos do formulário
    setTitulo(dados.titulo);
    setDescricao(dados.descricao);
    setDataReserva(dados.dataReserva);
    setHorarioInicio(dados.horarioInicio);
    setHorarioTermino(dados.horarioTermino);
    setQuantidadePessoas(dados.quantidadePessoas);
  }}
/>
```

### 3. Atualizar CriarEventoEntidade
Adicionar opção "evento sem reserva":

```tsx
// Adicionar state
const [precisaReserva, setPrecisaReserva] = useState(true);

// Adicionar campo no formulário
<div className="space-y-2">
  <Label>Este evento precisa de espaço físico?</Label>
  <Switch
    checked={precisaReserva}
    onCheckedChange={setPrecisaReserva}
  />
  {precisaReserva && (
    <p className="text-sm text-gray-600">
      Você poderá vincular a uma reserva após aprovação
    </p>
  )}
  {!precisaReserva && (
    <p className="text-sm text-gray-600">
      Evento será marcado como online/externo (sem necessidade de reserva)
    </p>
  )}
</div>
```

### 4. Atualizar EntidadeDetalhes.tsx
Adicionar tabs separadas e badges de status:

**Imports necessários:**
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VincularEventoReserva } from '@/components/VincularEventoReserva';
import { Dialog, DialogContent } from '@/components/ui/dialog';
```

**Adicionar states:**
```tsx
const [showVincularDialog, setShowVincularDialog] = useState(false);
const [selectedEventoVincular, setSelectedEventoVincular] = useState<any>(null);
const [selectedReservaVincular, setSelectedReservaVincular] = useState<any>(null);
```

**Substituir seção de eventos/reservas por:**
```tsx
<Tabs defaultValue="eventos" className="w-full">
  <TabsList>
    <TabsTrigger value="eventos">
      Eventos ({eventos?.length || 0})
    </TabsTrigger>
    <TabsTrigger value="reservas">
      Reservas ({reservasEntidade?.length || 0})
    </TabsTrigger>
  </TabsList>

  <TabsContent value="eventos">
    {/* Lista de eventos com badges de status */}
    {eventos?.map(evento => (
      <Card key={evento.id}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3>{evento.nome}</h3>
              {/* Badge de status baseado em status_aprovacao e reserva_id */}
              {getStatusBadgeEvento(evento)}
            </div>
            
            {/* Botão vincular se evento aprovado sem reserva */}
            {evento.status_aprovacao === 'aprovado' && !evento.reserva_id && (
              <Button onClick={() => {
                setSelectedEventoVincular(evento);
                setShowVincularDialog(true);
              }}>
                Vincular a Reserva
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    ))}
  </TabsContent>

  <TabsContent value="reservas">
    {/* Similar para reservas */}
  </TabsContent>
</Tabs>

{/* Dialog de vinculação */}
<Dialog open={showVincularDialog} onOpenChange={setShowVincularDialog}>
  <DialogContent>
    <VincularEventoReserva
      evento={selectedEventoVincular}
      reserva={selectedReservaVincular}
      entidadeId={entidade.id}
      onSuccess={() => {
        setShowVincularDialog(false);
        refetchEventos();
        refetchReservas();
      }}
    />
  </DialogContent>
</Dialog>
```

**Função para badges de status:**
```tsx
const getStatusBadgeEvento = (evento: any) => {
  if (evento.status_aprovacao === 'rejeitado') {
    return <Badge className="bg-red-600">Rejeitado</Badge>;
  }
  
  if (evento.status_aprovacao === 'pendente') {
    return <Badge className="bg-gray-600">Aguardando Aprovação</Badge>;
  }
  
  // Aprovado
  if (!evento.reserva_id) {
    return <Badge className="bg-yellow-600">Aguardando Reserva</Badge>;
  }
  
  // Tem reserva - verificar status da reserva
  const reserva = reservasEntidade?.find(r => r.id === evento.reserva_id);
  if (reserva?.status_reserva === 'aprovada') {
    return <Badge className="bg-green-600">Evento Ativo</Badge>;
  }
  
  return <Badge className="bg-orange-600">Reserva Pendente</Badge>;
};
```

### 5. Atualizar useEventos.ts (Visibilidade)
Modificar query para aplicar regra de visibilidade pública.

**Arquivo:** `src/hooks/useEventos.ts`

Não implementado ainda - precisa verificar estrutura atual do hook.

### 6. Executar fix-aprovar-evento-final.sql
**IMPORTANTE:** Antes de testar aprovação de eventos, execute:
- Arquivo: `fix-aprovar-evento-final.sql`
- Isso corrige a recursão infinita na função `aprovar_evento`

## 🧪 Fluxos de Teste

### Fluxo 1: Evento sem reserva
1. Criar evento (marcar como não precisa espaço físico)
2. Admin aprova evento
3. Verificar que aparece publicamente
4. Badge deve mostrar "Aguardando Reserva" (amarelo)

### Fluxo 2: Criar reserva → Vincular evento
1. Criar reserva com detalhes
2. Admin aprova reserva
3. Criar evento
4. Admin aprova evento
5. Em EntidadeDetalhes, vincular evento à reserva
6. Verificar que aparece publicamente
7. Badge deve mostrar "Evento Ativo" (verde)

### Fluxo 3: Criar evento → Preencher reserva
1. Criar evento com todos os dados
2. Admin aprova evento
3. Ir em criar reserva
4. Usar "Preencher com evento" para auto-completar
5. Finalizar criação da reserva
6. Admin aprova reserva
7. Vincular reserva ao evento
8. Verificar publicação

### Fluxo 4: Fluxo atual (manter)
1. Criar reserva
2. Admin aprova
3. Clicar "Criar Evento" na reserva
4. Sistema cria e vincula automaticamente
5. Admin aprova evento
6. Verificar publicação

### Fluxo 5: Trocar reserva
1. Evento vinculado à Reserva A
2. Desvincular em EntidadeDetalhes
3. Verificar que Reserva A ficou livre
4. Vincular Evento à Reserva B
5. Verificar que aparece com nova reserva

## 📊 Status das Implementações

| Tarefa | Status | Arquivo |
|--------|--------|---------|
| Migração SQL | ✅ Criado | `supabase/migrations/20250110_add_reserva_id_to_eventos.sql` |
| Script aplicação | ✅ Criado | `apply-separar-eventos-reservas.sql` |
| Hook vincular | ✅ Criado | `src/hooks/useVincularEventoReserva.ts` |
| Hook eventos sem reserva | ✅ Criado | `src/hooks/useEventosSemReserva.ts` |
| Hook reservas sem evento | ✅ Criado | `src/hooks/useReservasSemEvento.ts` |
| Componente vincular | ✅ Criado | `src/components/VincularEventoReserva.tsx` |
| Componente preencher | ✅ Criado | `src/components/PreencherReservaComEvento.tsx` |
| Atualizar ReservaSalaFormV2 | ⏳ Pendente | `src/components/ReservaSalaFormV2.tsx` |
| Atualizar ReservaAuditorioFormV3 | ⏳ Pendente | `src/components/ReservaAuditorioFormV3.tsx` |
| Atualizar CriarEventoEntidade | ⏳ Pendente | `src/components/CriarEventoEntidade.tsx` |
| Atualizar EntidadeDetalhes | ⏳ Pendente | `src/pages/EntidadeDetalhes.tsx` |
| Atualizar useEventos | ⏳ Pendente | `src/hooks/useEventos.ts` |
| Testes dos fluxos | ⏳ Pendente | - |

## 🔑 Pontos Importantes

1. **Migração SQL é obrigatória** antes de testar qualquer funcionalidade
2. **Fix função aprovar_evento** necessário para aprovar eventos sem erro
3. **Backward compatibility** mantida - fluxo atual continua funcionando
4. **Validações** de vinculação podem ser expandidas (datas, capacidades)
5. **Badges de status** ajudam entidades a entender estado de eventos/reservas

## 📝 Notas de Implementação

- Todos os hooks foram criados com tratamento de erro
- Componentes incluem estados de loading e empty states
- Validações básicas implementadas (podem ser expandidas)
- UI segue padrão existente do projeto (shadcn/ui)
- Mensagens de toast para feedback ao usuário
- Dialog de confirmação antes de vincular/desvincular

