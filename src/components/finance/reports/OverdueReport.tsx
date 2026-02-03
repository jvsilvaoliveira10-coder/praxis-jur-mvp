import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReportExporter } from './ReportExporter';
import { ReportFilters } from './ReportFilters';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/types/finance';
import { generateGenericTablePdf } from '@/lib/pdf-report-export';
import { exportToCSV } from '@/lib/csv-export';
import { format, differenceInDays, startOfYear, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, AlertTriangle, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OverdueItem {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  description: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  daysOverdue: number;
  agingBucket: '1-15' | '16-30' | '31-60' | '>60';
}

interface AgingSummary {
  bucket: string;
  count: number;
  total: number;
}

export function OverdueReport() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<OverdueItem[]>([]);
  const [agingSummary, setAgingSummary] = useState<AgingSummary[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
    const now = new Date();
    return { from: startOfYear(now), to: endOfMonth(now) };
  });

  useEffect(() => {
    if (user) {
      loadOverdueData();
    }
  }, [user, dateRange]);

  const loadOverdueData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: receivables } = await supabase
        .from('receivables')
        .select(`
          id,
          description,
          amount,
          amount_paid,
          due_date,
          client:clients(id, name, phone, email)
        `)
        .eq('status', 'atrasado')
        .gte('due_date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('due_date', format(dateRange.to, 'yyyy-MM-dd'))
        .order('due_date', { ascending: true });

      const today = new Date();
      const overdueItems: OverdueItem[] = (receivables || []).map(r => {
        const daysOverdue = differenceInDays(today, new Date(r.due_date));
        let agingBucket: OverdueItem['agingBucket'] = '1-15';
        
        if (daysOverdue > 60) agingBucket = '>60';
        else if (daysOverdue > 30) agingBucket = '31-60';
        else if (daysOverdue > 15) agingBucket = '16-30';

        return {
          id: r.id,
          clientId: r.client?.id || '',
          clientName: r.client?.name || 'Cliente não identificado',
          clientPhone: r.client?.phone || undefined,
          clientEmail: r.client?.email || undefined,
          description: r.description,
          amount: Number(r.amount),
          amountPaid: Number(r.amount_paid),
          dueDate: r.due_date,
          daysOverdue,
          agingBucket,
        };
      });

      setItems(overdueItems);

      // Calculate aging summary
      const summary = [
        { bucket: '1-15 dias', count: 0, total: 0 },
        { bucket: '16-30 dias', count: 0, total: 0 },
        { bucket: '31-60 dias', count: 0, total: 0 },
        { bucket: '> 60 dias', count: 0, total: 0 },
      ];

      overdueItems.forEach(item => {
        const pending = item.amount - item.amountPaid;
        const index = item.agingBucket === '1-15' ? 0 
          : item.agingBucket === '16-30' ? 1 
          : item.agingBucket === '31-60' ? 2 
          : 3;
        summary[index].count += 1;
        summary[index].total += pending;
      });

      setAgingSummary(summary);
    } catch (error) {
      console.error('Error loading overdue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalOverdue = items.reduce((sum, i) => sum + (i.amount - i.amountPaid), 0);

  const handleExportPDF = () => {
    generateGenericTablePdf(
      `Relatório de Inadimplência - ${format(dateRange.from, 'dd/MM/yyyy')} a ${format(dateRange.to, 'dd/MM/yyyy')}`,
      [
        { header: 'Cliente', width: 45 },
        { header: 'Descrição', width: 45 },
        { header: 'Valor', width: 30 },
        { header: 'Vencimento', width: 30 },
        { header: 'Dias Atraso', width: 25 },
      ],
      items.map(i => ({
        cliente: i.clientName,
        descrição: i.description,
        valor: formatCurrency(i.amount - i.amountPaid),
        vencimento: format(new Date(i.dueDate), 'dd/MM/yyyy'),
        dias_atraso: i.daysOverdue.toString(),
      }))
    );
  };

  const handleExportCSV = () => {
    exportToCSV(items, [
      { header: 'Cliente', accessor: 'clientName' },
      { header: 'Telefone', accessor: (i) => i.clientPhone || '' },
      { header: 'Email', accessor: (i) => i.clientEmail || '' },
      { header: 'Descrição', accessor: 'description' },
      { header: 'Valor Total', accessor: (i) => i.amount.toFixed(2) },
      { header: 'Valor Pago', accessor: (i) => i.amountPaid.toFixed(2) },
      { header: 'Valor Pendente', accessor: (i) => (i.amount - i.amountPaid).toFixed(2) },
      { header: 'Vencimento', accessor: (i) => format(new Date(i.dueDate), 'dd/MM/yyyy') },
      { header: 'Dias em Atraso', accessor: 'daysOverdue' },
    ], `Inadimplencia_${format(dateRange.from, 'yyyyMMdd')}_${format(dateRange.to, 'yyyyMMdd')}`);
  };

  const getAgingColor = (bucket: string) => {
    switch (bucket) {
      case '1-15 dias': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case '16-30 dias': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case '31-60 dias': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case '> 60 dias': return 'bg-red-200 text-red-900 dark:bg-red-950/50 dark:text-red-300';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold">Relatório de Inadimplência</h2>
          <Badge variant="destructive" className="ml-2">
            {formatCurrency(totalOverdue)}
          </Badge>
        </div>
        <ReportExporter 
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
          disabled={loading}
        />
      </div>

      {/* Date Filter */}
      <ReportFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* Aging Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {agingSummary.map((bucket) => (
          <Card key={bucket.bucket} className={cn('border-2', getAgingColor(bucket.bucket))}>
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium">{bucket.bucket}</p>
              <p className="text-xl font-bold mt-1">{formatCurrency(bucket.total)}</p>
              <p className="text-xs mt-1">{bucket.count} título(s)</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-medium">Nenhuma inadimplência!</p>
            <p className="text-sm">Todos os clientes estão em dia no período selecionado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Pendente</TableHead>
                  <TableHead className="text-center">Vencimento</TableHead>
                  <TableHead className="text-center">Atraso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.clientName}</div>
                      <div className="text-xs text-muted-foreground space-x-2">
                        {item.clientPhone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {item.clientPhone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-right font-medium text-destructive">
                      {formatCurrency(item.amount - item.amountPaid)}
                    </TableCell>
                    <TableCell className="text-center">
                      {format(new Date(item.dueDate), 'dd/MM/yy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        item.daysOverdue <= 15 ? 'bg-yellow-500' :
                        item.daysOverdue <= 30 ? 'bg-orange-500' :
                        item.daysOverdue <= 60 ? 'bg-red-500' : 'bg-red-700'
                      )}>
                        {item.daysOverdue} dias
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {item.clientPhone && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(`tel:${item.clientPhone}`)}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                        {item.clientEmail && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(`mailto:${item.clientEmail}`)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
