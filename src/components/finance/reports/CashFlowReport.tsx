import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReportFilters } from './ReportFilters';
import { ReportExporter } from './ReportExporter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/types/finance';
import { generateCashFlowPdf } from '@/lib/pdf-report-export';
import { exportToCSV } from '@/lib/csv-export';
import { startOfMonth, endOfMonth, format, eachMonthOfInterval, startOfYear, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthlyData {
  mes: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export function CashFlowReport() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: startOfYear(new Date()),
    to: endOfMonth(new Date()),
  });
  const [data, setData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    if (user) {
      loadCashFlowData();
    }
  }, [user, dateRange]);

  const loadCashFlowData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const months = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
      
      const { data: transactions } = await supabase
        .from('transactions')
        .select('type, amount, transaction_date')
        .gte('transaction_date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('transaction_date', format(dateRange.to, 'yyyy-MM-dd'))
        .eq('is_confirmed', true);

      const monthlyData: MonthlyData[] = months.map(month => {
        const monthTransactions = transactions?.filter(t => 
          isSameMonth(new Date(t.transaction_date), month)
        ) || [];

        const receitas = monthTransactions
          .filter(t => t.type === 'receita')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const despesas = monthTransactions
          .filter(t => t.type === 'despesa')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        return {
          mes: format(month, 'MMM/yy', { locale: ptBR }),
          receitas,
          despesas,
          saldo: receitas - despesas,
        };
      });

      setData(monthlyData);
    } catch (error) {
      console.error('Error loading cash flow:', error);
    } finally {
      setLoading(false);
    }
  };

  const totals = data.reduce(
    (acc, month) => ({
      receitas: acc.receitas + month.receitas,
      despesas: acc.despesas + month.despesas,
      saldo: acc.saldo + month.saldo,
    }),
    { receitas: 0, despesas: 0, saldo: 0 }
  );

  const handleExportPDF = () => {
    generateCashFlowPdf(data, {
      inicio: dateRange.from.toISOString(),
      fim: dateRange.to.toISOString(),
    });
  };

  const handleExportCSV = () => {
    const rows = [
      ...data,
      { mes: 'TOTAL', ...totals },
    ];

    exportToCSV(rows, [
      { header: 'Mês', accessor: 'mes' },
      { header: 'Receitas', accessor: (item) => item.receitas.toFixed(2) },
      { header: 'Despesas', accessor: (item) => item.despesas.toFixed(2) },
      { header: 'Saldo', accessor: (item) => item.saldo.toFixed(2) },
    ], 'FluxoCaixa');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Fluxo de Caixa</h2>
        </div>
        <ReportExporter 
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
          disabled={loading}
        />
      </div>

      <ReportFilters 
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês</TableHead>
                  <TableHead className="text-right">Receitas</TableHead>
                  <TableHead className="text-right">Despesas</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((month, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{month.mes}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(month.receitas)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(month.despesas)}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-medium",
                      month.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {formatCurrency(month.saldo)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCurrency(totals.receitas)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(totals.despesas)}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right",
                    totals.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {formatCurrency(totals.saldo)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
