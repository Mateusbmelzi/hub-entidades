import * as XLSX from 'xlsx';

export interface DashboardDataForExport {
  // Indicadores Principais
  totalAlunos: number;
  totalEntidades: number;
  totalDemonstracoes: number;
  totalEventos: number;
  
  // Seção Eventos
  eventosAprovacao: {
    total: number;
    pendentes: number;
    aprovados: number;
    rejeitados: number;
    taxaAprovacao: string;
  };
  topEventos: Array<{
    nome_evento: string;
    total_inscricoes: number;
  }>;
  eventosPorArea: Array<{
    area_atuacao: string;
    total_eventos: number;
  }>;
  eventosPorOrganizacao: Array<{
    organizacao: string;
    total_eventos: number;
  }>;
  
  // Seção Organizações
  taxaConversaoEntidades: Array<{
    nome: string;
    total_demonstracoes: number;
    total_participantes_eventos: number;
    taxa_conversao: number;
  }>;
  topEntidadesInteresse: Array<{
    nome: string;
    total_interesses: number;
  }>;
  demonstracoesPorArea: Array<{
    area_atuacao: string;
    total_demonstracoes: number;
  }>;
  areasEntidades: Array<{
    area_atuacao: string;
    total_entidades: number;
  }>;
  
  // Seção Alunos
  alunosPorCurso: Array<{
    curso: string;
    total_alunos: number;
  }>;
  alunosPorSemestre: Array<{
    semestre: string;
    total_alunos: number;
  }>;
  demonstracoesPorCurso: Array<{
    curso_estudante: string;
    total_demonstracoes: number;
  }>;
  inscricoesPorCurso: Array<{
    curso_estudante: string;
    total_inscricoes: number;
  }>;
  
  // Afinidades
  afinidadesCursoArea: Array<{
    curso_estudante: string;
    area_atuacao: string;
    total_interesses: number;
  }>;
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
  indicadoresSheet['!cols'] = [{ width: 25 }, { width: 15 }];
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
    aprovacaoSheet['!cols'] = [{ width: 25 }, { width: 15 }];
    XLSX.utils.book_append_sheet(workbook, aprovacaoSheet, 'Aprovação Eventos');
  }
  
  // 3. Aba: Top Eventos com Mais Inscritos (COMPLETO - não limitado a top 5)
  if (data.topEventos && data.topEventos.length > 0) {
    const topEventosData = [
      ['🏆 EVENTOS COM MAIS INSCRITOS - RANKING COMPLETO'],
      [`Gerado em: ${dataAtual}`],
      [''],
      ['Ranking', 'Nome do Evento', 'Total de Inscrições']
    ];
    
    // Adicionar TODOS os eventos ordenados
    data.topEventos.forEach((evento, index) => {
      topEventosData.push([
        `${index + 1}º`,
        evento.nome_evento,
        evento.total_inscricoes
      ]);
    });
    
    const topEventosSheet = XLSX.utils.aoa_to_sheet(topEventosData);
    topEventosSheet['!cols'] = [{ width: 10 }, { width: 50 }, { width: 20 }];
    XLSX.utils.book_append_sheet(workbook, topEventosSheet, 'Top Eventos');
  }
  
  // 4. Aba: Eventos por Área de Atuação (COMPLETO)
  if (data.eventosPorArea && data.eventosPorArea.length > 0) {
    const eventosPorAreaData = [
      ['📊 EVENTOS POR ÁREA DE ATUAÇÃO - RANKING COMPLETO'],
      [`Gerado em: ${dataAtual}`],
      [''],
      ['Ranking', 'Área de Atuação', 'Total de Eventos']
    ];
    
    // Adicionar TODAS as áreas ordenadas
    data.eventosPorArea.forEach((area, index) => {
      eventosPorAreaData.push([
        `${index + 1}º`,
        area.area_atuacao,
        area.total_eventos
      ]);
    });
    
    const eventosPorAreaSheet = XLSX.utils.aoa_to_sheet(eventosPorAreaData);
    eventosPorAreaSheet['!cols'] = [{ width: 10 }, { width: 40 }, { width: 20 }];
    XLSX.utils.book_append_sheet(workbook, eventosPorAreaSheet, 'Eventos por Área');
  }
  
  // 5. Aba: Eventos por Organização (COMPLETO)
  if (data.eventosPorOrganizacao && data.eventosPorOrganizacao.length > 0) {
    const eventosPorOrgData = [
      ['🏢 EVENTOS POR ORGANIZAÇÃO - RANKING COMPLETO'],
      [`Gerado em: ${dataAtual}`],
      [''],
      ['Ranking', 'Organização', 'Total de Eventos']
    ];
    
    // Adicionar TODAS as organizações ordenadas
    data.eventosPorOrganizacao.forEach((org, index) => {
      eventosPorOrgData.push([
        `${index + 1}º`,
        org.organizacao,
        org.total_eventos
      ]);
    });
    
    const eventosPorOrgSheet = XLSX.utils.aoa_to_sheet(eventosPorOrgData);
    eventosPorOrgSheet['!cols'] = [{ width: 10 }, { width: 50 }, { width: 20 }];
    XLSX.utils.book_append_sheet(workbook, eventosPorOrgSheet, 'Eventos por Org');
  }
  
  // 6. Aba: Top Entidades por Interesse (COMPLETO - não limitado a top 5)
  if (data.topEntidadesInteresse && data.topEntidadesInteresse.length > 0) {
    const topEntidadesData = [
      ['⭐ ENTIDADES POR INTERESSE - RANKING COMPLETO'],
      [`Gerado em: ${dataAtual}`],
      [''],
      ['Ranking', 'Nome da Entidade', 'Total de Interesses']
    ];
    
    // Adicionar TODAS as entidades ordenadas
    data.topEntidadesInteresse.forEach((entidade, index) => {
      topEntidadesData.push([
        `${index + 1}º`,
        entidade.nome,
        entidade.total_interesses
      ]);
    });
    
    const topEntidadesSheet = XLSX.utils.aoa_to_sheet(topEntidadesData);
    topEntidadesSheet['!cols'] = [{ width: 10 }, { width: 50 }, { width: 20 }];
    XLSX.utils.book_append_sheet(workbook, topEntidadesSheet, 'Top Entidades');
  }
  
  // 7. Aba: Demonstrações por Área (COMPLETO)
  if (data.demonstracoesPorArea && data.demonstracoesPorArea.length > 0) {
    const demonstracoesPorAreaData = [
      ['🎯 DEMONSTRAÇÕES DE INTERESSE POR ÁREA - RANKING COMPLETO'],
      [`Gerado em: ${dataAtual}`],
      [''],
      ['Ranking', 'Área de Atuação', 'Total de Demonstrações']
    ];
    
    // Adicionar TODAS as áreas ordenadas
    data.demonstracoesPorArea.forEach((area, index) => {
      demonstracoesPorAreaData.push([
        `${index + 1}º`,
        area.area_atuacao,
        area.total_demonstracoes
      ]);
    });
    
    const demonstracoesPorAreaSheet = XLSX.utils.aoa_to_sheet(demonstracoesPorAreaData);
    demonstracoesPorAreaSheet['!cols'] = [{ width: 10 }, { width: 40 }, { width: 25 }];
    XLSX.utils.book_append_sheet(workbook, demonstracoesPorAreaSheet, 'Demonstrações por Área');
  }
  
  // 8. Aba: Áreas das Entidades (COMPLETO)
  if (data.areasEntidades && data.areasEntidades.length > 0) {
    const areasEntidadesData = [
      ['🏗️ DISTRIBUIÇÃO DAS ÁREAS DAS ENTIDADES - RANKING COMPLETO'],
      [`Gerado em: ${dataAtual}`],
      [''],
      ['Ranking', 'Área de Atuação', 'Total de Entidades']
    ];
    
    // Adicionar TODAS as áreas ordenadas
    data.areasEntidades.forEach((area, index) => {
      areasEntidadesData.push([
        `${index + 1}º`,
        area.area_atuacao,
        area.total_entidades
      ]);
    });
    
    const areasEntidadesSheet = XLSX.utils.aoa_to_sheet(areasEntidadesData);
    areasEntidadesSheet['!cols'] = [{ width: 10 }, { width: 40 }, { width: 20 }];
    XLSX.utils.book_append_sheet(workbook, areasEntidadesSheet, 'Áreas das Entidades');
  }
  
  // 9. Aba: Alunos por Curso (COMPLETO)
  if (data.alunosPorCurso && data.alunosPorCurso.length > 0) {
    const alunosPorCursoData = [
      ['🎓 ALUNOS POR CURSO - RANKING COMPLETO'],
      [`Gerado em: ${dataAtual}`],
      [''],
      ['Ranking', 'Curso', 'Total de Alunos']
    ];
    
    // Adicionar TODOS os cursos ordenados
    data.alunosPorCurso.forEach((curso, index) => {
      alunosPorCursoData.push([
        `${index + 1}º`,
        curso.curso,
        curso.total_alunos
      ]);
    });
    
    const alunosPorCursoSheet = XLSX.utils.aoa_to_sheet(alunosPorCursoData);
    alunosPorCursoSheet['!cols'] = [{ width: 10 }, { width: 40 }, { width: 20 }];
    XLSX.utils.book_append_sheet(workbook, alunosPorCursoSheet, 'Alunos por Curso');
  }
  
  // 10. Aba: Alunos por Semestre (COMPLETO)
  if (data.alunosPorSemestre && data.alunosPorSemestre.length > 0) {
    const alunosPorSemestreData = [
      ['📚 ALUNOS POR SEMESTRE - RANKING COMPLETO'],
      [`Gerado em: ${dataAtual}`],
      [''],
      ['Ranking', 'Semestre', 'Total de Alunos']
    ];
    
    // Adicionar TODOS os semestres ordenados
    data.alunosPorSemestre.forEach((semestre, index) => {
      alunosPorSemestreData.push([
        `${index + 1}º`,
        semestre.semestre,
        semestre.total_alunos
      ]);
    });
    
    const alunosPorSemestreSheet = XLSX.utils.aoa_to_sheet(alunosPorSemestreData);
    alunosPorSemestreSheet['!cols'] = [{ width: 10 }, { width: 20 }, { width: 20 }];
    XLSX.utils.book_append_sheet(workbook, alunosPorSemestreSheet, 'Alunos por Semestre');
  }
  
  // 11. Aba: Demonstrações por Curso (COMPLETO)
  if (data.demonstracoesPorCurso && data.demonstracoesPorCurso.length > 0) {
    const demonstracoesPorCursoData = [
      ['🎯 DEMONSTRAÇÕES DE INTERESSE POR CURSO - RANKING COMPLETO'],
      [`Gerado em: ${dataAtual}`],
      [''],
      ['Ranking', 'Curso do Estudante', 'Total de Demonstrações']
    ];
    
    // Adicionar TODOS os cursos ordenados
    data.demonstracoesPorCurso.forEach((curso, index) => {
      demonstracoesPorCursoData.push([
        `${index + 1}º`,
        curso.curso_estudante,
        curso.total_demonstracoes
      ]);
    });
    
    const demonstracoesPorCursoSheet = XLSX.utils.aoa_to_sheet(demonstracoesPorCursoData);
    demonstracoesPorCursoSheet['!cols'] = [{ width: 10 }, { width: 40 }, { width: 25 }];
    XLSX.utils.book_append_sheet(workbook, demonstracoesPorCursoSheet, 'Demonstrações por Curso');
  }
  
  // 12. Aba: Inscrições por Curso (COMPLETO)
  if (data.inscricoesPorCurso && data.inscricoesPorCurso.length > 0) {
    const inscricoesPorCursoData = [
      ['📝 INSCRIÇÕES EM EVENTOS POR CURSO - RANKING COMPLETO'],
      [`Gerado em: ${dataAtual}`],
      [''],
      ['Ranking', 'Curso do Estudante', 'Total de Inscrições']
    ];
    
    // Adicionar TODOS os cursos ordenados
    data.inscricoesPorCurso.forEach((curso, index) => {
      inscricoesPorCursoData.push([
        `${index + 1}º`,
        curso.curso_estudante,
        curso.total_inscricoes
      ]);
    });
    
    const inscricoesPorCursoSheet = XLSX.utils.aoa_to_sheet(inscricoesPorCursoData);
    inscricoesPorCursoSheet['!cols'] = [{ width: 10 }, { width: 40 }, { width: 25 }];
    XLSX.utils.book_append_sheet(workbook, inscricoesPorCursoSheet, 'Inscrições por Curso');
  }
  
  // 13. Aba: Taxa de Conversão das Entidades (COMPLETO)
  if (data.taxaConversaoEntidades && data.taxaConversaoEntidades.length > 0) {
    const conversaoData = [
      ['🔄 TAXA DE CONVERSÃO DAS ENTIDADES - RANKING COMPLETO'],
      [`Gerado em: ${dataAtual}`],
      [''],
      ['Ranking', 'Entidade', 'Demonstrações', 'Participantes', 'Taxa de Conversão']
    ];
    
    // Adicionar TODAS as entidades ordenadas por taxa de conversão
    data.taxaConversaoEntidades.forEach((entidade, index) => {
      conversaoData.push([
        `${index + 1}º`,
        entidade.nome,
        entidade.total_demonstracoes,
        entidade.total_participantes_eventos,
        `${entidade.taxa_conversao}%`
      ]);
    });
    
    const conversaoSheet = XLSX.utils.aoa_to_sheet(conversaoData);
    conversaoSheet['!cols'] = [
      { width: 10 },
      { width: 40 },
      { width: 15 },
      { width: 15 },
      { width: 20 }
    ];
    XLSX.utils.book_append_sheet(workbook, conversaoSheet, 'Taxa Conversão');
  }
  
  // 14. Aba: Afinidade Curso-Área de Atuação (COMPLETO)
  if (data.afinidadesCursoArea && data.afinidadesCursoArea.length > 0) {
    const afinidadesData = [
      ['🎯 AFINIDADE CURSO-ÁREA DE ATUAÇÃO - RANKING COMPLETO'],
      [`Gerado em: ${dataAtual}`],
      [''],
      ['Ranking', 'Curso do Estudante', 'Área de Atuação', 'Total de Interesses']
    ];
    
    // Adicionar TODAS as afinidades ordenadas
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
  
  // 15. Aba: Resumo Executivo
  const resumoData = [
    ['📋 RESUMO EXECUTIVO - Hub de Entidades'],
    [`Gerado em: ${dataAtual}`],
    [''],
    ['Seção', 'Total de Registros', 'Descrição'],
    ['Indicadores Principais', '4', 'Métricas gerais do sistema'],
    ['Eventos', data.topEventos?.length || 0, 'Ranking completo de eventos por inscrições'],
    ['Eventos por Área', data.eventosPorArea?.length || 0, 'Distribuição de eventos por área de atuação'],
    ['Eventos por Organização', data.eventosPorOrganizacao?.length || 0, 'Ranking de organizações por eventos'],
    ['Organizações por Interesse', data.topEntidadesInteresse?.length || 0, 'Ranking completo de entidades por demonstrações'],
    ['Demonstrações por Área', data.demonstracoesPorArea?.length || 0, 'Distribuição de interesses por área'],
    ['Áreas das Entidades', data.areasEntidades?.length || 0, 'Distribuição de entidades por área'],
    ['Alunos por Curso', data.alunosPorCurso?.length || 0, 'Distribuição de alunos por curso'],
    ['Alunos por Semestre', data.alunosPorSemestre?.length || 0, 'Distribuição de alunos por semestre'],
    ['Demonstrações por Curso', data.demonstracoesPorCurso?.length || 0, 'Interesses por curso dos estudantes'],
    ['Inscrições por Curso', data.inscricoesPorCurso?.length || 0, 'Participação em eventos por curso'],
    ['Taxa de Conversão', data.taxaConversaoEntidades?.length || 0, 'Efetividade das entidades'],
    ['Afinidades Curso-Área', data.afinidadesCursoArea?.length || 0, 'Correlação entre cursos e áreas']
  ];
  
  const resumoSheet = XLSX.utils.aoa_to_sheet(resumoData);
  resumoSheet['!cols'] = [{ width: 35 }, { width: 20 }, { width: 50 }];
  XLSX.utils.book_append_sheet(workbook, resumoSheet, 'Resumo Executivo');
  
  // Salvar o arquivo Excel
  const fileName = `relatorio-completo-hub-entidades-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
  
  return fileName;
};
