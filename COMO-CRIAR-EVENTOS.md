# 📋 Como Criar Eventos - Guia Completo

## 🎯 Formas de Criar um Evento

Agora existem **2 formas principais** de criar eventos no sistema:

---

## 1️⃣ Criar Evento Diretamente (NOVO) ⭐

**Ideal para:** Eventos online, externos ou quando você quer criar o evento antes da reserva

### Passo a Passo:

1. **Acesse sua organização estudantil**
   - Vá para a página da sua entidade
   - URL: `/entidades/[ID]`

2. **Localize a seção "Eventos e Reservas"**
   - Role para baixo até ver o card com título "Eventos e Reservas"

3. **Clique no botão "Criar Evento"** (vermelho)
   - Localizado no canto superior direito do card
   - Ícone de "+" ao lado

4. **Preencha o formulário:**

   **a) Nome do Evento** *
   - Ex: "Workshop de React e TypeScript"

   **b) Descrição** *
   - Descreva objetivos, público-alvo, o que será abordado
   - Mínimo 20 caracteres

   **c) Este evento precisa de espaço físico no Insper?**
   - ✅ **MARCADO (ON)**: Evento presencial
     - Local, data e horário serão definidos pela reserva
     - Você vinculará a uma reserva após aprovação
     - Campo "Local" não aparece (será preenchido automaticamente)
   - ❌ **DESMARCADO (OFF)**: Evento online/externo
     - Não precisa de reserva
     - Você deve preencher o campo "Local" (plataforma/link)

   **d) Local** (apenas se evento for online/externo)
   - Ex: "Zoom", "Google Meet", "YouTube Live"
   - Aparece APENAS quando desmarcar "precisa espaço físico"

   **e) Capacidade** (opcional)
   - Número máximo de participantes
   - Ex: 50
   - Para eventos presenciais, será definida pela capacidade da sala

   **f) Link do Evento** (opcional)
   - URL de inscrição ou informações adicionais
   - Ex: https://forms.google.com/...

   **g) Áreas de Atuação**
   - Checkboxes com áreas da sua entidade
   - Já vêm pré-selecionadas automaticamente

5. **Clique em "Criar Evento"**

6. **Aguarde aprovação do admin**
   - Evento fica com status "Aguardando Aprovação"
   - Você verá badge cinza ⚫

7. **Após aprovação:**
   - **SE evento NÃO precisa de espaço físico**: Aparece publicamente ✅
   - **SE evento precisa de espaço físico**: Badge muda para "Aguardando Reserva" 🟡

8. **Vincular a reserva (se necessário):**
   - Crie uma reserva (ou use existente aprovada)
   - Na aba "Eventos", clique "Vincular a Reserva"
   - Selecione a reserva
   - Confirme
   - Badge muda para "Evento Ativo" 🟢
   - Evento aparece publicamente ✅

---

## 2️⃣ Criar Evento a partir de Reserva (Fluxo Atual)

**Ideal para:** Quando você já tem uma reserva aprovada e quer criar o evento dela

### Passo a Passo:

1. **Crie uma reserva primeiro**
   - Clique em "Reservar Sala" ou "Reservar Auditório"
   - Preencha todos os dados da reserva
   - Submeta a reserva

2. **Aguarde aprovação da reserva**
   - Admin aprova via Dashboard → Aprovar Reservas
   - Reserva fica com status "Aprovada"

3. **Volte para a página da sua entidade**

4. **Vá para a aba "Reservas"**
   - Clique na tab "Reservas" no card de Eventos e Reservas

5. **Localize a reserva aprovada**
   - Procure pela reserva que foi aprovada
   - Badge azul "Disponível" 🔵

6. **Clique no botão "Criar Evento"**
   - Botão aparece apenas em reservas aprovadas sem evento

7. **Formulário é preenchido automaticamente**
   - Dados da reserva são copiados para o evento:
     - Título
     - Descrição
     - Data e hora
     - Local
     - Capacidade
     - Data e hora são definidas pela reserva

8. **Revise e ajuste se necessário**

9. **Clique em "Criar Evento"**

10. **Evento e reserva são vinculados automaticamente**
    - `eventos.reserva_id` = ID da reserva
    - `reservas.evento_id` = ID do evento

11. **Aguarde aprovação do evento**
    - Admin aprova via Dashboard → Aprovar Eventos

12. **Evento aparece publicamente** ✅
    - Badge: "Evento Ativo" 🟢

---

## 🎨 Funcionalidades Especiais

### ✨ Preencher Reserva com Dados de Evento

Se você criou um evento primeiro e agora quer criar a reserva:

1. Vá em "Reservar Sala" ou "Reservar Auditório"
2. **No Step 1**, veja o card azul "Preencher com dados de evento existente"
3. Selecione o evento da lista
4. Clique "Aplicar dados do evento"
5. **Campos preenchidos automaticamente:**
   - Título do evento/capacitação
   - Descrição das pautas
   - Data da reserva
   - Horário de início
   - Horário de término
   - Quantidade de pessoas
6. Ajuste conforme necessário e continue

---

## 🔄 Gerenciar Eventos Existentes

### Ver Todos os Eventos

1. Vá para a página da sua entidade
2. Veja a aba "Eventos" no card "Eventos e Reservas"
3. Todos os eventos aparecem com badges de status

### Editar Evento

1. Localize o evento na lista
2. Clique no ícone de editar (lápis)
3. Faça as alterações
4. Salve

### Excluir Evento

1. Localize o evento na lista
2. Clique no ícone de lixeira
3. Confirme a exclusão

### Vincular Evento a Reserva

1. Evento deve estar aprovado (badge verde ou amarelo)
2. Deve ter reserva aprovada disponível
3. Clique "Vincular a Reserva"
4. Selecione a reserva da lista
5. Confirme
6. Badge muda para "Evento Ativo" 🟢

### Desvincular Evento de Reserva

1. Evento deve estar vinculado
2. Clique "Gerenciar Vinculação"
3. Clique "Desvincular Reserva Atual"
4. Confirme
5. Reserva fica livre (badge "Disponível" 🔵)
6. Evento fica "Aguardando Reserva" 🟡

---

## 📊 Entendendo os Badges de Status

### Eventos:

| Badge | Cor | Significado | Visível Publicamente? |
|-------|-----|-------------|----------------------|
| **Evento Ativo** | 🟢 Verde | Aprovado + Reserva Aprovada | ✅ Sim |
| **Aguardando Reserva** | 🟡 Amarelo | Aprovado + Sem Reserva | ⚠️ Apenas se for online/externo |
| **Reserva Pendente** | 🟠 Laranja | Aprovado + Reserva Pendente | ❌ Não |
| **Aguardando Aprovação** | ⚫ Cinza | Evento Pendente | ❌ Não |
| **Rejeitado** | 🔴 Vermelho | Evento Rejeitado | ❌ Não |

### Reservas:

| Badge | Cor | Significado | Pode Vincular? |
|-------|-----|-------------|----------------|
| **Disponível** | 🔵 Azul | Aprovada + Sem Evento | ✅ Sim |
| **Reserva Ativa** | 🟢 Verde | Aprovada + Com Evento | ❌ Não (já vinculada) |
| **Aguardando Aprovação** | 🟡 Amarelo | Pendente | ❌ Não |
| **Rejeitada** | 🔴 Vermelho | Rejeitada | ❌ Não |
| **Cancelada** | ⚫ Cinza | Cancelada | ❌ Não |

---

## 💡 Dicas e Melhores Práticas

### Para Eventos Online/Externos:
1. Crie o evento diretamente
2. **Desmarque** "Este evento precisa de espaço físico?"
3. Após aprovação, aparece publicamente imediatamente

### Para Eventos Presenciais:
1. **Opção A**: Crie a reserva primeiro, depois "Criar Evento" da reserva
2. **Opção B**: Crie o evento, depois crie reserva (use "Preencher com evento"), depois vincule

### Para Economizar Tempo:
1. Crie o evento com todos os detalhes
2. Ao criar a reserva, use "Preencher com dados de evento"
3. Campos são preenchidos automaticamente!

### Para Trocar Sala/Horário:
1. Crie nova reserva com nova sala/horário
2. Aguarde aprovação da nova reserva
3. Desvincule evento da reserva antiga
4. Vincule evento à nova reserva
5. Reserva antiga fica disponível para outro evento

---

## ⚠️ Regras Importantes

### Aprovação:
- ✅ Eventos e reservas são aprovados **separadamente** pelo admin
- ✅ Cada um tem seu próprio fluxo de aprovação

### Visibilidade Pública:
- ✅ Evento **SEM reserva** (online/externo) → Aparece se aprovado
- ✅ Evento **COM reserva** → Aparece apenas se AMBOS (evento E reserva) aprovados

### Vinculação:
- ✅ Só pode vincular se AMBOS estiverem aprovados
- ✅ Uma reserva pode ter apenas 1 evento por vez
- ✅ Um evento pode ter apenas 1 reserva por vez
- ✅ Pode desvincular e vincular a outro

---

## 🎉 Pronto!

Agora você tem um botão "Criar Evento" acessível diretamente na página da sua organização estudantil!

**Onde está:** EntidadeDetalhes → Card "Eventos e Reservas" → Botão vermelho "Criar Evento" (canto superior direito)

