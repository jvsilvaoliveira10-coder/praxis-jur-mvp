import { 
  FileText, 
  Kanban, 
  Wallet,
  Link as LinkIcon,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

const integrations = [
  {
    title: 'Produção + Processos',
    items: [
      'Petições vinculadas ao caso no pipeline',
      'Ao gerar petição, tarefa marcada como concluída',
      'Documentos organizados por processo',
    ],
    colors: {
      from: 'from-primary/20',
      to: 'to-blue-500/20',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
  },
  {
    title: 'Processos + Financeiro',
    items: [
      'Honorários vinculados ao processo',
      'Custas processuais registradas automaticamente',
      'Saldo e ROI por caso calculados',
    ],
    colors: {
      from: 'from-blue-500/20',
      to: 'to-green-500/20',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
    },
  },
  {
    title: 'Financeiro + Clientes',
    items: [
      'Cliente com histórico financeiro completo',
      'Receitas e custos por relacionamento',
      'Análise de rentabilidade por cliente',
    ],
    colors: {
      from: 'from-green-500/20',
      to: 'to-primary/20',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-600',
    },
  },
];

export function IntegrationSection() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div ref={ref} className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 
              className={cn(
                'text-3xl sm:text-4xl font-serif font-bold text-foreground transition-all duration-700',
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              Uma plataforma, três módulos integrados
            </h2>
            
            <p 
              className={cn(
                'mt-4 text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-100',
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              Tudo conectado, tudo em um só lugar. Os módulos se comunicam para 
              oferecer uma visão completa do seu escritório.
            </p>
          </div>

          {/* Visual Diagram */}
          <div 
            className={cn(
              'flex flex-col items-center mb-12 transition-all duration-700 delay-200',
              isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            )}
          >
            {/* Main hub diagram */}
            <div className="relative w-full max-w-md aspect-square">
              {/* Center hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-primary/30 flex items-center justify-center z-10">
                <LinkIcon className="w-8 h-8 text-primary" />
              </div>

              {/* Produção Jurídica - Top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground text-center">Produção<br/>Jurídica</span>
              </div>

              {/* Gestão de Processos - Bottom Left */}
              <div className="absolute bottom-0 left-8 flex flex-col items-center">
                <div className="w-16 h-16 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-2">
                  <Kanban className="w-7 h-7 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-foreground text-center">Gestão de<br/>Processos</span>
              </div>

              {/* Financeiro - Bottom Right */}
              <div className="absolute bottom-0 right-8 flex flex-col items-center">
                <div className="w-16 h-16 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-2">
                  <Wallet className="w-7 h-7 text-green-600" />
                </div>
                <span className="text-sm font-medium text-foreground text-center">Gestão<br/>Financeira</span>
              </div>

              {/* Connecting lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Top to center */}
                <line 
                  x1="50" y1="22" x2="50" y2="42" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth="0.5" 
                  strokeDasharray="2,2"
                  className="animate-pulse"
                />
                {/* Bottom left to center */}
                <line 
                  x1="25" y1="75" x2="42" y2="55" 
                  stroke="hsl(199 89% 48%)" 
                  strokeWidth="0.5" 
                  strokeDasharray="2,2"
                  className="animate-pulse"
                />
                {/* Bottom right to center */}
                <line 
                  x1="75" y1="75" x2="58" y2="55" 
                  stroke="hsl(142 76% 36%)" 
                  strokeWidth="0.5" 
                  strokeDasharray="2,2"
                  className="animate-pulse"
                />
                {/* Bottom left to bottom right */}
                <line 
                  x1="30" y1="82" x2="70" y2="82" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth="0.3" 
                  strokeDasharray="2,2"
                  className="animate-pulse"
                />
              </svg>
            </div>
          </div>

          {/* Integration Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {integrations.map((integration, index) => (
              <Card 
                key={integration.title}
                className={cn(
                  'border-0 transition-all duration-700 hover:shadow-lg',
                  `bg-gradient-to-br ${integration.colors.from} ${integration.colors.to}`,
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
                style={{ transitionDelay: `${(index + 3) * 100}ms` }}
              >
                <CardContent className="pt-6">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mb-4',
                    integration.colors.iconBg
                  )}>
                    <ArrowRight className={cn('w-5 h-5', integration.colors.iconColor)} />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {integration.title}
                  </h3>
                  
                  <ul className="space-y-2">
                    {integration.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-foreground/50 mt-1.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
