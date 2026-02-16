import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GenerationStage } from '@/hooks/usePetitionGeneration';

interface PetitionGenerationProgressProps {
  stages: GenerationStage[];
  currentStage: string | null;
  error?: string | null;
}

const stageIcons = {
  pending: <Circle className="w-4 h-4 text-muted-foreground" />,
  running: <Loader2 className="w-4 h-4 text-primary animate-spin" />,
  done: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  error: <XCircle className="w-4 h-4 text-destructive" />,
};

export const PetitionGenerationProgress = ({ stages, currentStage, error }: PetitionGenerationProgressProps) => {
  const completedCount = stages.filter(s => s.status === 'done').length;
  const progress = (completedCount / stages.length) * 100;

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Progresso da Geração</h3>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{stages.length} etapas
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage list */}
      <div className="space-y-2">
        {stages.map((stage) => (
          <div 
            key={stage.id}
            className={cn(
              'flex items-center gap-3 py-1.5 px-2 rounded-lg transition-colors text-sm',
              stage.status === 'running' && 'bg-primary/5',
              stage.status === 'done' && 'text-muted-foreground',
              stage.status === 'error' && 'bg-destructive/5',
            )}
          >
            {stageIcons[stage.status]}
            <span className={cn(
              stage.status === 'running' && 'font-medium text-primary',
              stage.status === 'error' && 'text-destructive',
            )}>
              {stage.label}
            </span>
            {stage.detail && (
              <span className="ml-auto text-xs text-muted-foreground">{stage.detail}</span>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
};
