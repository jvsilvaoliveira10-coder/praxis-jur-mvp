import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TourTooltip from './TourTooltip';
import { getTourSteps, TourModule, getTourModuleName, TourStep } from './tourSteps';

interface ProductTourProps {
  active: boolean;
  tourModule: TourModule;
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  onSkip: () => void;
}

const ProductTour = ({ 
  active, 
  tourModule,
  currentStep, 
  onStepChange, 
  onComplete, 
  onSkip 
}: ProductTourProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const steps = getTourSteps(tourModule);
  const step = steps[currentStep];
  const moduleName = tourModule !== 'completo' ? getTourModuleName(tourModule) : step?.module === 'juridico' ? 'Jurídico' : 'Financeiro';

  // Get the route for a step target
  const getRouteForStep = (stepData: TourStep): string => {
    const routes: Record<string, string> = {
      'dashboard': '/dashboard',
      'clients': '/clients',
      'cases': '/cases',
      'pipeline': '/pipeline',
      'petitions': '/petitions',
      'templates': '/templates',
      'jurisprudence': '/jurisprudence',
      'tracking': '/tracking',
      'agenda': '/agenda',
      'notifications': '/dashboard', // Notifications are in header
      'finance-dashboard': '/financeiro',
      'receivables': '/financeiro/receber',
      'payables': '/financeiro/pagar',
      'transactions': '/financeiro/extrato',
      'contracts': '/financeiro/contratos',
      'finance-reports': '/financeiro/relatorios',
      'finance-settings': '/financeiro/config',
    };
    return routes[stepData.id] || '/dashboard';
  };

  // Navigate to the correct page and update position
  const updatePosition = useCallback(() => {
    if (!step) return;

    const target = document.querySelector(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);
      setIsNavigating(false);
      
      // Scroll to element if needed
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [step]);

  // Effect to navigate to correct page for current step
  useEffect(() => {
    if (!active || !step) return;

    const targetRoute = getRouteForStep(step);
    
    // Check if we need to navigate
    if (!location.pathname.startsWith(targetRoute.split('/').slice(0, 2).join('/'))) {
      setIsNavigating(true);
      navigate(targetRoute);
    }
  }, [active, step, location.pathname, navigate]);

  // Effect to update position after navigation
  useEffect(() => {
    if (!active) return;

    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      updatePosition();
    }, 300);

    window.addEventListener('resize', updatePosition);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
    };
  }, [active, currentStep, location.pathname, updatePosition]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
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

  if (!active || !step || !targetRect || isNavigating) return null;

  const StepIcon = step.icon;

  return (
    <TourTooltip
      targetRect={targetRect}
      title={step.title}
      description={step.description}
      icon={<StepIcon className="w-6 h-6 text-primary" />}
      currentStep={currentStep}
      totalSteps={steps.length}
      moduleName={moduleName}
      preferredPlacement={step.placement}
      onPrev={handlePrev}
      onNext={handleNext}
      onSkip={onSkip}
      isFirstStep={currentStep === 0}
      isLastStep={currentStep === steps.length - 1}
    />
  );
};

export default ProductTour;
