import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateGenericTablePdf } from '@/lib/pdf-report-export';
import { exportToCSV } from '@/lib/csv-export';
import { 
  startOfMonth, 
  endOfMonth, 
  format, 
  eachMonthOfInterval, 
  startOfYear,
  isSameMonth 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Users, 
  FolderOpen, 
  FileText, 
  CalendarDays,
  Download,
  Loader2,
  CalendarIcon,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface ClientStats {
  total: number;
  pessoaFisica: number;
  pessoaJuridica: number;
  porMes: { mes: string; count: number }[];
}

interface CaseStats {
  total: number;
  porTipo: { tipo: string; count: number }[];
  porTribunal: { tribunal: string; count: number }[];
}

interface PetitionStats {
  total: number;
  porTipo: { tipo: string; count: number }[];
}

interface DeadlineStats {
  total: number;
  cumpridos: number;
  pendentes: number;
  atrasados: number;
}

const LegalReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clients');
  const [dateRange, setDateRange] = useState({
    from: startOfYear(new Date()),
    to: endOfMonth(new Date()),
  });

  const [clientStats, setClientStats] = useState<ClientStats>({
    total: 0,
    pessoaFisica: 0,
    pessoaJuridica: 0,
    porMes: [],
  });

  const [caseStats, setCaseStats] = useState<CaseStats>({
    total: 0,
    porTipo: [],
    porTribunal: [],
  });

  const [petitionStats, setPetitionStats] = useState<PetitionStats>({
    total: 0,
    porTipo: [],
  });

  const [deadlineStats, setDeadlineStats] = useState<DeadlineStats>({
    total: 0,
    cumpridos: 0,
    pendentes: 0,
    atrasados: 0,
  });

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user, dateRange]);

  const loadStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');

      // Load clients
      const { data: clients } = await supabase
        .from('clients')
        .select('id, type, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59');

      const months = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
      const clientsByMonth = months.map(month => ({
        mes: format(month, 'MMM/yy', { locale: ptBR }),
        count: clients?.filter(c => isSameMonth(new Date(c.created_at), month)).length || 0,
      }));

      setClientStats({
        total: clients?.length || 0,
        pessoaFisica: clients?.filter(c => c.type === 'pessoa_fisica').length || 0,
        pessoaJuridica: clients?.filter(c => c.type === 'pessoa_juridica').length || 0,
        porMes: clientsByMonth,
      });

      // Load cases
      const { data: cases } = await supabase
        .from('cases')
        .select('id, action_type, court, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59');

      const casesByType = new Map<string, number>();
      const casesByTribunal = new Map<string, number>();
      
      cases?.forEach(c => {
        const tipo = c.action_type || 'outros';
        casesByType.set(tipo, (casesByType.get(tipo) || 0) + 1);
        casesByTribunal.set(c.court, (casesByTribunal.get(c.court) || 0) + 1);
      });

      setCaseStats({
        total: cases?.length || 0,
        porTipo: Array.from(casesByType.entries()).map(([tipo, count]) => ({ tipo, count })),
        porTribunal: Array.from(casesByTribunal.entries())
          .map(([tribunal, count]) => ({ tribunal, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      });

      // Load petitions
      const { data: petitions } = await supabase
        .from('petitions')
        .select('id, petition_type, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59');

      const petitionsByType = new Map<string, number>();
      petitions?.forEach(p => {
        const tipo = p.petition_type || 'outros';
        petitionsByType.set(tipo, (petitionsByType.get(tipo) || 0) + 1);
      });

      setPetitionStats({
        total: petitions?.length || 0,
        porTipo: Array.from(petitionsByType.entries()).map(([tipo, count]) => ({ tipo, count })),
      });

      // Load deadlines
      const { data: deadlines } = await supabase
        .from('deadlines')
        .select('id, deadline_datetime')
        .gte('deadline_datetime', startDate)
        .lte('deadline_datetime', endDate + 'T23:59:59');

      const now = new Date();
      let cumpridos = 0;
      let pendentes = 0;
      let atrasados = 0;

      deadlines?.forEach(d => {
        const deadline = new Date(d.deadline_datetime);
        if (deadline > now) {
          pendentes++;
        } else {
          // For simplicity, we'll assume all past deadlines are "cumpridos"
          // In a real app, you'd have a status field
          cumpridos++;
        }
      });

      setDeadlineStats({
        total: deadlines?.length || 0,
        cumpridos,
        pendentes,
        atrasados,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    switch (activeTab) {
      case 'clients':
        exportToCSV(clientStats.porMes, [
          { header: 'Mês', accessor: 'mes' },
          { header: 'Novos Clientes', accessor: 'count' },
        ], 'RelatorioClientes');
        break;
      case 'cases':
        exportToCSV(caseStats.porTipo, [
          { header: 'Tipo de Ação', accessor: 'tipo' },
          { header: 'Quantidade', accessor: 'count' },
        ], 'RelatorioProcessos');
        break;
      case 'petitions':
        exportToCSV(petitionStats.porTipo, [
          { header: 'Tipo de Petição', accessor: 'tipo' },
          { header: 'Quantidade', accessor: 'count' },
        ], 'RelatorioPeticoes');
        break;
    }
  };

  const handleExportPDF = () => {
    switch (activeTab) {
      case 'clients':
        generateGenericTablePdf(
          'Relatório de Clientes',
          [
            { header: 'Mês', width: 60 },
            { header: 'Novos Clientes', width: 40 },
          ],
          clientStats.porMes.map(m => ({ mes: m.mes, novos_clientes: m.count.toString() })),
          { inicio: dateRange.from.toISOString(), fim: dateRange.to.toISOString() }
        );
        break;
      case 'cases':
        generateGenericTablePdf(
          'Relatório de Processos',
          [
            { header: 'Tipo', width: 80 },
            { header: 'Quantidade', width: 40 },
          ],
          caseStats.porTipo.map(t => ({ tipo: t.tipo, quantidade: t.count.toString() })),
          { inicio: dateRange.from.toISOString(), fim: dateRange.to.toISOString() }
        );
        break;
    }
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({ from: range.from, to: range.to });
    }
  };

  const reports = [
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'cases', label: 'Processos', icon: FolderOpen },
    { id: 'petitions', label: 'Petições', icon: FileText },
    { id: 'deadlines', label: 'Prazos', icon: CalendarDays },
  ];

  const actionTypeLabels: Record<string, string> = {
    obrigacao_de_fazer: 'Obrigação de Fazer',
    cobranca: 'Cobrança',
    indenizacao_danos_morais: 'Indenização por Danos Morais',
  };

  const petitionTypeLabels: Record<string, string> = {
    peticao_inicial: 'Petição Inicial',
    contestacao: 'Contestação',
    peticao_simples: 'Petição Simples',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Relatórios Jurídicos</h1>
          <p className="text-muted-foreground">
            Métricas de produtividade e desempenho
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" onClick={handleExportCSV} disabled={loading}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{clientStats.total}</p>
                <p className="text-sm text-muted-foreground">Novos Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{caseStats.total}</p>
                <p className="text-sm text-muted-foreground">Processos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{petitionStats.total}</p>
                <p className="text-sm text-muted-foreground">Petições</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{deadlineStats.total}</p>
                <p className="text-sm text-muted-foreground">Prazos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {reports.map((report) => (
            <TabsTrigger key={report.id} value={report.id} className="flex items-center gap-2">
              <report.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{report.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <TabsContent value="clients" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Novos Clientes por Mês</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mês</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientStats.porMes.map((m, i) => (
                          <TableRow key={i}>
                            <TableCell>{m.mes}</TableCell>
                            <TableCell className="text-right font-medium">{m.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Distribuição por Tipo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                      <span>Pessoa Física</span>
                      <span className="text-2xl font-bold">{clientStats.pessoaFisica}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                      <span>Pessoa Jurídica</span>
                      <span className="text-2xl font-bold">{clientStats.pessoaJuridica}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cases" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Por Tipo de Ação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {caseStats.porTipo.map((t, i) => (
                          <TableRow key={i}>
                            <TableCell>{actionTypeLabels[t.tipo] || t.tipo}</TableCell>
                            <TableCell className="text-right font-medium">{t.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Por Tribunal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tribunal</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {caseStats.porTribunal.map((t, i) => (
                          <TableRow key={i}>
                            <TableCell className="truncate max-w-[200px]">{t.tribunal}</TableCell>
                            <TableCell className="text-right font-medium">{t.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="petitions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Produção de Petições</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo de Petição</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {petitionStats.porTipo.map((t, i) => (
                        <TableRow key={i}>
                          <TableCell>{petitionTypeLabels[t.tipo] || t.tipo}</TableCell>
                          <TableCell className="text-right font-medium">{t.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deadlines" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
                  <CardContent className="p-6 text-center">
                    <p className="text-4xl font-bold text-green-600">{deadlineStats.cumpridos}</p>
                    <p className="text-sm text-green-700 mt-1">Cumpridos</p>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200">
                  <CardContent className="p-6 text-center">
                    <p className="text-4xl font-bold text-yellow-600">{deadlineStats.pendentes}</p>
                    <p className="text-sm text-yellow-700 mt-1">Pendentes</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 dark:bg-red-950/20 border-red-200">
                  <CardContent className="p-6 text-center">
                    <p className="text-4xl font-bold text-red-600">{deadlineStats.atrasados}</p>
                    <p className="text-sm text-red-700 mt-1">Atrasados</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default LegalReports;
