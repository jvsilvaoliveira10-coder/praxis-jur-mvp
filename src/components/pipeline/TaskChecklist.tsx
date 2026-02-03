import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CaseTask } from '@/types/pipeline';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TaskChecklistProps {
  tasks: CaseTask[];
  onTaskToggle: (taskId: string, completed: boolean) => void;
  onTaskAdd: (title: string) => void;
  onTaskDelete: (taskId: string) => void;
}

export const TaskChecklist = ({ tasks, onTaskToggle, onTaskAdd, onTaskDelete }: TaskChecklistProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newTaskTitle.trim()) {
      onTaskAdd(newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTaskTitle('');
    }
  };

  const completedCount = tasks.filter(t => t.is_completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* Progress */}
      {tasks.length > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{completedCount} de {tasks.length}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              'flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 group',
              task.is_completed && 'opacity-60'
            )}
          >
            <Checkbox
              checked={task.is_completed}
              onCheckedChange={(checked) => onTaskToggle(task.id, checked as boolean)}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm',
                task.is_completed && 'line-through text-muted-foreground'
              )}>
                {task.title}
              </p>
              {task.due_date && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onTaskDelete(task.id)}
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add Task */}
      {isAdding ? (
        <div className="flex items-center gap-2">
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Título da tarefa"
            autoFocus
            className="flex-1"
          />
          <Button size="sm" onClick={handleAdd}>
            Adicionar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
            Cancelar
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="w-4 h-4" />
          Adicionar tarefa
        </Button>
      )}
    </div>
  );
};
