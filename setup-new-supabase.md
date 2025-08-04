# Guia para Configurar Novo Projeto Supabase

## 1. Criar Novo Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Clique em "New Project"
4. Configure o projeto:
   - **Name**: `hub-entidades`
   - **Database Password**: Crie uma senha forte
   - **Region**: São Paulo (ou região mais próxima)

## 2. Obter Credenciais

Após criar o projeto, vá em **Settings > API** e copie:
- **Project URL** (ex: `https://abc123.supabase.co`)
- **anon public** key (começa com `eyJ...`)

## 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-public
VITE_APP_ENV=development
```

## 4. Aplicar Migrações

### Opção A: Via Supabase Dashboard (Recomendado)

1. No seu projeto Supabase, vá em **SQL Editor**
2. Execute as migrações na seguinte ordem:

#### Migração 1: Tabelas principais
```sql
-- Criar tabela de entidades
CREATE TABLE public.entidades (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  area_atuacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de eventos
CREATE TABLE public.eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  data_evento TIMESTAMP WITH TIME ZONE NOT NULL,
  local TEXT,
  entidade_id BIGINT REFERENCES public.entidades(id),
  capacidade INTEGER,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'cancelado', 'finalizado')),
  status_aprovacao TEXT DEFAULT 'pendente' CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado')),
  comentario_aprovacao TEXT,
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  aprovador_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de participantes
CREATE TABLE public.participantes_evento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID REFERENCES public.eventos(id) ON DELETE CASCADE,
  nome_participante TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  status_participacao TEXT DEFAULT 'confirmado' CHECK (status_participacao IN ('confirmado', 'pendente', 'cancelado')),
  data_inscricao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participantes_evento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entidades ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Anyone can view events" ON public.eventos FOR SELECT USING (true);
CREATE POLICY "Anyone can view participants" ON public.participantes_evento FOR SELECT USING (true);
CREATE POLICY "Anyone can view entities" ON public.entidades FOR SELECT USING (true);
```

#### Migração 2: Dados de exemplo
```sql
-- Inserir entidades de exemplo
INSERT INTO public.entidades (nome, descricao, area_atuacao) VALUES
('Tech Club', 'Clube de tecnologia e inovação', 'Tecnologia'),
('Finance Society', 'Sociedade de finanças e investimentos', 'Finanças'),
('Marketing Hub', 'Hub de marketing digital', 'Marketing'),
('Startup Lab', 'Laboratório de startups', 'Empreendedorismo'),
('Data Science Club', 'Clube de ciência de dados', 'Dados');

-- Inserir eventos de exemplo (aprovados)
INSERT INTO public.eventos (nome, descricao, data_evento, local, entidade_id, capacidade, status_aprovacao) VALUES
('Workshop React Avançado', 'Workshop prático sobre React com hooks avançados e performance', '2024-12-15 19:00:00+00', 'Lab 302', 1, 30, 'aprovado'),
('Hackathon 2024', 'Competição de programação de 48 horas com foco em soluções inovadoras', '2024-12-20 09:00:00+00', 'Auditório Principal', 1, 100, 'aprovado'),
('Palestra: IA e Machine Learning', 'Apresentação sobre as últimas tendências em IA e ML', '2024-12-18 18:30:00+00', 'Sala 205', 2, 50, 'aprovado'),
('Demo Day Startups', 'Apresentação de pitches de startups desenvolvidas por alunos', '2024-12-22 14:00:00+00', 'Auditório', 4, 80, 'aprovado'),
('Simulação de Trading', 'Simulação prática do mercado financeiro', '2024-12-16 16:00:00+00', 'Lab de Finanças', 5, 25, 'aprovado');
```

### Opção B: Via CLI (se tiver Docker)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Linkar projeto
supabase link --project-ref seu-project-ref

# Aplicar migrações
supabase db push
```

## 5. Testar a Aplicação

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse a página de eventos: `http://localhost:5173/eventos`

3. Verifique se os eventos estão carregando corretamente

## 6. Solução de Problemas

### Se a página ainda não carregar:

1. **Verificar console do navegador** (F12) para erros
2. **Verificar se as credenciais estão corretas** no arquivo `.env`
3. **Verificar se há eventos aprovados** no banco de dados
4. **Verificar as políticas RLS** no Supabase Dashboard

### Comandos úteis para debug:

```sql
-- Verificar se há eventos
SELECT * FROM eventos WHERE status_aprovacao = 'aprovado';

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'eventos';
```

## 7. Próximos Passos

Após configurar o novo projeto:
1. Configure autenticação no Supabase Dashboard
2. Configure storage para upload de imagens
3. Configure funções Edge se necessário 