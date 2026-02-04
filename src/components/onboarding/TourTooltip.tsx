import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

interface TourTooltipProps {
  targetRect: DOMRect;
  title: string;
  description: string;
  icon: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  moduleName?: string;
  preferredPlacement: TooltipPlacement;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

interface SafePosition {
  top: number;
  left: number;
  actualPlacement: TooltipPlacement;
  arrowPosition: 'center' | 'start' | 'end';
}

const TOOLTIP_WIDTH = 340;
const TOOLTIP_HEIGHT = 220;
const GAP = 16;
const EDGE_PADDING = 16;

const calculateSafePosition = (
  targetRect: DOMRect,
  preferredPlacement: TooltipPlacement
): SafePosition => {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const placements: TooltipPlacement[] = [preferredPlacement, 'right', 'left', 'bottom', 'top'];
  
  for (const placement of placements) {
    let top = 0;
    let left = 0;
    let fits = false;

    switch (placement) {
      case 'right':
        top = targetRect.top + targetRect.height / 2 - TOOLTIP_HEIGHT / 2;
        left = targetRect.right + GAP;
        fits = left + TOOLTIP_WIDTH <= viewport.width - EDGE_PADDING;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - TOOLTIP_HEIGHT / 2;
        left = targetRect.left - GAP - TOOLTIP_WIDTH;
        fits = left >= EDGE_PADDING;
        break;
      case 'bottom':
        top = targetRect.bottom + GAP;
        left = targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2;
        fits = top + TOOLTIP_HEIGHT <= viewport.height - EDGE_PADDING;
        break;
      case 'top':
        top = targetRect.top - GAP - TOOLTIP_HEIGHT;
        left = targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2;
        fits = top >= EDGE_PADDING;
        break;
    }

    // Clamp to viewport
    top = Math.max(EDGE_PADDING, Math.min(top, viewport.height - TOOLTIP_HEIGHT - EDGE_PADDING));
    left = Math.max(EDGE_PADDING, Math.min(left, viewport.width - TOOLTIP_WIDTH - EDGE_PADDING));

    if (fits) {
      return { top, left, actualPlacement: placement, arrowPosition: 'center' };
    }
  }

  // Fallback: center of screen
  return {
    top: (viewport.height - TOOLTIP_HEIGHT) / 2,
    left: (viewport.width - TOOLTIP_WIDTH) / 2,
    actualPlacement: 'bottom',
    arrowPosition: 'center',
  };
};

const TourTooltip = ({
  targetRect,
  title,
  description,
  icon,
  currentStep,
  totalSteps,
  moduleName,
  preferredPlacement,
  onPrev,
  onNext,
  onSkip,
  isFirstStep,
  isLastStep,
}: TourTooltipProps) => {
  const [position, setPosition] = useState<SafePosition | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const newPosition = calculateSafePosition(targetRect, preferredPlacement);
    setPosition(newPosition);
  }, [targetRect, preferredPlacement]);

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [updatePosition]);

  if (!position) return null;

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

  return createPortal(
    <>
      {/* Overlay with spotlight */}
      <div
        className="fixed inset-0 z-[9998] bg-black/70 transition-all duration-300"
        style={{ clipPath: spotlightPath }}
        onClick={onSkip}
      />

      {/* Target highlight with pulse */}
      <div
        className="fixed z-[9999] pointer-events-none rounded-lg ring-4 ring-primary animate-pulse-glow transition-all duration-300"
        style={{
          top: targetRect.top - padding,
          left: targetRect.left - padding,
          width: targetRect.width + padding * 2,
          height: targetRect.height + padding * 2,
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        style={{
          top: position.top,
          left: position.left,
          width: TOOLTIP_WIDTH,
        }}
      >
        {/* Header with gradient */}
        <div className="relative px-5 pt-5 pb-3">
          {/* Module badge */}
          {moduleName && (
            <div className="absolute top-3 left-5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full">
                {moduleName}
              </span>
            </div>
          )}
          
          {/* Close button */}
          <button
            onClick={onSkip}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted transition-colors group"
            aria-label="Pular tour"
          >
            <X className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
          </button>

          {/* Content */}
          <div className={cn("flex items-start gap-4", moduleName && "mt-6")}>
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-foreground mb-1 leading-tight">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 pt-2">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === currentStep 
                    ? "w-6 bg-primary" 
                    : index < currentStep 
                      ? "w-1.5 bg-primary/60" 
                      : "w-1.5 bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrev}
              disabled={isFirstStep}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <span className="text-xs text-muted-foreground">
              {currentStep + 1} de {totalSteps}
            </span>

            <Button
              size="sm"
              onClick={onNext}
              className="gap-1 bg-primary hover:bg-primary/90"
            >
              {isLastStep ? 'Concluir' : 'Próximo'}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>

          {/* Skip link */}
          <button
            onClick={onSkip}
            className="w-full mt-3 text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Pular {moduleName ? `Tour ${moduleName}` : 'Tour'}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};

export default TourTooltip;
