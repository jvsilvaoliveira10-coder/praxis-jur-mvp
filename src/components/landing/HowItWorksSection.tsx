import { UserPlus, FileText, Wand2, Download } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Cadastre',
    description: 'Registre seus clientes e processos de forma simples e organizada.',
  },
  {
    icon: FileText,
    number: '02',
    title: 'Selecione',
    description: 'Escolha o tipo de petição e um modelo de referência do seu escritório.',
  },
  {
    icon: Wand2,
    number: '03',
    title: 'Gere',
    description: 'A IA cria a petição completa, respeitando seu estilo e padrões.',
  },
  {
    icon: Download,
    number: '04',
    title: 'Exporte',
    description: 'Baixe o PDF pronto para protocolo nos tribunais.',
  },
];

export function HowItWorksSection() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section id="como-funciona" className="py-20 bg-muted/30 scroll-mt-16">
      <div className="container mx-auto px-4">
        <div ref={ref} className="max-w-3xl mx-auto text-center mb-16">
          <h2 
            className={cn(
              'text-3xl sm:text-4xl font-serif font-bold text-foreground transition-all duration-700',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Como funciona
          </h2>
          <p 
            className={cn(
              'mt-4 text-lg text-muted-foreground transition-all duration-700 delay-100',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Em 4 passos simples, você gera petições profissionais
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection line - hidden on mobile */}
            <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-border" />

            {steps.map((step, index) => (
              <div 
                key={step.number}
                className={cn(
                  'relative text-center transition-all duration-700',
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
                style={{ transitionDelay: `${(index + 2) * 100}ms` }}
              >
                {/* Icon circle */}
                <div className="relative mx-auto w-32 h-32 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center mb-6 group hover:border-primary/50 transition-colors">
                  <step.icon className="w-12 h-12 text-primary" />
                  {/* Number badge */}
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">{step.number}</span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
