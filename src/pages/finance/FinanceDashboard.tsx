import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingDown, 
  Wallet, 
  AlertTriangle, 
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FinanceStatsCard } from '@/components/finance/FinanceStatsCard';
import { CashFlowChart } from '@/components/finance/CashFlowChart';
import { RevenueExpenseChart } from '@/components/finance/RevenueExpenseChart';
import { UpcomingBills } from '@/components/finance/UpcomingBills';
import { RecentTransactions } from '@/components/finance/RecentTransactions';
import { 
  FinanceStats, 
  CashFlowData, 
  UpcomingBill, 
  Transaction,
  formatCurrency 
} from '@/types/finance';
import { format, subMonths, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<FinanceStats>({
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    totalBalance: 0,
    overdueReceivables: 0,
    pendingPayables: 0,
    revenueChange: 0,
    expenseChange: 0,
  });
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<UpcomingBill[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load stats in parallel
      await Promise.all([
        loadStats(),
        loadCashFlowData(),
        loadUpcomingBills(),
        loadRecentTransactions(),
      ]);
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

    // Get current month transactions
    const { data: currentMonthTransactions } = await supabase
      .from('transactions')
      .select('type, amount')
      .gte('transaction_date', format(startOfCurrentMonth, 'yyyy-MM-dd'))
      .lte('transaction_date', format(endOfCurrentMonth, 'yyyy-MM-dd'));

    // Get last month transactions for comparison
    const { data: lastMonthTransactions } = await supabase
      .from('transactions')
      .select('type, amount')
      .gte('transaction_date', format(startOfLastMonth, 'yyyy-MM-dd'))
      .lte('transaction_date', format(endOfLastMonth, 'yyyy-MM-dd'));

    // Get total balance from accounts
    const { data: accounts } = await supabase
      .from('financial_accounts')
      .select('current_balance')
      .eq('is_active', true);

    // Get overdue receivables
    const { data: overdueReceivables } = await supabase
      .from('receivables')
      .select('amount, amount_paid')
      .eq('status', 'atrasado');

    // Get pending payables for today
    const { data: pendingPayables } = await supabase
      .from('payables')
      .select('amount')
      .eq('status', 'pendente')
      .lte('due_date', format(now, 'yyyy-MM-dd'));

    // Calculate stats
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

    const pendingTotal = pendingPayables?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    setStats({
      monthlyRevenue: currentRevenue,
      monthlyExpenses: currentExpenses,
      totalBalance,
      overdueReceivables: overdueTotal,
      pendingPayables: pendingTotal,
      revenueChange: lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0,
      expenseChange: lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0,
    });
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

    // Get upcoming receivables
    const { data: receivables } = await supabase
      .from('receivables')
      .select('id, description, amount, due_date, status, client:clients(name)')
      .in('status', ['pendente', 'atrasado'])
      .lte('due_date', format(sevenDaysFromNow, 'yyyy-MM-dd'))
      .order('due_date', { ascending: true })
      .limit(5);

    // Get upcoming payables
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
        <div className="flex flex-wrap gap-2">
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinanceStatsCard
          title="Receita do Mês"
          value={stats.monthlyRevenue}
          icon={DollarSign}
          variant="success"
          change={stats.revenueChange}
        />
        <FinanceStatsCard
          title="Despesas do Mês"
          value={stats.monthlyExpenses}
          icon={TrendingDown}
          variant="danger"
          change={stats.expenseChange}
        />
        <FinanceStatsCard
          title="Saldo em Contas"
          value={stats.totalBalance}
          icon={Wallet}
          variant="default"
        />
        <FinanceStatsCard
          title="A Receber Atrasado"
          value={stats.overdueReceivables}
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
          <DollarSign className="w-5 h-5 text-primary" />
          <span className="text-sm">Contratos</span>
        </Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart data={cashFlowData} />
        <RevenueExpenseChart data={cashFlowData} />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingBills bills={upcomingBills} />
        <RecentTransactions transactions={recentTransactions} />
      </div>
    </div>
  );
};

export default FinanceDashboard;
