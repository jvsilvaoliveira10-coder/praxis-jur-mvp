import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { CaseStage, CaseWithPipeline } from '@/types/pipeline';
import { PipelineCard } from './PipelineCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PipelineColumnProps {
  stage: CaseStage;
  cases: CaseWithPipeline[];
  onCardClick: (caseData: CaseWithPipeline) => void;
  onAddClick?: () => void;
}

export const PipelineColumn = ({ stage, cases, onCardClick, onAddClick }: PipelineColumnProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: stage.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col w-[300px] min-w-[300px] bg-muted/30 rounded-lg border border-border/50',
        isOver && 'ring-2 ring-primary/50 bg-primary/5'
      )}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <h3 className="font-medium text-sm">{stage.name}</h3>
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {cases.length}
            </span>
          </div>
          {onAddClick && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onAddClick}>
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
        {stage.description && (
          <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
        )}
      </div>

      {/* Cards Container */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-280px)]">
        <div className="p-2 space-y-2">
          <SortableContext
            items={cases.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {cases.map((caseData) => (
              <PipelineCard
                key={caseData.id}
                caseData={caseData}
                onClick={() => onCardClick(caseData)}
              />
            ))}
          </SortableContext>

          {cases.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm">
              <p>Nenhum processo</p>
              <p className="text-xs">Arraste um card para cá</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
