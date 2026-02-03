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
    gradient: 'from-primary via-primary/90 to-teal-600',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
  },
  {
    title: 'Processos + Financeiro',
    items: [
      'Honorários vinculados ao processo',
      'Custas processuais registradas automaticamente',
      'Saldo e ROI por caso calculados',
    ],
    gradient: 'from-blue-600 via-blue-500 to-cyan-500',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
  },
  {
    title: 'Financeiro + Clientes',
    items: [
      'Cliente com histórico financeiro completo',
      'Receitas e custos por relacionamento',
      'Análise de rentabilidade por cliente',
    ],
    gradient: 'from-emerald-600 via-green-500 to-teal-500',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
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
                  'border-0 transition-all duration-700 hover:shadow-xl hover:scale-[1.02] group overflow-hidden relative',
                  `bg-gradient-to-br ${integration.gradient}`,
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
                style={{ transitionDelay: `${(index + 3) * 100}ms` }}
              >
                {/* Decorative glow effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                
                <CardContent className="pt-6 relative z-10">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20',
                    integration.iconBg
                  )}>
                    <ArrowRight className={cn('w-6 h-6', integration.iconColor)} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4 drop-shadow-sm">
                    {integration.title}
                  </h3>
                  
                  <ul className="space-y-3">
                    {integration.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/90">
                        <div className="w-2 h-2 rounded-full bg-white/70 mt-1.5 flex-shrink-0 shadow-sm" />
                        <span className="leading-relaxed">{item}</span>
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
