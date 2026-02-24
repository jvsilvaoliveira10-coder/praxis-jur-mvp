import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportOptions {
  includeMovements: boolean;
  includeDeadlines: boolean;
  includeFinancial: boolean;
}

interface FirmInfo {
  firmName?: string;
  lawyerName?: string;
  oabNumber?: string;
  oabState?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
}

interface CaseInfo {
  processNumber: string | null;
  court: string;
  actionType: string;
  opposingParty: string;
  clientName: string;
}

interface Movement {
  nome: string;
  data_hora: string;
  orgao_julgador?: string | null;
}

interface Deadline {
  title: string;
  deadline_datetime: string;
  deadline_type: string;
}

interface FinancialSummary {
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
}

export async function generateClientReport(
  caseInfo: CaseInfo,
  firmInfo: FirmInfo,
  movements: Movement[],
  deadlines: Deadline[],
  financial: FinancialSummary,
  options: ReportOptions
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFillColor(30, 41, 59); // Navy
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(firmInfo.firmName || 'Escritório de Advocacia', 15, 18);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const headerParts: string[] = [];
  if (firmInfo.lawyerName) headerParts.push(firmInfo.lawyerName);
  if (firmInfo.oabNumber && firmInfo.oabState) headerParts.push(`OAB/${firmInfo.oabState} ${firmInfo.oabNumber}`);
  if (headerParts.length > 0) doc.text(headerParts.join(' • '), 15, 26);

  const contactParts: string[] = [];
  if (firmInfo.phone) contactParts.push(firmInfo.phone);
  if (firmInfo.email) contactParts.push(firmInfo.email);
  if (contactParts.length > 0) doc.text(contactParts.join(' • '), 15, 33);

  doc.text(`Emitido em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 15, 40);

  y = 55;

  // Title
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE ANDAMENTO PROCESSUAL', pageWidth / 2, y, { align: 'center' });
  y += 12;

  // Case summary
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, y, pageWidth - 30, 40, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('DADOS DO PROCESSO', 20, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Cliente: ${caseInfo.clientName}`, 20, y + 16);
  doc.text(`Processo: ${caseInfo.processNumber || 'Sem número'}`, 20, y + 23);
  doc.text(`Tribunal: ${caseInfo.court}`, 20, y + 30);
  doc.text(`Parte contrária: ${caseInfo.opposingParty}`, 110, y + 16);
  doc.text(`Tipo: ${caseInfo.actionType}`, 110, y + 23);
  y += 48;

  // Movements
  if (options.includeMovements && movements.length > 0) {
    y = addSectionTitle(doc, 'ÚLTIMAS MOVIMENTAÇÕES', y, pageWidth);
    
    for (const mov of movements.slice(0, 10)) {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(format(new Date(mov.data_hora), 'dd/MM/yyyy', { locale: ptBR }), 20, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(mov.nome, pageWidth - 70);
      doc.text(lines, 55, y);
      y += Math.max(lines.length * 5, 7) + 2;
    }
    y += 5;
  }

  // Deadlines
  if (options.includeDeadlines && deadlines.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    y = addSectionTitle(doc, 'PRÓXIMOS PRAZOS', y, pageWidth);

    for (const dl of deadlines) {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(format(new Date(dl.deadline_datetime), 'dd/MM/yyyy', { locale: ptBR }), 20, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(dl.title, 55, y);
      y += 7;
    }
    y += 5;
  }

  // Financial
  if (options.includeFinancial) {
    if (y > 240) { doc.addPage(); y = 20; }
    y = addSectionTitle(doc, 'SITUAÇÃO FINANCEIRA', y, pageWidth);

    const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, y, pageWidth - 30, 28, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Total Honorários:', 20, y + 8);
    doc.text('Valor Pago:', 20, y + 16);
    doc.text('Saldo Pendente:', 20, y + 24);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(fmt(financial.totalAmount), 70, y + 8);
    doc.text(fmt(financial.totalPaid), 70, y + 16);
    doc.setTextColor(financial.totalPending > 0 ? 220 : 30, financial.totalPending > 0 ? 38 : 41, financial.totalPending > 0 ? 38 : 59);
    doc.text(fmt(financial.totalPending), 70, y + 24);
    y += 35;
  }

  // Footer
  if (y > 250) { doc.addPage(); y = 20; }
  y = doc.internal.pageSize.getHeight() - 30;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, pageWidth - 15, y);
  y += 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('Documento gerado automaticamente pelo sistema Práxis Jur.', pageWidth / 2, y, { align: 'center' });
  doc.text('Este relatório tem caráter informativo e não substitui parecer jurídico.', pageWidth / 2, y + 5, { align: 'center' });

  doc.save(`Relatorio_${caseInfo.clientName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
}

function addSectionTitle(doc: jsPDF, title: string, y: number, pageWidth: number): number {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(title, 15, y);
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.5);
  doc.line(15, y + 2, pageWidth - 15, y + 2);
  return y + 10;
}
