import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/types/finance';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FinanceMetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  subtitle?: string;
  change?: number;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  isCurrency?: boolean;
  onClick?: () => void;
}

export function FinanceMetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
  change,
  variant = 'default',
  isCurrency = true,
  onClick
}: FinanceMetricCardProps) {
  const variantStyles = {
    default: 'bg-card',
    success: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
    danger: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
  };

  const iconStyles = {
    default: 'text-primary',
    success: 'text-green-600 dark:text-green-400',
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  const getTrendIcon = () => {
    if (change === undefined || change === 0) return <Minus className="h-3 w-3" />;
    return change > 0 
      ? <TrendingUp className="h-3 w-3 text-green-500" /> 
      : <TrendingDown className="h-3 w-3 text-red-500" />;
  };

  const getChangeColor = () => {
    if (change === undefined || change === 0) return 'text-muted-foreground';
    // For expenses, negative change is good
    if (variant === 'danger') {
      return change < 0 ? 'text-green-600' : 'text-red-600';
    }
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card 
      className={cn(
        'transition-all hover:shadow-md',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:scale-[1.02]'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">
              {title}
            </p>
            <p className={cn(
              'text-xl font-bold mt-1 truncate',
              variant === 'danger' && value > 0 && 'text-red-600 dark:text-red-400',
              variant === 'success' && value > 0 && 'text-green-600 dark:text-green-400',
              variant === 'warning' && value > 0 && 'text-yellow-600 dark:text-yellow-400'
            )}>
              {isCurrency ? formatCurrency(value) : value.toLocaleString('pt-BR')}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
            {change !== undefined && (
              <div className={cn('flex items-center gap-1 mt-1', getChangeColor())}>
                {getTrendIcon()}
                <span className="text-xs font-medium">
                  {change > 0 ? '+' : ''}{change.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">vs mês anterior</span>
              </div>
            )}
          </div>
          <div className={cn(
            'p-2 rounded-lg bg-background/50',
            iconStyles[variant]
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
