// CSV Export utilities

export interface ExportColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | number);
}

export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  // Build header row
  const headers = columns.map(col => col.header).join(';');
  
  // Build data rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value: string | number;
      if (typeof col.accessor === 'function') {
        value = col.accessor(item);
      } else {
        value = item[col.accessor] as string | number;
      }
      
      // Escape special characters
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains special chars
        if (value.includes(';') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
      }
      
      return value ?? '';
    }).join(';');
  });
  
  // Combine header and rows
  const csvContent = [headers, ...rows].join('\n');
  
  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatDateForExport(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

export function formatCurrencyForExport(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
