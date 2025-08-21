# 🚨 Solução: Eventos Não Aparecem na Área de Aprovação

## 🔍 **Diagnóstico do Problema**

Os eventos não estão aparecendo na área de aprovação. Vamos resolver isso passo a passo.

## 🧪 **Passo 1: Testar Conexão**

### **Acessar Página de Teste**
1. Navegue para `/test-eventos` (página temporária criada)
2. Verifique o console do navegador para logs detalhados
3. Identifique onde está o problema

### **Verificar Console**
Abra o DevTools (F12) e verifique:
- Logs de inicialização do hook
- Logs de busca no Supabase
- Possíveis erros de conexão

## 🔧 **Passo 2: Verificar Configuração do Supabase**

### **Verificar Variáveis de Ambiente**
```bash
# Verificar se estas variáveis estão configuradas
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

### **Verificar Arquivo de Configuração**
```typescript
// src/integrations/supabase/client.ts
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

## 📊 **Passo 3: Verificar Estrutura da Tabela**

### **Verificar se a Tabela Existe**
No SQL Editor do Supabase, execute:
```sql
-- Verificar se a tabela eventos existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'eventos'
);

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'eventos'
ORDER BY ordinal_position;
```

### **Verificar Dados na Tabela**
```sql
-- Contar total de eventos
SELECT COUNT(*) FROM eventos;

-- Verificar status de aprovação
SELECT status_aprovacao, COUNT(*) 
FROM eventos 
GROUP BY status_aprovacao;

-- Verificar alguns eventos
SELECT id, nome, status_aprovacao, created_at
FROM eventos
LIMIT 5;
```

## 🚨 **Possíveis Problemas e Soluções**

### **Problema 1: Tabela não existe**
```sql
-- Criar tabela eventos se não existir
CREATE TABLE IF NOT EXISTS eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  local VARCHAR(255),
  data_evento TIMESTAMP WITH TIME ZONE,
  capacidade INTEGER,
  status VARCHAR(50) DEFAULT 'ativo',
  status_aprovacao VARCHAR(50) DEFAULT 'pendente',
  comentario_aprovacao TEXT,
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  aprovador_email VARCHAR(255),
  entidade_id INTEGER REFERENCES entidades(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Problema 2: Coluna status_aprovacao não existe**
```sql
-- Adicionar coluna se não existir
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS status_aprovacao VARCHAR(50) DEFAULT 'pendente';

-- Atualizar eventos existentes
UPDATE eventos 
SET status_aprovacao = 'pendente' 
WHERE status_aprovacao IS NULL;
```

### **Problema 3: Permissões de acesso**
```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'eventos';

-- Criar política se necessário
CREATE POLICY "Permitir leitura pública de eventos" ON eventos
FOR SELECT USING (true);
```

### **Problema 4: Dados de teste**
```sql
-- Inserir eventos de teste
INSERT INTO eventos (nome, descricao, local, data_evento, entidade_id, status_aprovacao)
VALUES 
  ('Workshop de Programação', 'Aprenda Python do zero', 'Sala 101', '2024-12-15 14:00:00', 1, 'pendente'),
  ('Palestra sobre IA', 'Introdução à Inteligência Artificial', 'Auditório', '2024-12-20 19:00:00', 1, 'pendente'),
  ('Meetup de Empreendedorismo', 'Networking e palestras', 'Coworking', '2024-12-25 18:00:00', 2, 'aprovado');
```

## 🔍 **Passo 4: Debug do Hook**

### **Verificar Logs do Hook**
O hook `useEventosAprovacaoStats` agora tem logs detalhados:
- 🚀 Inicialização
- 🔄 Início da busca
- 📊 Busca de dados básicos
- ✅ Eventos carregados
- 📈 Estatísticas calculadas
- 🔍 Busca de eventos pendentes
- 🏁 Finalização

### **Testar Hook Individualmente**
```typescript
// Em um componente de teste
const { stats, eventosPendentes, loading, error } = useEventosAprovacaoStats();

console.log('Hook Debug:', {
  stats,
  eventosPendentes,
  loading,
  error
});
```

## 🎯 **Passo 5: Verificar Componente**

### **Verificar Props do Componente**
```typescript
// Verificar se as props estão chegando
<EventosAprovacaoStats
  stats={eventosAprovacaoStats}        // Verificar se tem dados
  eventosPendentes={eventosPendentes}  // Verificar se tem dados
  loading={eventosAprovacaoLoading}    // Verificar estado de loading
/>
```

### **Verificar Estados no Dashboard**
```typescript
// No Dashboard, verificar:
console.log('Dashboard Debug:', {
  eventosAprovacaoStats,
  eventosPendentes,
  eventosAprovacaoLoading,
  eventosAprovacaoError
});
```

## 🚀 **Passo 6: Solução Rápida**

### **Se ainda não funcionar, usar hook alternativo**
```typescript
// Hook alternativo mais simples
const useEventosSimple = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const { data, error } = await supabase
          .from('eventos')
          .select('*');
        
        if (error) throw error;
        setEventos(data || []);
      } catch (err) {
        console.error('Erro simples:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  return { eventos, loading };
};
```

## 📋 **Checklist de Verificação**

- [ ] Variáveis de ambiente configuradas
- [ ] Tabela `eventos` existe
- [ ] Coluna `status_aprovacao` existe
- [ ] Dados na tabela
- [ ] Políticas de acesso configuradas
- [ ] Hook funcionando (verificar console)
- [ ] Componente recebendo props
- [ ] Dashboard integrado corretamente

## 🔧 **Comandos de Teste**

### **Testar Conexão Básica**
```bash
# Verificar se o projeto compila
npm run build

# Verificar se não há erros de TypeScript
npm run type-check
```

### **Testar Hook**
```bash
# Acessar página de teste
http://localhost:5173/test-eventos

# Verificar console para logs
```

## 📞 **Suporte**

Se o problema persistir:
1. Verificar logs do console
2. Verificar estrutura da tabela no Supabase
3. Testar com dados de exemplo
4. Verificar permissões e políticas RLS

---

**Status**: Em resolução 🔧
**Última atualização**: $(date)
