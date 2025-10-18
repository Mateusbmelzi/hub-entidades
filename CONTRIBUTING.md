# Guia de Contribuição

Obrigado por seu interesse em contribuir com o **Hub de Entidades Insper**! 🎓

Este é um projeto desenvolvido por alunos do Insper para alunos do Insper, e toda contribuição é muito bem-vinda. Este guia irá ajudá-lo a contribuir de forma eficiente e seguir os padrões do projeto.

## Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Padrões de Código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Reportando Problemas](#reportando-problemas)
- [Tipos de Contribuições](#tipos-de-contribuições)
- [Perguntas Frequentes](#perguntas-frequentes)

## Código de Conduta

Este projeto segue um [Código de Conduta](CODE_OF_CONDUCT.md) para garantir um ambiente acolhedor e respeitoso para todos os contribuidores. Ao participar deste projeto, você concorda em seguir este código.

## Como Contribuir

### 1. Fork e Clone

```bash
# 1. Faça fork do repositório no GitHub
# 2. Clone seu fork localmente
git clone https://github.com/SEU-USUARIO/hub-entidades.git
cd hub-entidades

# 3. Adicione o repositório original como upstream
git remote add upstream https://github.com/ORIGINAL-OWNER/hub-entidades.git
```

### 2. Configuração do Ambiente

```bash
# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Execute o projeto em modo de desenvolvimento
npm run dev
```

### 3. Criando uma Branch

```bash
# Sempre crie uma nova branch para suas mudanças
git checkout -b feature/sua-feature
# ou
git checkout -b fix/correcao-bug
# ou
git checkout -b docs/melhoria-documentacao
```

## Configuração do Ambiente

### Pré-requisitos

- **Node.js 18+**
- **npm ou yarn**
- **Conta no Supabase** (para desenvolvimento local)
- **Git**

### Tecnologias Utilizadas

- **Frontend**: React 18.3.1, TypeScript, Vite
- **UI**: Tailwind CSS, Shadcn/ui, Radix UI
- **Backend**: Supabase (PostgreSQL)
- **Estado**: React Query (TanStack Query)
- **Formulários**: React Hook Form + Zod
- **Roteamento**: React Router

### Estrutura do Banco de Dados

Para contribuir com funcionalidades que envolvem dados, você precisará:

1. **Criar um projeto Supabase** local ou usar as credenciais de desenvolvimento
2. **Executar os scripts SQL** na ordem correta (veja README.md)
3. **Configurar Row Level Security (RLS)** adequadamente

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Shadcn/ui)
│   └── ...             # Componentes específicos do projeto
├── pages/              # Páginas da aplicação
├── hooks/              # Custom hooks
├── integrations/       # Integrações externas (Supabase)
├── lib/                # Utilitários e helpers
├── types/              # Definições TypeScript
└── styles/             # Estilos globais
```

### Convenções de Nomenclatura

- **Componentes**: PascalCase (`EventosReservasTabsEntidade.tsx`)
- **Hooks**: camelCase começando com "use" (`useAuth.tsx`)
- **Páginas**: PascalCase (`Eventos.tsx`)
- **Utilitários**: camelCase (`debug-config.ts`)

## Padrões de Código

### TypeScript

- **Sempre use TypeScript** para novos arquivos
- **Defina tipos explícitos** para props, estados e funções
- **Use interfaces** para objetos complexos
- **Evite `any`** - prefira tipos específicos

```typescript
// ✅ Bom
interface EventoProps {
  id: string;
  titulo: string;
  data: Date;
  onEdit: (id: string) => void;
}

// ❌ Evite
const handleEvent = (event: any) => { ... }
```

### React

- **Use functional components** com hooks
- **Prefira composition** over inheritance
- **Use React.memo** para componentes pesados quando apropriado
- **Siga as regras dos hooks**

```typescript
// ✅ Bom
const MeuComponente: React.FC<Props> = ({ titulo, onSave }) => {
  const [loading, setLoading] = useState(false);
  
  return (
    <div>
      <h1>{titulo}</h1>
      <button onClick={onSave} disabled={loading}>
        Salvar
      </button>
    </div>
  );
};

export default React.memo(MeuComponente);
```

### Styling

- **Use Tailwind CSS** para estilos
- **Siga o design system** definido no projeto
- **Use classes utilitárias** ao invés de CSS customizado
- **Mantenha consistência** com componentes existentes

```tsx
// ✅ Bom
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">
    Título do Card
  </h2>
</div>
```

### Formulários

- **Use React Hook Form** com Zod para validação
- **Mantenha formulários acessíveis**
- **Forneça feedback visual** claro

```typescript
// ✅ Bom
const schema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  email: z.string().email('Email inválido'),
});

const Formulario = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });
  
  // ...
};
```

## Processo de Pull Request

### 1. Antes de Abrir um PR

- [ ] **Teste suas mudanças** localmente
- [ ] **Execute `npm run lint`** e corrija erros
- [ ] **Execute `npm run build`** para verificar se compila
- [ ] **Atualize a documentação** se necessário
- [ ] **Siga os padrões de código** do projeto

### 2. Criando o Pull Request

```bash
# Faça commit das suas mudanças
git add .
git commit -m "feat: adiciona funcionalidade X"

# Push para sua branch
git push origin feature/sua-feature
```

### 3. Template do Pull Request

```markdown
## Descrição
Breve descrição das mudanças implementadas.

## Tipo de Mudança
- [ ] Bug fix (mudança que corrige um problema)
- [ ] Nova funcionalidade (mudança que adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentação (mudança apenas na documentação)

## Como Testar
Passos para testar as mudanças:
1. Acesse a página X
2. Clique em Y
3. Verifique se Z acontece

## Screenshots (se aplicável)
Adicione screenshots para ajudar a explicar suas mudanças.

## Checklist
- [ ] Meu código segue os padrões do projeto
- [ ] Fiz auto-review do meu código
- [ ] Adicionei comentários onde necessário
- [ ] Minhas mudanças não geram warnings
- [ ] Adicionei testes se necessário
- [ ] Atualizei a documentação se necessário
```

### 4. Processo de Review

- **Mantenha PRs pequenas** e focadas em uma funcionalidade
- **Responda aos comentários** dos reviewers
- **Faça rebase** se necessário para manter histórico limpo
- **Aguarde aprovação** antes de fazer merge

## Reportando Problemas

### Antes de Reportar

1. **Verifique se já existe** uma issue similar
2. **Teste na versão mais recente**
3. **Colete informações** relevantes

### Como Reportar um Bug

```markdown
## Descrição do Bug
Descrição clara e concisa do problema.

## Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

## Comportamento Esperado
Descrição do que deveria acontecer.

## Screenshots
Se aplicável, adicione screenshots.

## Ambiente
- OS: [ex: Windows 10]
- Navegador: [ex: Chrome 91]
- Versão do Node: [ex: 18.15.0]

## Informações Adicionais
Qualquer outra informação relevante.
```

## Tipos de Contribuições

### 🐛 Correção de Bugs
- Identifique e corrija problemas existentes
- Adicione testes para prevenir regressões
- Documente a correção

### ✨ Novas Funcionalidades
- Implemente funcionalidades solicitadas em issues
- Mantenha consistência com o design existente
- Adicione documentação e testes

### 📚 Documentação
- Melhore a documentação existente
- Adicione exemplos de código
- Traduza documentação se necessário

### 🎨 Melhorias de UI/UX
- Melhore a interface do usuário
- Otimize a experiência do usuário
- Adicione animações ou transições

### ⚡ Performance
- Otimize código existente
- Reduza bundle size
- Melhore tempo de carregamento

### 🧪 Testes
- Adicione testes unitários
- Implemente testes de integração
- Melhore cobertura de testes

## Perguntas Frequentes

### Q: Como posso começar a contribuir?
R: Recomendamos começar com issues marcadas como "good first issue" ou "help wanted". Também pode melhorar a documentação ou corrigir bugs menores.

### Q: Preciso de permissão especial para contribuir?
R: Não! Qualquer pessoa pode contribuir. Apenas certifique-se de seguir o Código de Conduta e este guia.

### Q: Como escolho uma issue para trabalhar?
R: Procure por issues com labels como "good first issue", "bug", ou "enhancement". Comente na issue antes de começar a trabalhar.

### Q: Posso trabalhar em múltiplas issues ao mesmo tempo?
R: Recomendamos focar em uma issue por vez para manter PRs organizadas e facilitar o review.

### Q: Como obtenho ajuda se ficar travado?
R: Abra uma discussão no GitHub ou entre em contato com os desenvolvedores através dos canais listados no README.

### Q: O projeto aceita contribuições de não-alunos do Insper?
R: Sim! Embora o projeto seja focado na comunidade Insper, contribuições externas são bem-vindas.

## Recursos Úteis

- [Documentação do React](https://react.dev/)
- [Documentação do TypeScript](https://www.typescriptlang.org/docs/)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação do Supabase](https://supabase.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)

## Contato

- **Gabriel Pradyumna**: [LinkedIn](https://www.linkedin.com/in/gabriel-pradyumna-alencar-costa-8887a6201/) | [GitHub](https://github.com/prady001)
- **Mateus Melzi**: [LinkedIn](https://www.linkedin.com/in/mateus-bellon-melzi-6381111a9/) | [GitHub](https://github.com/Mateusbmelzi)

---

**Obrigado por contribuir com o Hub de Entidades Insper!** 🎉

*Última atualização: Outubro de 2025*
