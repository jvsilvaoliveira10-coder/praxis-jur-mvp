import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingSidebarProps {
  currentStep: number;
  totalSteps: number;
  onSkip: () => void;
}

const steps = [
  { id: 1, title: 'Advogado', description: 'Dados profissionais' },
  { id: 2, title: 'Escritório', description: 'Identidade visual' },
  { id: 3, title: 'Endereço', description: 'Localização comercial' },
  { id: 4, title: 'Estrutura', description: 'Tamanho da equipe' },
  { id: 5, title: 'Áreas', description: 'Atuação e tribunais' },
];

const OnboardingSidebar = ({ currentStep, totalSteps, onSkip }: OnboardingSidebarProps) => {
  return (
    <div className="w-[280px] bg-gradient-to-b from-[hsl(222,47%,15%)] to-[hsl(222,47%,12%)] text-white flex flex-col rounded-l-lg">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/praxis-jur-logo.png" alt="Práxis Jur" className="h-10" />
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex-1 p-6">
        <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-6">
          Configuração Inicial
        </p>
        
        <div className="space-y-1">
          {steps.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isPending = step.id > currentStep;
            
            return (
              <div key={step.id} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-[15px] top-[36px] w-[2px] h-[20px] transition-colors duration-300",
                      isCompleted ? "bg-primary" : "bg-white/20"
                    )}
                  />
                )}
                
                <div
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
                    isCurrent && "bg-white/10",
                    !isCurrent && "hover:bg-white/5"
                  )}
                >
                  {/* Step Indicator */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 shrink-0",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-white text-[hsl(222,47%,15%)] ring-4 ring-white/20",
                      isPending && "bg-white/10 text-white/50"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  
                  {/* Step Info */}
                  <div className="overflow-hidden">
                    <p
                      className={cn(
                        "font-medium text-sm transition-colors duration-300",
                        isCurrent ? "text-white" : isCompleted ? "text-white/80" : "text-white/50"
                      )}
                    >
                      {step.title}
                    </p>
                    <p
                      className={cn(
                        "text-xs transition-colors duration-300 truncate",
                        isCurrent ? "text-white/70" : "text-white/40"
                      )}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skip Button */}
      <div className="p-6 border-t border-white/10">
        <button
          onClick={onSkip}
          className="text-sm text-white/50 hover:text-white/80 transition-colors w-full text-left"
        >
          Pular por agora →
        </button>
      </div>
    </div>
  );
};

export default OnboardingSidebar;
