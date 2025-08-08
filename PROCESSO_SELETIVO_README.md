# Processos Seletivos - Documentação

## Visão Geral

Esta funcionalidade permite que o botão "Demonstrar Interesse" redirecione diretamente para o link de inscrição de um processo seletivo ativo, quando disponível.

## Estrutura da Tabela

A tabela `processos_seletivos` no Supabase possui a seguinte estrutura:

```json
[
  {
    "id": 17,
    "created_at": "2025-08-07 20:48:31.297297+00",
    "link_inscricao": "https://cursor.com/pricing",
    "is_active": null,
    "data_primeira_fase": null,
    "data_segunda_fase": null,
    "data_terceira_fase": null
  }
]
```

### Campos da Tabela

- `id`: Identificador único do processo seletivo
- `created_at`: Data de criação do registro
- `link_inscricao`: URL do formulário de inscrição (obrigatório para funcionamento)
- `is_active`: Status ativo/inativo do processo
- `data_primeira_fase`: Data da primeira fase do processo
- `data_segunda_fase`: Data da segunda fase do processo
- `data_terceira_fase`: Data da terceira fase do processo

## Funcionalidade

### Comportamento do Botão "Demonstrar Interesse"

1. **Quando existe um processo seletivo com link de inscrição:**
   - O botão abre o link em uma nova aba
   - Exibe uma notificação toast informando que o link foi aberto
   - O texto do botão permanece "Demonstrar interesse"

2. **Quando não existe processo seletivo ou link:**
   - Redireciona para a página `/demonstrar-interesse/${entidade.id}`
   - Mantém o comportamento original

### Lógica de Busca

O hook `useProcessoSeletivo` busca o processo seletivo mais recente que possui um `link_inscricao` válido:

```typescript
const { data } = await supabase
  .from('processos_seletivos')
  .select('*')
  .not('link_inscricao', 'is', null)
  .order('created_at', { ascending: false })
  .limit(1)
```

## Implementação

### Hook: `useProcessoSeletivo`

```typescript
export const useProcessoSeletivo = () => {
  const [processoSeletivo, setProcessoSeletivo] = useState<ProcessoSeletivo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProcessoSeletivo = async () => {
      try {
        const { data, error } = await supabase
          .from('processos_seletivos')
          .select('*')
          .not('link_inscricao', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Erro ao buscar processo seletivo:', error);
          return;
        }

        setProcessoSeletivo(data?.[0] || null);
      } catch (error) {
        console.error('Erro ao buscar processo seletivo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProcessoSeletivo();
  }, []);

  return { processoSeletivo, loading };
};
```

### Componente: `EntidadeDetalhes.tsx`

A função `handleDemonstrarInteresse` foi modificada para incluir a lógica de redirecionamento:

```typescript
const handleDemonstrarInteresse = () => {
  // ... verificações de autenticação ...

  // Verificar se existe um processo seletivo ativo com link de inscrição
  if (processoSeletivo && processoSeletivo.link_inscricao) {
    // Abrir o link de inscrição em uma nova aba
    window.open(processoSeletivo.link_inscricao, '_blank');
    
    toast({
      title: "Link de inscrição aberto",
      description: "O formulário de inscrição foi aberto em uma nova aba.",
      duration: 3000,
    });
    return;
  }

  // Se não há processo seletivo ativo, redirecionar para a página de demonstração de interesse
  navigate(`/demonstrar-interesse/${entidade.id}`);
};
```

## Configuração

1. **Criar a tabela no Supabase:**
   ```sql
   CREATE TABLE processos_seletivos (
     id BIGSERIAL PRIMARY KEY,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     link_inscricao TEXT,
     is_active BOOLEAN,
     data_primeira_fase TIMESTAMP WITH TIME ZONE,
     data_segunda_fase TIMESTAMP WITH TIME ZONE,
     data_terceira_fase TIMESTAMP WITH TIME ZONE
   );
   ```

2. **Inserir dados de teste:**
   ```sql
   INSERT INTO processos_seletivos (link_inscricao, is_active) 
   VALUES ('https://exemplo.com/formulario', true);
   ```

## Benefícios

- **Simplicidade:** Funcionalidade direta e objetiva
- **Experiência do usuário:** Redirecionamento imediato para o formulário de inscrição
- **Flexibilidade:** Mantém o comportamento original quando não há processo seletivo
- **Feedback visual:** Notificação toast informa o usuário sobre a ação

## Notas Técnicas

- O hook busca apenas processos com `link_inscricao` não nulo
- A busca é ordenada por `created_at` decrescente para pegar o mais recente
- O redirecionamento usa `window.open` com `_blank` para abrir em nova aba
- A funcionalidade é transparente para o usuário - não há mudança visual na interface
