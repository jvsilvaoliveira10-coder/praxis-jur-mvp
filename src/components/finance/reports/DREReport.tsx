import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ReportFilters } from './ReportFilters';
import { ReportExporter } from './ReportExporter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, RECEIVABLE_TYPE_LABELS, PAYABLE_TYPE_LABELS } from '@/types/finance';
import { generateDREPdf } from '@/lib/pdf-report-export';
import { exportToCSV } from '@/lib/csv-export';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { Loader2, FileText } from 'lucide-react';

interface DREItem {
  tipo: string;
  valor: number;
}

interface DREData {
  receitas: DREItem[];
  deducoes: DREItem[];
  despesas: DREItem[];
}

export function DREReport() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [data, setData] = useState<DREData>({
    receitas: [],
    deducoes: [],
    despesas: [],
  });

  useEffect(() => {
    if (user) {
      loadDREData();
    }
  }, [user, dateRange]);

  const loadDREData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');

      // Load transactions by type for the period
      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          type,
          amount,
          receivable:receivables(receivable_type),
          payable:payables(payable_type)
        `)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .eq('is_confirmed', true);

      // Aggregate revenues by type
      const receitasMap = new Map<string, number>();
      const despesasMap = new Map<string, number>();

      transactions?.forEach(t => {
        if (t.type === 'receita') {
          const tipo = t.receivable?.receivable_type || 'outros';
          const label = RECEIVABLE_TYPE_LABELS[tipo as keyof typeof RECEIVABLE_TYPE_LABELS] || 'Outros';
          receitasMap.set(label, (receitasMap.get(label) || 0) + Number(t.amount));
        } else {
          const tipo = t.payable?.payable_type || 'outros';
          const label = PAYABLE_TYPE_LABELS[tipo as keyof typeof PAYABLE_TYPE_LABELS] || 'Outros';
          despesasMap.set(label, (despesasMap.get(label) || 0) + Number(t.amount));
        }
      });

      // Convert maps to arrays and sort by value
      const receitas = Array.from(receitasMap.entries())
        .map(([tipo, valor]) => ({ tipo, valor }))
        .sort((a, b) => b.valor - a.valor);

      const despesas = Array.from(despesasMap.entries())
        .map(([tipo, valor]) => ({ tipo, valor }))
        .sort((a, b) => b.valor - a.valor);

      // Extract tax deductions (ISS = ~5% of services for lawyers)
      const totalReceitas = receitas.reduce((sum, r) => sum + r.valor, 0);
      const impostos = despesas.find(d => d.tipo === 'Impostos');
      const deducoes: DREItem[] = impostos ? [{ tipo: 'Impostos (ISS e outros)', valor: impostos.valor }] : [];
      
      // Remove impostos from despesas if included in deducoes
      const despesasFiltered = despesas.filter(d => d.tipo !== 'Impostos');

      setData({
        receitas,
        deducoes,
        despesas: despesasFiltered,
      });
    } catch (error) {
      console.error('Error loading DRE:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalReceitas = data.receitas.reduce((sum, r) => sum + r.valor, 0);
  const totalDeducoes = data.deducoes.reduce((sum, d) => sum + d.valor, 0);
  const receitaLiquida = totalReceitas - totalDeducoes;
  const totalDespesas = data.despesas.reduce((sum, d) => sum + d.valor, 0);
  const resultado = receitaLiquida - totalDespesas;

  const handleExportPDF = () => {
    generateDREPdf({
      receitas: data.receitas,
      deducoes: data.deducoes,
      despesas: data.despesas,
      periodo: {
        inicio: dateRange.from.toISOString(),
        fim: dateRange.to.toISOString(),
      },
    });
  };

  const handleExportCSV = () => {
    const rows = [
      ...data.receitas.map(r => ({ secao: 'RECEITA', tipo: r.tipo, valor: r.valor })),
      { secao: 'RECEITA TOTAL', tipo: '', valor: totalReceitas },
      ...data.deducoes.map(d => ({ secao: 'DEDUÇÕES', tipo: d.tipo, valor: d.valor })),
      { secao: 'RECEITA LÍQUIDA', tipo: '', valor: receitaLiquida },
      ...data.despesas.map(d => ({ secao: 'DESPESAS', tipo: d.tipo, valor: d.valor })),
      { secao: 'TOTAL DESPESAS', tipo: '', valor: totalDespesas },
      { secao: 'RESULTADO OPERACIONAL', tipo: '', valor: resultado },
    ];

    exportToCSV(rows, [
      { header: 'Seção', accessor: 'secao' },
      { header: 'Tipo', accessor: 'tipo' },
      { header: 'Valor', accessor: (item) => item.valor.toFixed(2) },
    ], 'DRE');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">DRE - Demonstrativo de Resultado</h2>
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
          <CardContent className="p-6">
            {/* Receitas */}
            <div className="space-y-2">
              <h3 className="font-semibold text-green-700 dark:text-green-400">RECEITA BRUTA</h3>
              {data.receitas.map((item, i) => (
                <div key={i} className="flex justify-between text-sm pl-4">
                  <span>{item.tipo}</span>
                  <span>{formatCurrency(item.valor)}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>= RECEITA TOTAL</span>
                <span className="text-green-700 dark:text-green-400">{formatCurrency(totalReceitas)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Deduções */}
            {data.deducoes.length > 0 && (
              <>
                <div className="space-y-2">
                  <h3 className="font-semibold text-muted-foreground">DEDUÇÕES</h3>
                  {data.deducoes.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm pl-4">
                      <span>{item.tipo}</span>
                      <span className="text-red-600">-{formatCurrency(item.valor)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>= RECEITA LÍQUIDA</span>
                    <span>{formatCurrency(receitaLiquida)}</span>
                  </div>
                </div>
                <Separator className="my-4" />
              </>
            )}

            {/* Despesas */}
            <div className="space-y-2">
              <h3 className="font-semibold text-red-700 dark:text-red-400">DESPESAS OPERACIONAIS</h3>
              {data.despesas.map((item, i) => (
                <div key={i} className="flex justify-between text-sm pl-4">
                  <span>{item.tipo}</span>
                  <span>{formatCurrency(item.valor)}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>= TOTAL DESPESAS</span>
                <span className="text-red-700 dark:text-red-400">{formatCurrency(totalDespesas)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Resultado */}
            <div className={`flex justify-between text-lg font-bold p-4 rounded-lg ${
              resultado >= 0 
                ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400' 
                : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
            }`}>
              <span>= RESULTADO OPERACIONAL</span>
              <span>{formatCurrency(resultado)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
