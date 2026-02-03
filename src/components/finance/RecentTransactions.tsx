import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDownLeft, ArrowUpRight, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCurrency, Transaction, PAYMENT_METHOD_LABELS } from '@/types/finance';
import { Link } from 'react-router-dom';

interface RecentTransactionsProps {
  transactions: Transaction[];
  showViewAll?: boolean;
}

export const RecentTransactions = ({ 
  transactions,
  showViewAll = true 
}: RecentTransactionsProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Últimas Movimentações</CardTitle>
          {showViewAll && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/financeiro/extrato">Ver todas</Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma movimentação registrada
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-full',
                      transaction.type === 'receita'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/50'
                        : 'bg-red-100 text-red-600 dark:bg-red-900/50'
                    )}
                  >
                    {transaction.type === 'receita' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {format(new Date(transaction.transaction_date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      {transaction.payment_method && (
                        <>
                          <span>•</span>
                          <span>{PAYMENT_METHOD_LABELS[transaction.payment_method]}</span>
                        </>
                      )}
                      {transaction.account && (
                        <>
                          <span>•</span>
                          <span>{transaction.account.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <p className={cn(
                  'font-semibold',
                  transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'
                )}>
                  {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
