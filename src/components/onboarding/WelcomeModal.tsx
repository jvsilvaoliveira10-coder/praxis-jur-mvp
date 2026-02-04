import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useFirmSettings } from '@/hooks/useFirmSettings';
import { 
  Sparkles, 
  Users, 
  FileText, 
  LayoutGrid,
  Rocket,
  PartyPopper
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

const WelcomeModal = ({ open, onClose, onStartTour }: WelcomeModalProps) => {
  const { firmSettings } = useFirmSettings();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const lawyerName = firmSettings?.lawyer_name || 'Advogado(a)';
  const firstName = lawyerName.split(' ')[0];

  const features = [
    {
      icon: Users,
      title: 'Gestão de Clientes',
      description: 'Base organizada com todos os dados',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileText,
      title: 'Petições com IA',
      description: 'Gere documentos em minutos',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: LayoutGrid,
      title: 'Pipeline Visual',
      description: 'Acompanhe processos estilo Kanban',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const handleStartTour = () => {
    onStartTour();
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
            {[...Array(20)].map((_, i) => (
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
                    color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)] 
                  }} 
                />
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="relative p-6 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
            <PartyPopper className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Bem-vindo(a), Dr(a). {firstName}! 🎉
          </h2>
          
          <p className="text-muted-foreground">
            Seu escritório está configurado e pronto para transformar sua prática jurídica.
          </p>
        </div>

        {/* Features */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-3 gap-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative group p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} mb-3`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-medium text-sm text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-2 space-y-3">
          <Button 
            onClick={handleStartTour} 
            className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Fazer Tour Guiado
            <span className="ml-2 text-xs opacity-70">(2 min)</span>
          </Button>
          
          <button
            onClick={handleExplore}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Ou explorar por conta própria →
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
