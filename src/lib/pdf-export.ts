import { jsPDF } from 'jspdf';

export const exportToPDF = (content: string, title: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Configure fonts
  doc.setFont('times', 'normal');
  doc.setFontSize(12);

  // Page margins
  const marginLeft = 30;
  const marginRight = 20;
  const marginTop = 25;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - marginLeft - marginRight;
  const lineHeight = 6;

  let yPosition = marginTop;

  // Split content into lines
  const lines = content.split('\n');

  lines.forEach((line) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 25) {
      doc.addPage();
      yPosition = marginTop;
    }

    // Handle empty lines
    if (line.trim() === '') {
      yPosition += lineHeight / 2;
      return;
    }

    // Check if line is a header (all caps or starts with roman numeral)
    const isHeader = /^[IVX]+\s*[–—-]/.test(line.trim()) || 
                     (line.trim() === line.trim().toUpperCase() && line.trim().length > 3);

    if (isHeader) {
      doc.setFont('times', 'bold');
      yPosition += lineHeight / 2; // Extra space before header
    } else {
      doc.setFont('times', 'normal');
    }

    // Word wrap the text
    const wrappedLines = doc.splitTextToSize(line, maxWidth);
    
    wrappedLines.forEach((wrappedLine: string) => {
      if (yPosition > pageHeight - 25) {
        doc.addPage();
        yPosition = marginTop;
      }

      // Center alignment for headers, justify for normal text
      if (isHeader && wrappedLines.length === 1) {
        const textWidth = doc.getTextWidth(wrappedLine);
        const xPosition = (pageWidth - textWidth) / 2;
        doc.text(wrappedLine, xPosition, yPosition);
      } else {
        doc.text(wrappedLine, marginLeft, yPosition);
      }

      yPosition += lineHeight;
    });

    if (isHeader) {
      yPosition += lineHeight / 2; // Extra space after header
    }
  });

  // Save the PDF
  const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
};
