import { ReservaDetalhada, STATUS_LABELS, TIPO_RESERVA_LABELS } from '@/types/reserva';

export interface ExportOptions {
  format: 'excel' | 'csv' | 'pdf';
  includeDetails?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export const exportReservas = (
  reservas: ReservaDetalhada[],
  options: ExportOptions
): void => {
  switch (options.format) {
    case 'excel':
      exportToExcel(reservas, options);
      break;
    case 'csv':
      exportToCSV(reservas, options);
      break;
    case 'pdf':
      exportToPDF(reservas, options);
      break;
    default:
      throw new Error('Formato de exportação não suportado');
  }
};

const exportToExcel = (reservas: ReservaDetalhada[], options: ExportOptions): void => {
  // Para Excel, vamos usar CSV com extensão .xlsx
  const csvContent = generateCSVContent(reservas, options);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `reservas_${new Date().toISOString().split('T')[0]}.xlsx`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToCSV = (reservas: ReservaDetalhada[], options: ExportOptions): void => {
  const csvContent = generateCSVContent(reservas, options);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `reservas_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToPDF = (reservas: ReservaDetalhada[], options: ExportOptions): void => {
  // Para PDF, vamos criar um HTML e usar window.print()
  const htmlContent = generatePDFContent(reservas, options);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
};

const generateCSVContent = (reservas: ReservaDetalhada[], options: ExportOptions): string => {
  const headers = [
    'ID',
    'Data da Reserva',
    'Horário Início',
    'Horário Término',
    'Tipo de Reserva',
    'Status',
    'Nome do Solicitante',
    'Telefone',
    'Quantidade de Pessoas',
    'Nome do Evento',
    'Descrição do Evento',
    'Nome da Entidade',
    'Data de Criação',
    'Data de Aprovação',
    'Aprovador',
    'Comentário de Aprovação'
  ];

  if (options.includeDetails) {
    headers.push(
      'Palestrante Externo',
      'Nome do Palestrante',
      'Apresentação do Palestrante',
      'Pessoa Pública',
      'Necessidade Sala Plana',
      'Motivo Sala Plana',
      'Sistema de Som',
      'Projetor',
      'Iluminação Especial',
      'Montagem de Palco',
      'Gravação',
      'Motivo Gravação',
      'Equipamentos Adicionais',
      'Suporte Técnico',
      'Detalhes Suporte Técnico',
      'Configuração da Sala',
      'Motivo Configuração',
      'Alimentação',
      'Detalhes Alimentação',
      'Custo Alimentação',
      'Segurança',
      'Detalhes Segurança',
      'Controle de Acesso',
      'Detalhes Controle de Acesso',
      'Limpeza Especial',
      'Detalhes Limpeza Especial',
      'Manutenção',
      'Detalhes Manutenção',
      'Observações'
    );
  }

  const csvRows = [headers.join(',')];

  reservas.forEach(reserva => {
    const row = [
      escapeCSV(reserva.id),
      escapeCSV(new Date(reserva.data_reserva + 'T00:00:00').toLocaleDateString('pt-BR')),
      escapeCSV(reserva.horario_inicio),
      escapeCSV(reserva.horario_termino),
      escapeCSV(TIPO_RESERVA_LABELS[reserva.tipo_reserva]),
      escapeCSV(STATUS_LABELS[reserva.status]),
      escapeCSV(reserva.nome_solicitante),
      escapeCSV(reserva.telefone_solicitante),
      escapeCSV(reserva.quantidade_pessoas.toString()),
      escapeCSV(reserva.nome_evento || ''),
      escapeCSV(reserva.descricao_evento || ''),
      escapeCSV(reserva.nome_entidade || ''),
      escapeCSV(new Date(reserva.created_at).toLocaleDateString('pt-BR')),
      escapeCSV(reserva.data_aprovacao ? new Date(reserva.data_aprovacao).toLocaleDateString('pt-BR') : ''),
      escapeCSV(reserva.aprovador_email || ''),
      escapeCSV(reserva.comentario_aprovacao || '')
    ];

    if (options.includeDetails) {
      row.push(
        escapeCSV(reserva.tem_palestrante_externo ? 'Sim' : 'Não'),
        escapeCSV(reserva.nome_palestrante_externo || ''),
        escapeCSV(reserva.apresentacao_palestrante_externo || ''),
        escapeCSV(reserva.eh_pessoa_publica ? 'Sim' : 'Não'),
        escapeCSV(reserva.necessidade_sala_plana ? 'Sim' : 'Não'),
        escapeCSV(reserva.motivo_sala_plana || ''),
        escapeCSV(reserva.precisa_sistema_som ? 'Sim' : 'Não'),
        escapeCSV(reserva.precisa_projetor ? 'Sim' : 'Não'),
        escapeCSV(reserva.precisa_iluminacao_especial ? 'Sim' : 'Não'),
        escapeCSV(reserva.precisa_montagem_palco ? 'Sim' : 'Não'),
        escapeCSV(reserva.precisa_gravacao ? 'Sim' : 'Não'),
        escapeCSV(reserva.motivo_gravacao || ''),
        escapeCSV(reserva.equipamentos_adicionais || ''),
        escapeCSV(reserva.precisa_suporte_tecnico ? 'Sim' : 'Não'),
        escapeCSV(reserva.detalhes_suporte_tecnico || ''),
        escapeCSV(reserva.configuracao_sala || ''),
        escapeCSV(reserva.motivo_configuracao_sala || ''),
        escapeCSV(reserva.precisa_alimentacao ? 'Sim' : 'Não'),
        escapeCSV(reserva.detalhes_alimentacao || ''),
        escapeCSV(reserva.custo_estimado_alimentacao?.toString() || ''),
        escapeCSV(reserva.precisa_seguranca ? 'Sim' : 'Não'),
        escapeCSV(reserva.detalhes_seguranca || ''),
        escapeCSV(reserva.precisa_controle_acesso ? 'Sim' : 'Não'),
        escapeCSV(reserva.detalhes_controle_acesso || ''),
        escapeCSV(reserva.precisa_limpeza_especial ? 'Sim' : 'Não'),
        escapeCSV(reserva.detalhes_limpeza_especial || ''),
        escapeCSV(reserva.precisa_manutencao ? 'Sim' : 'Não'),
        escapeCSV(reserva.detalhes_manutencao || ''),
        escapeCSV(reserva.observacoes || '')
      );
    }

    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};

const generatePDFContent = (reservas: ReservaDetalhada[], options: ExportOptions): string => {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Relatório de Reservas - ${currentDate}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #333; margin-bottom: 10px; }
        .header p { color: #666; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .status-pendente { background-color: #fff3cd; }
        .status-aprovada { background-color: #d4edda; }
        .status-rejeitada { background-color: #f8d7da; }
        .status-cancelada { background-color: #e2e3e5; }
        .summary { margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Relatório de Reservas</h1>
        <p>Gerado em: ${currentDate}</p>
        <p>Total de reservas: ${reservas.length}</p>
      </div>
  `;

  // Resumo por status
  const statusCount = reservas.reduce((acc, reserva) => {
    acc[reserva.status] = (acc[reserva.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  html += `
    <div class="summary">
      <h3>Resumo por Status</h3>
      <ul>
        ${Object.entries(statusCount).map(([status, count]) => 
          `<li>${STATUS_LABELS[status as keyof typeof STATUS_LABELS]}: ${count}</li>`
        ).join('')}
      </ul>
    </div>
  `;

  // Tabela de reservas
  html += `
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Horário</th>
          <th>Tipo</th>
          <th>Status</th>
          <th>Solicitante</th>
          <th>Pessoas</th>
          <th>Evento</th>
          <th>Entidade</th>
        </tr>
      </thead>
      <tbody>
  `;

  reservas.forEach(reserva => {
    const statusClass = `status-${reserva.status}`;
    html += `
      <tr class="${statusClass}">
        <td>${new Date(reserva.data_reserva + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
        <td>${reserva.horario_inicio} - ${reserva.horario_termino}</td>
        <td>${TIPO_RESERVA_LABELS[reserva.tipo_reserva]}</td>
        <td>${STATUS_LABELS[reserva.status]}</td>
        <td>${reserva.nome_solicitante}</td>
        <td>${reserva.quantidade_pessoas}</td>
        <td>${reserva.nome_evento || '-'}</td>
        <td>${reserva.nome_entidade || '-'}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    <div class="no-print">
      <p><em>Use Ctrl+P para imprimir este relatório</em></p>
    </div>
    </body>
    </html>
  `;

  return html;
};

const escapeCSV = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

// Função para gerar estatísticas das reservas
export const generateReservasStats = (reservas: ReservaDetalhada[]) => {
  const total = reservas.length;
  const statusCount = reservas.reduce((acc, reserva) => {
    acc[reserva.status] = (acc[reserva.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tipoCount = reservas.reduce((acc, reserva) => {
    acc[reserva.tipo_reserva] = (acc[reserva.tipo_reserva] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const entidadeCount = reservas.reduce((acc, reserva) => {
    const entidade = reserva.nome_entidade || 'Sem entidade';
    acc[entidade] = (acc[entidade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topEntidades = Object.entries(entidadeCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return {
    total,
    statusCount,
    tipoCount,
    entidadeCount,
    topEntidades,
    pendentes: statusCount.pendente || 0,
    aprovadas: statusCount.aprovada || 0,
    rejeitadas: statusCount.rejeitada || 0,
    canceladas: statusCount.cancelada || 0
  };
};
