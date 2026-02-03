import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Receipt, ArrowDownCircle, ArrowUpCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency, PAYMENT_METHOD_LABELS, TRANSACTION_TYPE_LABELS } from '@/types/finance';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  transaction_date: string;
  type: 'receita' | 'despesa';
  payment_method: string | null;
  is_confirmed: boolean;
  account_id: string | null;
  financial_accounts?: { name: string } | null;
}

interface Account {
  id: string;
  name: string;
  current_balance: number;
}

const Transactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  
  const [newTransaction, setNewTransaction] = useState({
    type: 'receita' as 'receita' | 'despesa',
    description: '',
    amount: '',
    transaction_date: format(new Date(), 'yyyy-MM-dd'),
    account_id: '',
    payment_method: 'pix',
  });

  const fetchData = async () => {
    setLoading(true);
    
    const [transactionsRes, accountsRes] = await Promise.all([
      supabase
        .from('transactions')
        .select(`*, financial_accounts(name)`)
        .order('transaction_date', { ascending: false })
        .limit(100),
      supabase
        .from('financial_accounts')
        .select('id, name, current_balance')
        .eq('is_active', true)
        .order('name'),
    ]);

    if (transactionsRes.error) {
      toast({ variant: 'destructive', title: 'Erro ao carregar transações', description: transactionsRes.error.message });
    } else {
      setTransactions(transactionsRes.data as Transaction[]);
    }

    if (accountsRes.data) {
      setAccounts(accountsRes.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.account_id) {
      toast({ variant: 'destructive', title: 'Preencha todos os campos obrigatórios' });
      return;
    }

    const { error } = await supabase.from('transactions').insert([{
      user_id: user?.id!,
      type: newTransaction.type,
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount.replace(',', '.')) || 0,
      transaction_date: newTransaction.transaction_date,
      account_id: newTransaction.account_id,
      payment_method: newTransaction.payment_method as 'pix' | 'boleto' | 'cartao_credito' | 'cartao_debito' | 'transferencia' | 'dinheiro' | 'cheque',
      is_confirmed: true,
    }]);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar lançamento', description: error.message });
    } else {
      toast({ title: 'Lançamento criado com sucesso' });
      setModalOpen(false);
      setNewTransaction({
        type: 'receita',
        description: '',
        amount: '',
        transaction_date: format(new Date(), 'yyyy-MM-dd'),
        account_id: '',
        payment_method: 'pix',
      });
      fetchData();
    }
  };

  const filteredTransactions = transactions.filter((item) => {
    const matchesSearch = item.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totals = {
    income: filteredTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0),
    expense: filteredTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0),
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Extrato</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Visualize todas as movimentações financeiras
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Lançamento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700 dark:text-green-400">Entradas</p>
            </div>
            <p className="text-xl font-bold text-green-800 dark:text-green-300 mt-1">
              {formatCurrency(totals.income)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700 dark:text-red-400">Saídas</p>
            </div>
            <p className="text-xl font-bold text-red-800 dark:text-red-300 mt-1">
              {formatCurrency(totals.expense)}
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-2 lg:col-span-1 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700 dark:text-blue-400">Saldo do Período</p>
            <p className={cn(
              "text-xl font-bold mt-1",
              totals.income - totals.expense >= 0 
                ? "text-green-800 dark:text-green-300" 
                : "text-red-800 dark:text-red-300"
            )}>
              {formatCurrency(totals.income - totals.expense)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                {search || typeFilter !== 'all' ? 'Nenhum resultado encontrado' : 'Nenhuma movimentação'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {search || typeFilter !== 'all' ? 'Tente outros filtros' : 'Clique em "Novo Lançamento" para começar'}
              </p>
            </div>
          ) : isMobile ? (
            <div className="space-y-3">
              {filteredTransactions.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.financial_accounts?.name || 'Sem conta'}
                      </p>
                    </div>
                    <div className={cn(
                      "text-right",
                      item.type === 'receita' ? 'text-green-600' : 'text-red-600'
                    )}>
                      <p className="font-bold">
                        {item.type === 'receita' ? '+' : '-'} {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{format(new Date(item.transaction_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                    {item.is_confirmed && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-xs">Confirmado</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead>Forma Pgto</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Confirmado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {format(new Date(item.transaction_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium max-w-48 truncate">
                        {item.description}
                      </TableCell>
                      <TableCell>{item.financial_accounts?.name || '-'}</TableCell>
                      <TableCell>
                        {item.payment_method 
                          ? PAYMENT_METHOD_LABELS[item.payment_method as keyof typeof PAYMENT_METHOD_LABELS] || item.payment_method
                          : '-'}
                      </TableCell>
                      <TableCell className={cn(
                        "text-right font-medium",
                        item.type === 'receita' ? 'text-green-600' : 'text-red-600'
                      )}>
                        {item.type === 'receita' ? '+' : '-'} {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell>
                        {item.is_confirmed && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Transaction Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Lançamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={newTransaction.type} 
                onValueChange={(v) => setNewTransaction({ ...newTransaction, type: v as 'receita' | 'despesa' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input
                placeholder="Descrição do lançamento"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor (R$) *</Label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Data *</Label>
              <Input
                type="date"
                value={newTransaction.transaction_date}
                onChange={(e) => setNewTransaction({ ...newTransaction, transaction_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Conta *</Label>
              <Select 
                value={newTransaction.account_id} 
                onValueChange={(v) => setNewTransaction({ ...newTransaction, account_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select 
                value={newTransaction.payment_method} 
                onValueChange={(v) => setNewTransaction({ ...newTransaction, payment_method: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateTransaction}>Criar Lançamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
