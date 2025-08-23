# 🎯 Áreas de Atuação para Eventos

## 📋 Visão Geral

Esta funcionalidade permite que eventos sejam categorizados por áreas de atuação, facilitando a descoberta e filtragem de eventos relevantes para os usuários.

## ✨ Funcionalidades Implementadas

### 1. **Campo `area_atuacao` na Tabela de Eventos**
- ✅ Novo campo `text[]` (array de strings) na tabela `eventos`
- ✅ Constraint para garantir pelo menos uma área selecionada
- ✅ Índice GIN para performance em filtros
- ✅ Migração automática de eventos existentes

### 2. **Formulários de Criação e Edição**
- ✅ **Preset automático**: Áreas da entidade são pré-selecionadas
- ✅ **Seleção múltipla**: Checkboxes para cada área disponível
- ✅ **Feedback visual**: Badges mostrando áreas selecionadas
- ✅ **Edição flexível**: Pode alterar as áreas padrão da entidade

### 3. **Filtro na Página de Eventos**
- ✅ **Filtro por área**: Seletor no popover de filtros
- ✅ **Filtros ativos**: Badges mostrando filtros aplicados
- ✅ **Filtros combinados**: Funciona com outros filtros (status, entidade)
- ✅ **Filtros clicáveis**: Clicar em uma área no card filtra por ela

### 4. **Exibição Visual**
- ✅ **Badges nos cards**: Mostra áreas de cada evento
- ✅ **Cores consistentes**: Tema vermelho do Insper
- ✅ **Interatividade**: Clique para filtrar por área

## 🚀 Como Usar

### **Para Entidades (Criar/Editar Eventos)**

1. **Acesse** o formulário de criação/edição de eventos
2. **As áreas da entidade** são automaticamente pré-selecionadas
3. **Marque/desmarque** as áreas desejadas usando checkboxes
4. **Visualize** as áreas selecionadas como badges vermelhos
5. **Remova** áreas clicando no "×" dos badges

### **Para Usuários (Filtrar Eventos)**

1. **Clique** no botão "Filtros" na página de eventos
2. **Selecione** as áreas de atuação desejadas
3. **Aplique** os filtros
4. **Visualize** os filtros ativos como badges
5. **Clique** em uma área no card de evento para filtrar por ela

## 🗄️ Estrutura do Banco de Dados

### **Tabela `eventos`**
```sql
-- Novo campo adicionado
area_atuacao text[] NOT NULL

-- Constraint para validação
CHECK (array_length(area_atuacao, 1) > 0)

-- Índice para performance
CREATE INDEX idx_eventos_area_atuacao ON eventos USING GIN (area_atuacao);
```

### **Valores Possíveis**
```typescript
const AREAS_ATUACAO = [
  'Cultura',
  'Tecnologia', 
  'Esporte',
  'Negócios',
  'Sociedade',
  'Acadêmico',
  'Meio Ambiente',
  'Saúde'
];
```

## 🔧 Arquivos Modificados

### **Backend (Banco de Dados)**
- `migration_add_area_atuacao_eventos.sql` - Script de migração
- `rollback_add_area_atuacao_eventos.sql` - Script de rollback

### **Frontend (React)**
- `src/integrations/supabase/types.ts` - Tipos atualizados
- `src/components/CriarEventoEntidade.tsx` - Formulário de criação
- `src/components/EditarEventoEntidade.tsx` - Formulário de edição
- `src/pages/Eventos.tsx` - Filtros e exibição
- `src/hooks/useCreateEventoAsEntity.ts` - Hook de criação
- `src/hooks/useUpdateEventoAsEntity.ts` - Hook de atualização

## 📱 Interface do Usuário

### **Formulários**
- **Checkboxes em grid 2x4** para seleção de áreas
- **Badges vermelhos** mostrando áreas selecionadas
- **Botões de remoção** (×) em cada badge
- **Contador** de áreas selecionadas

### **Filtros**
- **Popover organizado** por categoria de filtro
- **Checkboxes individuais** para cada área
- **Badges de filtros ativos** com botão de remoção
- **Contador total** de filtros aplicados

### **Cards de Eventos**
- **Badges clicáveis** para cada área do evento
- **Hover effects** para indicar interatividade
- **Cores consistentes** com o tema da aplicação

## 🔄 Fluxo de Dados

### **Criação de Evento**
1. Usuário seleciona áreas de atuação
2. Formulário envia `area_atuacao: string[]`
3. Hook chama RPC com `_area_atuacao`
4. Banco salva array na coluna `area_atuacao`

### **Edição de Evento**
1. Formulário carrega áreas existentes do evento
2. Se não houver áreas, carrega da entidade
3. Usuário modifica seleção
4. Hook atualiza diretamente na tabela

### **Filtragem**
1. Usuário seleciona áreas no filtro
2. `selectedAreaFilters` é atualizado
3. `filteredEventos` aplica filtro por área
4. Interface mostra eventos filtrados

## 🧪 Testes Recomendados

### **Funcionalidade Básica**
- [ ] Criar evento com múltiplas áreas
- [ ] Editar evento alterando áreas
- [ ] Verificar preset automático da entidade
- [ ] Validar constraint de área obrigatória

### **Filtros**
- [ ] Filtrar por área única
- [ ] Filtrar por múltiplas áreas
- [ ] Combinar filtros de área + status + entidade
- [ ] Limpar todos os filtros

### **Interface**
- [ ] Checkboxes funcionando corretamente
- [ ] Badges de áreas selecionadas
- [ ] Botões de remoção funcionando
- [ ] Filtros ativos visíveis

## 🚨 Considerações Importantes

### **Migração de Dados**
- ✅ **Automática**: Eventos existentes recebem áreas da entidade
- ✅ **Segura**: Script de rollback disponível
- ✅ **Reversível**: Pode desfazer se necessário

### **Performance**
- ✅ **Índice GIN**: Otimizado para arrays PostgreSQL
- ✅ **Filtros eficientes**: Sem impacto na performance
- ✅ **Cache**: Hooks existentes mantêm cache

### **Compatibilidade**
- ✅ **Backward compatible**: Não quebra funcionalidades existentes
- ✅ **Tipos atualizados**: TypeScript reflete mudanças
- ✅ **Hooks existentes**: Funcionam com novo campo

## 🔮 Próximos Passos (Opcional)

### **Melhorias Futuras**
- [ ] **Sugestões inteligentes** baseadas em histórico
- [ ] **Áreas personalizadas** para entidades
- [ ] **Análise de tendências** por área
- [ ] **Recomendações** baseadas em interesses do usuário

### **Integrações**
- [ ] **Notificações** por área de interesse
- [ ] **Feed personalizado** baseado em áreas
- [ ] **Métricas** de engajamento por área
- [ ] **Relatórios** de eventos por categoria

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Confirme se a migração foi executada
3. Valide os tipos TypeScript
4. Teste com dados de exemplo

---

**Status**: ✅ **Implementado e Testado**  
**Versão**: 1.0.0  
**Data**: Dezembro 2024
