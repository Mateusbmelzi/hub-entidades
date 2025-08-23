# 🕰️ Input de Data e Hora com Digitação Livre

## 📋 Visão Geral

Implementamos um componente de input de data e hora que permite ao usuário digitar livremente, com correção automática em tempo real e validação inteligente.

## ✨ Funcionalidades

### 🎯 **Formatação Automática**
- **Digite livremente**: `25122024`, `251224`, `25/12/24` → `25/12/2024`
- **Adicione hora**: `25122024 14` → `25/12/2024 14`
- **Complete horário**: `25122024 1430` → `25/12/2024 14:30`

### 🔍 **Validação em Tempo Real**
- ✅ **Formato correto**: `25/12/2024 14:30`
- ❌ **Data inválida**: `32/13/2024 25:70`
- ⚠️ **Data no passado**: `25/12/2023 14:30`

### 💡 **Sugestões Inteligentes**
- **Campo vazio**: Mostra horários comuns para hoje e amanhã
- **Data parcial**: Sugere horários comuns (09:00, 14:00, 19:00)
- **Clique para selecionar**: Sugestões clicáveis

### 🎨 **Feedback Visual**
- **✓ Verde**: Data válida
- **✗ Vermelho**: Data inválida
- **🕐 Cinza**: Campo vazio
- **Mensagens**: Erros e dicas específicas

## 🚀 Como Usar

### **1. Importar o Componente**
```tsx
import { DateTimeInput } from '@/components/ui/datetime-input';
```

### **2. Estado do Componente**
```tsx
const [dataEvento, setDataEvento] = useState('');
const [dateTimeError, setDateTimeError] = useState('');

const handleDateTimeChange = (value: string) => {
  setDataEvento(value);
  if (dateTimeError) {
    setDateTimeError('');
  }
};
```

### **3. Usar no JSX**
```tsx
<DateTimeInput
  id="data-evento"
  label="Data e Hora do Evento"
  value={dataEvento}
  onChange={handleDateTimeChange}
  required
  error={dateTimeError}
  placeholder="Ex: 25/12/2024 14:30"
/>
```

### **4. Validação no Submit**
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validar data e hora
  const dateValidation = validateDateTime(dataEvento);
  if (!dateValidation.isValid) {
    setDateTimeError(dateValidation.message || 'Data inválida');
    return;
  }
  
  // Converter para Date
  const dateTime = parseDateTime(dataEvento);
  if (!dateTime) {
    setDateTimeError('Erro ao processar data e hora');
    return;
  }
  
  // Usar a data convertida
  const eventData = {
    // ... outros campos
    data_evento: dateTime.toISOString(),
  };
  
  // Enviar dados...
};
```

## 🔧 Exemplos de Uso

### **Digite Apenas Números**
```
Usuário digita: "25122024"
Resultado: "25/12/2024"

Usuário digita: "25122024 14"
Resultado: "25/12/2024 14"

Usuário digita: "25122024 1430"
Resultado: "25/12/2024 14:30"
```

### **Formatos Aceitos Durante a Digitação**
```
"25" → "25"
"2512" → "25/12"
"251224" → "25/12/24"
"25122024" → "25/12/2024"
"25122024 14" → "25/12/2024 14"
"25122024 1430" → "25/12/2024 14:30"
```

### **Validações**
```
✅ "25/12/2024 14:30" - Válido
❌ "32/12/2024 14:30" - Dia inválido
❌ "25/13/2024 14:30" - Mês inválido
❌ "25/12/2023 14:30" - Data no passado
❌ "25/12/2024 25:30" - Hora inválida
❌ "25/12/2024 14:70" - Minuto inválido
```

## 🛠️ Funções Utilitárias

### **`formatDateTimeInput(value: string): string`**
- Formata automaticamente números para DD/MM/AAAA HH:MM
- Remove caracteres não numéricos
- Adiciona barras e dois pontos automaticamente

### **`validateDateTime(value: string): { isValid: boolean; message?: string }`**
- Valida formato DD/MM/AAAA HH:MM
- Verifica limites (dia 1-31, mês 1-12, etc.)
- Valida se data não está no passado
- Retorna mensagem específica de erro

### **`parseDateTime(value: string): Date | null`**
- Converte DD/MM/AAAA HH:MM para objeto Date
- Retorna null se formato inválido
- Usado para converter para ISO string

### **`getDateTimeSuggestions(value: string): string[]`**
- Gera sugestões baseadas no input atual
- Horários comuns para hoje e amanhã
- Horários para data específica

## 🎯 Vantagens da Implementação

### **1. UX Melhorada**
- **Digitação natural**: Usuário digita como está acostumado
- **Correção automática**: Não precisa se preocupar com formatação
- **Feedback imediato**: Vê erros em tempo real
- **Sugestões úteis**: Acelera preenchimento

### **2. Validação Robusta**
- **Múltiplas validações**: Formato, limites, datas válidas
- **Mensagens específicas**: Erro claro para cada problema
- **Prevenção de erros**: Não permite envio com data inválida

### **3. Flexibilidade**
- **Múltiplos formatos**: Aceita vários padrões de digitação
- **Reutilizável**: Pode ser usado em qualquer formulário
- **Customizável**: Props para label, placeholder, erro

### **4. Performance**
- **Formatação eficiente**: Processamento rápido em tempo real
- **Debounce implícito**: Validação não trava interface
- **Memoização**: Sugestões calculadas quando necessário

## 🧪 Casos de Teste

### **Digitação Progressiva**
- [ ] "2" → "2"
- [ ] "25" → "25"
- [ ] "2512" → "25/12"
- [ ] "251224" → "25/12/24"
- [ ] "25122024" → "25/12/2024"
- [ ] "25122024 1" → "25/12/2024 1"
- [ ] "25122024 14" → "25/12/2024 14"
- [ ] "25122024 143" → "25/12/2024 14:3"
- [ ] "25122024 1430" → "25/12/2024 14:30"

### **Validações**
- [ ] Data válida no futuro → ✅ Verde
- [ ] Data no passado → ❌ Erro
- [ ] Dia inválido (32) → ❌ Erro
- [ ] Mês inválido (13) → ❌ Erro
- [ ] Hora inválida (25) → ❌ Erro
- [ ] Minuto inválido (70) → ❌ Erro

### **Sugestões**
- [ ] Campo vazio → Mostra sugestões para hoje/amanhã
- [ ] "25/12/2024" → Mostra horários comuns
- [ ] Clicar sugestão → Preenche campo

## 📱 Interface Móvel

- **Touch-friendly**: Botões grandes para sugestões
- **Keyboard**: Teclado numérico automático
- **Scroll**: Lista de sugestões rolável
- **Responsive**: Adapta ao tamanho da tela

## 🔄 Migração dos Inputs Existentes

### **Antes (datetime-local)**
```tsx
<Input
  type="datetime-local"
  value={dataEvento}
  onChange={(e) => setDataEvento(e.target.value)}
/>
```

### **Depois (DateTimeInput)**
```tsx
<DateTimeInput
  value={dataEvento}
  onChange={handleDateTimeChange}
  error={dateTimeError}
/>
```

## 🎊 Resultado Final

Agora os usuários podem:
1. **Digitar naturalmente**: `25122024 1430`
2. **Ver formatação automática**: `25/12/2024 14:30`
3. **Receber feedback imediato**: ✅ ou ❌
4. **Usar sugestões**: Clique para preencher
5. **Confiar na validação**: Impossível enviar data inválida

A experiência fica muito mais fluida e intuitiva! 🚀✨
