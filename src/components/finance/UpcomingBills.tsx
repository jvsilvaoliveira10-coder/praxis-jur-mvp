import { format, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDownLeft, ArrowUpRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency, UpcomingBill } from '@/types/finance';
import { PaymentStatusBadge } from './PaymentStatusBadge';

interface UpcomingBillsProps {
  bills: UpcomingBill[];
  title?: string;
  emptyMessage?: string;
}

export const UpcomingBills = ({ 
  bills, 
  title = 'Próximos Vencimentos',
  emptyMessage = 'Nenhuma conta nos próximos 7 dias'
}: UpcomingBillsProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bills.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => {
              const dueDate = new Date(bill.due_date);
              const isOverdue = isPast(dueDate) && bill.status !== 'pago';
              const isDueToday = isToday(dueDate);

              return (
                <div
                  key={`${bill.type}-${bill.id}`}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    isOverdue && 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20',
                    isDueToday && !isOverdue && 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20',
                    !isOverdue && !isDueToday && 'border-border bg-muted/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'p-2 rounded-full',
                        bill.type === 'receivable'
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/50'
                          : 'bg-red-100 text-red-600 dark:bg-red-900/50'
                      )}
                    >
                      {bill.type === 'receivable' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{bill.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {bill.type === 'receivable' 
                          ? bill.client_name || 'Sem cliente'
                          : bill.supplier_name || 'Sem fornecedor'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'font-semibold',
                      bill.type === 'receivable' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {bill.type === 'receivable' ? '+' : '-'}{formatCurrency(bill.amount)}
                    </p>
                    <p className={cn(
                      'text-xs',
                      isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'
                    )}>
                      {isOverdue 
                        ? 'Vencido' 
                        : isDueToday 
                          ? 'Vence hoje'
                          : format(dueDate, "dd 'de' MMM", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
