import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar, AlertCircle } from 'lucide-react';
import { format, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DueDateBadgeProps {
  date: string | null;
  size?: 'sm' | 'md';
}

export const DueDateBadge = ({ date, size = 'sm' }: DueDateBadgeProps) => {
  if (!date) return null;

  const dateObj = new Date(date);
  const isOverdue = isPast(dateObj) && !isToday(dateObj);
  const isDueToday = isToday(dateObj);
  const isDueTomorrow = isTomorrow(dateObj);
  const daysUntil = differenceInDays(dateObj, new Date());

  let label = format(dateObj, 'dd/MM', { locale: ptBR });
  let colorClass = 'bg-muted text-muted-foreground';

  if (isOverdue) {
    label = 'Atrasado';
    colorClass = 'bg-red-100 text-red-700';
  } else if (isDueToday) {
    label = 'Hoje';
    colorClass = 'bg-orange-100 text-orange-700';
  } else if (isDueTomorrow) {
    label = 'Amanhã';
    colorClass = 'bg-yellow-100 text-yellow-700';
  } else if (daysUntil <= 7) {
    colorClass = 'bg-blue-100 text-blue-700';
  }

  const Icon = isOverdue ? AlertCircle : Calendar;

  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1 font-normal',
        colorClass,
        size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'
      )}
    >
      <Icon className={cn(size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
      {label}
    </Badge>
  );
};
