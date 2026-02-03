import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PremiumFormHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  backPath: string;
}

const PremiumFormHeader = ({ icon, title, subtitle, backPath }: PremiumFormHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-start gap-4 mb-8">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate(backPath)} 
        className="mt-1 shrink-0 hover:bg-muted"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 shadow-sm">
        {icon}
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default PremiumFormHeader;
