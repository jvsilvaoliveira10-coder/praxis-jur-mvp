import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/types/finance';

interface FinanceStatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  change?: number;
  isCurrency?: boolean;
}

export const FinanceStatsCard = ({
  title,
  value,
  icon: Icon,
  variant = 'default',
  change,
  isCurrency = true,
}: FinanceStatsCardProps) => {
  const variantStyles = {
    default: 'bg-card',
    success: 'bg-green-50 dark:bg-green-950/30',
    danger: 'bg-red-50 dark:bg-red-950/30',
    warning: 'bg-yellow-50 dark:bg-yellow-950/30',
  };

  const iconStyles = {
    default: 'text-primary bg-primary/10',
    success: 'text-green-600 bg-green-100 dark:bg-green-900/50',
    danger: 'text-red-600 bg-red-100 dark:bg-red-900/50',
    warning: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50',
  };

  return (
    <Card className={cn('overflow-hidden', variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
              {isCurrency ? formatCurrency(value) : value.toLocaleString('pt-BR')}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1">
                {change >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    change >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {change >= 0 ? '+' : ''}
                  {change.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">vs mês anterior</span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-full', iconStyles[variant])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
