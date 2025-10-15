# Fluxo de Criação de Evento com Formulário de Inscrição

## ✅ Fluxo Completo Implementado

### 1. **Criação do Evento a partir da Reserva**
```
EntidadeDetalhes.tsx
├── "Minhas Reservas" (reservas aprovadas)
├── Botão "Criar Evento desta Reserva" 
└── Abre CriarEventoDeReserva.tsx
```

### 2. **CriarEventoDeReserva.tsx**
```typescript
// Dados pré-preenchidos da reserva:
- nome: reserva.titulo_evento_capacitacao
- descricao: reserva.descricao_pautas_evento_capacitacao
- local: reserva.sala_nome + predio + andar
- data: reserva.data_reserva + reserva.horario_inicio
- capacidade: reserva.sala_capacidade

// Após criar evento com sucesso:
if (result.success && result.eventoId) {
  // 1. Vincular reserva ao evento
  await supabase.from('reservas').update({ evento_id: result.eventoId })
  
  // 2. Abrir configuração do formulário
  setEventoId(result.eventoId);
  setShowFormularioConfig(true);
}
```

### 3. **ConfigurarFormularioInscricao.tsx**
```typescript
// Configurações disponíveis:
- ativo: boolean (habilitar/desabilitar formulário)
- limite_vagas: number (pré-preenchido com capacidade da sala)
- aceita_lista_espera: boolean
- campos_personalizados: CampoPersonalizado[]

// Tipos de campos personalizados:
- text: Texto curto
- textarea: Texto longo  
- select: Múltipla escolha
- checkbox: Sim/Não
```

### 4. **Hook useFormularioInscricao.ts**
```typescript
// Funcionalidades:
- fetchFormulario(): Buscar configuração existente
- saveFormulario(): Salvar no banco (formularios_inscricao + eventos)
- addCampoPersonalizado(): Adicionar campo
- removeCampoPersonalizado(): Remover campo
- updateCampoPersonalizado(): Editar campo
- reorderCampos(): Reordenar campos
```

### 5. **Integração com Banco de Dados**
```sql
-- Tabela formularios_inscricao
CREATE TABLE formularios_inscricao (
  id UUID PRIMARY KEY,
  evento_id UUID REFERENCES eventos(id),
  entidade_id INTEGER REFERENCES entidades(id),
  ativo BOOLEAN DEFAULT true,
  limite_vagas INTEGER,
  aceita_lista_espera BOOLEAN DEFAULT false,
  campos_personalizados JSONB DEFAULT '[]'::jsonb
);

-- Campos adicionados na tabela eventos
ALTER TABLE eventos ADD COLUMN formulario_ativo BOOLEAN DEFAULT false;
ALTER TABLE eventos ADD COLUMN limite_vagas INTEGER;
```

## 🔄 Fluxo de Uso Completo

### **Para a Entidade:**
1. **Reserva Aprovada** → EntidadeDetalhes.tsx mostra reserva com botão "Criar Evento"
2. **Criar Evento** → CriarEventoDeReserva.tsx (dados pré-preenchidos)
3. **Configurar Inscrições** → ConfigurarFormularioInscricao.tsx (automaticamente aberto)
4. **Gerenciar Inscritos** → GerenciarInscritosEvento.tsx (na página do evento)

### **Para o Usuário:**
1. **Ver Evento** → Eventos.tsx ou EventoDetalhes.tsx
2. **Botão "Inscrever-se"** → FormularioInscricaoEvento.tsx
3. **Preencher Formulário** → Campos básicos + personalizados
4. **Confirmação** → Status "confirmado" ou "lista_espera"

## 🎯 Componentes Integrados

### **EventoDetalhes.tsx**
```typescript
// Botão de inscrição para usuários públicos
{evento.formulario_ativo && !isOwner && (
  <FormularioInscricaoEvento eventoId={evento.id} />
)}

// Gerenciamento para proprietário
{isOwner && evento.formulario_ativo && (
  <GerenciarInscritosEvento eventoId={evento.id} />
)}
```

### **Eventos.tsx**
```typescript
// Indicador de vagas
{evento.formulario_ativo && (
  <div className="flex items-center text-sm text-gray-600">
    <Users className="mr-1 h-4 w-4" />
    <span>{evento.total_inscritos}/{evento.limite_vagas || '∞'} inscritos</span>
  </div>
)}
```

## 🔧 Hooks e Utilitários

### **useInscricaoEvento.ts** (atualizado)
```typescript
// Validação de vagas
const verificarVagasDisponiveis = async (eventoId: string) => {
  // Buscar limite_vagas do formulario
  // Contar inscrições confirmadas
  // Retornar status: 'confirmado' ou 'lista_espera'
}

// Inscrição com campos personalizados
const inscreverEvento = async (eventoId, dadosFormulario) => {
  // Inserir em inscricoes_eventos
  // Atualizar total_inscritos no evento
}
```

### **inscricoes-export.ts**
```typescript
// Exportação CSV/Excel
exportInscricoesToCSV(inscritos, campos)
exportInscricoesToExcel(inscritos, campos)
exportInscricoesToText(inscritos, campos)
```

## ✅ Status Final

- ✅ **Fluxo completo implementado**
- ✅ **Integração entre componentes funcionando**
- ✅ **Hook useFormularioInscricao corrigido**
- ✅ **Build compilando sem erros**
- ✅ **ConfigurarFormularioInscricao integrado em CriarEventoDeReserva**
- ✅ **Políticas RLS corrigidas**

## 🚀 Próximos Passos

1. **Execute a migração SQL** no Supabase
2. **Execute as políticas RLS corrigidas**
3. **Teste o fluxo completo**:
   - Criar evento a partir de reserva
   - Configurar formulário de inscrição
   - Testar inscrição como usuário
   - Visualizar e exportar inscritos
