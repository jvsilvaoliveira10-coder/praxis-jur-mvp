import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  PaymentStatus, 
  PAYMENT_STATUS_LABELS, 
  PAYMENT_STATUS_COLORS 
} from '@/types/finance';
import { CheckCircle, Clock, AlertCircle, XCircle, CircleDot } from 'lucide-react';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  showIcon?: boolean;
  className?: string;
}

const statusIcons = {
  pago: CheckCircle,
  pendente: Clock,
  atrasado: AlertCircle,
  cancelado: XCircle,
  parcial: CircleDot,
};

export const PaymentStatusBadge = ({ 
  status, 
  showIcon = true,
  className 
}: PaymentStatusBadgeProps) => {
  const Icon = statusIcons[status];
  
  return (
    <Badge 
      variant="secondary"
      className={cn(PAYMENT_STATUS_COLORS[status], 'gap-1.5', className)}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  );
};
