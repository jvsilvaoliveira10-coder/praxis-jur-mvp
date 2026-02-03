import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, PAYMENT_METHOD_LABELS } from '@/types/finance';
import { format } from 'date-fns';

interface Account {
  id: string;
  name: string;
}

interface QuickPaymentModalProps {
  open: boolean;
  onClose: () => void;
  type: 'receivable' | 'payable';
  item: {
    id: string;
    description: string;
    amount: number;
    amount_paid: number;
  };
  onSuccess: () => void;
}

export const QuickPaymentModal = ({
  open,
  onClose,
  type,
  item,
  onSuccess,
}: QuickPaymentModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const remainingAmount = item.amount - item.amount_paid;

  const [form, setForm] = useState({
    amount: String(remainingAmount),
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    account_id: '',
    payment_method: 'pix',
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data } = await supabase
        .from('financial_accounts')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (data) setAccounts(data);
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      amount: String(remainingAmount),
    }));
  }, [remainingAmount]);

  const handleSubmit = async () => {
    if (!form.account_id) {
      toast({ variant: 'destructive', title: 'Selecione uma conta' });
      return;
    }

    const paymentAmount = parseFloat(form.amount.replace(',', '.')) || 0;
    if (paymentAmount <= 0) {
      toast({ variant: 'destructive', title: 'Valor inválido' });
      return;
    }

    setLoading(true);

    // Create transaction
    const { error: transactionError } = await supabase.from('transactions').insert([{
      user_id: user?.id!,
      type: type === 'receivable' ? 'receita' as const : 'despesa' as const,
      description: item.description,
      amount: paymentAmount,
      transaction_date: form.payment_date,
      account_id: form.account_id,
      payment_method: form.payment_method as 'pix' | 'boleto' | 'cartao_credito' | 'cartao_debito' | 'transferencia' | 'dinheiro' | 'cheque',
      is_confirmed: true,
      receivable_id: type === 'receivable' ? item.id : null,
      payable_id: type === 'payable' ? item.id : null,
    }]);

    if (transactionError) {
      toast({ variant: 'destructive', title: 'Erro ao criar transação', description: transactionError.message });
      setLoading(false);
      return;
    }

    // Update receivable/payable status
    const newAmountPaid = item.amount_paid + paymentAmount;
    const newStatus = newAmountPaid >= item.amount ? 'pago' : 'parcial';
    
    const tableName = type === 'receivable' ? 'receivables' : 'payables';
    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        amount_paid: newAmountPaid,
        status: newStatus,
        payment_date: newStatus === 'pago' ? form.payment_date : null,
      })
      .eq('id', item.id);

    if (updateError) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar status', description: updateError.message });
    } else {
      toast({ 
        title: type === 'receivable' ? 'Recebimento registrado' : 'Pagamento registrado',
        description: `${formatCurrency(paymentAmount)} ${newStatus === 'pago' ? 'liquidado' : 'recebido parcialmente'}`,
      });
      onSuccess();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'receivable' ? 'Registrar Recebimento' : 'Registrar Pagamento'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="text-sm text-muted-foreground">Descrição</p>
            <p className="font-medium">{item.description}</p>
            <div className="flex justify-between mt-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Valor total</span>
              <span className="font-medium">{formatCurrency(item.amount)}</span>
            </div>
            {item.amount_paid > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Já pago</span>
                <span className="text-green-600">{formatCurrency(item.amount_paid)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Restante</span>
              <span className="font-bold">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Valor a {type === 'receivable' ? 'receber' : 'pagar'} (R$)</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={form.payment_date}
              onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Conta *</Label>
            <Select value={form.account_id} onValueChange={(v) => setForm({ ...form, account_id: v })}>
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
            <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
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
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Processando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
