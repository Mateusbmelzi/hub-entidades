# Edge Functions do Dashboard - Hub de Entidades

Este documento descreve todas as edge functions necessárias para alimentar o dashboard com dados em tempo real.

## 📊 Edge Functions Disponíveis

### 1. **update-indicadores-gerais** ✅ NOVA
- **Função**: Calcula e atualiza indicadores gerais do sistema
- **Tabela de destino**: `indicadores_gerais`
- **Dados calculados**:
  - Total de alunos (profiles)
  - Total de organizações ativas
  - Total de demonstrações de interesse
  - Total de eventos
  - Eventos aprovados
  - Total de inscrições em eventos
  - Processos seletivos ativos
  - Total de candidatos
  - Taxa de aprovação de eventos
  - Média de inscrições por evento

### 2. **update-top-eventos** ✅ EXISTENTE
- **Função**: Atualiza ranking dos eventos com mais inscritos
- **Tabela de destino**: `top_eventos`
- **Dados calculados**:
  - Nome do evento
  - Total de inscrições
  - Ranking por popularidade

### 3. **update-afinidade-curso-area** ✅ EXISTENTE
- **Função**: Calcula afinidade entre cursos dos estudantes e áreas de atuação
- **Tabela de destino**: `afinidade_curso_area`
- **Dados calculados**:
  - Curso do estudante
  - Área de atuação da organização
  - Total de interesses demonstrados

### 4. **update-indicadores-profiles** ✅ EXISTENTE
- **Função**: Analisa e calcula indicadores dos perfis dos usuários
- **Tabela de destino**: `indicadores_profiles`
- **Dados calculados**:
  - Total de usuários
  - Perfis completos vs incompletos
  - Distribuição por curso
  - Distribuição por semestre
  - Áreas de interesse mais populares
  - Faixas etárias
  - Crescimento por período

### 5. **update-taxa-conversao-entidades** ✅ EXISTENTE
- **Função**: Calcula taxa de conversão das organizações
- **Tabela de destino**: `taxa_conversao_entidades`
- **Dados calculados**:
  - Nome da organização
  - Total de demonstrações de interesse
  - Total de participantes em eventos
  - Taxa de conversão (participantes/demonstrações)

## 🚀 Como Usar

### Execução Manual
```bash
# Para cada edge function
curl -X POST 'https://[PROJECT_REF].supabase.co/functions/v1/update-indicadores-gerais' \
  -H 'Authorization: Bearer [ANON_KEY]' \
  -H 'Content-Type: application/json'
```

### Execução Automática via Cron Jobs
As edge functions são executadas automaticamente a cada 15 minutos através de cron jobs configurados no Supabase.

## 📋 Estrutura das Tabelas

### `indicadores_gerais`
```sql
CREATE TABLE indicadores_gerais (
  id SERIAL PRIMARY KEY,
  total_alunos INTEGER,
  total_entidades INTEGER,
  total_demonstracoes INTEGER,
  total_eventos INTEGER,
  eventos_aprovados INTEGER,
  total_inscricoes INTEGER,
  processos_seletivos_ativos INTEGER,
  total_candidatos INTEGER,
  taxa_aprovacao_eventos DECIMAL(5,4),
  media_inscricoes_evento DECIMAL(10,2),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `top_eventos`
```sql
CREATE TABLE top_eventos (
  id SERIAL PRIMARY KEY,
  nome_evento TEXT,
  total_inscricoes INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `afinidade_curso_area`
```sql
CREATE TABLE afinidade_curso_area (
  id SERIAL PRIMARY KEY,
  curso_estudante TEXT,
  area_atuacao TEXT,
  total_interesses INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `indicadores_profiles`
```sql
CREATE TABLE indicadores_profiles (
  id SERIAL PRIMARY KEY,
  tipo TEXT,
  categoria TEXT,
  valor DECIMAL(10,2),
  descricao TEXT,
  metadata JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `taxa_conversao_entidades`
```sql
CREATE TABLE taxa_conversao_entidades (
  id SERIAL PRIMARY KEY,
  nome TEXT,
  total_demonstracoes INTEGER,
  total_participantes_eventos INTEGER,
  taxa_conversao DECIMAL(5,4),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔄 Frequência de Atualização

- **Todas as edge functions**: Executadas a cada 15 minutos
- **Horário**: Via cron jobs do Supabase
- **Dados**: Sempre atualizados em tempo real

## 📱 Integração com o Dashboard

O dashboard consome dados dessas tabelas através dos seguintes hooks:

- `useIndicadoresGerais()` → `indicadores_gerais`
- `useTopEventos()` → `top_eventos`
- `useAfinidadeCursoArea()` → `afinidade_curso_area`
- `useTaxaConversaoEntidades()` → `taxa_conversao_entidades`

## 🛠️ Desenvolvimento Local

Para testar as edge functions localmente:

```bash
# 1. Iniciar Supabase local
supabase start

# 2. Executar edge function
supabase functions serve update-indicadores-gerais

# 3. Testar via curl
curl -X POST 'http://localhost:54321/functions/v1/update-indicadores-gerais' \
  -H 'Content-Type: application/json'
```

## 📝 Logs e Monitoramento

Cada edge function inclui logs detalhados para facilitar o debugging:

- ✅ Operações bem-sucedidas
- ❌ Erros e exceções
- 📊 Contadores e métricas
- 🎯 Resultados finais
- 🕐 Timestamps de execução

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de permissão**: Verificar se `SUPABASE_SERVICE_ROLE_KEY` está configurada
2. **Tabela não existe**: Executar scripts SQL de criação das tabelas
3. **Timeout**: Verificar se as queries estão otimizadas
4. **Dados vazios**: Verificar se há dados nas tabelas de origem

### Verificação de Status

```sql
-- Verificar cron jobs
SELECT * FROM cron.job WHERE active = true;

-- Verificar dados das tabelas
SELECT COUNT(*) FROM indicadores_gerais;
SELECT COUNT(*) FROM top_eventos;
SELECT COUNT(*) FROM afinidade_curso_area;
SELECT COUNT(*) FROM indicadores_profiles;
SELECT COUNT(*) FROM taxa_conversao_entidades;
```

## 📈 Próximos Passos

1. ✅ Implementar todas as edge functions
2. ✅ Configurar cron jobs
3. ✅ Testar execução automática
4. 🔄 Monitorar performance
5. 🔄 Otimizar queries se necessário
6. 🔄 Adicionar mais indicadores conforme demanda

---

**Última atualização**: $(date)
**Status**: Todas as edge functions implementadas ✅
