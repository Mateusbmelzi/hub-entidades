# Política de Segurança

## Versões com Suporte

Utilizamos o versionamento semântico (semantic versioning) para gerenciar as versões do projeto. Atualmente, as seguintes versões são suportadas com atualizações de segurança:

| Versão | Suporte          |
| ------- | ------------------ |
| 1.x.x   | ✅ Suporte completo |
| 0.x.x   | ❌ Apenas correções críticas |

## Como Reportar uma Vulnerabilidade de Segurança

A segurança do **Hub de Entidades Insper** é uma prioridade para nossa equipe. Se você descobrir uma vulnerabilidade de segurança, pedimos que reporte de forma responsável e siga este processo.

### ⚠️ **NÃO** Reporte Vulnerabilidades Publicamente

- **NÃO** abra uma issue pública no GitHub
- **NÃO** discuta a vulnerabilidade em fóruns públicos
- **NÃO** publique detalhes em redes sociais
- **NÃO** envie emails para listas de discussão públicas

### ✅ Como Reportar Corretamente

#### Opção 1: Contato Direto (Recomendado)

Entre em contato diretamente com os desenvolvedores responsáveis:

- **Gabriel Pradyumna**: [LinkedIn](https://www.linkedin.com/in/gabriel-pradyumna-alencar-costa-8887a6201/)
- **Mateus Melzi**: [LinkedIn](https://www.linkedin.com/in/mateus-bellon-melzi-6381111a9/)

#### Opção 2: GitHub Security Advisory

1. Acesse a [página de Security Advisories](https://github.com/SEU-USUARIO/hub-entidades/security/advisories/new) do repositório
2. Clique em "Report a vulnerability"
3. Preencha o formulário com os detalhes da vulnerabilidade

### 📋 Informações Necessárias no Relatório

Para que possamos investigar e corrigir a vulnerabilidade de forma eficiente, inclua as seguintes informações:

#### Informações Básicas
- **Tipo de vulnerabilidade** (ex: SQL injection, XSS, autenticação, etc.)
- **Severidade estimada** (Crítica, Alta, Média, Baixa)
- **Versão afetada** do software
- **Ambiente** onde foi descoberta (desenvolvimento, produção, etc.)

#### Detalhes Técnicos
- **Passos para reproduzir** a vulnerabilidade
- **Screenshots ou vídeos** (se aplicável e seguro)
- **Logs relevantes** (sem informações sensíveis)
- **Configuração do sistema** onde foi testada

#### Impacto Potencial
- **Dados que podem ser acessados** ou modificados
- **Usuários afetados** (todos, apenas admins, etc.)
- **Funcionalidades comprometidas**
- **Riscos de escalação de privilégios**

### 🔒 Confidencialidade

- **Mantenha a confidencialidade** até que a vulnerabilidade seja corrigida
- **Não compartilhe** informações com terceiros
- **Aguarde nossa resposta** antes de divulgar publicamente
- **Respeite o prazo** de 90 dias para divulgação coordenada

## Processo de Resposta

### 📅 Timeline de Resposta

| Tempo | Ação |
|-------|------|
| **24 horas** | Confirmação de recebimento do relatório |
| **72 horas** | Análise inicial e classificação da vulnerabilidade |
| **7 dias** | Investigação detalhada e plano de correção |
| **30 dias** | Desenvolvimento e teste da correção |
| **90 dias** | Divulgação pública (se não for corrigida antes) |

### 🔍 Investigação

1. **Análise inicial**: Avaliamos a severidade e validamos o relatório
2. **Investigação detalhada**: Reproduzimos e analisamos o impacto
3. **Desenvolvimento da correção**: Criamos e testamos a solução
4. **Testes de segurança**: Verificamos se a correção resolve o problema

### 🛠️ Correção

- **Correções críticas**: Implementadas imediatamente
- **Correções de alta severidade**: Dentro de 7 dias
- **Correções médias/baixas**: Na próxima versão planejada
- **Hotfixes**: Para vulnerabilidades críticas em produção

### 📢 Divulgação

- **Advisory público**: Criado após a correção
- **Changelog**: Atualizado com detalhes da correção
- **Release notes**: Incluem informações sobre a correção
- **Comunicação**: Notificação aos usuários afetados

## Reconhecimento

### 🏆 Hall of Fame

Reconhecemos publicamente pesquisadores de segurança que reportam vulnerabilidades de forma responsável:

- **Nome**: [Seu Nome]
- **Data**: [Data do Relatório]
- **Vulnerabilidade**: [Tipo de vulnerabilidade]

### 📜 Critérios para Reconhecimento

- Relatório responsável seguindo esta política
- Vulnerabilidade validada e corrigida
- Colaboração construtiva durante o processo
- Não violação dos termos de uso

## Áreas de Foco para Segurança

### 🔐 Autenticação e Autorização
- Sistema de login (Supabase Auth)
- Controle de acesso baseado em roles
- Sessões de usuário
- Tokens JWT

### 🛡️ Proteção de Dados
- Dados pessoais de estudantes
- Informações de organizações estudantis
- Upload de arquivos e imagens
- Backup e recuperação

### 🌐 Segurança Web
- Proteção contra XSS
- Prevenção de CSRF
- Validação de entrada
- Sanitização de dados

### 🔒 Infraestrutura
- Configuração do Supabase
- Variáveis de ambiente
- Deploy na Vercel
- Certificados SSL/TLS

### 📱 Segurança do Cliente
- Armazenamento local
- Comunicação com APIs
- Validação no frontend
- Proteção contra ataques

## Ferramentas e Processos

### 🔍 Ferramentas de Segurança Utilizadas

- **Dependências**: `npm audit` para verificar vulnerabilidades
- **Código**: Análise estática com ESLint e TypeScript
- **Dependências**: Renovate para atualizações automáticas
- **Monitoramento**: Logs de segurança do Supabase

### 📋 Checklist de Segurança

#### Para Desenvolvedores
- [ ] Validação de entrada em todos os formulários
- [ ] Sanitização de dados antes de exibir
- [ ] Verificação de permissões antes de operações sensíveis
- [ ] Uso de HTTPS em todas as comunicações
- [ ] Logs de auditoria para ações importantes

#### Para Deploy
- [ ] Variáveis de ambiente seguras
- [ ] Certificados SSL válidos
- [ ] Configuração de CORS adequada
- [ ] Políticas de RLS (Row Level Security) no Supabase
- [ ] Backup automático dos dados

## Contato de Emergência

### 🚨 Situações Críticas

Para vulnerabilidades que requerem atenção imediata (ex: vazamento de dados em produção):

- **Contato prioritário**: Via LinkedIn dos desenvolvedores
- **Assunto**: "URGENTE: Vulnerabilidade Crítica - Hub de Entidades"
- **Inclua**: Resumo executivo do problema e impacto estimado

### 📞 Outros Contatos

- **Issues gerais**: Use o sistema de issues do GitHub
- **Dúvidas sobre segurança**: Entre em contato via LinkedIn
- **Melhorias de segurança**: Abra uma issue com label "security"

## Políticas Específicas

### 🎓 Contexto Acadêmico

Como projeto desenvolvido no ambiente acadêmico do Insper:

- **Dados sensíveis**: Informações de estudantes são tratadas com máxima proteção
- **Conformidade**: Seguimos as políticas de segurança do Insper quando aplicável
- **Transparência**: Mantemos transparência com a comunidade acadêmica
- **Educação**: Usamos incidentes como oportunidades de aprendizado

### 🏢 Organizações Estudantis

Para representantes de organizações estudantis:

- **Acesso limitado**: Apenas dados necessários para funcionalidades
- **Auditoria**: Logs de todas as ações administrativas
- **Treinamento**: Orientações sobre uso seguro da plataforma
- **Suporte**: Assistência para configurações de segurança

## Atualizações desta Política

Esta política de segurança pode ser atualizada periodicamente para refletir:

- Mudanças nas práticas de segurança
- Novas vulnerabilidades descobertas
- Melhorias no processo de resposta
- Feedback da comunidade

**Última atualização**: Outubro de 2025

---

**Obrigado por ajudar a manter o Hub de Entidades Insper seguro!** 🔒

*Esta política segue as melhores práticas do GitHub e da comunidade de segurança.*
