import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReportFilters } from './ReportFilters';
import { ReportExporter } from './ReportExporter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/types/finance';
import { generateGenericTablePdf } from '@/lib/pdf-report-export';
import { exportToCSV } from '@/lib/csv-export';
import { startOfYear, endOfMonth, format, differenceInDays } from 'date-fns';
import { Loader2, Users, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ClientData {
  id: string;
  name: string;
  totalRecebido: number;
  totalPendente: number;
  totalAtrasado: number;
  tempoMedioRecebimento: number;
  quantidadeTitulos: number;
}

export function ClientAnalysisReport() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: startOfYear(new Date()),
    to: endOfMonth(new Date()),
  });
  const [clients, setClients] = useState<ClientData[]>([]);

  useEffect(() => {
    if (user) {
      loadClientData();
    }
  }, [user, dateRange]);

  const loadClientData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');

      // Load all receivables with client info
      const { data: receivables } = await supabase
        .from('receivables')
        .select(`
          id,
          client_id,
          amount,
          amount_paid,
          status,
          due_date,
          payment_date,
          created_at,
          client:clients(id, name)
        `)
        .gte('due_date', startDate)
        .lte('due_date', endDate)
        .not('client_id', 'is', null);

      // Aggregate by client
      const clientMap = new Map<string, ClientData>();

      receivables?.forEach(r => {
        if (!r.client) return;
        
        const clientId = r.client.id;
        const existing = clientMap.get(clientId) || {
          id: clientId,
          name: r.client.name,
          totalRecebido: 0,
          totalPendente: 0,
          totalAtrasado: 0,
          tempoMedioRecebimento: 0,
          quantidadeTitulos: 0,
        };

        existing.quantidadeTitulos += 1;

        if (r.status === 'pago') {
          existing.totalRecebido += Number(r.amount_paid);
          if (r.payment_date) {
            const days = differenceInDays(new Date(r.payment_date), new Date(r.due_date));
            existing.tempoMedioRecebimento += days;
          }
        } else if (r.status === 'atrasado') {
          existing.totalAtrasado += Number(r.amount) - Number(r.amount_paid);
        } else if (r.status === 'pendente' || r.status === 'parcial') {
          existing.totalPendente += Number(r.amount) - Number(r.amount_paid);
        }

        clientMap.set(clientId, existing);
      });

      // Calculate averages and sort
      const clientsArray = Array.from(clientMap.values()).map(c => ({
        ...c,
        tempoMedioRecebimento: c.quantidadeTitulos > 0 
          ? Math.round(c.tempoMedioRecebimento / c.quantidadeTitulos) 
          : 0,
      })).sort((a, b) => b.totalRecebido - a.totalRecebido);

      setClients(clientsArray);
    } catch (error) {
      console.error('Error loading client analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalGeral = clients.reduce((sum, c) => sum + c.totalRecebido, 0);

  const handleExportPDF = () => {
    generateGenericTablePdf(
      'Análise por Cliente',
      [
        { header: 'Cliente', width: 50 },
        { header: 'Recebido', width: 35 },
        { header: 'Pendente', width: 35 },
        { header: 'Atrasado', width: 35 },
        { header: 'Tempo Médio', width: 25 },
      ],
      clients.map(c => ({
        cliente: c.name,
        recebido: formatCurrency(c.totalRecebido),
        pendente: formatCurrency(c.totalPendente),
        atrasado: formatCurrency(c.totalAtrasado),
        tempo_médio: `${c.tempoMedioRecebimento} dias`,
      })),
      { inicio: dateRange.from.toISOString(), fim: dateRange.to.toISOString() }
    );
  };

  const handleExportCSV = () => {
    exportToCSV(clients, [
      { header: 'Cliente', accessor: 'name' },
      { header: 'Total Recebido', accessor: (c) => c.totalRecebido.toFixed(2) },
      { header: 'Pendente', accessor: (c) => c.totalPendente.toFixed(2) },
      { header: 'Atrasado', accessor: (c) => c.totalAtrasado.toFixed(2) },
      { header: 'Tempo Médio (dias)', accessor: 'tempoMedioRecebimento' },
      { header: 'Qtd Títulos', accessor: 'quantidadeTitulos' },
    ], 'AnaliseClientes');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Análise por Cliente</h2>
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
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum dado de cliente para o período selecionado
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Cliente</TableHead>
                  <TableHead className="text-right">Recebido</TableHead>
                  <TableHead className="text-right">Pendente</TableHead>
                  <TableHead className="text-right">Atrasado</TableHead>
                  <TableHead className="text-right">Tempo Médio</TableHead>
                  <TableHead className="w-[15%]">% Faturamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => {
                  const percentage = totalGeral > 0 ? (client.totalRecebido / totalGeral) * 100 : 0;
                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {client.quantidadeTitulos} títulos
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {formatCurrency(client.totalRecebido)}
                      </TableCell>
                      <TableCell className="text-right text-yellow-600">
                        {formatCurrency(client.totalPendente)}
                      </TableCell>
                      <TableCell className="text-right">
                        {client.totalAtrasado > 0 ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {formatCurrency(client.totalAtrasado)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {client.tempoMedioRecebimento > 0 
                          ? `${client.tempoMedioRecebimento} dias`
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={percentage} className="h-2" />
                          <span className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
