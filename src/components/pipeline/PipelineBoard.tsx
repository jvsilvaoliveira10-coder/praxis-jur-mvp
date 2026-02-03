import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PipelineColumn } from './PipelineColumn';
import { PipelineCard } from './PipelineCard';
import { CaseStage, CaseWithPipeline, PipelineColumn as PipelineColumnType } from '@/types/pipeline';

interface PipelineBoardProps {
  columns: PipelineColumnType[];
  onCardClick: (caseData: CaseWithPipeline) => void;
  onCardMove: (caseId: string, newStageId: string) => void;
  onAddClick?: (stageId: string) => void;
}

export const PipelineBoard = ({ columns, onCardClick, onCardMove, onAddClick }: PipelineBoardProps) => {
  const [activeCase, setActiveCase] = useState<CaseWithPipeline | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const caseId = active.id as string;
    
    // Find the case across all columns
    for (const column of columns) {
      const foundCase = column.cases.find(c => c.id === caseId);
      if (foundCase) {
        setActiveCase(foundCase);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCase(null);

    if (!over) return;

    const caseId = active.id as string;
    const newStageId = over.id as string;

    // Check if dropped on a column (stage)
    const isDroppedOnColumn = columns.some(col => col.stage.id === newStageId);
    
    if (isDroppedOnColumn) {
      // Find current stage of the case
      let currentStageId: string | null = null;
      for (const column of columns) {
        if (column.cases.some(c => c.id === caseId)) {
          currentStageId = column.stage.id;
          break;
        }
      }

      if (currentStageId && currentStageId !== newStageId) {
        onCardMove(caseId, newStageId);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="w-full">
        <div className="flex gap-4 p-4 min-h-[calc(100vh-240px)]">
          {columns.map((column) => (
            <PipelineColumn
              key={column.stage.id}
              stage={column.stage}
              cases={column.cases}
              onCardClick={onCardClick}
              onAddClick={onAddClick ? () => onAddClick(column.stage.id) : undefined}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <DragOverlay>
        {activeCase ? (
          <div className="opacity-80 rotate-3">
            <PipelineCard
              caseData={activeCase}
              onClick={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
