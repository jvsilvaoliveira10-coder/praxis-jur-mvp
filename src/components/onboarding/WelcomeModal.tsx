import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useFirmSettings } from '@/hooks/useFirmSettings';
import { 
  Sparkles, 
  Scale,
  Wallet,
  Rocket,
  PartyPopper,
  Clock
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { TourModule } from './tourSteps';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onStartTour: (module: TourModule) => void;
}

interface TourOption {
  id: TourModule;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  steps: number;
  time: string;
  gradient: string;
}

const TOUR_OPTIONS: TourOption[] = [
  {
    id: 'juridico',
    icon: Scale,
    title: 'Tour Jurídico',
    subtitle: 'Processos, petições e mais',
    steps: 10,
    time: '~4 min',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'financeiro',
    icon: Wallet,
    title: 'Tour Financeiro',
    subtitle: 'Gestão financeira completa',
    steps: 7,
    time: '~3 min',
    gradient: 'from-green-500 to-emerald-500',
  },
];

const WelcomeModal = ({ open, onClose, onStartTour }: WelcomeModalProps) => {
  const { firmSettings } = useFirmSettings();
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedTour, setSelectedTour] = useState<TourModule | null>(null);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const lawyerName = firmSettings?.lawyer_name || 'Advogado(a)';
  const firstName = lawyerName.split(' ')[0];

  const handleStartTour = (module: TourModule) => {
    onStartTour(module);
    onClose();
  };

  const handleExplore = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-gradient-to-b from-background to-muted/30 border-none">
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <Sparkles 
                  className="w-4 h-4" 
                  style={{ 
                    color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)] 
                  }} 
                />
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="relative px-6 pt-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-5">
            <PartyPopper className="w-10 h-10 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Bem-vindo(a), Dr(a). {firstName}! 🎉
          </h2>
          
          <p className="text-muted-foreground max-w-sm mx-auto">
            Seu escritório está configurado e pronto para transformar sua prática jurídica.
          </p>
        </div>

        {/* Tour Selection */}
        <div className="px-6 pb-4">
          <p className="text-sm font-medium text-center text-muted-foreground mb-4">
            Escolha como deseja começar:
          </p>

          {/* Module Tours */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {TOUR_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedTour === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedTour(isSelected ? null : option.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    isSelected 
                      ? 'border-primary bg-primary/5 shadow-lg' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <h3 className="font-semibold text-foreground text-sm mb-0.5">
                    {option.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {option.subtitle}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{option.steps} passos</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {option.time}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Complete Tour Option */}
          <button
            onClick={() => setSelectedTour(selectedTour === 'completo' ? null : 'completo')}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
              selectedTour === 'completo'
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-semibold text-foreground">Tour Completo</h3>
              <p className="text-xs text-muted-foreground">
                17 passos • ~7 min • Jurídico + Financeiro
              </p>
            </div>
            {selectedTour === 'completo' && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-2 space-y-3">
          <Button 
            onClick={() => selectedTour && handleStartTour(selectedTour)} 
            disabled={!selectedTour}
            className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50"
          >
            <Rocket className="w-5 h-5 mr-2" />
            {selectedTour ? 'Iniciar Tour' : 'Selecione um tour acima'}
          </Button>
          
          <button
            onClick={handleExplore}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Ou explorar por conta própria →
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
