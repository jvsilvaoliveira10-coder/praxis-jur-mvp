import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CaseWithPipeline, ACTION_TYPE_LABELS } from '@/types/pipeline';
import { PriorityBadge } from './PriorityBadge';
import { DueDateBadge } from './DueDateBadge';
import { CheckCircle2, Circle, GripVertical, User } from 'lucide-react';

interface PipelineCardProps {
  caseData: CaseWithPipeline;
  onClick: () => void;
}

export const PipelineCard = ({ caseData, onClick }: PipelineCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: caseData.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const completedTasks = caseData.tasks?.filter(t => t.is_completed).length || 0;
  const totalTasks = caseData.tasks?.length || 0;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-3 cursor-pointer hover:shadow-md transition-all group bg-card',
        isDragging && 'opacity-50 shadow-lg rotate-2'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Header with badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {caseData.pipeline?.priority && (
              <PriorityBadge priority={caseData.pipeline.priority} />
            )}
            <Badge variant="outline" className="text-xs">
              {ACTION_TYPE_LABELS[caseData.action_type] || caseData.action_type}
            </Badge>
          </div>

          {/* Client & Opposing Party */}
          <div className="space-y-0.5">
            <p className="font-medium text-sm leading-tight flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="truncate">{caseData.client?.name || 'Cliente não vinculado'}</span>
            </p>
            <p className="text-xs text-muted-foreground truncate">
              vs. {caseData.opposing_party}
            </p>
          </div>

          {/* Process Number */}
          {caseData.process_number && (
            <p className="text-xs font-mono text-muted-foreground truncate">
              {caseData.process_number}
            </p>
          )}

          {/* Tasks Progress */}
          {totalTasks > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {completedTasks === totalTasks ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Circle className="w-3.5 h-3.5" />
              )}
              <span>
                {completedTasks}/{totalTasks} tarefas
              </span>
            </div>
          )}

          {/* Footer with due date and court */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <DueDateBadge date={caseData.pipeline?.due_date || null} />
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {caseData.court}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
