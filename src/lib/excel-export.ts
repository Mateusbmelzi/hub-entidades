import * as XLSX from 'xlsx';

export interface DashboardDataForExport {
  totalAlunos: number;
  totalEntidades: number;
  totalDemonstracoes: number;
  totalEventos: number;
  taxaConversaoEntidades: Array<{
    nome: string;
    total_demonstracoes: number;
    total_participantes_eventos: number;
    taxa_conversao: number;
  }>;
  topEventos: Array<{
    nome_evento: string;
    total_inscricoes: number;
  }>;
  topEntidadesInteresse: Array<{
    nome: string;
    total_interesses: number;
  }>;
  afinidadesCursoArea: Array<{
    curso_estudante: string;
    area_atuacao: string;
    total_interesses: number;
  }>;
  eventosAprovacao: {
    total: number;
    pendentes: number;
    aprovados: number;
    rejeitados: number;
    taxaAprovacao: string;
  };
}

export const exportDashboardToExcel = (data: DashboardDataForExport) => {
  // Criar um novo workbook
  const workbook = XLSX.utils.book_new();
  
  // Data de geração
  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // 1. Aba: Indicadores Principais
  const indicadoresData = [
    ['📊 INDICADORES PRINCIPAIS - Hub de Entidades'],
    [`Gerado em: ${dataAtual}`],
    [''],
    ['Indicador', 'Valor'],
    ['Total de Alunos', data.totalAlunos?.toLocaleString('pt-BR') || '0'],
    ['Organizações', data.totalEntidades?.toLocaleString('pt-BR') || '0'],
    ['Demonstrações de Interesse', data.totalDemonstracoes?.toLocaleString('pt-BR') || '0'],
    ['Total de Eventos', data.totalEventos?.toLocaleString('pt-BR') || '0']
  ];
  
  const indicadoresSheet = XLSX.utils.aoa_to_sheet(indicadoresData);
  
  // Configurar largura das colunas
  indicadoresSheet['!cols'] = [
    { width: 25 },
    { width: 15 }
  ];
  
  XLSX.utils.book_append_sheet(workbook, indicadoresSheet, 'Indicadores Principais');
  
  // 2. Aba: Estatísticas de Aprovação de Eventos
  if (data.eventosAprovacao) {
    const aprovacaoData = [
      ['✅ ESTATÍSTICAS DE APROVAÇÃO DE EVENTOS'],
      [`Gerado em: ${dataAtual}`],
      [''],
      ['Métrica', 'Valor'],
      ['Total de Eventos', data.eventosAprovacao.total],
      ['Eventos Pendentes', data.eventosAprovacao.pendentes],
      ['Eventos Aprovados', data.eventosAprovacao.aprovados],
      ['Eventos Rejeitados', data.eventosAprovacao.rejeitados],
      ['Taxa de Aprovação', data.eventosAprovacao.taxaAprovacao]
    ];
    
    const aprovacaoSheet = XLSX.utils.aoa_to_sheet(aprovacaoData);
    aprovacaoSheet['!cols'] = [
      { width: 25 },
      { width: 15 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, aprovacaoSheet, 'Aprovação Eventos');
  }
  
  // 3. Aba: Taxa de Conversão das Entidades
  if (data.taxaConversaoEntidades && data.taxaConversaoEntidades.length > 0) {
    const conversaoData = [
      ['🔄 TAXA DE CONVERSÃO DAS ENTIDADES'],
      [`Gerado em: ${dataAtual}`],
      [''],
      ['Entidade', 'Demonstrações', 'Participantes', 'Taxa de Conversão']
    ];
    
    // Adicionar dados das entidades
    data.taxaConversaoEntidades.forEach(entidade => {
      conversaoData.push([
        entidade.nome,
        entidade.total_demonstracoes,
        entidade.total_participantes_eventos,
        `${entidade.taxa_conversao}%`
      ]);
    });
    
    const conversaoSheet = XLSX.utils.aoa_to_sheet(conversaoData);
    conversaoSheet['!cols'] = [
      { width: 40 },
      { width: 15 },
      { width: 15 },
      { width: 20 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, conversaoSheet, 'Taxa Conversão');
  }
  
  // 4. Aba: Top Eventos com Mais Inscritos
  if (data.topEventos && data.topEventos.length > 0) {
    const topEventosData = [
      ['🏆 TOP EVENTOS COM MAIS INSCRITOS'],
      [`Gerado em: ${dataAtual}`],
      [''],
      ['Ranking', 'Nome do Evento', 'Total de Inscrições']
    ];
    
    // Adicionar dados dos eventos
    data.topEventos.forEach((evento, index) => {
      topEventosData.push([
        `${index + 1}º`,
        evento.nome_evento,
        evento.total_inscricoes
      ]);
    });
    
    const topEventosSheet = XLSX.utils.aoa_to_sheet(topEventosData);
    topEventosSheet['!cols'] = [
      { width: 10 },
      { width: 50 },
      { width: 20 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, topEventosSheet, 'Top Eventos');
  }
  
  // 5. Aba: Top Entidades por Interesse
  if (data.topEntidadesInteresse && data.topEntidadesInteresse.length > 0) {
    const topEntidadesData = [
      ['⭐ TOP ENTIDADES POR INTERESSE'],
      [`Gerado em: ${dataAtual}`],
      [''],
      ['Ranking', 'Nome da Entidade', 'Total de Interesses']
    ];
    
    // Adicionar dados das entidades
    data.topEntidadesInteresse.forEach((entidade, index) => {
      topEntidadesData.push([
        `${index + 1}º`,
        entidade.nome,
        entidade.total_interesses
      ]);
    });
    
    const topEntidadesSheet = XLSX.utils.aoa_to_sheet(topEntidadesData);
    topEntidadesSheet['!cols'] = [
      { width: 10 },
      { width: 50 },
      { width: 20 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, topEntidadesSheet, 'Top Entidades');
  }
  
  // 6. Aba: Afinidade Curso-Área de Atuação
  if (data.afinidadesCursoArea && data.afinidadesCursoArea.length > 0) {
    const afinidadesData = [
      ['🎯 AFINIDADE CURSO-ÁREA DE ATUAÇÃO'],
      [`Gerado em: ${dataAtual}`],
      [''],
      ['Ranking', 'Curso do Estudante', 'Área de Atuação', 'Total de Interesses']
    ];
    
    // Adicionar dados das afinidades
    data.afinidadesCursoArea.forEach((afinidade, index) => {
      afinidadesData.push([
        `${index + 1}º`,
        afinidade.curso_estudante,
        afinidade.area_atuacao,
        afinidade.total_interesses
      ]);
    });
    
    const afinidadesSheet = XLSX.utils.aoa_to_sheet(afinidadesData);
    afinidadesSheet['!cols'] = [
      { width: 10 },
      { width: 30 },
      { width: 30 },
      { width: 20 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, afinidadesSheet, 'Afinidades');
  }
  
  // Salvar o arquivo Excel
  const fileName = `relatorio-indicadores-hub-entidades-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
  
  return fileName;
};
