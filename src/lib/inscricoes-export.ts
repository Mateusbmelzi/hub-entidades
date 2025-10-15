import { InscritoEvento } from '@/hooks/useInscritosEvento';

export function exportarInscritosCSV(inscritos: InscritoEvento[], camposPersonalizados: string[] = []) {
  if (inscritos.length === 0) {
    throw new Error('Nenhum inscrito para exportar');
  }

  const headers = [
    'Número',
    'Nome Completo',
    'Email',
    'Curso',
    'Semestre',
    'Status',
    'Data de Inscrição'
  ];

  // Adicionar headers para campos personalizados
  const allHeaders = [...headers, ...camposPersonalizados];

  const csvContent = [
    allHeaders.join(','),
    ...inscritos.map(inscrito => {
      const row = [
        inscrito.numero_inscricao,
        `"${inscrito.nome_completo}"`,
        `"${inscrito.email}"`,
        `"${inscrito.curso || ''}"`,
        inscrito.semestre || '',
        inscrito.status,
        new Date(inscrito.created_at).toLocaleDateString('pt-BR')
      ];

      // Adicionar campos personalizados
      camposPersonalizados.forEach(campo => {
        const valor = inscrito.campos_adicionais?.[campo] || '';
        row.push(`"${valor}"`);
      });

      return row.join(',');
    })
  ].join('\n');

  // Download do arquivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `inscritos_evento_${new Date().getTime()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportarInscritosExcel(inscritos: InscritoEvento[], camposPersonalizados: string[] = []) {
  if (inscritos.length === 0) {
    throw new Error('Nenhum inscrito para exportar');
  }

  // Para Excel, vamos usar uma abordagem mais simples com CSV
  // que pode ser aberto no Excel
  const headers = [
    'Número',
    'Nome Completo',
    'Email',
    'Curso',
    'Semestre',
    'Status',
    'Data de Inscrição'
  ];

  const allHeaders = [...headers, ...camposPersonalizados];

  const csvContent = [
    allHeaders.join('\t'), // Usar tab para melhor compatibilidade com Excel
    ...inscritos.map(inscrito => {
      const row = [
        inscrito.numero_inscricao,
        inscrito.nome_completo,
        inscrito.email,
        inscrito.curso || '',
        inscrito.semestre || '',
        inscrito.status,
        new Date(inscrito.created_at).toLocaleDateString('pt-BR')
      ];

      // Adicionar campos personalizados
      camposPersonalizados.forEach(campo => {
        const valor = inscrito.campos_adicionais?.[campo] || '';
        row.push(String(valor));
      });

      return row.join('\t');
    })
  ].join('\n');

  // Download do arquivo
  const blob = new Blob([csvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `inscritos_evento_${new Date().getTime()}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function gerarRelatorioInscritos(inscritos: InscritoEvento[]) {
  const stats = {
    total: inscritos.length,
    confirmados: inscritos.filter(i => i.status === 'confirmado').length,
    lista_espera: inscritos.filter(i => i.status === 'lista_espera').length,
    cancelados: inscritos.filter(i => i.status === 'cancelado').length
  };

  const relatorio = `
RELATÓRIO DE INSCRIÇÕES
========================

Total de Inscritos: ${stats.total}
- Confirmados: ${stats.confirmados}
- Lista de Espera: ${stats.lista_espera}
- Cancelados: ${stats.cancelados}

DETALHES DOS INSCRITOS
======================

${inscritos.map(inscrito => `
${inscrito.numero_inscricao}. ${inscrito.nome_completo}
   Email: ${inscrito.email}
   Curso: ${inscrito.curso || 'Não informado'}
   Semestre: ${inscrito.semestre || 'Não informado'}
   Status: ${inscrito.status}
   Data: ${new Date(inscrito.created_at).toLocaleDateString('pt-BR')}
`).join('\n')}

Gerado em: ${new Date().toLocaleString('pt-BR')}
  `.trim();

  return relatorio;
}

export function downloadRelatorioTexto(relatorio: string, nomeArquivo: string = 'relatorio_inscritos.txt') {
  const blob = new Blob([relatorio], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', nomeArquivo);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
