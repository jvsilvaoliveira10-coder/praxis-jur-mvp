import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFirmSettings } from '@/hooks/useFirmSettings';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp,
  X,
  Sparkles,
  User,
  Users,
  FileText,
  Kanban,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistTask {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  action?: () => void;
  actionLabel?: string;
}

const OnboardingChecklist = () => {
  const navigate = useNavigate();
  const { firmSettings } = useFirmSettings();
  const { 
    progress, 
    percentComplete, 
    dismissChecklist,
    checkAndUpdateProgress 
  } = useOnboardingProgress();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  // Check progress on mount
  useEffect(() => {
    checkAndUpdateProgress();
  }, []);

  // Celebrate when complete
  useEffect(() => {
    if (percentComplete === 100 && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
  }, [percentComplete, showCelebration]);

  const tasks: ChecklistTask[] = [
    {
      id: 'profile',
      title: 'Completar perfil',
      description: 'Preencha seus dados profissionais',
      icon: User,
      completed: !!(firmSettings?.lawyer_name && firmSettings?.oab_number),
      action: () => navigate('/configuracoes'),
      actionLabel: 'Configurações',
    },
    {
      id: 'client',
      title: 'Cadastrar primeiro cliente',
      description: 'Adicione seu primeiro cliente',
      icon: Users,
      completed: progress?.first_client_created ?? false,
      action: () => navigate('/clientes/novo'),
      actionLabel: 'Novo Cliente',
    },
    {
      id: 'case',
      title: 'Criar primeiro processo',
      description: 'Registre um processo judicial',
      icon: FileText,
      completed: progress?.first_case_created ?? false,
      action: () => navigate('/processos/novo'),
      actionLabel: 'Novo Processo',
    },
    {
      id: 'petition',
      title: 'Gerar primeira petição',
      description: 'Use a IA para criar uma petição',
      icon: FileText,
      completed: progress?.first_petition_generated ?? false,
      action: () => navigate('/peticoes/nova'),
      actionLabel: 'Nova Petição',
    },
    {
      id: 'pipeline',
      title: 'Explorar gestão de processos',
      description: 'Conheça o quadro Kanban',
      icon: Kanban,
      completed: progress?.pipeline_visited ?? false,
      action: () => navigate('/pipeline'),
      actionLabel: 'Ver Pipeline',
    },
  ];

  const completedCount = tasks.filter(t => t.completed).length;
  const nextTask = tasks.find(t => !t.completed);

  if (!progress) return null;

  // Minimized state
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
      >
        <div className="relative">
          <div 
            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
            style={{
              background: `conic-gradient(hsl(var(--primary)) ${percentComplete * 3.6}deg, hsl(var(--muted)) 0deg)`
            }}
          >
            <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{percentComplete}%</span>
            </div>
          </div>
        </div>
        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          Primeiros Passos
        </span>
        <ChevronUp className="w-4 h-4 text-muted-foreground" />
      </button>
    );
  }

  // Expanded state
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center z-10">
          <div className="text-center p-6">
            <Trophy className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-foreground mb-2">Parabéns! 🎉</h3>
            <p className="text-muted-foreground text-sm">
              Você completou todos os primeiros passos!
            </p>
            <Button 
              onClick={dismissChecklist}
              className="mt-4"
              size="sm"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Primeiros Passos</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={dismissChecklist}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium text-foreground">{completedCount}/{tasks.length}</span>
          </div>
          <Progress value={percentComplete} className="h-2" />
        </div>
      </div>

      {/* Tasks */}
      <div className="p-2 max-h-64 overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg transition-colors",
              task.completed 
                ? "opacity-60" 
                : "hover:bg-muted/50 cursor-pointer"
            )}
            onClick={() => !task.completed && task.action?.()}
          >
            <div className="flex-shrink-0 mt-0.5">
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium",
                task.completed ? "line-through text-muted-foreground" : "text-foreground"
              )}>
                {task.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {task.description}
              </p>
            </div>
            {!task.completed && (
              <task.icon className="w-4 h-4 text-primary flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Footer with next action */}
      {nextTask && (
        <div className="p-3 border-t border-border bg-muted/20">
          <Button
            onClick={nextTask.action}
            size="sm"
            className="w-full"
          >
            {nextTask.actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default OnboardingChecklist;
