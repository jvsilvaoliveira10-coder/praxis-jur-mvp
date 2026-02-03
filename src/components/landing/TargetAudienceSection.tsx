import { User, Users, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

const audiences = [
  {
    icon: User,
    title: 'Advogados Autônomos',
    description: 'Profissionais que atuam sozinhos e precisam de agilidade para atender demandas variadas sem comprometer a qualidade.',
    benefits: [
      'Mais tempo para captar clientes', 
      'Controle financeiro sem planilhas', 
      'Visão clara de cada processo',
      'Maior competitividade'
    ],
  },
  {
    icon: Users,
    title: 'Pequenos Escritórios',
    description: 'Equipes de 2 a 10 advogados que buscam padronização de linguagem e organização do conhecimento interno.',
    benefits: [
      'Padronização de documentos', 
      'Pipeline visual para toda equipe', 
      'Dashboard financeiro compartilhado',
      'Gestão centralizada'
    ],
  },
  {
    icon: Briefcase,
    title: 'Advogados de Volume',
    description: 'Profissionais que trabalham com demandas repetitivas e precisam escalar sua produção sem perder qualidade.',
    benefits: [
      'Escala sem aumento de equipe', 
      'Identificação de gargalos', 
      'Relatórios de rentabilidade',
      'Consistência na produção'
    ],
  },
];

export function TargetAudienceSection() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div ref={ref} className="max-w-3xl mx-auto text-center mb-12">
          <h2 
            className={cn(
              'text-3xl sm:text-4xl font-serif font-bold text-foreground transition-all duration-700',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Para quem é a plataforma
          </h2>
          <p 
            className={cn(
              'mt-4 text-lg text-muted-foreground transition-all duration-700 delay-100',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Desenvolvida pensando nas necessidades reais do advogado brasileiro
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {audiences.map((audience, index) => (
            <Card 
              key={audience.title}
              className={cn(
                'group hover:shadow-lg transition-all duration-700',
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
              style={{ transitionDelay: `${(index + 2) * 100}ms` }}
            >
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <audience.icon className="w-7 h-7 text-primary" />
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {audience.title}
                </h3>

                <p className="text-muted-foreground mb-4">
                  {audience.description}
                </p>

                <ul className="space-y-2">
                  {audience.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
