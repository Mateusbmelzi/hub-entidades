# Guia de Geração de PDF - Dashboard Hub de Entidades

## Visão Geral

A funcionalidade de geração de PDF no dashboard permite criar relatórios personalizados e profissionais com os dados do sistema. O relatório inclui análises detalhadas sobre o engajamento dos alunos, performance das organizações estudantis e sucesso dos eventos.

## Como Acessar

1. Acesse o **Dashboard** como administrador
2. Clique no botão **"Gerar PDF"** no cabeçalho
3. Configure as opções desejadas no modal que aparecerá

## Funcionalidades Principais

### 📋 Seções Disponíveis

#### 1. Resumo Executivo
- **Descrição**: Principais métricas e indicadores gerais
- **Conteúdo**: 
  - Total de organizações
  - Total de eventos
  - Demonstrações de interesse
  - Eventos pendentes
  - Taxa de engajamento geral

#### 2. Visão Geral do Sistema
- **Descrição**: Descrição do sistema e funcionalidades
- **Conteúdo**:
  - Descrição do Hub de Entidades
  - Principais funcionalidades analisadas
  - Objetivos do sistema

#### 3. Indicadores dos Alunos
- **Descrição**: Comportamento e engajamento dos estudantes
- **Conteúdo**:
  - Taxa de login por turma
  - Tempo de navegação
  - Perfil de interesse por curso
  - Curva de cliques por entidade
  - Ação comum pós-login

#### 4. Indicadores das Organizações
- **Descrição**: Performance e vitalidade das organizações
- **Conteúdo**:
  - Eventos por organização
  - Atratividade por curso
  - Taxa de visualização vs interesse

#### 5. Análise de Eventos
- **Descrição**: Eventos com mais inscritos e sucesso
- **Conteúdo**:
  - Eventos com mais inscritos
  - Análise de formatos de sucesso
  - Taxa de ocupação

#### 6. Eventos Pendentes
- **Descrição**: Eventos aguardando aprovação
- **Conteúdo**:
  - Lista de eventos pendentes
  - Detalhes para aprovação

### ⚙️ Opções de Configuração

#### Título Personalizado
- Defina um título personalizado para o relatório
- Padrão: "Relatório do Dashboard - Hub de Entidades"

#### Filtros Avançados
- **Data Inicial**: Filtra dados a partir de uma data específica
- **Data Final**: Filtra dados até uma data específica

#### Métricas Específicas
Selecione quais métricas específicas incluir:
- Taxa de Login
- Tempo de Navegação
- Demonstrações de Interesse
- Vitalidade das Organizações
- Sucesso de Eventos
- Atratividade por Curso
- Comportamento Pós-Login
- Taxa de Conversão

#### Opções de Conteúdo
- **Incluir Gráficos**: Adiciona visualizações gráficas
- **Incluir Tabelas**: Adiciona dados tabulados detalhados

### 💾 Configurações Salvas

#### Salvar Configuração
1. Configure as opções desejadas
2. Clique em **"Salvar Config"**
3. Digite um nome para a configuração
4. A configuração será salva para uso futuro

#### Carregar Configuração
1. Clique em **"Carregar"** na configuração desejada
2. As opções serão aplicadas automaticamente

#### Remover Configuração
1. Clique no ícone de lixeira na configuração
2. A configuração será removida

## Estrutura do PDF Gerado

### Página 1: Capa
- Título do relatório
- Data e hora de geração
- Informações do sistema

### Páginas Seguintes: Conteúdo
- Seções selecionadas na configuração
- Tabelas com dados detalhados
- Análises e recomendações

### Última Página: Rodapé
- Informações de conformidade LGPD
- Dados anonimizados
- Para uso interno e institucional

## Características Técnicas

### Formato
- **Tipo**: PDF (Portable Document Format)
- **Tamanho**: A4 (210 x 297 mm)
- **Orientação**: Retrato

### Conformidade
- **LGPD**: Todos os dados são anonimizados
- **Privacidade**: Emails e nomes são mascarados
- **Uso**: Apenas para uso interno e institucional

### Performance
- **Tempo de geração**: 5-15 segundos (dependendo do volume de dados)
- **Tamanho do arquivo**: 100KB - 2MB (dependendo do conteúdo)
- **Compatibilidade**: Funciona em todos os navegadores modernos

## Dicas de Uso

### Para Relatórios Executivos
- Inclua apenas "Resumo Executivo" e "Visão Geral"
- Use título personalizado com data
- Ideal para apresentações de alto nível

### Para Análises Detalhadas
- Selecione todas as seções
- Inclua gráficos e tabelas
- Use filtros de data para períodos específicos

### Para Relatórios Mensais
- Configure filtros de data para o mês desejado
- Salve a configuração com nome "Relatório Mensal"
- Reutilize a configuração nos próximos meses

### Para Relatórios de Organizações Específicas
- Use filtros avançados
- Foque nas seções de organizações
- Personalize o título com o nome da organização

## Solução de Problemas

### PDF não gera
- Verifique se há dados disponíveis
- Tente recarregar a página
- Verifique a conexão com a internet

### PDF muito grande
- Reduza o número de seções incluídas
- Use filtros de data para reduzir dados
- Desmarque opções de gráficos

### Dados não aparecem
- Verifique se os dados foram carregados no dashboard
- Recarregue os dados clicando em "Recarregar"
- Verifique se há eventos ou organizações cadastradas

### Erro de permissão
- Verifique se está logado como administrador
- Faça logout e login novamente
- Verifique as permissões do usuário

## Exemplos de Uso

### Relatório Semanal
```
Título: "Relatório Semanal - Semana 15/01/2024"
Seções: Resumo Executivo, Indicadores dos Alunos
Filtros: Data da semana atual
```

### Relatório Trimestral
```
Título: "Relatório Trimestral Q1 2024"
Seções: Todas as seções
Filtros: Últimos 3 meses
Métricas: Todas selecionadas
```

### Relatório de Performance
```
Título: "Análise de Performance - Organizações"
Seções: Indicadores das Organizações, Análise de Eventos
Opções: Gráficos e tabelas incluídos
```

## Suporte

Para dúvidas ou problemas:
1. Verifique este guia
2. Consulte a documentação técnica
3. Entre em contato com o suporte técnico

---

**Versão**: 1.0  
**Última atualização**: Janeiro 2024  
**Compatível com**: Dashboard Hub de Entidades v2.0+ 