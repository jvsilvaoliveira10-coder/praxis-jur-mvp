import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Trophy,
  Play,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CHECKLIST_MODULES, ACHIEVEMENTS, ChecklistTask, ChecklistModule } from './checklistModules';
import AchievementBadge from './AchievementBadge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const OnboardingChecklist = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { firmSettings, isLoading: loadingSettings } = useFirmSettings();
  const { 
    progress, 
    percentComplete, 
    dismissChecklist,
    checkAndUpdateProgress,
    startTour,
    juridicoModuleComplete,
    financeModuleComplete,
  } = useOnboardingProgress({
    firmSettings,
    loadingSettings,
  });
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    juridico: true,
    financeiro: false,
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [recentUnlock, setRecentUnlock] = useState<string | null>(null);

  // Check progress on mount and route changes
  useEffect(() => {
    checkAndUpdateProgress();
  }, [checkAndUpdateProgress, location.pathname]);

  // Celebrate when complete
  useEffect(() => {
    if (percentComplete === 100 && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
  }, [percentComplete, showCelebration]);

  // Check for newly unlocked badges
  useEffect(() => {
    if (juridicoModuleComplete && !recentUnlock) {
      setRecentUnlock('jurista');
      setTimeout(() => setRecentUnlock(null), 3000);
    } else if (financeModuleComplete && recentUnlock !== 'gestor') {
      setRecentUnlock('gestor');
      setTimeout(() => setRecentUnlock(null), 3000);
    }
  }, [juridicoModuleComplete, financeModuleComplete, recentUnlock]);

  // Check if a task is completed
  const isTaskCompleted = (task: ChecklistTask): boolean => {
    if (task.customCheck && task.id === 'profile') {
      return !!(firmSettings?.lawyer_name && firmSettings?.oab_number);
    }
    if (task.progressField && progress) {
      // Use type assertion to access dynamic field
      const progressRecord = progress as unknown as Record<string, boolean>;
      return !!progressRecord[task.progressField];
    }
    return false;
  };

  // Calculate module progress
  const getModuleProgress = (module: ChecklistModule): { completed: number; total: number; percent: number } => {
    const completed = module.tasks.filter(isTaskCompleted).length;
    const total = module.tasks.length;
    const percent = Math.round((completed / total) * 100);
    return { completed, total, percent };
  };

  // Get achievements status
  const achievements = useMemo(() => {
    return ACHIEVEMENTS.map(a => {
      let unlocked = false;
      let progressPercent = 0;

      if (a.condition === 'module_juridico') {
        const moduleProgress = getModuleProgress(CHECKLIST_MODULES[0]);
        unlocked = moduleProgress.percent === 100;
        progressPercent = moduleProgress.percent;
      } else if (a.condition === 'module_financeiro') {
        const moduleProgress = getModuleProgress(CHECKLIST_MODULES[1]);
        unlocked = moduleProgress.percent === 100;
        progressPercent = moduleProgress.percent;
      } else if (a.condition === 'all_complete') {
        unlocked = percentComplete === 100;
        progressPercent = percentComplete;
      }

      return { ...a, unlocked, progress: progressPercent };
    });
  }, [progress, firmSettings, percentComplete]);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleTaskClick = (task: ChecklistTask) => {
    if (!isTaskCompleted(task) && task.route) {
      navigate(task.route);
    }
  };

  const handleStartTour = (module: 'juridico' | 'financeiro') => {
    startTour(module);
    setIsExpanded(false);
  };

  if (!progress) return null;

  const totalCompleted = CHECKLIST_MODULES.flatMap(m => m.tasks).filter(isTaskCompleted).length;
  const totalTasks = CHECKLIST_MODULES.flatMap(m => m.tasks).length;

  // Minimized state
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
      >
        <div className="relative">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: `conic-gradient(hsl(var(--primary)) ${percentComplete * 3.6}deg, hsl(var(--muted)) 0deg)`
            }}
          >
            <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{percentComplete}%</span>
            </div>
          </div>
        </div>
        <div className="text-left">
          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors block">
            Primeiros Passos
          </span>
          <span className="text-xs text-muted-foreground">
            {totalCompleted}/{totalTasks} concluídas
          </span>
        </div>
        <ChevronUp className="w-4 h-4 text-muted-foreground ml-2" />
      </button>
    );
  }

  // Expanded state
  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="text-center p-6 animate-celebrate">
            <Trophy className="w-20 h-20 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">Parabéns! 🎉</h3>
            <p className="text-muted-foreground">
              Você dominou o Práxis Jur!
            </p>
            <Button 
              onClick={dismissChecklist}
              className="mt-6"
            >
              Concluir Onboarding
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-muted/30 to-muted/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-bold text-foreground">Primeiros Passos</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={dismissChecklist}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso Total</span>
            <span className="font-bold text-foreground">{totalCompleted}/{totalTasks}</span>
          </div>
          <div className="relative">
            <Progress value={percentComplete} className="h-2.5" />
            {percentComplete > 0 && percentComplete < 100 && (
              <div className="absolute inset-0 animate-progress-glow rounded-full pointer-events-none" />
            )}
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="max-h-80 overflow-y-auto scrollbar-legal">
        {CHECKLIST_MODULES.map((module) => {
          const moduleProgress = getModuleProgress(module);
          const isOpen = openModules[module.id];
          const isComplete = moduleProgress.percent === 100;
          const ModuleIcon = module.icon;

          return (
            <Collapsible
              key={module.id}
              open={isOpen}
              onOpenChange={() => toggleModule(module.id)}
            >
              <CollapsibleTrigger asChild>
                <button className="w-full p-3 flex items-center justify-between hover:bg-muted/30 transition-colors border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br",
                      module.gradient,
                      isComplete && "animate-celebrate"
                    )}>
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <ModuleIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-foreground">{module.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {moduleProgress.completed}/{moduleProgress.total} tarefas • {moduleProgress.percent}%
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    isOpen && "rotate-90"
                  )} />
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="p-2 bg-muted/10">
                  {/* Tour button */}
                  {!isComplete && (
                    <button
                      onClick={() => handleStartTour(module.id)}
                      className="w-full mb-2 p-2 flex items-center gap-2 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Ver tour do módulo {module.title.toLowerCase()}</span>
                    </button>
                  )}

                  {/* Tasks */}
                  {module.tasks.map((task) => {
                    const completed = isTaskCompleted(task);
                    const isNextTask = !completed && module.tasks.findIndex(t => !isTaskCompleted(t)) === module.tasks.indexOf(task);
                    const TaskIcon = task.icon;

                    return (
                      <div
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-lg transition-all",
                          completed 
                            ? "opacity-60" 
                            : "hover:bg-muted/50 cursor-pointer",
                          isNextTask && "animate-next-task bg-primary/5"
                        )}
                      >
                        <div className="flex-shrink-0">
                          {completed ? (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
                            </div>
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm",
                            completed ? "line-through text-muted-foreground" : "text-foreground font-medium"
                          )}>
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {task.description}
                          </p>
                        </div>
                        {!completed && (
                          <TaskIcon className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {/* Achievements */}
      <div className="p-3 border-t border-border bg-muted/20">
        <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5" />
          CONQUISTAS
        </p>
        <div className="flex items-center justify-center gap-4">
          {achievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              size="sm"
              showLabel
              animated={recentUnlock === achievement.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingChecklist;
