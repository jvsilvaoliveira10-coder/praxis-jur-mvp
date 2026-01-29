import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

export function CTASection() {
  const { ref, isInView } = useInView({ threshold: 0.3 });

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div ref={ref} className="max-w-3xl mx-auto text-center">
          <div 
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-primary-foreground mb-6 transition-all duration-700',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Comece agora mesmo</span>
          </div>

          <h2 
            className={cn(
              'text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-primary-foreground mb-6 transition-all duration-700 delay-100',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Pronto para transformar sua produtividade?
          </h2>

          <p 
            className={cn(
              'text-lg sm:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto transition-all duration-700 delay-200',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Junte-se aos advogados que já estão economizando horas por semana na elaboração de petições.
          </p>

          <Button 
            size="lg" 
            variant="secondary"
            asChild
            className={cn(
              'text-lg px-10 py-6 h-auto transition-all duration-700 delay-300',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            <Link to="/auth">
              Criar Conta Gratuita
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>

          <p 
            className={cn(
              'mt-6 text-sm text-primary-foreground/60 transition-all duration-700 delay-400',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Sem cartão de crédito • Acesso imediato • Grátis por tempo limitado
          </p>
        </div>
      </div>
    </section>
  );
}
