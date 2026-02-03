import { Badge } from '@/components/ui/badge';
import { CasePriority, PRIORITY_CONFIG } from '@/types/pipeline';
import { cn } from '@/lib/utils';
import { AlertTriangle, ArrowDown, ArrowUp, Flame } from 'lucide-react';

interface PriorityBadgeProps {
  priority: CasePriority;
  size?: 'sm' | 'md';
}

const PRIORITY_ICONS: Record<CasePriority, React.ElementType> = {
  baixa: ArrowDown,
  media: ArrowUp,
  alta: AlertTriangle,
  urgente: Flame,
};

export const PriorityBadge = ({ priority, size = 'sm' }: PriorityBadgeProps) => {
  const config = PRIORITY_CONFIG[priority];
  const Icon = PRIORITY_ICONS[priority];

  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1 font-medium',
        config.bgColor,
        config.color,
        size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'
      )}
    >
      <Icon className={cn(size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
      {config.label}
    </Badge>
  );
};
