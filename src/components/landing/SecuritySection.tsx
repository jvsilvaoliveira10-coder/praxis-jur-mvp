import { Shield, Lock, Server, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

const securityFeatures = [
  {
    icon: Lock,
    title: 'Criptografia de Dados',
    description: 'Todos os dados são criptografados em trânsito e em repouso utilizando protocolos de segurança modernos.',
  },
  {
    icon: Shield,
    title: 'Conformidade LGPD',
    description: 'Plataforma desenvolvida em conformidade com a Lei Geral de Proteção de Dados brasileira.',
  },
  {
    icon: Server,
    title: 'Servidores Seguros',
    description: 'Infraestrutura hospedada em servidores com certificações de segurança internacionais.',
  },
  {
    icon: UserCheck,
    title: 'Acesso Exclusivo',
    description: 'Seus dados são acessíveis apenas por você. Nenhum terceiro tem acesso às suas informações.',
  },
];

export function SecuritySection() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section id="seguranca" className="py-20 bg-muted/30 scroll-mt-16">
      <div className="container mx-auto px-4">
        <div ref={ref} className="max-w-3xl mx-auto text-center mb-12">
          <div 
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 mb-6 transition-all duration-700',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Segurança Garantida</span>
          </div>

          <h2 
            className={cn(
              'text-3xl sm:text-4xl font-serif font-bold text-foreground transition-all duration-700 delay-100',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Seus dados protegidos com os mais altos padrões
          </h2>
          <p 
            className={cn(
              'mt-4 text-lg text-muted-foreground transition-all duration-700 delay-200',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Sabemos da importância do sigilo profissional. Por isso, investimos em segurança de ponta.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {securityFeatures.map((feature, index) => (
            <Card 
              key={feature.title}
              className={cn(
                'text-center transition-all duration-700',
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
              style={{ transitionDelay: `${(index + 3) * 100}ms` }}
            >
              <CardContent className="pt-6">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
