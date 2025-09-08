# Integração do Sistema de Reserva de Salas

Este documento explica como integrar o sistema de reserva de salas na aplicação existente.

## 1. Adicionar a Rota

### No arquivo `src/App.tsx`:

```tsx
// Adicionar o import
import ReservaSala from '@/pages/ReservaSala';

// Adicionar a rota nas rotas protegidas (após a linha 100)
<Route path="/reserva-sala" element={
  <ProtectedRoute requireProfile={true}>
    <ReservaSala />
  </ProtectedRoute>
} />
```

## 2. Adicionar ao Menu de Navegação

### No arquivo `src/components/Navigation.tsx`:

Adicionar um novo item no menu para entidades:

```tsx
// Adicionar o ícone no import
import { 
  Building2, 
  Calendar, 
  Home, 
  Menu, 
  X, 
  User, 
  LogOut,
  Settings,
  MapPin // Adicionar este ícone
} from 'lucide-react';

// Adicionar no menu de navegação (procure pela seção de links de entidade)
<Link
  to="/reserva-sala"
  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive('/reserva-sala')
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
  }`}
  onClick={() => setIsOpen(false)}
>
  <MapPin className="h-4 w-4" />
  Reserva de Sala
</Link>
```

## 3. Integrar com o Sistema de Autenticação

### Modificar o hook `useSalaReservation.ts`:

```typescript
// Adicionar import do contexto de autenticação
import { useAuth } from '@/hooks/useAuth';
import { useAuthStateContext } from '@/components/AuthStateProvider';

export const useSalaReservation = () => {
  const { user } = useAuth();
  const { entity } = useAuthStateContext(); // Se você tiver contexto de entidade
  
  const submitReservation = async (): Promise<{ success: boolean; message: string }> => {
    // ... código existente ...
    
    try {
      const response = await fetch('/api/sala-reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`, // Se usar JWT
        },
        body: JSON.stringify({
          ...formState.data,
          entityId: entity?.id || user?.id, // Pegar ID da entidade logada
          studentId: user?.id, // ID do estudante que está fazendo a reserva
          status: 'pending_approval',
          createdAt: new Date().toISOString()
        }),
      });
      
      // ... resto do código ...
    }
  };
};
```

## 4. Criar a API Endpoint

### Criar arquivo `supabase/functions/sala-reservations/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const reservationData = await req.json()
      
      const { data, error } = await supabaseClient
        .from('sala_reservations')
        .insert([
          {
            ...reservationData,
            created_by: user.id,
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

## 5. Criar a Tabela no Banco de Dados

### SQL para criar a tabela:

```sql
-- Criar tabela de reservas de sala
CREATE TABLE sala_reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Dados básicos
  data DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_termino TIME NOT NULL,
  quantidade_pessoas INTEGER NOT NULL,
  nome_completo_solicitante TEXT NOT NULL,
  celular_com_ddd TEXT NOT NULL,
  
  -- Detalhes do evento
  motivo_reserva TEXT NOT NULL,
  titulo_evento TEXT NOT NULL,
  descricao_evento TEXT NOT NULL,
  
  -- Campos condicionais (JSON)
  tem_palestrante_externo BOOLEAN DEFAULT FALSE,
  palestrante_externo JSONB,
  necessidade_sala_plana BOOLEAN DEFAULT FALSE,
  motivo_sala_plana TEXT,
  
  -- Controle
  status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Índices para performance
CREATE INDEX idx_sala_reservations_entity_id ON sala_reservations(entity_id);
CREATE INDEX idx_sala_reservations_student_id ON sala_reservations(student_id);
CREATE INDEX idx_sala_reservations_status ON sala_reservations(status);
CREATE INDEX idx_sala_reservations_data ON sala_reservations(data);

-- RLS (Row Level Security)
ALTER TABLE sala_reservations ENABLE ROW LEVEL SECURITY;

-- Política: Entidades podem ver suas próprias reservas
CREATE POLICY "Entities can view their own reservations" ON sala_reservations
  FOR SELECT USING (
    entity_id IN (
      SELECT entity_id FROM entity_members 
      WHERE student_id = auth.uid()
    )
  );

-- Política: Estudantes podem criar reservas para suas entidades
CREATE POLICY "Students can create reservations for their entities" ON sala_reservations
  FOR INSERT WITH CHECK (
    entity_id IN (
      SELECT entity_id FROM entity_members 
      WHERE student_id = auth.uid()
    )
  );

-- Política: Estudantes podem atualizar suas próprias reservas
CREATE POLICY "Students can update their own reservations" ON sala_reservations
  FOR UPDATE USING (student_id = auth.uid());

-- Política: Super admins podem ver todas as reservas
CREATE POLICY "Super admins can view all reservations" ON sala_reservations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );
```

## 6. Adicionar Notificações

### Usar o sistema de toast existente:

```tsx
// No componente ReservaSalaForm.tsx, adicionar:
import { toast } from 'sonner';

const handleSubmit = async () => {
  const result = await submitReservation();
  
  if (result.success) {
    toast.success(result.message);
    // Opcional: redirecionar para uma página de sucesso
    // navigate('/reserva-sala/sucesso');
  } else {
    toast.error(result.message);
  }
};
```

## 7. Página de Histórico de Reservas

### Criar `src/pages/HistoricoReservas.tsx`:

```tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const HistoricoReservas: React.FC = () => {
  const { data: reservations, isLoading } = useQuery({
    queryKey: ['sala-reservations'],
    queryFn: async () => {
      const response = await fetch('/api/sala-reservations');
      return response.json();
    }
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Histórico de Reservas</h1>
      
      <div className="grid gap-4">
        {reservations?.map((reservation: any) => (
          <Card key={reservation.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{reservation.titulo_evento}</CardTitle>
                <Badge variant={
                  reservation.status === 'approved' ? 'default' :
                  reservation.status === 'rejected' ? 'destructive' :
                  'secondary'
                }>
                  {reservation.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p><strong>Data:</strong> {reservation.data}</p>
              <p><strong>Horário:</strong> {reservation.horario_inicio} - {reservation.horario_termino}</p>
              <p><strong>Pessoas:</strong> {reservation.quantidade_pessoas}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HistoricoReservas;
```

## 8. Deploy da Edge Function

```bash
# No diretório do projeto
supabase functions deploy sala-reservations
```

## 9. Teste da Integração

1. **Teste o formulário**: Acesse `/reserva-sala` e preencha todos os campos
2. **Teste validações**: Tente enviar sem preencher campos obrigatórios
3. **Teste campos condicionais**: Marque as opções de palestrante externo e sala plana
4. **Teste a API**: Verifique se os dados estão sendo salvos no banco
5. **Teste permissões**: Verifique se apenas entidades logadas podem criar reservas

## 10. Próximos Passos

Após a integração básica, considere implementar:

- **Sistema de aprovação** para administradores
- **Notificações por email** quando reserva for aprovada/rejeitada
- **Calendário de disponibilidade** de salas
- **Conflitos de horário** - verificar se sala já está reservada
- **Relatórios** de uso de salas
- **Integração com sistema de presença** nos eventos
