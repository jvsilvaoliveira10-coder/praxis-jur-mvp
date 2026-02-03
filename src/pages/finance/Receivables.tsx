import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Search, Edit, Trash2, ArrowDownCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { PaymentStatusBadge } from '@/components/finance/PaymentStatusBadge';
import { QuickPaymentModal } from '@/components/finance/QuickPaymentModal';
import { 
  RECEIVABLE_TYPE_LABELS, 
  PAYMENT_STATUS_LABELS,
  formatCurrency
} from '@/types/finance';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Receivable {
  id: string;
  description: string;
  amount: number;
  amount_paid: number;
  due_date: string;
  payment_date: string | null;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado' | 'parcial';
  receivable_type: string;
  client_id: string | null;
  case_id: string | null;
  notes: string | null;
  clients?: { name: string } | null;
}

const Receivables = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<{open: boolean; item: Receivable | null}>({
    open: false,
    item: null
  });

  const fetchReceivables = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('receivables')
      .select(`
        *,
        clients(name)
      `)
      .order('due_date', { ascending: true });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar contas a receber',
        description: error.message,
      });
    } else {
      setReceivables(data as Receivable[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReceivables();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('receivables').delete().eq('id', deleteId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: error.message,
      });
    } else {
      toast({ title: 'Conta a receber excluída com sucesso' });
      fetchReceivables();
    }
    setDeleteId(null);
  };

  const handlePaymentSuccess = () => {
    fetchReceivables();
    setPaymentModal({ open: false, item: null });
  };

  const filteredReceivables = receivables.filter((item) => {
    const matchesSearch = item.description.toLowerCase().includes(search.toLowerCase()) ||
      (item.clients?.name?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totals = {
    pending: filteredReceivables
      .filter(r => r.status === 'pendente')
      .reduce((sum, r) => sum + (r.amount - r.amount_paid), 0),
    overdue: filteredReceivables
      .filter(r => r.status === 'atrasado')
      .reduce((sum, r) => sum + (r.amount - r.amount_paid), 0),
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Contas a Receber</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gerencie seus recebíveis e honorários
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/financeiro/receber/novo">
            <Plus className="w-4 h-4 mr-2" />
            Nova Receita
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <p className="text-sm text-amber-700 dark:text-amber-400">Pendente</p>
            <p className="text-xl font-bold text-amber-800 dark:text-amber-300">
              {formatCurrency(totals.pending)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <p className="text-sm text-red-700 dark:text-red-400">Atrasado</p>
            <p className="text-xl font-bold text-red-800 dark:text-red-300">
              {formatCurrency(totals.overdue)}
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
                placeholder="Buscar por descrição ou cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredReceivables.length === 0 ? (
            <div className="text-center py-12">
              <ArrowDownCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                {search || statusFilter !== 'all' ? 'Nenhum resultado encontrado' : 'Nenhuma conta a receber'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {search || statusFilter !== 'all' ? 'Tente outros filtros' : 'Clique em "Nova Receita" para começar'}
              </p>
            </div>
          ) : isMobile ? (
            <div className="space-y-3">
              {filteredReceivables.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.description}</p>
                      {item.clients?.name && (
                        <p className="text-sm text-muted-foreground">{item.clients.name}</p>
                      )}
                    </div>
                    <PaymentStatusBadge status={item.status} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {format(new Date(item.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                    <span className="font-bold text-lg">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t">
                    {item.status !== 'pago' && item.status !== 'cancelado' && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setPaymentModal({ open: true, item })}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Receber
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/financeiro/receber/${item.id}/editar`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceivables.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-48 truncate">
                        {item.description}
                      </TableCell>
                      <TableCell>{item.clients?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {RECEIVABLE_TYPE_LABELS[item.receivable_type as keyof typeof RECEIVABLE_TYPE_LABELS] || item.receivable_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(item.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.status !== 'pago' && item.status !== 'cancelado' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setPaymentModal({ open: true, item })}
                              title="Receber"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/financeiro/receber/${item.id}/editar`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta conta a receber? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="w-full sm:w-auto">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Modal */}
      {paymentModal.item && (
        <QuickPaymentModal
          open={paymentModal.open}
          onClose={() => setPaymentModal({ open: false, item: null })}
          type="receivable"
          item={{
            id: paymentModal.item.id,
            description: paymentModal.item.description,
            amount: paymentModal.item.amount,
            amount_paid: paymentModal.item.amount_paid,
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Receivables;
