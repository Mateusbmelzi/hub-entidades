# 🎯 Sistema de Filtros de Eventos Simplificado

## ✨ **Visão Geral**

Implementamos um sistema de filtros **simples e intuitivo** para a página de eventos, com **2 filtros essenciais** e uma **busca inteligente** que permite encontrar eventos por organização estudantil.

## 🔍 **Filtros Disponíveis**

### **1. 🎯 Filtro por Área de Atuação**
- **Funcionalidade**: Filtra eventos por área de atuação específica
- **Áreas disponíveis**: Todas as áreas definidas em `AREAS_ATUACAO`
- **Como usar**: Selecione uma ou mais áreas de interesse
- **Exemplo**: Mostrar apenas eventos de "Tecnologia" ou "Consultoria e Negócios"

### **2. 💖 Filtro Personalizado (Inteligente)**
- **Funcionalidade**: **Ordena eventos por relevância** baseada nas áreas de interesse do usuário
- **Como funciona**: 
  - Analisa as áreas de interesse cadastradas no perfil do usuário
  - Calcula um score de relevância para cada evento
  - Ordena eventos do mais relevante para o menos relevante
- **Score de relevância**:
  - 🟢 **Alta Relevância** (score > 70%): Eventos muito relacionados às suas áreas
  - 🟡 **Relevante** (score 30-70%): Eventos moderadamente relacionados
  - 🔵 **Relacionado** (score 1-30%): Eventos com alguma relação
  - ⚪ **Sem relação** (score 0%): Eventos não relacionados

### **3. 🔍 Busca Inteligente**
- **Funcionalidade**: Busca por **nome do evento**, **organização estudantil**, **descrição** ou **local**
- **Como usar**: Digite na barra de busca
- **Exemplo**: Digite "Consilium" para ver todos os eventos dessa organização
- **Dica**: A busca é inteligente e encontra correspondências parciais

## 🚀 **Como Usar**

### **Passo 1: Buscar por Organização**
1. **Digite o nome da organização** na barra de busca
2. **Exemplo**: "FOX BAJA", "Consilium", "Blockchain Insper"
3. **Resultado**: Todos os eventos da organização aparecerão

### **Passo 2: Filtrar por Área**
1. Clique no botão **"Filtros"** (ícone de filtro)
2. Selecione as **áreas de atuação** desejadas
3. Clique em **"Aplicar Filtros"**

### **Passo 3: Ativar Filtro Personalizado**
1. No popover de filtros, ative o **"Filtro Personalizado"**
2. Os eventos serão **ordenados por relevância** baseada no seu perfil
3. Veja os indicadores de relevância nos cards dos eventos

## 🎨 **Indicadores Visuais**

### **Badges de Filtros Ativos**
- **Filtros de Status**: Futuros, Próximos, Finalizados
- **Filtros de Área**: Área de atuação selecionada
- **Filtro Personalizado**: Badge especial com ícone de coração

### **Indicadores de Relevância**
Quando o filtro personalizado está ativo, cada evento mostra:
- 🟢 **Alta Relevância**: Eventos muito relacionados às suas áreas
- 🟡 **Relevante**: Eventos moderadamente relacionados
- 🔵 **Relacionado**: Eventos com alguma relação

### **Dica de Busca**
- **💡 Dica** visível na barra de busca
- **Placeholder** explicativo
- **Busca inteligente** por organização

## 🧠 **Algoritmo de Personalização**

### **Cálculo do Score**
```typescript
const getPersonalizedScore = (evento) => {
  const userAreas = profile.area_interesse; // Áreas do usuário
  const eventoAreas = evento.area_atuacao; // Áreas do evento
  
  // Contar áreas que coincidem
  const matchingAreas = eventoAreas.filter(area => userAreas.includes(area));
  
  // Score baseado na porcentagem de match
  return matchingAreas.length / Math.max(userAreas.length, eventoAreas.length);
};
```

### **Exemplo de Cálculo**
- **Usuário**: Interesse em ["Tecnologia", "Consultoria"]
- **Evento A**: Áreas ["Tecnologia", "Finanças"]
- **Score A**: 1/2 = 50% → **Relevante**

- **Evento B**: Áreas ["Tecnologia", "Consultoria"]
- **Score B**: 2/2 = 100% → **Alta Relevância**

## 🔧 **Funcionalidades Técnicas**

### **Estado dos Filtros**
```typescript
const [selectedAreaFilters, setSelectedAreaFilters] = useState<string[]>([]);
const [enablePersonalizedFilter, setEnablePersonalizedFilter] = useState(false);
```

### **Filtragem e Ordenação**
```typescript
// Filtragem básica
const filteredEventos = eventos.filter(evento => {
  const matchesSearch = 
    evento.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.local?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.entidades?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
  
  const matchesAreaFilter = selectedAreaFilters.length === 0 || 
                           selectedAreaFilters.some(selectedArea => 
                             evento.area_atuacao.includes(selectedArea)
                           );
  
  return matchesSearch && matchesAreaFilter;
});

// Ordenação personalizada
const sortedEventos = enablePersonalizedFilter 
  ? [...filteredEventos].sort((a, b) => {
      const scoreA = getPersonalizedScore(a);
      const scoreB = getPersonalizedScore(b);
      return scoreB - scoreA; // Decrescente
    })
  : filteredEventos;
```

## 📱 **Interface Responsiva**

### **Desktop**
- Filtros organizados verticalmente
- Popover limpo e focado
- Dica de busca visível

### **Mobile**
- Filtros empilhados verticalmente
- Busca otimizada para touch
- Interface simplificada

## 🎯 **Casos de Uso**

### **Caso 1: Buscar Eventos de uma Organização**
1. **Digite o nome da organização** na busca
2. **Exemplo**: "FOX BAJA"
3. **Resultado**: Todos os eventos da FOX BAJA aparecerão

### **Caso 2: Filtrar por Área de Interesse**
1. **Abra os filtros**
2. **Selecione áreas** como "Tecnologia" e "Consultoria"
3. **Veja eventos** relacionados a essas áreas

### **Caso 3: Usar Filtro Personalizado**
1. **Ative o filtro personalizado**
2. **Veja eventos ordenados** por relevância
3. **Identifique eventos de alta relevância** (badge verde)

## 🚀 **Vantagens da Nova Interface**

### **UX Melhorada**
- ✅ **Interface mais limpa** e focada
- ✅ **Menos opções** para reduzir confusão
- ✅ **Busca inteligente** por organização
- ✅ **Filtros essenciais** mantidos

### **Funcionalidade Mantida**
- ✅ **Busca por entidade** via barra de busca
- ✅ **Filtros por área** funcionando perfeitamente
- ✅ **Filtro personalizado** com algoritmo inteligente
- ✅ **Indicadores visuais** para relevância

## 🎉 **Resultado Final**

O sistema simplificado oferece:
1. **Interface mais limpa** e intuitiva
2. **Busca inteligente** por organização estudantil
3. **Filtros essenciais** para áreas de atuação
4. **Personalização inteligente** baseada no perfil
5. **UX otimizada** para todos os usuários

**Agora encontrar eventos é muito mais simples e intuitivo!** 🚀✨

**💡 Dica**: Para encontrar eventos de uma organização específica, simplesmente digite o nome dela na barra de busca!
