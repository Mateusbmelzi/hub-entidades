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

export const exportDashboardToPDF = (data: DashboardDataForExport) => {
  const doc = new jsPDF();
  
  // Configurações do documento
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Título principal
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Indicadores - Hub de Entidades', pageWidth / 2, 30, { align: 'center' });
  
  // Data de geração
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Gerado em: ${dataAtual}`, pageWidth / 2, 45, { align: 'center' });
  
  let yPosition = 70;
  
  // Seção 1: Indicadores Principais
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('📊 Indicadores Principais', margin, yPosition);
  yPosition += 20;
  
  // Cards dos indicadores principais
  const indicadoresData = [
    ['Total de Alunos', data.totalAlunos?.toLocaleString('pt-BR') || '0'],
    ['Organizações', data.totalEntidades?.toLocaleString('pt-BR') || '0'],
    ['Demonstrações de Interesse', data.totalDemonstracoes?.toLocaleString('pt-BR') || '0'],
    ['Total de Eventos', data.totalEventos?.toLocaleString('pt-BR') || '0']
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Indicador', 'Valor']],
    body: indicadoresData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 12 },
    styles: { fontSize: 11 },
    margin: { left: margin, right: margin }
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 20;
  
  // Seção 2: Estatísticas de Aprovação de Eventos
  if (data.eventosAprovacao) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('✅ Estatísticas de Aprovação de Eventos', margin, yPosition);
    yPosition += 20;
    
    const aprovacaoData = [
      ['Total de Eventos', data.eventosAprovacao.total],
      ['Eventos Pendentes', data.eventosAprovacao.pendentes],
      ['Eventos Aprovados', data.eventosAprovacao.aprovados],
      ['Eventos Rejeitados', data.eventosAprovacao.rejeitados],
      ['Taxa de Aprovação', data.eventosAprovacao.taxaAprovacao]
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: aprovacaoData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94], textColor: 255, fontSize: 12 },
      styles: { fontSize: 11 },
      margin: { left: margin, right: margin }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }
  
  // Verificar se há espaço para a próxima seção
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 30;
  }
  
  // Seção 3: Taxa de Conversão das Entidades
  if (data.taxaConversaoEntidades && data.taxaConversaoEntidades.length > 0) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('🔄 Taxa de Conversão das Entidades', margin, yPosition);
    yPosition += 20;
    
    const conversaoData = data.taxaConversaoEntidades.map(entidade => [
      entidade.nome,
      entidade.total_demonstracoes,
      entidade.total_participantes_eventos,
      `${entidade.taxa_conversao}%`
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Entidade', 'Demonstrações', 'Participantes', 'Taxa de Conversão']],
      body: conversaoData,
      theme: 'grid',
      headStyles: { fillColor: [168, 85, 247], textColor: 255, fontSize: 12 },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 40, halign: 'center' }
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }
  
  // Verificar se há espaço para a próxima seção
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 30;
  }
  
  // Seção 4: Top Eventos com Mais Inscritos
  if (data.topEventos && data.topEventos.length > 0) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('🏆 Top Eventos com Mais Inscritos', margin, yPosition);
    yPosition += 20;
    
    const topEventosData = data.topEventos.map((evento, index) => [
      `${index + 1}º`,
      evento.nome_evento,
      evento.total_inscricoes
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Ranking', 'Nome do Evento', 'Total de Inscrições']],
      body: topEventosData,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11], textColor: 255, fontSize: 12 },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 120 },
        2: { cellWidth: 40, halign: 'center' }
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }
  
  // Verificar se há espaço para a próxima seção
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 30;
  }
  
  // Seção 5: Top Entidades por Interesse
  if (data.topEntidadesInteresse && data.topEntidadesInteresse.length > 0) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('⭐ Top Entidades por Interesse', margin, yPosition);
    yPosition += 20;
    
    const topEntidadesData = data.topEntidadesInteresse.map((entidade, index) => [
      `${index + 1}º`,
      entidade.nome,
      entidade.total_interesses
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Ranking', 'Nome da Entidade', 'Total de Interesses']],
      body: topEntidadesData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 12 },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 120 },
        2: { cellWidth: 40, halign: 'center' }
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }
  
  // Verificar se há espaço para a próxima seção
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 30;
  }
  
  // Seção 6: Afinidade Curso-Área de Atuação
  if (data.afinidadesCursoArea && data.afinidadesCursoArea.length > 0) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('🎯 Afinidade Curso-Área de Atuação', margin, yPosition);
    yPosition += 20;
    
    const afinidadesData = data.afinidadesCursoArea.map((afinidade, index) => [
      `${index + 1}º`,
      afinidade.curso_estudante,
      afinidade.area_atuacao,
      afinidade.total_interesses
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Ranking', 'Curso do Estudante', 'Área de Atuação', 'Total de Interesses']],
      body: afinidadesData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 12 },
      styles: { fontSize: 9 },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 60 },
        3: { cellWidth: 40, halign: 'center' }
      }
    });
  }
  
  // Rodapé
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  }
  
  // Salvar o PDF
  const fileName = `relatorio-indicadores-hub-entidades-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  return fileName;
};
