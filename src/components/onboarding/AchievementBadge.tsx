import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number; // 0-100
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const AchievementBadge = ({ 
  achievement, 
  size = 'md',
  showLabel = false,
  animated = false,
}: AchievementBadgeProps) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
  };

  const labelSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "relative rounded-xl flex items-center justify-center transition-all duration-300",
                sizeClasses[size],
                achievement.unlocked 
                  ? "bg-gradient-to-br from-primary/20 to-secondary/20 shadow-lg shadow-primary/10" 
                  : "bg-muted/50",
                animated && achievement.unlocked && "animate-badge-unlock"
              )}
            >
              {achievement.unlocked ? (
                <span className="drop-shadow-sm">{achievement.icon}</span>
              ) : (
                <div className="relative flex items-center justify-center">
                  <span className="opacity-20 grayscale">{achievement.icon}</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className={cn(
                      "text-muted-foreground",
                      size === 'sm' && 'w-3 h-3',
                      size === 'md' && 'w-4 h-4',
                      size === 'lg' && 'w-6 h-6',
                    )} />
                  </div>
                </div>
              )}

              {/* Progress ring for partially complete */}
              {!achievement.unlocked && achievement.progress !== undefined && achievement.progress > 0 && (
                <svg
                  className="absolute inset-0 -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="text-muted/50"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="transparent"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary"
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    strokeDasharray={`${achievement.progress}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              )}

              {/* Shine effect for unlocked */}
              {achievement.unlocked && (
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 shimmer-complete" />
                </div>
              )}
            </div>

            {showLabel && (
              <span className={cn(
                "font-medium text-center max-w-[80px] truncate",
                labelSizeClasses[size],
                achievement.unlocked ? "text-foreground" : "text-muted-foreground"
              )}>
                {achievement.unlocked ? achievement.name : '???'}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <div className="text-center">
            <p className="font-semibold">
              {achievement.unlocked ? achievement.name : 'Conquista Bloqueada'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {achievement.unlocked 
                ? achievement.description 
                : `Complete as tarefas para desbloquear: ${achievement.name}`}
            </p>
            {!achievement.unlocked && achievement.progress !== undefined && (
              <p className="text-xs text-primary mt-1 font-medium">
                {achievement.progress}% concluído
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AchievementBadge;
