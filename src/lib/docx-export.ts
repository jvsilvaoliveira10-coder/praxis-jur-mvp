import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

interface FirmSettings {
  firm_name?: string | null;
  lawyer_name?: string | null;
  oab_number?: string | null;
  oab_state?: string | null;
  phone?: string | null;
  email?: string | null;
  address_street?: string | null;
  address_number?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip?: string | null;
}

// Strip HTML tags and extract text blocks
function parseHtmlToBlocks(html: string): { type: 'h1' | 'h2' | 'h3' | 'p' | 'blockquote' | 'li'; text: string; bold?: boolean; italic?: boolean }[] {
  const blocks: { type: 'h1' | 'h2' | 'h3' | 'p' | 'blockquote' | 'li'; text: string; bold?: boolean; italic?: boolean }[] = [];
  
  // Simple regex-based parser for the HTML we generate
  const tagRegex = /<(h[1-3]|p|blockquote|li)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  
  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase() as 'h1' | 'h2' | 'h3' | 'p' | 'blockquote' | 'li';
    let text = match[2]
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<strong>(.*?)<\/strong>/gi, '$1')
      .replace(/<em>(.*?)<\/em>/gi, '$1')
      .replace(/<u>(.*?)<\/u>/gi, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .trim();
    
    if (!text) continue;
    
    const bold = match[2].includes('<strong>') || tag.startsWith('h');
    const italic = match[2].includes('<em>') || tag === 'blockquote';
    
    blocks.push({ type: tag, text, bold, italic });
  }
  
  // Fallback: if no HTML tags found, treat as plain text
  if (blocks.length === 0 && html.trim()) {
    const plainText = html.replace(/<[^>]+>/g, '').trim();
    for (const line of plainText.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
        blocks.push({ type: 'h2', text: trimmed, bold: true });
      } else {
        blocks.push({ type: 'p', text: trimmed });
      }
    }
  }
  
  return blocks;
}

export async function exportToDocx(content: string, title: string, firmSettings?: FirmSettings | null) {
  const blocks = parseHtmlToBlocks(content);
  const children: Paragraph[] = [];
  
  // Header with firm info
  if (firmSettings?.firm_name || firmSettings?.lawyer_name) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: firmSettings.firm_name || firmSettings.lawyer_name || '', bold: true, size: 28, font: 'Times New Roman' })],
      spacing: { after: 100 },
    }));
    
    const infoLine: string[] = [];
    if (firmSettings.oab_number && firmSettings.oab_state) infoLine.push(`OAB/${firmSettings.oab_state} nº ${firmSettings.oab_number}`);
    if (firmSettings.phone) infoLine.push(firmSettings.phone);
    if (firmSettings.email) infoLine.push(firmSettings.email);
    
    if (infoLine.length > 0) {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: infoLine.join(' • '), size: 20, font: 'Times New Roman', color: '666666' })],
        spacing: { after: 100 },
      }));
    }
    
    if (firmSettings.address_street) {
      const addr = [firmSettings.address_street, firmSettings.address_number, firmSettings.address_city, firmSettings.address_state].filter(Boolean).join(', ');
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: addr, size: 18, font: 'Times New Roman', color: '888888' })],
        spacing: { after: 200 },
      }));
    }
    
    // Separator line
    children.push(new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
      spacing: { after: 400 },
    }));
  }

  // Content blocks
  for (const block of blocks) {
    switch (block.type) {
      case 'h1':
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: block.text, bold: true, size: 28, font: 'Times New Roman' })],
          spacing: { before: 300, after: 200 },
        }));
        break;
      case 'h2':
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: block.text, bold: true, size: 26, font: 'Times New Roman' })],
          spacing: { before: 250, after: 150 },
        }));
        break;
      case 'h3':
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun({ text: block.text, bold: true, size: 24, font: 'Times New Roman' })],
          spacing: { before: 200, after: 100 },
        }));
        break;
      case 'blockquote':
        children.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { left: 720, right: 720 },
          children: [new TextRun({ text: block.text, italics: true, size: 22, font: 'Times New Roman' })],
          spacing: { before: 100, after: 100 },
        }));
        break;
      default:
        children.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 720 },
          children: [new TextRun({ text: block.text, size: 24, font: 'Times New Roman' })],
          spacing: { after: 100, line: 360 },
        }));
    }
  }

  // Signature block
  if (firmSettings?.lawyer_name) {
    children.push(new Paragraph({ spacing: { before: 600 } }));
    
    const now = new Date();
    const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    const local = firmSettings.address_city && firmSettings.address_state 
      ? `${firmSettings.address_city}/${firmSettings.address_state}` : '';
    const dateStr = `${local}${local ? ', ' : ''}${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}.`;
    
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: dateStr, size: 24, font: 'Times New Roman' })],
      spacing: { after: 600 },
    }));
    
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '___________________________________', size: 24, font: 'Times New Roman' })],
      spacing: { after: 50 },
    }));
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: firmSettings.lawyer_name, bold: true, size: 24, font: 'Times New Roman' })],
      spacing: { after: 50 },
    }));
    if (firmSettings.oab_number && firmSettings.oab_state) {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `OAB/${firmSettings.oab_state} nº ${firmSettings.oab_number}`, size: 22, font: 'Times New Roman' })],
      }));
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${title.replace(/[^a-zA-Z0-9áàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ\s-]/g, '').trim() || 'peticao'}.docx`;
  saveAs(blob, fileName);
}
