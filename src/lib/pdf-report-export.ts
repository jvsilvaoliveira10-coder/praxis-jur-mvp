import jsPDF from 'jspdf';
import { formatCurrency } from '@/types/finance';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DREData {
  receitas: { tipo: string; valor: number }[];
  deducoes: { tipo: string; valor: number }[];
  despesas: { tipo: string; valor: number }[];
  periodo: { inicio: string; fim: string };
}

interface CashFlowData {
  mes: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

interface TableColumn {
  header: string;
  width: number;
}

interface TableRow {
  [key: string]: string | number;
}

export function generateDREPdf(data: DREData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Demonstrativo de Resultado do Exercício (DRE)', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Period
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Período: ${format(new Date(data.periodo.inicio), 'dd/MM/yyyy', { locale: ptBR })} a ${format(new Date(data.periodo.fim), 'dd/MM/yyyy', { locale: ptBR })}`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );
  yPos += 15;

  // Helper function to add section
  const addSection = (title: string, items: { tipo: string; valor: number }[], isBold = false) => {
    doc.setFontSize(11);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(title, 20, yPos);
    yPos += 8;

    items.forEach(item => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`  ${item.tipo}`, 25, yPos);
      doc.text(formatCurrency(item.valor), 180, yPos, { align: 'right' });
      yPos += 6;
    });

    yPos += 4;
  };

  // Receitas
  const totalReceitas = data.receitas.reduce((sum, r) => sum + r.valor, 0);
  addSection('RECEITA BRUTA', data.receitas);
  doc.setFont('helvetica', 'bold');
  doc.text('= RECEITA TOTAL', 20, yPos);
  doc.text(formatCurrency(totalReceitas), 180, yPos, { align: 'right' });
  yPos += 12;

  // Deduções
  const totalDeducoes = data.deducoes.reduce((sum, d) => sum + d.valor, 0);
  if (data.deducoes.length > 0) {
    addSection('DEDUÇÕES', data.deducoes);
    const receitaLiquida = totalReceitas - totalDeducoes;
    doc.setFont('helvetica', 'bold');
    doc.text('= RECEITA LÍQUIDA', 20, yPos);
    doc.text(formatCurrency(receitaLiquida), 180, yPos, { align: 'right' });
    yPos += 12;
  }

  // Despesas
  const totalDespesas = data.despesas.reduce((sum, d) => sum + d.valor, 0);
  addSection('DESPESAS OPERACIONAIS', data.despesas);
  doc.setFont('helvetica', 'bold');
  doc.text('= TOTAL DESPESAS', 20, yPos);
  doc.text(formatCurrency(totalDespesas), 180, yPos, { align: 'right' });
  yPos += 12;

  // Resultado
  const resultado = totalReceitas - totalDeducoes - totalDespesas;
  doc.setDrawColor(0);
  doc.line(20, yPos, 190, yPos);
  yPos += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('= RESULTADO OPERACIONAL', 20, yPos);
  doc.setTextColor(resultado >= 0 ? 0 : 255, resultado >= 0 ? 128 : 0, 0);
  doc.text(formatCurrency(resultado), 180, yPos, { align: 'right' });

  // Footer
  doc.setTextColor(0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  doc.save(`DRE_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function generateCashFlowPdf(data: CashFlowData[], periodo: { inicio: string; fim: string }): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Fluxo de Caixa', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Period
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Período: ${format(new Date(periodo.inicio), 'dd/MM/yyyy', { locale: ptBR })} a ${format(new Date(periodo.fim), 'dd/MM/yyyy', { locale: ptBR })}`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );
  yPos += 20;

  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPos, 170, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Mês', 25, yPos + 7);
  doc.text('Receitas', 70, yPos + 7);
  doc.text('Despesas', 110, yPos + 7);
  doc.text('Saldo', 155, yPos + 7);
  yPos += 14;

  // Table rows
  let totalReceitas = 0;
  let totalDespesas = 0;
  let saldoAcumulado = 0;

  doc.setFont('helvetica', 'normal');
  data.forEach((row, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(20, yPos - 4, 170, 8, 'F');
    }
    
    doc.text(row.mes, 25, yPos);
    doc.text(formatCurrency(row.receitas), 70, yPos);
    doc.text(formatCurrency(row.despesas), 110, yPos);
    doc.setTextColor(row.saldo >= 0 ? 0 : 255, row.saldo >= 0 ? 128 : 0, 0);
    doc.text(formatCurrency(row.saldo), 155, yPos);
    doc.setTextColor(0);
    
    totalReceitas += row.receitas;
    totalDespesas += row.despesas;
    saldoAcumulado += row.saldo;
    
    yPos += 8;
  });

  // Totals
  yPos += 4;
  doc.setDrawColor(0);
  doc.line(20, yPos, 190, yPos);
  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', 25, yPos);
  doc.text(formatCurrency(totalReceitas), 70, yPos);
  doc.text(formatCurrency(totalDespesas), 110, yPos);
  doc.setTextColor(saldoAcumulado >= 0 ? 0 : 255, saldoAcumulado >= 0 ? 128 : 0, 0);
  doc.text(formatCurrency(saldoAcumulado), 155, yPos);

  // Footer
  doc.setTextColor(0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  doc.save(`FluxoCaixa_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function generateGenericTablePdf(
  title: string,
  columns: TableColumn[],
  rows: TableRow[],
  periodo?: { inicio: string; fim: string }
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Period (if provided)
  if (periodo) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Período: ${format(new Date(periodo.inicio), 'dd/MM/yyyy', { locale: ptBR })} a ${format(new Date(periodo.fim), 'dd/MM/yyyy', { locale: ptBR })}`,
      pageWidth / 2,
      yPos,
      { align: 'center' }
    );
    yPos += 15;
  } else {
    yPos += 5;
  }

  // Calculate column positions
  const startX = 15;
  let currentX = startX;
  const columnPositions = columns.map(col => {
    const pos = currentX;
    currentX += col.width;
    return pos;
  });

  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(startX, yPos, pageWidth - 30, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  
  columns.forEach((col, i) => {
    doc.text(col.header, columnPositions[i] + 2, yPos + 7);
  });
  yPos += 14;

  // Table rows
  doc.setFont('helvetica', 'normal');
  rows.forEach((row, index) => {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      yPos = 20;
    }

    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(startX, yPos - 4, pageWidth - 30, 8, 'F');
    }
    
    columns.forEach((col, i) => {
      const value = String(row[col.header.toLowerCase().replace(/ /g, '_')] ?? row[Object.keys(row)[i]] ?? '');
      // Truncate if too long
      const maxChars = Math.floor(col.width / 2.5);
      const displayValue = value.length > maxChars ? value.substring(0, maxChars - 3) + '...' : value;
      doc.text(displayValue, columnPositions[i] + 2, yPos);
    });
    
    yPos += 8;
  });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} | Total: ${rows.length} registros`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  // Sanitize filename
  const safeFilename = title.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${safeFilename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
