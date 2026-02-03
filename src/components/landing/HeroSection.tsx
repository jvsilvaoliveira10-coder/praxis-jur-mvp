import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function HeroSection() {
  const scrollToFeatures = () => {
    const element = document.querySelector('#funcionalidades');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge 
            variant="secondary" 
            className="mb-6 px-4 py-2 text-sm font-medium bg-secondary/20 text-secondary-foreground border border-secondary/30 animate-fade-in"
          >
            <Sparkles className="w-4 h-4 mr-2 inline" />
            Grátis por tempo limitado
          </Badge>

          {/* Headline */}
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-tight animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
            Seu escritório <span className="text-primary">completo</span> em uma só plataforma
          </h1>

          {/* Subtitle */}
          <p 
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: '200ms' }}
          >
            Hub 360° para advogados brasileiros. Gere petições com IA, gerencie processos 
            como projetos, controle suas finanças e tenha visão total do seu negócio.
          </p>

          {/* CTAs */}
          <div 
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
            style={{ animationDelay: '300ms' }}
          >
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/auth">
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8"
              onClick={scrollToFeatures}
            >
              Ver Funcionalidades
            </Button>
          </div>

          {/* Trust indicators */}
          <div 
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm">Gestão jurídica + financeira integrada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm">100% adaptado ao foro brasileiro</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm">Sem cartão de crédito</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
