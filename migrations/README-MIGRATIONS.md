# Instruções para Migrações do Banco de Dados

## Reservas de Salas para Fases Presenciais

Este documento contém as instruções para executar as migrações necessárias para a funcionalidade de reservas de salas em fases presenciais do processo seletivo.

### Arquivo de Migração

Execute o arquivo `migrations/add-presencial-fases-reservas.sql` no Supabase SQL Editor.

### Passos para Executar

1. **Acesse o Supabase Dashboard**
   - Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Faça login na sua conta
   - Selecione o projeto do hub-entidades

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o Script**
   - Copie todo o conteúdo do arquivo `migrations/add-presencial-fases-reservas.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar

4. **Verifique se Funcionou**
   - O script deve mostrar mensagens de sucesso
   - Verifique se as colunas/tabelas foram criadas corretamente

### O que o script faz

1. Adiciona a coluna `presencial` (boolean) na tabela `processos_seletivos_fases`
2. Cria a tabela `fases_reservas` para relacionar fases com reservas
3. Cria índices para melhorar performance nas consultas

### Após Executar

Após executar as migrações, a funcionalidade estará disponível:
- Marcar fases como presenciais
- Vincular múltiplas reservas a uma fase presencial
- Validar conflitos globais de horário
- Validar capacidade das salas

