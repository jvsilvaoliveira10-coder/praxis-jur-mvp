import { CaseActivity } from '@/types/pipeline';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ArrowRight, 
  FileText, 
  Calendar, 
  CheckCircle, 
  MessageSquare,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityTimelineProps {
  activities: CaseActivity[];
}

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  stage_change: ArrowRight,
  note: MessageSquare,
  document: FileText,
  deadline: Calendar,
  task: CheckCircle,
  created: Plus,
};

const ACTIVITY_COLORS: Record<string, string> = {
  stage_change: 'bg-blue-100 text-blue-600',
  note: 'bg-yellow-100 text-yellow-600',
  document: 'bg-purple-100 text-purple-600',
  deadline: 'bg-orange-100 text-orange-600',
  task: 'bg-green-100 text-green-600',
  created: 'bg-gray-100 text-gray-600',
};

export const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Nenhuma atividade registrada
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = ACTIVITY_ICONS[activity.activity_type] || MessageSquare;
        const colorClass = ACTIVITY_COLORS[activity.activity_type] || ACTIVITY_COLORS.note;
        const isLast = index === activities.length - 1;

        return (
          <div key={activity.id} className="flex gap-3">
            {/* Timeline line & icon */}
            <div className="flex flex-col items-center">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', colorClass)}>
                <Icon className="w-4 h-4" />
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-border mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <p className="text-sm">{activity.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(activity.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
