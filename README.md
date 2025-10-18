# Hub de Entidades Insper

[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.50.2-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.11-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

> **Plataforma completa para conectar alunos do Insper com organizações estudantis, facilitando processos seletivos, eventos e demonstrações de interesse.**

**Projeto independente desenvolvido por alunos do Insper para alunos do Insper**

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Sistema de Formulários de Inscrição](#sistema-de-formulários-de-inscrição)
- [Eventos e Reservas](#eventos-e-reservas)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Deploy](#deploy)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Design System](#design-system)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Autenticação](#autenticação)
- [Dashboard Analytics](#dashboard-analytics)
- [Performance e Debugging](#performance-e-debugging)
- [Contribuição](#contribuição)
- [Licença](#licença)

## Sobre o Projeto

O **Hub de Entidades Insper** é uma plataforma web moderna que conecta alunos do Insper com as organizações estudantis da instituição. A aplicação facilita a descoberta de entidades, inscrição em eventos e demonstração de interesse em organizações específicas.

### Desenvolvedores

Este é um **projeto independente** desenvolvido por dois alunos do Insper:

- **Gabriel Pradyumna** - Ciência da Computação
- **Mateus Melzi** - Administração

> **Solução criada por alunos do Insper para alunos do Insper**

A plataforma nasceu da necessidade real de conectar estudantes com as organizações estudantis da instituição, oferecendo uma experiência digital moderna e intuitiva.

### Status do Projeto

- **Status**: Projeto independente em desenvolvimento ativo
- **Objetivo**: Solução criada por alunos para alunos
- **Instituição**: Insper - Instituto de Ensino e Pesquisa
- **Desenvolvimento**: 2025
- **Relação**: Não oficial - projeto acadêmico independente

### Contexto Acadêmico

O Insper possui mais de **30 organizações estudantis** ativas, divididas em áreas como:
- **Consultoria e Negócios** (Insper Jr., Consilium, etc.)
- **Tecnologia** (Insper Code, Insper Data, etc.)
- **Finanças** (InFinance, Insper Asset, etc.)
- **Direito** (Electus, Insper ADR, etc.)
- **Educação** (Cursinho Insper, Insper Academy)
- **Cultura** (Bateria Imperial, Vega Cultural)
- **Entretenimento** (Insper Entertainment Business)

## Funcionalidades

### Para Alunos
- **Explorar Entidades**: Catálogo completo com filtros por área de atuação
- **Demonstração de Interesse**: Sistema para expressar interesse em entidades
- **Eventos**: Visualização e inscrição em eventos das organizações
- **Perfil Personalizado**: Gerenciamento de áreas de interesse e informações
- **Cronograma**: Acompanhamento de processos seletivos e eventos
- **Notificações**: Sistema de alertas para novos eventos e oportunidades

### Para Entidades
- **Dashboard de Gestão**: Analytics e métricas de engajamento
- **Gerenciamento de Eventos**: Criação e administração de eventos
- **Gestão de Demonstrações**: Aprovação/rejeição de interesses
- **Relatórios**: Insights sobre perfis dos interessados
- **Autenticação Específica**: Login dedicado para representantes
- **Sistema de Templates**: Criação e gerenciamento de templates de formulários de inscrição reutilizáveis
- **Configuração de Formulários**: Configuração de formulários de inscrição para eventos com campos customizados
- **Gestão de Inscrições**: Gestão de inscritos em eventos com exportação de dados
- **Eventos Flexíveis**: Criação de eventos independentes (online/externos) ou vinculados a reservas
- **Vinculação de Reservas**: Vinculação flexível entre eventos e reservas aprovadas
- **Dashboard de Aprovação**: Dashboard de aprovação de eventos com visualização detalhada

### Para Administradores
- **Dashboard Analytics**: Métricas estratégicas e indicadores
- **Aprovação de Eventos**: Aprovação de eventos com visualização completa de informações (tipo, palestrantes, observações)
- **Gestão de Usuários**: Administração de perfis e permissões
- **Relatórios Avançados**: Analytics de engajamento e comportamento
- **Gestão de Reservas**: Gestão de reservas de salas e auditórios
- **Sistema de Vinculação**: Sistema de vinculação entre eventos aprovados e reservas aprovadas

## Sistema de Formulários de Inscrição

### Templates Reutilizáveis
- **Criação de Templates**: Criação de templates de formulários personalizados por entidade
- **Configuração de Campos**: Configuração de campos básicos visíveis (nome, email, curso, semestre, telefone)
- **Campos Personalizados**: Adição de campos personalizados (text, textarea, select, checkbox, radio)
- **Associação por Tipo**: Associação de templates a tipos específicos de eventos
- **Gestão de Limites**: Gestão de limites de vagas e listas de espera

### Configuração de Formulários
- **Seleção de Template**: Seleção de template durante ou após criação do evento
- **Preview em Tempo Real**: Preview em tempo real do formulário configurado
- **Pré-preenchimento**: Campos básicos pré-preenchidos com dados do perfil do usuário
- **Sincronização**: Sincronização automática entre formulário e evento

### Gestão de Inscrições
- **Visualização de Inscritos**: Visualização de inscritos por evento
- **Exportação de Dados**: Exportação de dados em CSV
- **Controle de Vagas**: Controle de vagas e lista de espera
- **Status de Inscrição**: Status de inscrição (confirmado, cancelado, lista de espera)

## Eventos e Reservas

### Fluxo de Criação
1. **Eventos Presenciais**: Criados sem reserva inicial, vinculados após aprovação
2. **Eventos Online/Externos**: Criados sem necessidade de reserva física
3. **Reservas**: Criadas independentemente, podem ser vinculadas a eventos

### Vinculação Flexível
- **Aprovação Independente**: Eventos e reservas aprovados independentemente
- **Vinculação Pós-aprovação**: Vinculação pós-aprovação entre evento e reserva
- **Alteração de Vinculação**: Possibilidade de alterar vinculação (mover evento entre reservas)
- **Visibilidade Pública**: Eventos só aparecem publicamente se aprovados E (sem reserva OU reserva aprovada)

### Informações Expandidas
- **Tipo de Evento**: Palestra (alunos/público externo), Capacitação, Reunião, Processo Seletivo
- **Palestrantes/Convidados**: Nome, apresentação, pessoa pública, apoio externo
- **Observações**: Campo livre para informações adicionais
- **Necessidade de Espaço Físico**: Indicada por vinculação com reserva

## Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Vite)  │◄──►│   (Supabase)    │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   Auth System   │◄─────────────┘
                        │   (Supabase)    │
                        └─────────────────┘
```

### Fluxo de Dados
1. **Autenticação**: Supabase Auth com múltiplos provedores
2. **API**: Supabase REST API com Row Level Security (RLS)
3. **Estado**: React Query para cache e sincronização
4. **UI**: Componentes reutilizáveis com Shadcn/ui

## Tecnologias

### Frontend
- **React 18.3.1** - Biblioteca de interface
- **TypeScript 5.5.3** - Tipagem estática
- **Vite 5.4.1** - Build tool e dev server
- **React Router 6.26.2** - Roteamento
- **React Query 5.56.2** - Gerenciamento de estado
- **React Hook Form 7.53.0** - Formulários
- **Zod 3.23.8** - Validação de schemas
- **date-fns 3.6.0** - Manipulação de datas
- **recharts 2.12.7** - Gráficos e visualizações

### UI/UX
- **Tailwind CSS 3.4.11** - Framework CSS
- **Shadcn/ui** - Componentes de interface
- **Radix UI** - Primitivos acessíveis
- **Lucide React** - Ícones
- **Framer Motion** - Animações
- **Sonner** - Notificações toast

### Backend
- **Supabase 2.50.2** - Backend-as-a-Service
- **PostgreSQL** - Banco de dados
- **Row Level Security** - Segurança granular
- **Real-time subscriptions** - Atualizações em tempo real

### Ferramentas
- **ESLint** - Linting
- **Prettier** - Formatação
- **Husky** - Git hooks
- **Vercel** - Deploy e hosting

## Deploy

O projeto está configurado para deploy automático na Vercel:

1. **Branch principal**: `main`
2. **Build command**: `npm run build`
3. **Output directory**: `dist`
4. **Node version**: 18.x

### Variáveis de Ambiente

Configure as seguintes variáveis no painel da Vercel:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### Passos

1. **Clone o repositório**
   ```bash
   git clone https://github.com/your-username/hub-entidades.git
   cd hub-entidades
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp env.example .env.local
   # Edite o arquivo .env.local com suas credenciais
   ```

4. **Execute o projeto**
   ```bash
   npm run dev
   ```

## Configuração

### Supabase Setup

1. **Crie um projeto no Supabase**
2. **Configure as tabelas** usando os scripts SQL fornecidos
3. **Configure Row Level Security (RLS)**
4. **Configure autenticação** com provedores desejados
5. **Configure storage** para upload de imagens

### Banco de Dados

Execute os scripts SQL na seguinte ordem:

1. `schema.sql` - Estrutura das tabelas
2. `create-templates-formularios.sql` - Sistema de templates
3. `create-inscricoes-tables.sql` - Tabelas de inscrições
4. `20250110_add_reserva_id_to_eventos.sql` - Vinculação eventos-reservas
5. `20250111_add_evento_fields.sql` - Campos expandidos de eventos
6. `20250111_create_default_template.sql` - Template padrão do sistema
7. `rls_policies.sql` - Políticas de segurança
8. `seed_data.sql` - Dados iniciais (opcional)

## Uso

### Página Inicial
- **Landing page** com estatísticas em tempo real
- **Call-to-action** para explorar entidades
- **Navegação intuitiva** para diferentes seções

### Explorar Entidades
- **Filtros avançados** por área de atuação
- **Busca por nome** e descrição
- **Cards informativos** com detalhes das organizações
- **Demonstração de interesse** direta

### Eventos
- **Calendário de eventos** das entidades
- **Inscrição simplificada** com formulário
- **Notificações** para novos eventos
- **Exportação de dados** para entidades

### Perfil do Usuário
- **Configuração de áreas de interesse**
- **Histórico de demonstrações**
- **Participação em eventos**
- **Upload de foto de perfil**

### Componentes
- **Cards responsivos** com hover effects
- **Botões com estados** visuais claros
- **Formulários acessíveis** com validação
- **Navegação mobile-first** otimizada

### Responsividade
- **Mobile-first** design
- **Breakpoints** otimizados
- **Touch-friendly** interfaces
- **Performance** otimizada

## Design System

### Cores
- **Insper Red**: #C8102E
- **Insper Green**: #00A651
- **Insper Purple**: #6B46C1
- **Gray Scale**: 50-950

### Tipografia
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: 24px, 20px, 18px, 16px
- **Body**: 14px, 16px

### Componentes
- **Shadcn/ui** como base
- **Customizações** para identidade visual
- **Acessibilidade** seguindo WCAG 2.1

## Estrutura do Projeto

```
src/
├── components/                              # Componentes reutilizáveis
│   ├── ui/                                  # Componentes base (Shadcn/ui)
│   ├── ConfigurarFormularioInscricao.tsx    # Configuração de formulários
│   ├── CriarEditarTemplate.tsx              # Editor de templates
│   ├── DashboardAprovacaoEventos.tsx        # Dashboard de aprovação
│   ├── EventosReservasTabsEntidade.tsx      # Tabs de eventos/reservas
│   ├── FormularioInscricaoEvento.tsx        # Formulário público
│   ├── GerenciarInscritosEvento.tsx         # Gestão de inscritos
│   ├── GerenciarTemplatesFormularios.tsx    # Listagem de templates
│   ├── TemplatePreview.tsx                  # Preview de templates
│   ├── VincularEventoReserva.tsx            # Vinculação evento-reserva
│   ├── Navigation.tsx                       # Navegação principal
│   └── ...
├── pages/                                   # Páginas da aplicação
│   ├── Home.tsx                             # Landing page
│   ├── Entidades.tsx                        # Listagem de entidades
│   ├── Eventos.tsx                          # Eventos
│   └── ...
├── hooks/                                   # Custom hooks
│   ├── useAuth.tsx                          # Autenticação
│   ├── useEntidades.ts                      # Dados de entidades
│   ├── useFormularioInscricao.ts            # Hook para formulários
│   ├── useTemplatesFormularios.ts           # CRUD de templates
│   ├── useInscritosEvento.ts                # Gestão de inscritos
│   ├── useVincularEventoReserva.ts          # Vinculação evento-reserva
│   └── ...
├── integrations/                            # Integrações externas
│   └── supabase/                            # Configuração Supabase
├── lib/                                    # Utilitários
│   ├── debug-config.ts                      # Configuração de logs
│   ├── test-eventos-rls.ts                  # Testes de RLS
│   └── ...
├── types/                                   # Definições de tipos
│   ├── template-formulario.ts               # Tipos para templates
│   ├── evento.ts                            # Tipos expandidos de eventos
│   └── ...
└── styles/                                  # Estilos globais
```

## Autenticação

### Tipos de Usuário
1. **Alunos**: Acesso completo às funcionalidades
2. **Representantes de Entidades**: Gestão de eventos e demonstrações
3. **Super Administradores**: Controle total da plataforma

### Segurança
- **Row Level Security (RLS)** no Supabase
- **JWT tokens** para autenticação
- **Políticas granulares** de acesso
- **Validação de entrada** com Zod

## Dashboard Analytics

### Métricas Principais
- **Engajamento de usuários**
- **Demonstrações de interesse**
- **Participação em eventos**
- **Afinidade curso-entidade**

### Indicadores Estratégicos
- **Taxa de conversão** de visitas para demonstrações
- **Tempo de navegação** por seção
- **Correlação** entre áreas de interesse
- **Identificação de usuários inativos**

## Segurança

### Reportando Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança, **não** abra uma issue pública. Em vez disso, leia nossa [Política de Segurança](SECURITY.md) para saber como reportar de forma responsável.

### Código de Conduta

Este projeto adota um Código de Conduta que esperamos que todos os participantes sigam. Por favor, leia o [Código de Conduta completo](CODE_OF_CONDUCT.md) para entender quais ações serão e não serão toleradas.

### Como Contribuir
1. **Fork** o projeto
2. **Crie** uma branch para sua feature
3. **Commit** suas mudanças
4. **Push** para a branch
5. **Abra** um Pull Request

Ao contribuir para este projeto, você concorda em seguir nosso Código de Conduta.

### Reportar Bugs
- Use as **Issues** do GitHub
- Inclua **screenshots** quando relevante
- Descreva os **passos para reproduzir**

### Sugestões
- Abra uma **Discussion** no GitHub
- Descreva o **caso de uso**
- Inclua **mockups** se possível

## Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## Agradecimentos

- **Organizações Estudantis do Insper** pela inspiração e feedback durante o desenvolvimento
- **Insper** pela formação e ambiente acadêmico que possibilitou este projeto
- **Comunidade Supabase** pelo excelente backend
- **Shadcn/ui** pelos componentes de qualidade
- **Vercel** pela infraestrutura de deploy

---

**Desenvolvido por alunos do Insper para a comunidade Insper**

---

### Contato dos Desenvolvedores

- **Gabriel Pradyumna** - [LinkedIn](https://www.linkedin.com/in/gabriel-pradyumna-alencar-costa-8887a6201/) | [GitHub](https://github.com/prady001)
- **Mateus Melzi** - [LinkedIn](https://www.linkedin.com/in/mateus-bellon-melzi-6381111a9/) | [GitHub](https://github.com/Mateusbmelzi)

