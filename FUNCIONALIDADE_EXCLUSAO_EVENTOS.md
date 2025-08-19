# 🗑️ **Funcionalidade de Exclusão de Eventos - Dashboard**

## ✅ **Funcionalidade Adicionada:**
A página de **Aprovar Eventos** agora possui a funcionalidade de **excluir eventos permanentemente**.

## 🎯 **Onde Encontrar:**
- **Rota:** `/aprovar-eventos`
- **Acesso:** Apenas para usuários Super Admin
- **Localização:** Dashboard → Botão "Aprovar Eventos"

## 🔧 **Como Funciona:**

### **1. Para Eventos Pendentes:**
- **Botão "Aprovar Evento"** ✅ (verde)
- **Botão "Rejeitar Evento"** ❌ (vermelho)
- **Botão "Excluir Evento"** 🗑️ (vermelho escuro)

### **2. Para Eventos Aprovados/Rejeitados:**
- **Badge de Status** (verde para aprovado, vermelho para rejeitado)
- **Descrição do status**
- **Botão "Excluir"** 🗑️ (vermelho escuro)

## 🚨 **Segurança e Confirmação:**

### **Dialog de Confirmação:**
- ⚠️ **Aviso de ação irreversível**
- **Detalhes completos** do evento
- **Consequências** da exclusão
- **Confirmação dupla** necessária

### **Informações Exibidas:**
- Nome do evento
- Entidade responsável
- Data do evento
- Local
- Capacidade
- Status atual

### **Consequências Alertadas:**
- Evento removido permanentemente
- Todas as inscrições perdidas
- Ação não pode ser desfeita

## 🎨 **Interface:**

### **Botões:**
- **Cor:** Vermelho escuro (`bg-red-700 hover:bg-red-800`)
- **Ícone:** Lixeira (`Trash2`)
- **Estados:** Normal, Hover, Disabled (durante exclusão)

### **Estados de Loading:**
- **Durante exclusão:** "Excluindo..."
- **Botão desabilitado** durante operação
- **Feedback visual** com toast de sucesso/erro

## 🔄 **Fluxo de Exclusão:**

1. **Clique no botão "Excluir"**
2. **Dialog de confirmação abre**
3. **Revisão dos detalhes do evento**
4. **Confirmação da ação**
5. **Exclusão executada**
6. **Toast de sucesso/erro**
7. **Lista atualizada automaticamente**

## 🛡️ **Permissões:**

### **Requisitos:**
- Usuário deve ser **Super Admin**
- Verificação múltipla de permissões
- Acesso restrito à funcionalidade

### **Validações:**
- Evento deve existir
- Evento deve pertencer à entidade
- Usuário deve ter permissão de exclusão

## 📱 **Responsividade:**
- **Mobile:** Botões empilhados verticalmente
- **Desktop:** Botões lado a lado
- **Adaptação automática** para diferentes tamanhos de tela

## 🧪 **Testes Recomendados:**

### **Cenários de Teste:**
1. **Excluir evento pendente**
2. **Excluir evento aprovado**
3. **Excluir evento rejeitado**
4. **Cancelar exclusão**
5. **Verificar feedback visual**
6. **Confirmar atualização da lista**

### **Validações:**
- ✅ Evento removido da lista
- ✅ Toast de sucesso exibido
- ✅ Lista atualizada automaticamente
- ✅ Botões de estado correto
- ✅ Permissões funcionando

## 🔧 **Arquivos Modificados:**

- `src/pages/AprovarEventos.tsx` - Página principal
- `src/hooks/useDeleteEventoAsEntity.ts` - Hook de exclusão
- **Importações:** `Trash2` icon, `useDeleteEventoAsEntity`

## 🎉 **Benefícios:**

1. **Gestão completa** de eventos
2. **Controle administrativo** total
3. **Interface intuitiva** e segura
4. **Feedback visual** claro
5. **Confirmação dupla** para ações críticas
6. **Integração** com sistema existente

---

**A funcionalidade está pronta para uso!** 🚀
