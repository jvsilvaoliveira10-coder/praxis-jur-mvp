import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = [
  'Advogado',
  'Escritório',
  'Endereço',
  'Estrutura',
  'Áreas',
];

const OnboardingProgress = ({ currentStep, totalSteps }: OnboardingProgressProps) => {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          
          return (
            <div key={step} className="flex items-center flex-1">
              {/* Step circle */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step
                )}
              </div>
              
              {/* Connector line */}
              {step < totalSteps && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded-full transition-all",
                    step < currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Step labels */}
      <div className="flex justify-between">
        {stepLabels.map((label, i) => {
          const step = i + 1;
          const isCurrent = step === currentStep;
          
          return (
            <span
              key={label}
              className={cn(
                "text-xs transition-colors flex-1 text-center",
                isCurrent ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingProgress;
