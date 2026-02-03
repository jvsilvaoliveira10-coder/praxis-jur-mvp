import { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  Brain, 
  FolderTree, 
  Bell, 
  Calendar, 
  Search, 
  FileDown,
  Kanban,
  ListChecks,
  History,
  CalendarDays,
  Flag,
  Wallet,
  Receipt,
  TrendingUp,
  FileSignature,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

type ModuleKey = 'juridico' | 'processos' | 'financeiro';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface Module {
  key: ModuleKey;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  features: Feature[];
}

const modules: Module[] = [
  {
    key: 'juridico',
    label: 'Produção Jurídica',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    features: [
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
        icon: Search,
        title: 'Pesquisa de Jurisprudência',
        description: 'Busque decisões relevantes para fundamentar suas petições.',
      },
      {
        icon: FileDown,
        title: 'Exportação em PDF',
        description: 'Exporte petições prontas para protocolo com um clique.',
      },
    ],
  },
  {
    key: 'processos',
    label: 'Gestão de Processos',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    features: [
      {
        icon: Kanban,
        title: 'Pipeline Kanban',
        description: 'Visualize todos os processos em etapas customizáveis, do início ao fim.',
      },
      {
        icon: ListChecks,
        title: 'Checklists por Processo',
        description: 'Nunca esqueça uma tarefa. Crie checklists personalizados para cada caso.',
      },
      {
        icon: History,
        title: 'Histórico de Atividades',
        description: 'Registro automático de todas as movimentações e alterações.',
      },
      {
        icon: CalendarDays,
        title: 'Visualização em Calendário',
        description: 'Veja prazos e compromissos de todos os processos em uma única agenda.',
      },
      {
        icon: Bell,
        title: 'Acompanhamento Automático',
        description: 'Monitoramento via DataJud com notificações de novas movimentações.',
      },
      {
        icon: Flag,
        title: 'Prioridades e Prazos',
        description: 'Defina prioridades e prazos por etapa para nunca perder um deadline.',
      },
    ],
  },
  {
    key: 'financeiro',
    label: 'Gestão Financeira',
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    features: [
      {
        icon: Wallet,
        title: 'Contas a Receber',
        description: 'Controle de honorários, consultas e valores pendentes com alertas.',
      },
      {
        icon: Receipt,
        title: 'Contas a Pagar',
        description: 'Gestão de despesas operacionais, custas processuais e vencimentos.',
      },
      {
        icon: TrendingUp,
        title: 'Fluxo de Caixa',
        description: 'Visão em tempo real do dinheiro entrando e saindo, com projeções.',
      },
      {
        icon: FileSignature,
        title: 'Contratos de Honorários',
        description: 'Gestão de contratos recorrentes com geração automática de cobranças.',
      },
      {
        icon: BarChart3,
        title: 'Dashboard Avançado',
        description: 'Métricas, gráficos e indicadores para tomar decisões informadas.',
      },
      {
        icon: FileSpreadsheet,
        title: 'Relatórios Gerenciais',
        description: 'DRE, análise de inadimplência, ROI por cliente e exportação em PDF.',
      },
    ],
  },
];

export function FeaturesSection() {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const [activeModule, setActiveModule] = useState<ModuleKey>('juridico');

  const currentModule = modules.find((m) => m.key === activeModule)!;

  return (
    <section id="funcionalidades" className="py-20 scroll-mt-16">
      <div className="container mx-auto px-4">
        <div ref={ref} className="max-w-3xl mx-auto text-center mb-8">
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
            Três módulos integrados para cobrir todas as necessidades do seu escritório
          </p>
        </div>

        {/* Module Tabs */}
        <div 
          className={cn(
            'flex flex-wrap justify-center gap-3 mb-10 transition-all duration-700 delay-150',
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          {modules.map((module) => (
            <Button
              key={module.key}
              variant={activeModule === module.key ? 'default' : 'outline'}
              onClick={() => setActiveModule(module.key)}
              className={cn(
                'transition-all duration-300',
                activeModule === module.key && module.key === 'juridico' && 'bg-primary hover:bg-primary/90',
                activeModule === module.key && module.key === 'processos' && 'bg-blue-600 hover:bg-blue-700 border-blue-600',
                activeModule === module.key && module.key === 'financeiro' && 'bg-green-600 hover:bg-green-700 border-green-600',
                activeModule !== module.key && 'hover:border-foreground/30'
              )}
            >
              {module.label}
            </Button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {currentModule.features.map((feature, index) => (
            <Card 
              key={`${activeModule}-${feature.title}`}
              className={cn(
                'group hover:shadow-lg transition-all duration-500',
                currentModule.borderColor,
                'hover:border-opacity-50'
              )}
              style={{ 
                animationDelay: `${index * 50}ms`,
              }}
            >
              <CardContent className="pt-6">
                <div className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform',
                  currentModule.bgColor
                )}>
                  <feature.icon className={cn('w-6 h-6', currentModule.color)} />
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
