import { 
  Sparkles, 
  Upload, 
  Brain, 
  FolderTree, 
  Bell, 
  Calendar, 
  Search, 
  FileDown 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Sparkles,
    title: 'Geração com IA',
    description: 'Petições completas geradas automaticamente com inteligência artificial.',
  },
  {
    icon: Upload,
    title: 'Upload de Modelos',
    description: 'Faça upload dos modelos próprios do seu escritório em PDF, DOCX ou TXT.',
  },
  {
    icon: Brain,
    title: 'IA que Aprende',
    description: 'A IA utiliza seus modelos como referência de estilo e estrutura.',
  },
  {
    icon: FolderTree,
    title: 'Pastas Organizadas',
    description: 'Organize seus modelos em pastas personalizadas com cores distintas.',
  },
  {
    icon: Bell,
    title: 'Acompanhamento Automático',
    description: 'Monitoramento de processos via DataJud com notificações de movimentações.',
  },
  {
    icon: Calendar,
    title: 'Agenda de Prazos',
    description: 'Controle de prazos processuais, audiências e compromissos.',
  },
  {
    icon: Search,
    title: 'Pesquisa de Jurisprudência',
    description: 'Busque decisões relevantes para fundamentar suas petições.',
  },
  {
    icon: FileDown,
    title: 'Exportação em PDF',
    description: 'Exporte petições prontas para protocolo com um clique.',
  },
];

export function FeaturesSection() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section id="funcionalidades" className="py-20 scroll-mt-16">
      <div className="container mx-auto px-4">
        <div ref={ref} className="max-w-3xl mx-auto text-center mb-12">
          <h2 
            className={cn(
              'text-3xl sm:text-4xl font-serif font-bold text-foreground transition-all duration-700',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Tudo que você precisa em um só lugar
          </h2>
          <p 
            className={cn(
              'mt-4 text-lg text-muted-foreground transition-all duration-700 delay-100',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Funcionalidades pensadas para aumentar sua produtividade sem abrir mão da qualidade
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className={cn(
                'group hover:shadow-lg hover:border-primary/30 transition-all duration-500',
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
              style={{ transitionDelay: `${(index + 2) * 50}ms` }}
            >
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
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
