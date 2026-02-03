import { 
  Kanban, 
  ListChecks, 
  History, 
  CalendarDays, 
  ArrowRight,
  GripVertical,
  Flag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

const benefits = [
  {
    icon: Kanban,
    text: 'Visualize processos em etapas claras e customizáveis',
  },
  {
    icon: GripVertical,
    text: 'Arraste cards para atualizar status instantaneamente',
  },
  {
    icon: ListChecks,
    text: 'Checklists por processo para não esquecer tarefas',
  },
  {
    icon: History,
    text: 'Histórico completo de movimentações registrado',
  },
  {
    icon: Flag,
    text: 'Prioridades e prazos por etapa com alertas',
  },
  {
    icon: CalendarDays,
    text: 'Múltiplas visualizações: Kanban, Lista e Calendário',
  },
];

// Mockup data for Kanban board
const mockupColumns = [
  { 
    name: 'Consulta', 
    count: 3, 
    color: 'hsl(var(--primary))',
    cards: [
      { name: 'Maria S.', priority: 'Alta', priorityColor: 'bg-destructive' },
      { name: 'Carlos R.', priority: 'Média', priorityColor: 'bg-yellow-500' },
    ]
  },
  { 
    name: 'Documentação', 
    count: 2, 
    color: 'hsl(199 89% 48%)',
    cards: [
      { name: 'João P.', priority: 'Média', priorityColor: 'bg-yellow-500' },
    ]
  },
  { 
    name: 'Protocolado', 
    count: 4, 
    color: 'hsl(142 76% 36%)',
    cards: [
      { name: 'Empresa ABC', priority: 'Baixa', priorityColor: 'bg-muted-foreground' },
    ]
  },
  { 
    name: 'Encerrado', 
    count: 8, 
    color: 'hsl(var(--muted-foreground))',
    cards: [
      { name: 'Pedro R.', priority: 'Baixa', priorityColor: 'bg-muted-foreground' },
    ]
  },
];

export function ProcessManagementSection() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section id="gestao-processos" className="py-20 bg-muted/30 scroll-mt-16">
      <div className="container mx-auto px-4">
        <div ref={ref} className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge 
              className={cn(
                'mb-4 px-4 py-1.5 text-sm font-medium bg-blue-500/10 text-blue-600 border-blue-500/20 transition-all duration-700',
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              <Kanban className="w-4 h-4 mr-2 inline" />
              Gestão de Processos
            </Badge>
            
            <h2 
              className={cn(
                'text-3xl sm:text-4xl font-serif font-bold text-foreground transition-all duration-700 delay-100',
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              Acompanhe cada caso do início ao fim
            </h2>
            
            <p 
              className={cn(
                'mt-4 text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-150',
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              Pipeline visual estilo Kanban para gerenciar todos os seus processos. 
              Saiba exatamente onde cada caso está e o que precisa ser feito.
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Mockup do Kanban */}
            <div 
              className={cn(
                'transition-all duration-700 delay-200',
                isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              )}
            >
              <div className="bg-card border rounded-xl p-4 shadow-lg">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {mockupColumns.map((column, colIndex) => (
                    <div 
                      key={column.name}
                      className="flex-shrink-0 w-36 bg-muted/50 rounded-lg p-2"
                      style={{ animationDelay: `${colIndex * 100}ms` }}
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between mb-2 px-1">
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: column.color }}
                          />
                          <span className="text-xs font-medium text-foreground truncate">
                            {column.name}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {column.count}
                        </span>
                      </div>
                      
                      {/* Cards */}
                      <div className="space-y-2">
                        {column.cards.map((card, cardIndex) => (
                          <div 
                            key={cardIndex}
                            className="bg-card border rounded-md p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-foreground truncate">
                                {card.name}
                              </span>
                            </div>
                            <div className={cn(
                              'text-[10px] px-1.5 py-0.5 rounded-full w-fit text-white',
                              card.priorityColor
                            )}>
                              {card.priority}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Drag indicator */}
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <GripVertical className="w-4 h-4" />
                  <span>Arraste para mover entre etapas</span>
                </div>
              </div>
            </div>

            {/* Benefits List */}
            <div 
              className={cn(
                'transition-all duration-700 delay-300',
                isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              )}
            >
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3"
                    style={{ animationDelay: `${(index + 3) * 100}ms` }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-foreground pt-2">{benefit.text}</p>
                  </div>
                ))}
              </div>

              <Button asChild size="lg" className="mt-8 bg-blue-600 hover:bg-blue-700">
                <Link to="/auth">
                  Experimentar Gestão de Processos
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
