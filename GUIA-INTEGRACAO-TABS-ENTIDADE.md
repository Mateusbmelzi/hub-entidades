# Guia de Integração: Tabs Eventos/Reservas no EntidadeDetalhes

## 📦 Componente Criado

Criei o componente **`EventosReservasTabsEntidade`** que consolida toda a lógica de exibição e vinculação de eventos e reservas.

**Localização:** `src/components/EventosReservasTabsEntidade.tsx`

## 🔧 Como Integrar no EntidadeDetalhes.tsx

### Passo 1: Adicionar Import

No topo do arquivo `src/pages/EntidadeDetalhes.tsx`, adicione:

```tsx
import { EventosReservasTabsEntidade } from '@/components/EventosReservasTabsEntidade';
```

### Passo 2: Localizar Seção de Eventos

Procure por essa linha (aproximadamente linha 849):

```tsx
<Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
  <CardHeader className="pb-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Calendar className="w-5 h-5 text-red-600" />
        <CardTitle className="text-2xl text-gray-900">Eventos</CardTitle>
```

### Passo 3: Substituir o Card Inteiro de Eventos

Substitua TODO o Card de "Eventos" (que vai até próximo Card de outra seção) por:

```tsx
{/* Eventos e Reservas com Tabs */}
{isOwner && (
  <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-red-600" />
          <CardTitle className="text-2xl text-gray-900">Eventos e Reservas</CardTitle>
          <div className="flex items-center gap-2 ml-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              {allEventos?.filter(e => e.status_aprovacao === 'aprovado').length || 0} eventos aprovados
            </Badge>
            {allEventos?.filter(e => e.status_aprovacao === 'pendente').length > 0 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                {allEventos.filter(e => e.status_aprovacao === 'pendente').length} pendentes
              </Badge>
            )}
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              {reservasEntidade?.filter(r => r.status_reserva === 'aprovada').length || 0} reservas aprovadas
            </Badge>
          </div>
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

### Passo 4: Remover Dialogs Duplicados (Opcional)

Se você já tem dialogs para criar evento de reserva no final do arquivo, pode removê-los pois o componente `EventosReservasTabsEntidade` já os inclui.

Procure por:
```tsx
{/* Dialog para criar evento de reserva */}
<Dialog open={showCreateEventFromReservaDialog} ...>
```

E remova se encontrar (o novo componente já tem isso integrado).

## 🎨 Funcionalidades do Componente

### Para Eventos:
- ✅ Lista todos os eventos da entidade
- ✅ Badge de status (Ativo, Aguardando Reserva, Pendente, etc.)
- ✅ Botão "Vincular a Reserva" (se aprovado sem reserva)
- ✅ Botão "Gerenciar Vinculação" (se já tem reserva)
- ✅ Menu dropdown com opções Editar/Excluir
- ✅ Informações: data, hora, local, capacidade
- ✅ Indicador de evento passado

### Para Reservas:
- ✅ Lista todas as reservas da entidade
- ✅ Badge de status (Disponível, Ativa, Pendente, etc.)
- ✅ Botão "Vincular a Evento" (se aprovada sem evento)
- ✅ Botão "Criar Evento" (fluxo atual mantido)
- ✅ Informações: data, horário, sala, pessoas
- ✅ Indicador de reserva passada
- ✅ Badge de tipo (Sala/Auditório)

### Dialogs Integrados:
- ✅ Dialog de vinculação (eventos ↔ reservas)
- ✅ Dialog de criação de evento de reserva
- ✅ Dialog de desvinculação

## 📊 Badges de Status

### Eventos:
- 🟢 **Evento Ativo**: Aprovado + Reserva Aprovada
- 🟡 **Aguardando Reserva**: Aprovado + Sem Reserva
- 🟠 **Reserva Pendente**: Aprovado + Reserva Pendente
- ⚫ **Aguardando Aprovação**: Evento Pendente
- 🔴 **Rejeitado**: Evento Rejeitado

### Reservas:
- 🔵 **Disponível**: Aprovada + Sem Evento
- 🟢 **Reserva Ativa**: Aprovada + Com Evento
- 🟡 **Aguardando Aprovação**: Pendente
- 🔴 **Rejeitada**: Rejeitada
- ⚫ **Cancelada**: Cancelada

## 🔄 Fluxos Suportados

1. **Vincular Evento → Reserva**: Clicar em "Vincular a Reserva" no evento
2. **Vincular Reserva → Evento**: Clicar em "Vincular a Evento" na reserva
3. **Criar Evento de Reserva**: Clicar em "Criar Evento" na reserva (fluxo atual)
4. **Desvincular**: Clicar em "Gerenciar Vinculação" e depois "Desvincular"

## ⚠️ Nota Importante

**ANTES de testar**, execute as migrações SQL:

1. `apply-separar-eventos-reservas.sql` - Adiciona campo `reserva_id` e RLS policies
2. `fix-aprovar-evento-final.sql` - Corrige função de aprovação

## 🧪 Como Testar Após Integração

1. Acesse uma página de entidade como owner
2. Veja as tabs "Eventos" e "Reservas"
3. Crie um evento sem reserva
4. Admin aprova
5. Volte na entidade e veja badge "Aguardando Reserva"
6. Clique "Vincular a Reserva"
7. Selecione reserva aprovada
8. Confirme vinculação
9. Badge deve mudar para "Evento Ativo"

## 📝 Alternativa Mais Simples

Se preferir uma integração ainda mais fácil, você pode:

1. Comentar toda a seção antiga de eventos
2. Adicionar o novo componente em uma linha:

```tsx
{isOwner && entidade && (
  <Card>
    <CardHeader>
      <CardTitle>Eventos e Reservas</CardTitle>
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

Isso substitui completamente a seção antiga e adiciona todas as novas funcionalidades!

## ✨ Benefícios

- Código mais limpo e organizado
- Todas as funcionalidades de vinculação em um só lugar
- Tabs separadas para melhor UX
- Badges visuais claros
- Mantém compatibilidade com fluxo existente
- Pronto para expandir com mais funcionalidades

