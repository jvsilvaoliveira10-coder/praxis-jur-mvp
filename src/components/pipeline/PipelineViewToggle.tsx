import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Kanban, List, Calendar } from 'lucide-react';

export type PipelineView = 'kanban' | 'list' | 'calendar';

interface PipelineViewToggleProps {
  view: PipelineView;
  onViewChange: (view: PipelineView) => void;
}

export const PipelineViewToggle = ({ view, onViewChange }: PipelineViewToggleProps) => {
  return (
    <ToggleGroup
      type="single"
      value={view}
      onValueChange={(value) => value && onViewChange(value as PipelineView)}
      className="bg-muted rounded-lg p-1"
    >
      <ToggleGroupItem
        value="kanban"
        aria-label="Visualização Kanban"
        className="data-[state=on]:bg-background data-[state=on]:shadow-sm px-3"
      >
        <Kanban className="w-4 h-4 mr-2" />
        Kanban
      </ToggleGroupItem>
      <ToggleGroupItem
        value="list"
        aria-label="Visualização em Lista"
        className="data-[state=on]:bg-background data-[state=on]:shadow-sm px-3"
      >
        <List className="w-4 h-4 mr-2" />
        Lista
      </ToggleGroupItem>
      <ToggleGroupItem
        value="calendar"
        aria-label="Visualização Calendário"
        className="data-[state=on]:bg-background data-[state=on]:shadow-sm px-3"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Calendário
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
