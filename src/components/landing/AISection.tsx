import { Link } from 'react-router-dom';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

const benefits = [
  'Petições geradas em segundos, não em horas',
  'Aprende com os modelos do seu escritório',
  'Mantém seu estilo e padrão de qualidade',
  'Fundamentação com legislação brasileira',
  'Qualificação automática das partes',
  'Formatação pronta para protocolo',
];

export function AISection() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div ref={ref} className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div 
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 transition-all duration-700',
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Inteligência Artificial</span>
              </div>

              <h2 
                className={cn(
                  'text-3xl sm:text-4xl font-serif font-bold text-foreground mb-6 transition-all duration-700 delay-100',
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
              >
                Geração de petições com IA que entende o seu escritório
              </h2>

              <p 
                className={cn(
                  'text-lg text-muted-foreground mb-8 transition-all duration-700 delay-200',
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
              >
                Nossa IA não usa modelos genéricos. Ela aprende com os documentos do seu escritório 
                e gera petições que mantêm sua identidade, estilo e padrão de qualidade.
              </p>

              <ul className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <li 
                    key={index}
                    className={cn(
                      'flex items-center gap-3 transition-all duration-700',
                      isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                    )}
                    style={{ transitionDelay: `${(index + 3) * 100}ms` }}
                  >
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button 
                size="lg" 
                asChild
                className={cn(
                  'transition-all duration-700 delay-500',
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
              >
                <Link to="/auth">
                  Experimentar Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Visual mockup */}
            <div 
              className={cn(
                'relative transition-all duration-700 delay-300',
                isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              )}
            >
              <div className="relative bg-card rounded-xl border shadow-2xl p-6 overflow-hidden">
                {/* Header mockup */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>

                {/* Content mockup */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-4 bg-muted rounded w-48" />
                  </div>

                  <div className="space-y-2">
                    <div className="h-3 bg-muted/60 rounded w-full" />
                    <div className="h-3 bg-muted/60 rounded w-5/6" />
                    <div className="h-3 bg-muted/60 rounded w-4/6" />
                  </div>

                  <div className="pt-4 border-t">
                    <div className="h-3 bg-primary/30 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted/40 rounded w-full" />
                    <div className="h-3 bg-muted/40 rounded w-5/6" />
                  </div>

                  <div className="pt-4">
                    <div className="h-3 bg-muted/40 rounded w-full" />
                    <div className="h-3 bg-muted/40 rounded w-4/5 mt-2" />
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -right-3 top-1/3 bg-primary text-primary-foreground px-4 py-2 rounded-l-lg shadow-lg">
                  <span className="text-xs font-medium">Gerando...</span>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
