import { Clock, FolderOpen, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

const problems = [
  {
    icon: Clock,
    title: 'Tempo perdido',
    description: 'Horas redigindo peças repetitivas que poderiam ser automatizadas, comprometendo a produtividade do escritório.',
  },
  {
    icon: FolderOpen,
    title: 'Desorganização',
    description: 'Modelos espalhados em pastas, e-mails e HDs externos. Dificuldade para encontrar e padronizar documentos.',
  },
  {
    icon: RefreshCw,
    title: 'Acompanhamento manual',
    description: 'Consultas diárias aos portais dos tribunais para verificar movimentações, gastando tempo precioso.',
  },
];

export function ProblemSection() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div ref={ref} className="max-w-3xl mx-auto text-center mb-12">
          <h2 
            className={cn(
              'text-3xl sm:text-4xl font-serif font-bold text-foreground transition-all duration-700',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Os problemas que você conhece bem
          </h2>
          <p 
            className={cn(
              'mt-4 text-lg text-muted-foreground transition-all duration-700 delay-100',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            O dia a dia do advogado é marcado por tarefas repetitivas que consomem tempo e energia
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <Card 
              key={problem.title}
              className={cn(
                'border-destructive/20 bg-card transition-all duration-700',
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
              style={{ transitionDelay: `${(index + 2) * 100}ms` }}
            >
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                  <problem.icon className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {problem.title}
                </h3>
                <p className="text-muted-foreground">
                  {problem.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
