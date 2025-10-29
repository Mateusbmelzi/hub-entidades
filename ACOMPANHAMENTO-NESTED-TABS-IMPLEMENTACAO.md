# Implementação: Nested Tabs no Acompanhamento

## Resumo das Alterações

Refatoração completa da aba "Acompanhamento" do processo seletivo para usar **nested tabs** (uma sub-aba para cada fase) com **visualização em lista** substituindo o Kanban.

## Arquivos Criados

### 1. `src/components/EstudanteFaseCard.tsx` (Novo)

Componente reutilizável para exibir informações detalhadas de cada candidato.

**Características:**
- Avatar circular com iniciais do estudante (primeiras letras do nome)
- Nome completo, email, curso e semestre
- Área de interesse (extraída de `respostas_formulario`)
- Badge de status (verde=aprovado, amarelo=pendente, vermelho=reprovado)
- Data de inscrição formatada (dd/MM/yyyy)
- Botões de ação: "Ver Detalhes", "Aprovar", "Reprovar"
- Botões de aprovar/reprovar aparecem apenas para candidatos pendentes

**Props:**
```typescript
interface EstudanteFaseCardProps {
  candidato: InscricaoProcessoUsuario;
  onAprovar: (id: string) => void;
  onReprovar: (id: string) => void;
  onVerDetalhes: (id: string) => void;
}
```

**Componentes UI usados:**
- Card, CardContent
- Button
- Badge
- Avatar, AvatarFallback
- Ícones do lucide-react (Mail, GraduationCap, Calendar, Eye, Check, X)

## Arquivos Modificados

### 2. `src/components/AcompanhamentoFasesPS.tsx` (Refatorado)

Refatoração completa do componente de acompanhamento.

**Removido:**
- Visualização Kanban
- Seletor de modo de visualização (Kanban/Lista)
- Select de filtro por fase (não mais necessário com nested tabs)
- Componentes `KanbanColumnPS` e `MetricasFasePS`
- Estado `viewMode` e `faseFiltro`

**Adicionado:**
- **Nested Tabs:** Uma aba para cada fase do processo seletivo
- **Badge com contador:** Cada aba mostra quantos candidatos estão na fase
- **Métricas por fase:** Dentro de cada aba, exibe:
  - Total de candidatos
  - Pendentes
  - Aprovados
  - Reprovados
- **Lista de estudantes:** Usando o componente `EstudanteFaseCard`
- **Estado vazio:** Mensagem quando não há candidatos na fase
- **Toasts:** Feedback visual ao aprovar/reprovar candidatos

**Estrutura das Nested Tabs:**
```tsx
<Tabs defaultValue={fases[0]?.id}>
  <TabsList>
    {fases.map(fase => (
      <TabsTrigger value={fase.id}>
        {fase.nome}
        <Badge>{candidatosFase.length}</Badge>
      </TabsTrigger>
    ))}
  </TabsList>
  
  {fases.map(fase => (
    <TabsContent value={fase.id}>
      {/* Métricas da fase */}
      {/* Lista de estudantes */}
    </TabsContent>
  ))}
</Tabs>
```

**Métricas mantidas:**
- Métricas globais no topo (4 cards):
  - Total de Candidatos
  - Em Processo
  - Taxa de Aprovação
  - Tempo Médio

**Handlers implementados:**
- `handleAprovarCandidato`: Aprova candidato e mostra toast de sucesso
- `handleReprovarCandidato`: Reprova candidato e mostra toast
- `handleVerDetalhes`: Placeholder para funcionalidade futura (mostra toast "em desenvolvimento")

## Fluxo de Uso

### Para Owners da Entidade:

1. **Acesse a aba "Processo Seletivo" → "Acompanhamento"**
2. **Visualize as métricas globais** no topo:
   - Total de candidatos
   - Candidatos em processo
   - Taxa de aprovação
   - Tempo médio no processo
3. **Clique em uma aba de fase** para ver os candidatos daquela fase
4. **Veja as métricas da fase** (pendentes, aprovados, reprovados)
5. **Gerencie cada candidato:**
   - Clique "Ver Detalhes" para ver informações completas (em desenvolvimento)
   - Clique "Aprovar" para aprovar o candidato na fase atual
   - Clique "Reprovar" para reprovar o candidato

## Benefícios da Nova Implementação

### 1. Navegação Clara
- Cada fase tem sua própria aba
- Badge mostra quantos candidatos em cada fase
- Fácil alternar entre fases

### 2. Informações Detalhadas
- Mais espaço para exibir informações de cada candidato
- Avatar visual para rápida identificação
- Todos os dados relevantes visíveis sem cliques adicionais

### 3. Performance
- Renderização lazy: Apenas a aba ativa é renderizada
- Melhor performance com muitos candidatos
- Não há re-renderização de fases não visíveis

### 4. UX Melhorada
- Interface mais limpa e organizada
- Feedback imediato com toasts
- Botões contextuais (aparecem apenas quando relevantes)
- Estados vazios informativos

### 5. Escalabilidade
- Funciona bem com qualquer número de fases
- Funciona bem com muitos candidatos por fase
- Layout responsivo (grid adaptável no TabsList)

## Componentes UI Utilizados

### Do shadcn/ui:
- Card, CardContent, CardHeader, CardTitle
- Button
- Badge
- Tabs, TabsContent, TabsList, TabsTrigger
- Skeleton
- Alert, AlertDescription
- Avatar, AvatarFallback

### Ícones (lucide-react):
- Users, Clock, Check, Calendar, Download
- AlertCircle, CheckCircle, XCircle, HourglassIcon
- Mail, GraduationCap, Eye, X

### Utilitários:
- `format` (date-fns) - Formatação de datas
- `ptBR` (date-fns/locale) - Localização para português
- `toast` (sonner) - Notificações

## Estado Vazio

Quando não há candidatos em uma fase, exibe:
```
┌─────────────────────────────────────┐
│     [Ícone de Usuários Opaco]      │
│   Nenhum candidato nesta fase       │
│   Os candidatos aparecerão aqui     │
│   quando forem movidos para esta    │
│   fase.                             │
└─────────────────────────────────────┘
```

Quando não há fases cadastradas:
```
⚠️ Nenhuma fase cadastrada. Configure as fases 
   do processo seletivo na aba "Fases".
```

## Integração com Backend

**Hook utilizado:** `useAcompanhamentoFases(entidadeId)`

**Retorna:**
- `candidatosPorFase`: Map<string, InscricaoProcessoUsuario[]>
- `fases`: FaseProcessoSeletivo[]
- `metricas`: MetricasFases
- `loading`: boolean
- `error`: string | null
- `aprovarCandidato`: (candidatoId: string) => Promise
- `reprovarCandidato`: (candidatoId: string) => Promise

**Tabelas do Supabase:**
- `processos_seletivos_fases` - Fases do processo
- `inscricoes_processo_seletivo` - Inscrições dos candidatos
- `inscricoes_fases_ps` - Relacionamento candidato-fase
- `profiles` - Dados dos estudantes

## Funcionalidades Futuras

### 1. Dialog de Detalhes do Estudante
Ao clicar "Ver Detalhes", abrir um dialog mostrando:
- Todas as respostas do formulário de inscrição
- Histórico completo de fases (por quais passou)
- Feedback recebido em cada fase
- Notas/comentários adicionados por avaliadores
- Botão para adicionar notas

### 2. Exportar Lista
Botão "Exportar Lista" atualmente desabilitado. Implementar:
- Exportação para CSV
- Exportação para Excel
- Filtros avançados antes de exportar

### 3. Ações em Massa
- Selecionar múltiplos candidatos
- Aprovar/reprovar em lote
- Mover múltiplos candidatos para outra fase

### 4. Filtros e Busca
- Buscar candidatos por nome/email
- Filtrar por curso/semestre
- Filtrar por área de interesse
- Filtrar por status

### 5. Ordenação
- Ordenar por nome
- Ordenar por data de inscrição
- Ordenar por status

## Testes Recomendados

- [ ] Verificar se as abas aparecem corretamente com todas as fases
- [ ] Verificar se o contador de candidatos por fase está correto
- [ ] Clicar em cada aba e verificar se os candidatos corretos aparecem
- [ ] Testar aprovação de candidato pendente
- [ ] Testar reprovação de candidato pendente
- [ ] Verificar se toasts aparecem após ações
- [ ] Verificar estado vazio quando fase não tem candidatos
- [ ] Verificar responsividade em mobile/tablet
- [ ] Verificar se métricas globais e por fase estão corretas
- [ ] Verificar formatação de datas em português

## Arquivos Relacionados

- `src/hooks/useAcompanhamentoFases.ts` - Hook de dados
- `src/types/acompanhamento-processo.ts` - Tipos TypeScript
- `src/pages/EntidadeDetalhes.tsx` - Página que usa o componente
- `src/components/ui/avatar.tsx` - Componente Avatar (shadcn/ui)

## Notas Técnicas

### Grid Dinâmico no TabsList
```tsx
<TabsList 
  className="grid w-full" 
  style={{ gridTemplateColumns: `repeat(${fases.length}, minmax(0, 1fr))` }}
>
```
Cria colunas iguais dinamicamente baseado no número de fases.

### Extração de Área de Interesse
```typescript
const areaInteresse = 
  candidato.respostas_formulario?.area_interesse || 
  candidato.respostas_formulario?.['area-interesse'] ||
  'Não especificada';
```
Suporta diferentes formatos de chave (camelCase e kebab-case).

### Geração de Iniciais
```typescript
const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};
```
Usa primeira letra do primeiro e último nome, ou primeiras 2 letras se nome único.

---

**Status:** ✅ Implementação concluída - Pronto para testes

**Data:** 2025-01-29

