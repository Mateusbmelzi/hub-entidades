na pa# Implementação do Sistema de Reservas - Frontend

Este documento descreve a implementação completa do sistema de reservas no frontend, integrado com o novo fluxo de eventos.

## 📁 **Arquivos Criados/Modificados**

### **Tipos TypeScript**
- `src/types/reserva.ts` - Tipos para o sistema de reservas

### **Hooks**
- `src/hooks/useReservas.ts` - Hook para listar reservas
- `src/hooks/useCreateReserva.ts` - Hook para criar reservas
- `src/hooks/useAprovarReservas.ts` - Hook para aprovar/rejeitar reservas

### **Componentes**
- `src/components/ReservaSalaFormV2.tsx` - Formulário atualizado de reserva de sala
- `src/components/DashboardAprovacaoReservas.tsx` - Dashboard de aprovação
- `src/components/MinhasReservas.tsx` - Lista de reservas do usuário

### **Páginas**
- `src/pages/AprovarReservas.tsx` - Página de aprovação de reservas
- `src/pages/MinhasReservas.tsx` - Página das reservas do usuário
- `src/pages/ReservaSala.tsx` - Atualizada para usar novo formulário

### **Tipos Supabase**
- `src/integrations/supabase/types.ts` - Atualizado com tipos da tabela reservas

## 🔄 **Fluxo Completo Implementado**

### **1. Usuário faz reserva:**
```typescript
// Formulário de reserva com seleção de evento
const { createReserva } = useCreateReserva();
await createReserva(formData);
```

### **2. Reserva aparece no dashboard:**
```typescript
// Dashboard de aprovação para administradores
const { reservasPendentes } = useReservasPendentes();
```

### **3. Admin aprova/rejeita:**
```typescript
// Aprovar reserva (cria evento automaticamente)
const { aprovarReserva } = useAprovarReservas();
await aprovarReserva(reservaId, comentario);

// Rejeitar reserva
const { rejeitarReserva } = useAprovarReservas();
await rejeitarReserva(reservaId, comentario);
```

### **4. Usuário vê suas reservas:**
```typescript
// Lista de reservas do usuário
const { reservasUsuario } = useReservasUsuario(userId);
```

## 🎯 **Como Usar**

### **1. Adicionar rotas no App.tsx:**
```typescript
import AprovarReservas from '@/pages/AprovarReservas';
import MinhasReservas from '@/pages/MinhasReservas';

// Adicionar as rotas:
<Route path="/aprovar-reservas" element={<AprovarReservas />} />
<Route path="/minhas-reservas" element={<MinhasReservas />} />
```

### **2. Adicionar links na navegação:**
```typescript
// Para usuários comuns
<Link to="/minhas-reservas">Minhas Reservas</Link>

// Para administradores
<Link to="/aprovar-reservas">Aprovar Reservas</Link>
```

### **3. Usar os hooks em outros componentes:**
```typescript
import { useReservas, useCreateReserva, useAprovarReservas } from '@/hooks';

// Listar reservas
const { reservas, loading, error } = useReservas();

// Criar reserva
const { createReserva, loading: createLoading } = useCreateReserva();

// Aprovar reservas
const { aprovarReserva, rejeitarReserva } = useAprovarReservas();
```

## 🔧 **Funcionalidades Implementadas**

### **Formulário de Reserva (ReservaSalaFormV2)**
- ✅ Seleção de evento obrigatória
- ✅ Dados básicos da reserva
- ✅ Campos condicionais (palestrante externo, sala plana)
- ✅ Validação em tempo real
- ✅ Interface em etapas (4 passos)
- ✅ Integração com hooks

### **Dashboard de Aprovação**
- ✅ Lista de reservas pendentes
- ✅ Detalhes completos de cada reserva
- ✅ Aprovação com comentário
- ✅ Rejeição com motivo obrigatório
- ✅ Interface responsiva
- ✅ Atualização automática

### **Minhas Reservas**
- ✅ Lista de reservas do usuário
- ✅ Status colorido
- ✅ Detalhes de cada reserva
- ✅ Cancelamento de reservas
- ✅ Histórico completo

### **Hooks**
- ✅ `useReservas` - Listar todas as reservas
- ✅ `useReservasPendentes` - Reservas para aprovação
- ✅ `useReservasUsuario` - Reservas do usuário
- ✅ `useCreateReserva` - Criar nova reserva
- ✅ `useAprovarReservas` - Aprovar/rejeitar/cancelar

## 🎨 **Interface**

### **Design System**
- ✅ Componentes shadcn/ui
- ✅ Ícones Lucide React
- ✅ Toast notifications (Sonner)
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design

### **UX Features**
- ✅ Progress indicator
- ✅ Form validation
- ✅ Confirmation dialogs
- ✅ Success/error messages
- ✅ Loading spinners
- ✅ Empty states

## 🔒 **Segurança**

### **RLS (Row Level Security)**
- ✅ Usuários só veem suas próprias reservas
- ✅ Administradores veem todas as reservas
- ✅ Entidades veem reservas relacionadas
- ✅ Validação de permissões no frontend

### **Validação**
- ✅ Validação de formulário
- ✅ Verificação de conflitos
- ✅ Validação de dados obrigatórios
- ✅ Sanitização de inputs

## 📊 **Status e Estados**

### **Status das Reservas**
- 🟡 **Pendente** - Aguardando aprovação
- 🟢 **Aprovada** - Aprovada e evento criado
- 🔴 **Rejeitada** - Rejeitada com motivo
- ⚫ **Cancelada** - Cancelada pelo usuário

### **Estados da Interface**
- ⏳ **Loading** - Carregando dados
- ❌ **Error** - Erro na operação
- ✅ **Success** - Operação bem-sucedida
- 📝 **Empty** - Nenhum dado encontrado

## 🚀 **Próximos Passos**

### **Melhorias Futuras**
1. **Notificações em tempo real** - WebSocket para atualizações
2. **Filtros avançados** - Por data, status, tipo
3. **Exportação** - PDF/Excel das reservas
4. **Calendário** - Visualização em calendário
5. **Mobile app** - App nativo para reservas

### **Integrações**
1. **Email notifications** - Notificar aprovações/rejeições
2. **Calendar sync** - Sincronizar com Google Calendar
3. **SMS alerts** - Alertas por SMS
4. **Analytics** - Dashboard de métricas

## 🐛 **Troubleshooting**

### **Problemas Comuns**

1. **Erro de permissão**
   - Verificar se usuário está autenticado
   - Verificar RLS policies no Supabase

2. **Formulário não envia**
   - Verificar se evento foi selecionado
   - Verificar validação dos campos

3. **Reservas não aparecem**
   - Verificar se RLS está configurado
   - Verificar se usuário tem permissão

4. **Aprovação não funciona**
   - Verificar se usuário é admin
   - Verificar se função existe no Supabase

### **Logs Úteis**
```typescript
// Debug de reservas
console.log('Reservas:', reservas);
console.log('Loading:', loading);
console.log('Error:', error);

// Debug de formulário
console.log('Form Data:', formData);
console.log('Errors:', errors);
```

## 📝 **Exemplo de Uso Completo**

```typescript
import { useCreateReserva } from '@/hooks/useCreateReserva';
import { useReservasPendentes } from '@/hooks/useReservas';
import { useAprovarReservas } from '@/hooks/useAprovarReservas';

function ReservaExample() {
  const { createReserva } = useCreateReserva();
  const { reservasPendentes } = useReservasPendentes();
  const { aprovarReserva } = useAprovarReservas();

  const handleCreateReserva = async () => {
    const formData = {
      evento_id: 'uuid-do-evento',
      tipo_reserva: 'sala',
      data_reserva: '2024-02-15',
      horario_inicio: '14:00',
      horario_termino: '16:00',
      quantidade_pessoas: 30,
      nome_solicitante: 'João Silva',
      telefone_solicitante: '(11) 99999-9999'
    };

    await createReserva(formData);
  };

  const handleAprovar = async (reservaId: string) => {
    await aprovarReserva(reservaId, 'Reserva aprovada');
  };

  return (
    <div>
      <button onClick={handleCreateReserva}>Criar Reserva</button>
      {reservasPendentes.map(reserva => (
        <div key={reserva.id}>
          <p>{reserva.nome_solicitante}</p>
          <button onClick={() => handleAprovar(reserva.id)}>
            Aprovar
          </button>
        </div>
      ))}
    </div>
  );
}
```

O sistema está completo e pronto para uso! 🎉
