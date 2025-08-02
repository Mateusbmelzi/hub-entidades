export interface CSVExportData {
  [key: string]: string | number | Date;
}

/**
 * Converte dados para formato CSV e faz download
 * @param data Array de objetos para exportar
 * @param filename Nome do arquivo CSV
 * @param headers Cabeçalhos personalizados (opcional)
 */
export const exportToCSV = (
  data: CSVExportData[],
  filename: string,
  headers?: { [key: string]: string }
) => {
  if (data.length === 0) {
    console.warn('Nenhum dado para exportar');
    return;
  }

  // Obter todas as chaves únicas dos dados
  const allKeys = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });

  // Definir ordem das colunas
  const columnOrder = headers ? Object.keys(headers) : Array.from(allKeys);

  // Criar cabeçalhos
  const csvHeaders = columnOrder.map(key => 
    headers?.[key] || key
  ).join(',');

  // Criar linhas de dados
  const csvRows = data.map(item => {
    return columnOrder.map(key => {
      const value = item[key];
      // Escapar vírgulas e aspas no valor
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',');
  });

  // Combinar cabeçalhos e dados
  const csvContent = [csvHeaders, ...csvRows].join('\n');

  // Criar blob e fazer download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Formata data para exibição no CSV
 * @param dateString String de data
 * @returns Data formatada
 */
export const formatDateForCSV = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

/**
 * Formata status para exibição no CSV
 * @param status Status da demonstração
 * @returns Status formatado
 */
export const formatStatusForCSV = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'pendente': 'Pendente',
    'aprovada': 'Aprovada',
    'rejeitada': 'Rejeitada'
  };
  return statusMap[status] || status;
}; 