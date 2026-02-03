import { useState } from 'react';
import { 
  Kanban, 
  ListChecks, 
  History, 
  CalendarDays, 
  ArrowRight,
  GripVertical,
  Flag,
  PartyPopper
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  DndContext, 
  DragEndEvent, 
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  closestCenter
} from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInView } from '@/hooks/useInView';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { KanbanColumn } from './kanban-demo/KanbanColumn';
import { ConfettiEffect } from './kanban-demo/ConfettiEffect';

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

export interface CardData {
  id: string;
  name: string;
  priority: string;
  priorityColor: string;
}

export interface ColumnData {
  id: string;
  name: string;
  color: string;
  cards: CardData[];
}

const initialColumns: ColumnData[] = [
  { 
    id: 'consulta',
    name: 'Consulta', 
    color: 'hsl(var(--primary))',
    cards: [
      { id: 'card-1', name: 'Maria S.', priority: 'Alta', priorityColor: 'bg-destructive' },
      { id: 'card-2', name: 'Carlos R.', priority: 'Média', priorityColor: 'bg-yellow-500' },
    ]
  },
  { 
    id: 'documentacao',
    name: 'Documentação', 
    color: 'hsl(199 89% 48%)',
    cards: [
      { id: 'card-3', name: 'João P.', priority: 'Média', priorityColor: 'bg-yellow-500' },
    ]
  },
  { 
    id: 'protocolado',
    name: 'Protocolado', 
    color: 'hsl(142 76% 36%)',
    cards: [
      { id: 'card-4', name: 'Empresa ABC', priority: 'Baixa', priorityColor: 'bg-muted-foreground' },
    ]
  },
  { 
    id: 'encerrado',
    name: 'Encerrado', 
    color: 'hsl(var(--muted-foreground))',
    cards: [
      { id: 'card-5', name: 'Pedro R.', priority: 'Baixa', priorityColor: 'bg-muted-foreground' },
    ]
  },
];

export function ProcessManagementSection() {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  const [columns, setColumns] = useState<ColumnData[]>(initialColumns);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  const findCardColumn = (cardId: string): string | null => {
    for (const column of columns) {
      if (column.cards.some(card => card.id === cardId)) {
        return column.id;
      }
    }
    return null;
  };

  const findCard = (cardId: string): CardData | null => {
    for (const column of columns) {
      const card = column.cards.find(c => c.id === cardId);
      if (card) return card;
    }
    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeCardId = active.id as string;
    const overId = over.id as string;

    // Find source column
    const sourceColumnId = findCardColumn(activeCardId);
    if (!sourceColumnId) return;

    // Determine target column
    let targetColumnId: string;
    
    // Check if dropped over a column
    const isOverColumn = columns.some(col => col.id === overId);
    if (isOverColumn) {
      targetColumnId = overId;
    } else {
      // Dropped over a card - find its column
      const cardColumn = findCardColumn(overId);
      if (!cardColumn) return;
      targetColumnId = cardColumn;
    }

    // If same column, do nothing for now
    if (sourceColumnId === targetColumnId) return;

    // Get column names for feedback
    const sourceCol = columns.find(c => c.id === sourceColumnId);
    const targetCol = columns.find(c => c.id === targetColumnId);
    const movedCardData = findCard(activeCardId);

    // Move card between columns
    setColumns(prevColumns => {
      const newColumns = prevColumns.map(col => ({
        ...col,
        cards: [...col.cards]
      }));

      const sourceColumn = newColumns.find(c => c.id === sourceColumnId);
      const targetColumn = newColumns.find(c => c.id === targetColumnId);

      if (!sourceColumn || !targetColumn) return prevColumns;

      const cardIndex = sourceColumn.cards.findIndex(c => c.id === activeCardId);
      if (cardIndex === -1) return prevColumns;

      const [movedCard] = sourceColumn.cards.splice(cardIndex, 1);
      targetColumn.cards.push(movedCard);

      return newColumns;
    });

    // Show confetti and toast
    setShowConfetti(true);
    toast({
      title: "🎉 Processo movido!",
      description: `${movedCardData?.name} foi para ${targetCol?.name}`,
    });
  };

  return (
    <section id="gestao-processos" className="py-8 sm:py-10 scroll-mt-16">
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
            {/* Interactive Kanban */}
            <div 
              className={cn(
                'transition-all duration-700 delay-200',
                isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              )}
            >
              <div className="bg-card border rounded-xl p-4 shadow-lg relative">
                <ConfettiEffect show={showConfetti} onComplete={() => setShowConfetti(false)} />
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {columns.map((column) => (
                      <KanbanColumn 
                        key={column.id} 
                        column={column}
                      />
                    ))}
                  </div>
                </DndContext>
                
                {/* Instruction */}
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg py-2">
                  <GripVertical className="w-4 h-4" />
                  <span>Experimente! Arraste os cards entre as colunas</span>
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
