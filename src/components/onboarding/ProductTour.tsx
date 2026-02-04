import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Kanban,
  Bell,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  placement: 'right' | 'bottom' | 'left' | 'top';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="dashboard"]',
    title: 'Central de Comando',
    description: 'Seu painel com visão geral de tudo: prazos, processos e métricas importantes.',
    icon: LayoutDashboard,
    placement: 'right',
  },
  {
    target: '[data-tour="clients"]',
    title: 'Base de Clientes',
    description: 'Gerencie todos os seus clientes com dados completos e histórico de processos.',
    icon: Users,
    placement: 'right',
  },
  {
    target: '[data-tour="petitions"]',
    title: 'Gerador de Petições',
    description: 'Crie petições completas com ajuda da IA em poucos minutos.',
    icon: FileText,
    placement: 'right',
  },
  {
    target: '[data-tour="pipeline"]',
    title: 'Gestão Visual',
    description: 'Acompanhe seus processos em um quadro Kanban intuitivo e visual.',
    icon: Kanban,
    placement: 'right',
  },
  {
    target: '[data-tour="notifications"]',
    title: 'Fique Atualizado',
    description: 'Receba alertas de prazos, audiências e movimentações processuais.',
    icon: Bell,
    placement: 'bottom',
  },
];

interface ProductTourProps {
  active: boolean;
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  onSkip: () => void;
}

const ProductTour = ({ 
  active, 
  currentStep, 
  onStepChange, 
  onComplete, 
  onSkip 
}: ProductTourProps) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const step = TOUR_STEPS[currentStep];

  const updatePosition = useCallback(() => {
    if (!step) return;

    const target = document.querySelector(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);

      // Calcular posição do tooltip
      const gap = 16;
      let top = 0;
      let left = 0;

      switch (step.placement) {
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + gap;
          break;
        case 'bottom':
          top = rect.bottom + gap;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - gap;
          break;
        case 'top':
          top = rect.top - gap;
          left = rect.left + rect.width / 2;
          break;
      }

      setTooltipPosition({ top, left });

      // Scroll to element if needed
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [step]);

  useEffect(() => {
    if (active) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);
    }
  }, [active, currentStep, updatePosition]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      onStepChange(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  if (!active || !step || !targetRect) return null;

  const StepIcon = step.icon;

  // Spotlight clip-path
  const padding = 8;
  const spotlightPath = `
    polygon(
      0% 0%, 
      0% 100%, 
      ${targetRect.left - padding}px 100%, 
      ${targetRect.left - padding}px ${targetRect.top - padding}px, 
      ${targetRect.right + padding}px ${targetRect.top - padding}px, 
      ${targetRect.right + padding}px ${targetRect.bottom + padding}px, 
      ${targetRect.left - padding}px ${targetRect.bottom + padding}px, 
      ${targetRect.left - padding}px 100%, 
      100% 100%, 
      100% 0%
    )
  `;

  const getTooltipTransform = () => {
    switch (step.placement) {
      case 'right':
        return 'translateY(-50%)';
      case 'bottom':
        return 'translateX(-50%)';
      case 'left':
        return 'translate(-100%, -50%)';
      case 'top':
        return 'translate(-50%, -100%)';
      default:
        return '';
    }
  };

  return createPortal(
    <>
      {/* Overlay with spotlight */}
      <div
        className="fixed inset-0 z-[9998] bg-black/60 transition-all duration-300"
        style={{ clipPath: spotlightPath }}
        onClick={onSkip}
      />

      {/* Target highlight */}
      <div
        className="fixed z-[9999] pointer-events-none rounded-lg ring-4 ring-primary ring-offset-2 ring-offset-transparent transition-all duration-300"
        style={{
          top: targetRect.top - padding,
          left: targetRect.left - padding,
          width: targetRect.width + padding * 2,
          height: targetRect.height + padding * 2,
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[10000] w-80 bg-card border border-border rounded-xl shadow-2xl p-5 transition-all duration-300"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: getTooltipTransform(),
        }}
      >
        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-3 right-3 p-1 rounded-md hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <StepIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep 
                    ? 'bg-primary' 
                    : index < currentStep 
                      ? 'bg-primary/50' 
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <Button
            size="sm"
            onClick={handleNext}
            className="gap-1"
          >
            {currentStep === TOUR_STEPS.length - 1 ? 'Concluir' : 'Próximo'}
            {currentStep < TOUR_STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Step counter */}
        <div className="text-center mt-3 text-xs text-muted-foreground">
          {currentStep + 1} de {TOUR_STEPS.length}
        </div>
      </div>
    </>,
    document.body
  );
};

export default ProductTour;
