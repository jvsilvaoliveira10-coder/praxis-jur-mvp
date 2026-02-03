import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingDown, 
  Wallet, 
  AlertTriangle, 
  ArrowDownLeft,
  ArrowUpRight,
  Settings,
  Clock,
  Users,
  FileSignature,
  TrendingUp,
  BarChart3,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FinanceMetricCard } from '@/components/finance/cards/FinanceMetricCard';
import { AlertCard } from '@/components/finance/cards/AlertCard';
import { CashFlowChart } from '@/components/finance/CashFlowChart';
import { RevenueExpenseChart } from '@/components/finance/RevenueExpenseChart';
import { CategoryDistributionChart } from '@/components/finance/charts/CategoryDistributionChart';
import { OverdueAnalysisChart } from '@/components/finance/charts/OverdueAnalysisChart';
import { MonthlyComparisonChart } from '@/components/finance/charts/MonthlyComparisonChart';
import { TopClientsChart } from '@/components/finance/charts/TopClientsChart';
import { BalanceEvolutionChart } from '@/components/finance/charts/BalanceEvolutionChart';
import { UpcomingBills } from '@/components/finance/UpcomingBills';
import { RecentTransactions } from '@/components/finance/RecentTransactions';
import { 
  FinanceStats, 
  CashFlowData, 
  UpcomingBill, 
  Transaction,
  formatCurrency,
  RECEIVABLE_TYPE_LABELS,
  PAYABLE_TYPE_LABELS
} from '@/types/finance';
import { format, subMonths, startOfMonth, endOfMonth, addDays, differenceInDays, eachMonthOfInterval, isSameMonth, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface ExtendedStats extends FinanceStats {
  lucroLiquido: number;
  pendingReceivablesCount: number;
  pendingPayablesCount: number;
  overdueCount: number;
  mrrValue: number;
  activeContractsCount: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface OverdueData {
  range: string;
  value: number;
  count: number;
}

interface ClientData {
  id: string;
  name: string;
  value: number;
  count: number;
}

type PeriodFilter = '7d' | '30d' | '90d' | 'year' | 'all';

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ExtendedStats>({
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    totalBalance: 0,
    overdueReceivables: 0,
    pendingPayables: 0,
    revenueChange: 0,
    expenseChange: 0,
    lucroLiquido: 0,
    pendingReceivablesCount: 0,
    pendingPayablesCount: 0,
    overdueCount: 0,
    mrrValue: 0,
    activeContractsCount: 0,
  });
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<UpcomingBill[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<CategoryData[]>([]);
  const [expenseByCategory, setExpenseByCategory] = useState<CategoryData[]>([]);
  const [overdueData, setOverdueData] = useState<OverdueData[]>([]);
  const [topClients, setTopClients] = useState<ClientData[]>([]);
  const [balanceEvolution, setBalanceEvolution] = useState<{ month: string; saldo: number }[]>([]);
  const [comparisonData, setComparisonData] = useState<{ category: string; mesAtual: number; mesAnterior: number }[]>([]);
  const [alerts, setAlerts] = useState<{ type: 'error' | 'warning' | 'info'; title: string; message: string }[]>([]);

  const dateRange = useMemo(() => {
    const now = new Date();
    switch (periodFilter) {
      case '7d':
        return { from: subDays(now, 7), to: now };
      case '30d':
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case '90d':
        return { from: subMonths(now, 2), to: now };
      case 'year':
        return { from: new Date(now.getFullYear(), 0, 1), to: now };
      case 'all':
        return { from: new Date(2020, 0, 1), to: now };
      default:
        return { from: startOfMonth(now), to: endOfMonth(now) };
    }
  }, [periodFilter]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, dateRange]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadCashFlowData(),
        loadUpcomingBills(),
        loadRecentTransactions(),
        loadCategoryDistribution(),
        loadOverdueAnalysis(),
        loadTopClients(),
        loadBalanceEvolution(),
        loadMonthlyComparison(),
        loadMRR(),
      ]);
      
      // Check for alerts
      checkAlerts();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));

    const { data: currentMonthTransactions } = await supabase
      .from('transactions')
      .select('type, amount')
      .gte('transaction_date', format(startOfCurrentMonth, 'yyyy-MM-dd'))
      .lte('transaction_date', format(endOfCurrentMonth, 'yyyy-MM-dd'));

    const { data: lastMonthTransactions } = await supabase
      .from('transactions')
      .select('type, amount')
      .gte('transaction_date', format(startOfLastMonth, 'yyyy-MM-dd'))
      .lte('transaction_date', format(endOfLastMonth, 'yyyy-MM-dd'));

    const { data: accounts } = await supabase
      .from('financial_accounts')
      .select('current_balance')
      .eq('is_active', true);

    const { data: overdueReceivables } = await supabase
      .from('receivables')
      .select('id, amount, amount_paid')
      .eq('status', 'atrasado');

    const { data: pendingReceivables } = await supabase
      .from('receivables')
      .select('id, amount, amount_paid')
      .in('status', ['pendente', 'parcial']);

    const { data: pendingPayables } = await supabase
      .from('payables')
      .select('id, amount')
      .in('status', ['pendente', 'parcial']);

    const currentRevenue = currentMonthTransactions
      ?.filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    
    const currentExpenses = currentMonthTransactions
      ?.filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const lastRevenue = lastMonthTransactions
      ?.filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    
    const lastExpenses = lastMonthTransactions
      ?.filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const totalBalance = accounts?.reduce((sum, a) => sum + Number(a.current_balance), 0) || 0;
    
    const overdueTotal = overdueReceivables?.reduce(
      (sum, r) => sum + (Number(r.amount) - Number(r.amount_paid)), 
      0
    ) || 0;

    const pendingReceivablesTotal = pendingReceivables?.reduce(
      (sum, r) => sum + (Number(r.amount) - Number(r.amount_paid)), 
      0
    ) || 0;

    const pendingPayablesTotal = pendingPayables?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    setStats({
      monthlyRevenue: currentRevenue,
      monthlyExpenses: currentExpenses,
      totalBalance,
      overdueReceivables: overdueTotal,
      pendingPayables: pendingPayablesTotal,
      revenueChange: lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0,
      expenseChange: lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0,
      lucroLiquido: currentRevenue - currentExpenses,
      pendingReceivablesCount: pendingReceivables?.length || 0,
      pendingPayablesCount: pendingPayables?.length || 0,
      overdueCount: overdueReceivables?.length || 0,
      mrrValue: 0,
      activeContractsCount: 0,
    });
  };

  const loadMRR = async () => {
    const { data: contracts } = await supabase
      .from('fee_contracts')
      .select('id, monthly_amount')
      .eq('is_active', true)
      .not('monthly_amount', 'is', null);

    const mrrValue = contracts?.reduce((sum, c) => sum + Number(c.monthly_amount || 0), 0) || 0;
    
    setStats(prev => ({
      ...prev,
      mrrValue,
      activeContractsCount: contracts?.length || 0,
    }));
  };

  const loadCashFlowData = async () => {
    const months: CashFlowData[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      const startDate = format(startOfMonth(month), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(month), 'yyyy-MM-dd');

      const { data: transactions } = await supabase
        .from('transactions')
        .select('type, amount')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      const receitas = transactions
        ?.filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      
      const despesas = transactions
        ?.filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      months.push({
        month: format(month, 'MMM', { locale: ptBR }),
        receitas,
        despesas,
        saldo: receitas - despesas,
      });
    }

    setCashFlowData(months);
  };

  const loadUpcomingBills = async () => {
    const now = new Date();
    const sevenDaysFromNow = addDays(now, 7);

    const { data: receivables } = await supabase
      .from('receivables')
      .select('id, description, amount, due_date, status, client:clients(name)')
      .in('status', ['pendente', 'atrasado'])
      .lte('due_date', format(sevenDaysFromNow, 'yyyy-MM-dd'))
      .order('due_date', { ascending: true })
      .limit(5);

    const { data: payables } = await supabase
      .from('payables')
      .select('id, description, amount, due_date, status, supplier_name')
      .in('status', ['pendente', 'atrasado'])
      .lte('due_date', format(sevenDaysFromNow, 'yyyy-MM-dd'))
      .order('due_date', { ascending: true })
      .limit(5);

    const bills: UpcomingBill[] = [
      ...(receivables?.map(r => ({
        id: r.id,
        type: 'receivable' as const,
        description: r.description,
        amount: Number(r.amount),
        due_date: r.due_date,
        status: r.status,
        client_name: r.client?.name,
      })) || []),
      ...(payables?.map(p => ({
        id: p.id,
        type: 'payable' as const,
        description: p.description,
        amount: Number(p.amount),
        due_date: p.due_date,
        status: p.status,
        supplier_name: p.supplier_name || undefined,
      })) || []),
    ].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
     .slice(0, 7);

    setUpcomingBills(bills);
  };

  const loadRecentTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select(`
        *,
        account:financial_accounts(id, name)
      `)
      .order('transaction_date', { ascending: false })
      .limit(5);

    setRecentTransactions(data as Transaction[] || []);
  };

  const loadCategoryDistribution = async () => {
    const { data: transactions } = await supabase
      .from('transactions')
      .select(`
        type,
        amount,
        receivable:receivables(receivable_type),
        payable:payables(payable_type)
      `)
      .gte('transaction_date', format(dateRange.from, 'yyyy-MM-dd'))
      .lte('transaction_date', format(dateRange.to, 'yyyy-MM-dd'));

    const revenueMap = new Map<string, number>();
    const expenseMap = new Map<string, number>();

    transactions?.forEach(t => {
      if (t.type === 'receita') {
        const tipo = t.receivable?.receivable_type || 'outros';
        const label = RECEIVABLE_TYPE_LABELS[tipo as keyof typeof RECEIVABLE_TYPE_LABELS] || 'Outros';
        revenueMap.set(label, (revenueMap.get(label) || 0) + Number(t.amount));
      } else {
        const tipo = t.payable?.payable_type || 'outros';
        const label = PAYABLE_TYPE_LABELS[tipo as keyof typeof PAYABLE_TYPE_LABELS] || 'Outros';
        expenseMap.set(label, (expenseMap.get(label) || 0) + Number(t.amount));
      }
    });

    setRevenueByCategory(
      Array.from(revenueMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    );

    setExpenseByCategory(
      Array.from(expenseMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    );
  };

  const loadOverdueAnalysis = async () => {
    const { data: receivables } = await supabase
      .from('receivables')
      .select('id, amount, amount_paid, due_date')
      .eq('status', 'atrasado');

    const today = new Date();
    const buckets: OverdueData[] = [
      { range: '1-15 dias', value: 0, count: 0 },
      { range: '16-30 dias', value: 0, count: 0 },
      { range: '31-60 dias', value: 0, count: 0 },
      { range: '> 60 dias', value: 0, count: 0 },
    ];

    receivables?.forEach(r => {
      const days = differenceInDays(today, new Date(r.due_date));
      const pending = Number(r.amount) - Number(r.amount_paid);
      
      let index = 0;
      if (days > 60) index = 3;
      else if (days > 30) index = 2;
      else if (days > 15) index = 1;
      
      buckets[index].value += pending;
      buckets[index].count += 1;
    });

    setOverdueData(buckets);
  };

  const loadTopClients = async () => {
    const { data: receivables } = await supabase
      .from('receivables')
      .select(`
        amount_paid,
        client:clients(id, name)
      `)
      .eq('status', 'pago')
      .gte('payment_date', format(dateRange.from, 'yyyy-MM-dd'))
      .lte('payment_date', format(dateRange.to, 'yyyy-MM-dd'))
      .not('client_id', 'is', null);

    const clientMap = new Map<string, { id: string; name: string; value: number; count: number }>();

    receivables?.forEach(r => {
      if (!r.client) return;
      const existing = clientMap.get(r.client.id) || { 
        id: r.client.id, 
        name: r.client.name, 
        value: 0, 
        count: 0 
      };
      existing.value += Number(r.amount_paid);
      existing.count += 1;
      clientMap.set(r.client.id, existing);
    });

    const sorted = Array.from(clientMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    setTopClients(sorted);
  };

  const loadBalanceEvolution = async () => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 11),
      end: new Date(),
    });

    const evolution: { month: string; saldo: number }[] = [];
    let runningBalance = 0;

    // Get initial balance from accounts
    const { data: accounts } = await supabase
      .from('financial_accounts')
      .select('initial_balance');
    
    runningBalance = accounts?.reduce((sum, a) => sum + Number(a.initial_balance), 0) || 0;

    for (const month of months) {
      const startDate = format(startOfMonth(month), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(month), 'yyyy-MM-dd');

      const { data: transactions } = await supabase
        .from('transactions')
        .select('type, amount')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      const monthNet = transactions?.reduce((sum, t) => {
        return sum + (t.type === 'receita' ? Number(t.amount) : -Number(t.amount));
      }, 0) || 0;

      runningBalance += monthNet;
      
      evolution.push({
        month: format(month, 'MMM/yy', { locale: ptBR }),
        saldo: runningBalance,
      });
    }

    setBalanceEvolution(evolution);
  };

  const loadMonthlyComparison = async () => {
    const now = new Date();
    const currentMonth = { start: startOfMonth(now), end: endOfMonth(now) };
    const lastMonth = { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };

    const { data: currentTransactions } = await supabase
      .from('transactions')
      .select('type, amount')
      .gte('transaction_date', format(currentMonth.start, 'yyyy-MM-dd'))
      .lte('transaction_date', format(currentMonth.end, 'yyyy-MM-dd'));

    const { data: lastTransactions } = await supabase
      .from('transactions')
      .select('type, amount')
      .gte('transaction_date', format(lastMonth.start, 'yyyy-MM-dd'))
      .lte('transaction_date', format(lastMonth.end, 'yyyy-MM-dd'));

    const calcTotals = (transactions: typeof currentTransactions) => ({
      receitas: transactions?.filter(t => t.type === 'receita').reduce((s, t) => s + Number(t.amount), 0) || 0,
      despesas: transactions?.filter(t => t.type === 'despesa').reduce((s, t) => s + Number(t.amount), 0) || 0,
    });

    const current = calcTotals(currentTransactions);
    const last = calcTotals(lastTransactions);

    setComparisonData([
      { category: 'Receitas', mesAtual: current.receitas, mesAnterior: last.receitas },
      { category: 'Despesas', mesAtual: current.despesas, mesAnterior: last.despesas },
      { category: 'Lucro', mesAtual: current.receitas - current.despesas, mesAnterior: last.receitas - last.despesas },
    ]);
  };

  const checkAlerts = () => {
    const newAlerts: typeof alerts = [];

    if (stats.overdueReceivables > 0) {
      newAlerts.push({
        type: 'error',
        title: 'Contas em atraso',
        message: `Você tem ${formatCurrency(stats.overdueReceivables)} em contas atrasadas.`,
      });
    }

    if (stats.pendingPayables > 0) {
      const today = new Date();
      newAlerts.push({
        type: 'warning',
        title: 'Contas a pagar',
        message: `${formatCurrency(stats.pendingPayables)} em contas pendentes.`,
      });
    }

    setAlerts(newAlerts);
  };

  const lucroChange = stats.monthlyRevenue > 0 || stats.monthlyExpenses > 0
    ? ((stats.lucroLiquido) / (Math.abs(stats.monthlyRevenue) || 1)) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">
            Gerencie as finanças do seu escritório
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">Este mês</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
              <SelectItem value="all">Todo período</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => navigate('/financeiro/receber/novo')}>
            <ArrowDownLeft className="w-4 h-4 mr-2" />
            Nova Receita
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/financeiro/pagar/novo')}>
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Nova Despesa
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/financeiro/config')}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <AlertCard
              key={i}
              type={alert.type}
              title={alert.title}
              message={alert.message}
              action={{
                label: 'Ver detalhes',
                onClick: () => navigate(alert.type === 'error' ? '/financeiro/receber' : '/financeiro/pagar'),
              }}
              onDismiss={() => setAlerts(prev => prev.filter((_, idx) => idx !== i))}
            />
          ))}
        </div>
      )}

      {/* Main Stats - Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FinanceMetricCard
          title="Receita do Mês"
          value={stats.monthlyRevenue}
          icon={DollarSign}
          variant="success"
          change={stats.revenueChange}
          onClick={() => navigate('/financeiro/receber')}
        />
        <FinanceMetricCard
          title="Despesas do Mês"
          value={stats.monthlyExpenses}
          icon={TrendingDown}
          variant="danger"
          change={stats.expenseChange}
          onClick={() => navigate('/financeiro/pagar')}
        />
        <FinanceMetricCard
          title="Lucro Líquido"
          value={stats.lucroLiquido}
          icon={TrendingUp}
          variant={stats.lucroLiquido >= 0 ? 'success' : 'danger'}
        />
        <FinanceMetricCard
          title="Saldo em Contas"
          value={stats.totalBalance}
          icon={Wallet}
          variant="default"
          onClick={() => navigate('/financeiro/extrato')}
        />
      </div>

      {/* Secondary Stats - Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FinanceMetricCard
          title="A Receber Pendente"
          value={stats.pendingPayables > 0 ? stats.monthlyRevenue : 0}
          subtitle={`${stats.pendingReceivablesCount} títulos`}
          icon={Clock}
          variant="info"
          onClick={() => navigate('/financeiro/receber')}
        />
        <FinanceMetricCard
          title="A Pagar Pendente"
          value={stats.pendingPayables}
          subtitle={`${stats.pendingPayablesCount} títulos`}
          icon={Clock}
          variant="warning"
          onClick={() => navigate('/financeiro/pagar')}
        />
        <FinanceMetricCard
          title="Inadimplência"
          value={stats.overdueReceivables}
          subtitle={`${stats.overdueCount} clientes`}
          icon={AlertTriangle}
          variant="danger"
          onClick={() => navigate('/financeiro/relatorios')}
        />
        <FinanceMetricCard
          title="Honorários Recorrentes"
          value={stats.mrrValue}
          subtitle={`${stats.activeContractsCount} contratos ativos`}
          icon={FileSignature}
          variant="success"
          onClick={() => navigate('/financeiro/contratos')}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col gap-2"
          onClick={() => navigate('/financeiro/receber')}
        >
          <ArrowDownLeft className="w-5 h-5 text-green-600" />
          <span className="text-sm">Contas a Receber</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col gap-2"
          onClick={() => navigate('/financeiro/pagar')}
        >
          <ArrowUpRight className="w-5 h-5 text-red-600" />
          <span className="text-sm">Contas a Pagar</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col gap-2"
          onClick={() => navigate('/financeiro/extrato')}
        >
          <Wallet className="w-5 h-5 text-primary" />
          <span className="text-sm">Extrato</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col gap-2"
          onClick={() => navigate('/financeiro/contratos')}
        >
          <FileSignature className="w-5 h-5 text-primary" />
          <span className="text-sm">Contratos</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col gap-2"
          onClick={() => navigate('/financeiro/relatorios')}
        >
          <BarChart3 className="w-5 h-5 text-primary" />
          <span className="text-sm">Relatórios</span>
        </Button>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart data={cashFlowData} />
        <MonthlyComparisonChart 
          data={comparisonData}
          currentMonth={format(new Date(), 'MMM', { locale: ptBR })}
          previousMonth={format(subMonths(new Date(), 1), 'MMM', { locale: ptBR })}
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDistributionChart 
          title="Receitas por Tipo"
          data={revenueByCategory}
          type="receitas"
        />
        <CategoryDistributionChart 
          title="Despesas por Tipo"
          data={expenseByCategory}
          type="despesas"
        />
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OverdueAnalysisChart 
          data={overdueData}
          totalOverdue={stats.overdueReceivables}
        />
        <TopClientsChart 
          clients={topClients}
          totalRevenue={stats.monthlyRevenue}
        />
      </div>

      {/* Balance Evolution */}
      <BalanceEvolutionChart data={balanceEvolution} />

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingBills bills={upcomingBills} />
        <RecentTransactions transactions={recentTransactions} />
      </div>
    </div>
  );
};

export default FinanceDashboard;
