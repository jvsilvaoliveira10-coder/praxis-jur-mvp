import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info, XCircle, ChevronRight } from 'lucide-react';

interface AlertCardProps {
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export function AlertCard({ type, title, message, action, onDismiss }: AlertCardProps) {
  const styles = {
    error: {
      bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
      icon: XCircle,
      iconColor: 'text-red-600 dark:text-red-400',
      titleColor: 'text-red-800 dark:text-red-300',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      titleColor: 'text-yellow-800 dark:text-yellow-300',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600 dark:text-green-400',
      titleColor: 'text-green-800 dark:text-green-300',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
      titleColor: 'text-blue-800 dark:text-blue-300',
    },
  };

  const { bg, icon: Icon, iconColor, titleColor } = styles[type];

  return (
    <Card className={cn('border', bg)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColor)} />
          <div className="flex-1 min-w-0">
            <h4 className={cn('font-medium text-sm', titleColor)}>{title}</h4>
            <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
            {action && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 h-7 px-2 -ml-2"
                onClick={action.onClick}
              >
                {action.label}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-1 -mt-1"
              onClick={onDismiss}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
