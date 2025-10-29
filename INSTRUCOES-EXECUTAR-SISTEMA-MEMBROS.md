# Instruções para Executar o Sistema de Gestão de Membros

## ⚠️ Importante: Leia Antes de Começar

Este sistema foi completamente implementado e está pronto para uso. Siga as etapas abaixo na ordem.

## 📋 Pré-requisitos

- [x] Node.js instalado
- [x] Projeto configurado localmente
- [x] Acesso ao Supabase (local ou cloud)

## 🚀 Passo a Passo

### 1. Aplicar a Migration no Banco de Dados

A migration cria todas as tabelas, triggers, funções RPC e políticas de segurança.

**Opção A: Supabase Local**
```bash
# Se estiver usando Supabase local
supabase db push
```

**Opção B: Supabase Cloud (Studio)**
1. Acesse o Supabase Studio
2. Vá em "SQL Editor"
3. Clique em "New Query"
4. Copie todo o conteúdo de `supabase/migrations/20250120_create_members_system.sql`
5. Cole no editor
6. Clique em "Run" (F5)

**Opção C: Linha de Comando (Cloud)**
```bash
# Conectar ao projeto
supabase link --project-ref SEU_PROJECT_REF

# Aplicar migrations
supabase db push
```

### 2. Verificar se a Migration foi Aplicada

No Supabase Studio:

1. **Verificar Tabelas**:
   - Vá em "Table Editor"
   - Verifique se existem:
     - `cargos_entidade`
     - `membros_entidade`
     - `permissoes_cargo`

2. **Verificar Funções RPC**:
   - Vá em "SQL Editor"
   - Execute: 
     ```sql
     SELECT * FROM pg_proc WHERE proname LIKE '%entity%';
     ```
   - Deve mostrar: `check_entity_permission` e `get_user_entity_permissions`

3. **Verificar Cargos Padrão**:
   ```sql
   SELECT e.nome as entidade, c.nome as cargo, c.nivel_hierarquia
   FROM cargos_entidade c
   JOIN entidades e ON e.id = c.entidade_id
   ORDER BY e.nome, c.nivel_hierarquia;
   ```
   - Cada entidade deve ter 3 cargos: Presidente, Gerente, Membro

### 3. Instalar Dependências (se necessário)

```bash
npm install
```

### 4. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

### 5. Testar o Sistema

#### A. Como Owner de Entidade

1. **Fazer Login**:
   - Acesse a aplicação
   - Faça login como entidade (usando credenciais da entidade)

2. **Acessar Gestão de Membros**:
   - Vá para a página da sua entidade
   - Role até encontrar a seção "Gestão de Membros" (fundo azul/roxo)
   - Você verá duas abas: "Membros" e "Cargos"

3. **Testar Aba Membros**:
   - Clique em "Adicionar Membro"
   - Busque um aluno pelo nome ou e-mail
   - Selecione um cargo
   - Confirme
   - Verifique se o membro aparece na lista

4. **Testar Aba Cargos**:
   - Clique na aba "Cargos"
   - Clique em "Novo Cargo"
   - Preencha:
     - Nome: "Diretor de Marketing"
     - Descrição: "Responsável pela comunicação"
     - Nível: 2
     - Cor: escolha uma cor
     - Permissões: marque algumas
   - Salve
   - Verifique se o cargo aparece na lista

5. **Testar Alterar Cargo**:
   - Na aba "Membros", clique no menu (⋮) de um membro
   - Selecione "Alterar Cargo"
   - Escolha um novo cargo
   - Confirme
   - Verifique se o badge do cargo foi atualizado

6. **Testar Remover Membro**:
   - Na aba "Membros", clique no menu (⋮) de um membro
   - Selecione "Remover Membro"
   - Confirme
   - Verifique se o membro foi removido da lista

#### B. Testar Validações

1. **Tentar Remover Único Presidente**:
   - Se a entidade tiver apenas 1 presidente
   - Tente remover esse presidente
   - Deve mostrar erro: "Não é possível remover o único presidente"

2. **Tentar Excluir Cargo com Membros**:
   - Na aba "Cargos", tente excluir um cargo que tem membros
   - Deve mostrar aviso sobre membros ativos

3. **Adicionar Membro Duplicado**:
   - Tente adicionar um membro que já existe
   - Deve mostrar: "Usuário já é membro ativo"

### 6. Verificar Permissões

Teste as permissões criando cargos com diferentes permissões:

1. **Criar cargo "Visualizador"**:
   - Apenas permissão "visualizar"
   - Adicionar um aluno com este cargo
   - Verificar que ele não pode gerenciar membros/cargos

2. **Criar cargo "Gerente de Eventos"**:
   - Permissões: "criar_eventos", "visualizar"
   - Testar se consegue criar eventos

## 🔍 Troubleshooting

### Problema: Migration falhou

**Solução**:
1. Verificar se há migrations pendentes
2. Executar migrations anteriores primeiro
3. Verificar se as tabelas dependentes existem (entidades, auth.users, profiles)

### Problema: RLS bloqueando acesso

**Solução**:
```sql
-- Desabilitar temporariamente RLS para debug (NÃO FAÇA EM PRODUÇÃO)
ALTER TABLE cargos_entidade DISABLE ROW LEVEL SECURITY;
ALTER TABLE membros_entidade DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes_cargo DISABLE ROW LEVEL SECURITY;

-- Depois de resolver, reabilitar
ALTER TABLE cargos_entidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE membros_entidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes_cargo ENABLE ROW LEVEL SECURITY;
```

### Problema: Cargos padrão não foram criados

**Solução**:
```sql
-- Executar manualmente para uma entidade específica
DO $$
DECLARE
    entidade_id_param INTEGER := 1; -- ALTERAR para ID da entidade
    presidente_id UUID;
    gerente_id UUID;
    membro_id UUID;
BEGIN
    -- Criar cargo Presidente
    INSERT INTO cargos_entidade (entidade_id, nome, descricao, nivel_hierarquia, cor)
    VALUES (entidade_id_param, 'Presidente', 'Liderança máxima da organização estudantil', 1, '#9333ea')
    RETURNING id INTO presidente_id;
    
    INSERT INTO permissoes_cargo (cargo_id, permissao)
    VALUES 
        (presidente_id, 'gerenciar_membros'),
        (presidente_id, 'criar_eventos'),
        (presidente_id, 'editar_entidade'),
        (presidente_id, 'editar_projetos'),
        (presidente_id, 'gerenciar_cargos'),
        (presidente_id, 'aprovar_conteudo'),
        (presidente_id, 'visualizar');
    
    -- Criar cargo Gerente
    INSERT INTO cargos_entidade (entidade_id, nome, descricao, nivel_hierarquia, cor)
    VALUES (entidade_id_param, 'Gerente', 'Gestão de projetos e eventos', 2, '#3b82f6')
    RETURNING id INTO gerente_id;
    
    INSERT INTO permissoes_cargo (cargo_id, permissao)
    VALUES 
        (gerente_id, 'criar_eventos'),
        (gerente_id, 'editar_projetos'),
        (gerente_id, 'visualizar');
    
    -- Criar cargo Membro
    INSERT INTO cargos_entidade (entidade_id, nome, descricao, nivel_hierarquia, cor)
    VALUES (entidade_id_param, 'Membro', 'Membro participante da organização estudantil', 3, '#10b981')
    RETURNING id INTO membro_id;
    
    INSERT INTO permissoes_cargo (cargo_id, permissao)
    VALUES (membro_id, 'visualizar');
END $$;
```

### Problema: Busca de alunos não funciona

**Solução**:
1. Verificar se a tabela `profiles` tem dados
2. Verificar permissões RLS na tabela `profiles`
3. Adicionar política se necessário:
```sql
CREATE POLICY "Allow authenticated users to read profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);
```

## 📊 Queries Úteis para Debug

```sql
-- Ver todos os cargos de uma entidade
SELECT * FROM cargos_entidade WHERE entidade_id = 1;

-- Ver todos os membros de uma entidade
SELECT 
    m.*,
    p.nome,
    p.email,
    c.nome as cargo
FROM membros_entidade m
JOIN profiles p ON p.id = m.user_id
JOIN cargos_entidade c ON c.id = m.cargo_id
WHERE m.entidade_id = 1 AND m.ativo = true;

-- Ver permissões de um cargo
SELECT 
    c.nome as cargo,
    p.permissao
FROM cargos_entidade c
LEFT JOIN permissoes_cargo p ON p.cargo_id = c.id
WHERE c.entidade_id = 1
ORDER BY c.nivel_hierarquia, p.permissao;

-- Verificar permissões de um usuário
SELECT * FROM get_user_entity_permissions(
    'uuid-do-usuario'::uuid,
    1::integer
);

-- Testar função de verificação de permissão
SELECT check_entity_permission(
    'uuid-do-usuario'::uuid,
    1::integer,
    'gerenciar_membros'::text
);
```

## ✅ Checklist de Verificação

- [ ] Migration aplicada com sucesso
- [ ] Tabelas criadas (cargos_entidade, membros_entidade, permissoes_cargo)
- [ ] Funções RPC criadas (check_entity_permission, get_user_entity_permissions)
- [ ] Cargos padrão criados para todas as entidades
- [ ] RLS habilitado e funcionando
- [ ] Aplicação inicia sem erros
- [ ] Seção "Gestão de Membros" aparece para owners
- [ ] Consegue adicionar membro
- [ ] Consegue alterar cargo de membro
- [ ] Consegue remover membro
- [ ] Consegue criar cargo customizado
- [ ] Consegue editar cargo
- [ ] Consegue excluir cargo (sem membros)
- [ ] Validações funcionando corretamente

## 🎉 Sistema Pronto!

Se todos os itens do checklist estão marcados, o sistema está funcionando perfeitamente!

## 📚 Documentação Adicional

- **Manual Completo**: `SISTEMA-GESTAO-MEMBROS.md`
- **Resumo Técnico**: `IMPLEMENTACAO-MEMBROS-SUMMARY.md`
- **Plan Original**: `sistema-gest-o-membros.plan.md`

## 🆘 Suporte

Se encontrar problemas não listados aqui:

1. Verifique os logs do console do navegador
2. Verifique os logs do Supabase
3. Revise a documentação completa
4. Verifique se todas as dependências estão instaladas

