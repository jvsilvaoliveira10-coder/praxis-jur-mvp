import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import type { CardData } from '../ProcessManagementSection';

interface KanbanCardProps {
  card: CardData;
}

export function KanbanCard({ card }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'bg-card border rounded-md p-1.5 sm:p-2 shadow-sm cursor-grab active:cursor-grabbing transition-all touch-none',
        isDragging ? 'opacity-70 shadow-lg scale-105 ring-2 ring-primary/20' : 'hover:shadow-md'
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-foreground truncate">
          {card.name}
        </span>
      </div>
      <div className={cn(
        'text-[10px] px-1.5 py-0.5 rounded-full w-fit text-white',
        card.priorityColor
      )}>
        {card.priority}
      </div>
    </div>
  );
}
