import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { KanbanCard } from './KanbanCard';
import type { ColumnData } from '../ProcessManagementSection';

interface KanbanColumnProps {
  column: ColumnData;
}

export function KanbanColumn({ column }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        'flex-shrink-0 w-36 bg-muted/50 rounded-lg p-2 transition-all duration-200',
        isOver && 'bg-muted ring-2 ring-primary/30'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: column.color }}
          />
          <span className="text-xs font-medium text-foreground truncate">
            {column.name}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {column.cards.length}
        </span>
      </div>
      
      {/* Cards */}
      <div className={cn(
        'space-y-2 min-h-[60px] transition-colors rounded-md',
        isOver && 'bg-primary/5'
      )}>
        {column.cards.map((card) => (
          <KanbanCard key={card.id} card={card} />
        ))}
        
        {column.cards.length === 0 && (
          <div className="h-14 border-2 border-dashed border-muted-foreground/20 rounded-md flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground">Solte aqui</span>
          </div>
        )}
      </div>
    </div>
  );
}
