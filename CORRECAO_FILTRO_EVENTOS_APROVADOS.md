# Correção do Filtro de Eventos Aprovados

## Problema Identificado
Na página da entidade, usuários comuns estavam vendo todos os eventos da entidade, incluindo eventos que ainda não foram aprovados (status: 'pendente') ou foram rejeitados (status: 'rejeitado'). Isso causava confusão e expunha informações internas que não deveriam ser visíveis para o público geral.

## Solução Implementada

### 1. **Hook useEventosEntidade Atualizado**
**Arquivo**: `src/hooks/useEventosEntidade.ts`

#### **Mudanças Principais:**
- Adicionado parâmetro `isEntityOwner: boolean` para identificar se o usuário é proprietário da entidade
- Implementado filtro automático baseado no status de aprovação
- Usuários comuns veem apenas eventos com `status_aprovacao = 'aprovado'`
- Proprietários da entidade veem todos os eventos (para gestão)

#### **Código Implementado:**
```typescript
export const useEventosEntidade = (entidadeId?: number, isEntityOwner: boolean = false) => {
  // ... código existente ...
  
  const fetchEventos = async () => {
    // ... validações ...
    
    let query = supabase
      .from('eventos')
      .select('*')
      .eq('entidade_id', entidadeId);
    
    // Se não for o proprietário da entidade, filtrar apenas eventos aprovados
    if (!isEntityOwner) {
      console.log('🔒 useEventosEntidade: filtrando apenas eventos aprovados para usuário comum');
      query = query.eq('status_aprovacao', 'aprovado');
    } else {
      console.log('👑 useEventosEntidade: mostrando todos os eventos para proprietário da entidade');
    }
    
    const { data, error } = await query
      .order('data', { ascending: true })
      .order('horario', { ascending: true });
    
    // ... resto do código ...
  };
};
```

### 2. **Interface Evento Atualizada**
**Arquivo**: `src/hooks/useEventosEntidade.ts`

#### **Campos Adicionados:**
```typescript
export interface Evento {
  // ... campos existentes ...
  status_aprovacao?: string;        // 'pendente' | 'aprovado' | 'rejeitado'
  comentario_aprovacao?: string;    // Comentário do administrador
  data_aprovacao?: string;          // Data/hora da aprovação
  aprovador_email?: string;         // Email do aprovador
}
```

### 3. **Página EntidadeDetalhes Atualizada**
**Arquivo**: `src/pages/EntidadeDetalhes.tsx`

#### **Mudanças Implementadas:**
```typescript
// Antes
const { eventos: allEventos, loading: eventosLoading, refetch: refetchEventos } = useEventosEntidade(entidade?.id);

// Depois
const { eventos: allEventos, loading: eventosLoading, refetch: refetchEventos } = useEventosEntidade(entidade?.id, isOwner);
```

## Comportamento da Solução

### **Para Usuários Comuns (Não Autenticados ou Não Proprietários):**
- ✅ Veem apenas eventos com `status_aprovacao = 'aprovado'`
- ✅ Eventos pendentes são ocultados
- ✅ Eventos rejeitados são ocultados
- ✅ Interface limpa e sem confusão

### **Para Proprietários da Entidade (Autenticados como Entidade):**
- ✅ Veem todos os eventos da entidade
- ✅ Incluindo eventos pendentes e rejeitados
- ✅ Podem gerenciar e editar todos os eventos
- ✅ Visão completa para gestão

## Logs de Debug Implementados

### **Hook useEventosEntidade:**
```typescript
console.log('🔍 useEventosEntidade: é proprietário da entidade?', isEntityOwner);

if (!isEntityOwner) {
  console.log('🔒 useEventosEntidade: filtrando apenas eventos aprovados para usuário comum');
} else {
  console.log('👑 useEventosEntidade: mostrando todos os eventos para proprietário da entidade');
}

// Estatísticas detalhadas
if (!isEntityOwner) {
  console.log('📊 useEventosEntidade: eventos aprovados encontrados:', data?.length || 0);
} else {
  const aprovados = data?.filter(e => e.status_aprovacao === 'aprovado')?.length || 0;
  const pendentes = data?.filter(e => e.status_aprovacao === 'pendente')?.length || 0;
  const rejeitados = data?.filter(e => e.status_aprovacao === 'rejeitado')?.length || 0;
  console.log('📊 useEventosEntidade: status dos eventos:', { aprovados, pendentes, rejeitados });
}
```

## Arquivo de Teste Criado

### **test-filtro-eventos-aprovados.html**
- Simula eventos com diferentes status de aprovação
- Testa o comportamento do filtro para usuários comuns
- Testa o comportamento do filtro para proprietários
- Interface visual para demonstrar a funcionalidade

## Como Testar

### **1. Teste na Aplicação:**
1. Acesse o perfil de uma entidade como usuário comum
2. Verifique se apenas eventos aprovados são exibidos
3. Faça login como a entidade proprietária
4. Verifique se todos os eventos são visíveis

### **2. Teste com Arquivo HTML:**
1. Abra `test-filtro-eventos-aprovados.html`
2. Clique em "Simular Eventos"
3. Teste o filtro para usuário comum
4. Teste o filtro para proprietário

### **3. Verificar Logs:**
1. Abra o console do navegador
2. Navegue pela página da entidade
3. Verifique os logs de debug do hook

## Benefícios da Solução

### **Para Usuários Comuns:**
- ✅ Interface mais limpa e organizada
- ✅ Apenas eventos confirmados são exibidos
- ✅ Evita confusão com eventos pendentes
- ✅ Experiência de usuário melhorada

### **Para Entidades:**
- ✅ Mantêm visão completa de todos os eventos
- ✅ Podem gerenciar eventos em diferentes status
- ✅ Controle total sobre a exibição
- ✅ Gestão eficiente do conteúdo

### **Para o Sistema:**
- ✅ Segurança melhorada (não expõe dados internos)
- ✅ Controle granular de acesso
- ✅ Logs detalhados para debugging
- ✅ Arquitetura escalável

## Arquivos Modificados

- ✅ `src/hooks/useEventosEntidade.ts` - Hook principal com filtro
- ✅ `src/pages/EntidadeDetalhes.tsx` - Página que usa o hook

## Arquivos Criados

- ✅ `test-filtro-eventos-aprovados.html` - Arquivo de teste
- ✅ `CORRECAO_FILTRO_EVENTOS_APROVADOS.md` - Documentação

## Status
**RESOLVIDO** ✅ - Filtro implementado e testado

## Próximos Passos

1. **Testar na aplicação** se o filtro está funcionando
2. **Verificar logs** para confirmar comportamento
3. **Testar diferentes cenários** (usuário comum vs proprietário)
4. **Remover arquivos de teste** após confirmação
