import { useState, useCallback } from 'react';
import { 
  Wallet, 
  Receipt, 
  TrendingUp, 
  FileSignature, 
  BarChart3, 
  FileSpreadsheet,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  MousePointerClick
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInView } from '@/hooks/useInView';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ConfettiEffect } from './kanban-demo/ConfettiEffect';

const benefits = [
  {
    icon: BarChart3,
    text: 'Dashboard com métricas em tempo real',
  },
  {
    icon: TrendingUp,
    text: 'Receitas, despesas e lucro líquido integrados',
  },
  {
    icon: Receipt,
    text: 'Alertas de inadimplência automáticos',
  },
  {
    icon: Wallet,
    text: 'Fluxo de caixa projetado e realizado',
  },
  {
    icon: FileSignature,
    text: 'Contratos de honorários recorrentes',
  },
  {
    icon: FileSpreadsheet,
    text: 'Relatórios DRE e análise por cliente',
  },
];

// Mockup data for financial dashboard
const initialMetrics = [
  { 
    id: 'receita',
    label: 'Receita do Mês', 
    value: 45000, 
    change: 15.2, 
    positive: true,
    icon: ArrowUpRight,
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-600'
  },
  { 
    id: 'despesas',
    label: 'Despesas do Mês', 
    value: 18000, 
    change: 3.5, 
    positive: false,
    icon: ArrowDownRight,
    bgColor: 'bg-destructive/10',
    textColor: 'text-destructive'
  },
  { 
    id: 'lucro',
    label: 'Lucro Líquido', 
    value: 27000, 
    change: 28.4, 
    positive: true,
    icon: ArrowUpRight,
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-600'
  },
  { 
    id: 'saldo',
    label: 'Saldo Total', 
    value: 85000, 
    change: 12.1, 
    positive: true,
    icon: ArrowUpRight,
    bgColor: 'bg-primary/10',
    textColor: 'text-primary'
  },
];

// Mini chart bars - revenues and expenses alternating
const generateChartBars = () => [
  { height: 40, isRevenue: true, month: 0 },
  { height: 25, isRevenue: false, month: 0 },
  { height: 55, isRevenue: true, month: 1 },
  { height: 30, isRevenue: false, month: 1 },
  { height: 70, isRevenue: true, month: 2 },
  { height: 35, isRevenue: false, month: 2 },
  { height: 60, isRevenue: true, month: 3 },
  { height: 28, isRevenue: false, month: 3 },
  { height: 80, isRevenue: true, month: 4 },
  { height: 40, isRevenue: false, month: 4 },
  { height: 75, isRevenue: true, month: 5 },
  { height: 32, isRevenue: false, month: 5 },
];

export function FinanceSection() {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  const { toast } = useToast();
  const [metrics, setMetrics] = useState(initialMetrics);
  const [chartBars, setChartBars] = useState(generateChartBars);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleMetricClick = useCallback((metricId: string) => {
    setSelectedMetric(prev => prev === metricId ? null : metricId);
    
    // Simulate adding a value
    setMetrics(prev => prev.map(metric => {
      if (metric.id === metricId) {
        const increase = Math.floor(Math.random() * 5000) + 1000;
        const newValue = metric.id === 'despesas' 
          ? metric.value + increase 
          : metric.value + increase;
        
        return {
          ...metric,
          value: newValue,
          change: metric.change + (Math.random() * 2),
        };
      }
      return metric;
    }));

    // Recalculate lucro
    setMetrics(prev => {
      const receita = prev.find(m => m.id === 'receita')?.value || 0;
      const despesas = prev.find(m => m.id === 'despesas')?.value || 0;
      return prev.map(metric => {
        if (metric.id === 'lucro') {
          return { ...metric, value: receita - despesas };
        }
        if (metric.id === 'saldo') {
          return { ...metric, value: metric.value + Math.floor(Math.random() * 2000) };
        }
        return metric;
      });
    });

    setInteractionCount(prev => prev + 1);
    
    const metric = metrics.find(m => m.id === metricId);
    toast({
      title: `📊 ${metric?.label}`,
      description: "Valor atualizado! Clique novamente para simular mais.",
    });

    // Show confetti on 3rd interaction
    if (interactionCount === 2) {
      setShowConfetti(true);
      toast({
        title: "🎉 Você está pegando o jeito!",
        description: "Assim funciona o controle financeiro em tempo real.",
      });
    }
  }, [metrics, toast, interactionCount]);

  const handleBarClick = useCallback((index: number) => {
    setChartBars(prev => prev.map((bar, i) => {
      if (i === index) {
        const newHeight = Math.min(95, bar.height + Math.floor(Math.random() * 15) + 5);
        return { ...bar, height: newHeight };
      }
      return bar;
    }));

    const bar = chartBars[index];
    toast({
      title: bar.isRevenue ? "💰 Receita aumentou!" : "📉 Despesa registrada",
      description: bar.isRevenue 
        ? "Novo pagamento de honorários recebido" 
        : "Custo operacional lançado",
    });
  }, [chartBars, toast]);

  return (
    <section id="financeiro" className="py-8 sm:py-10 scroll-mt-16">
      <div className="container mx-auto px-4">
        <div ref={ref} className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge 
              className={cn(
                'mb-4 px-4 py-1.5 text-sm font-medium bg-green-500/10 text-green-600 border-green-500/20 transition-all duration-700',
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              <Wallet className="w-4 h-4 mr-2 inline" />
              Gestão Financeira
            </Badge>
            
            <h2 
              className={cn(
                'text-3xl sm:text-4xl font-serif font-bold text-foreground transition-all duration-700 delay-100',
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              Controle total das finanças do seu escritório
            </h2>
            
            <p 
              className={cn(
                'mt-4 text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-150',
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              Dashboard profissional com tudo que você precisa para gerenciar 
              receitas, despesas e a saúde financeira do seu negócio jurídico.
            </p>
          </div>

          {/* Content Grid - Inverted layout */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Benefits List */}
            <div 
              className={cn(
                'order-2 lg:order-1 transition-all duration-700 delay-200',
                isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              )}
            >
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-foreground pt-2">{benefit.text}</p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Tudo integrado com seus clientes e processos para visão completa do ROI.
              </p>

              <Button asChild size="lg" className="mt-8 bg-green-600 hover:bg-green-700">
                <Link to="/auth">
                  Conhecer Módulo Financeiro
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Interactive Dashboard Mockup */}
            <div 
              className={cn(
                'order-1 lg:order-2 transition-all duration-700 delay-300',
                isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              )}
            >
              <div className="bg-card border rounded-xl p-4 shadow-lg relative">
                <ConfettiEffect show={showConfetti} onComplete={() => setShowConfetti(false)} />
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {metrics.map((metric) => (
                    <button
                      key={metric.id}
                      onClick={() => handleMetricClick(metric.id)}
                      className={cn(
                        'rounded-lg p-3 border text-left transition-all duration-200 hover:scale-105 cursor-pointer',
                        metric.bgColor,
                        selectedMetric === metric.id && 'ring-2 ring-primary'
                      )}
                    >
                      <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                      <p className="text-lg font-bold text-foreground">{formatCurrency(metric.value)}</p>
                      <div className={cn('flex items-center gap-1 text-xs', metric.textColor)}>
                        <metric.icon className="w-3 h-3" />
                        <span>+{metric.change.toFixed(1)}%</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Interactive Chart */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-3">Receitas vs Despesas (clique nas barras)</p>
                  <div className="flex items-end justify-between gap-1 h-20">
                    {chartBars.map((bar, index) => (
                      <button
                        key={index}
                        onClick={() => handleBarClick(index)}
                        className={cn(
                          'flex-1 rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer',
                          bar.isRevenue ? 'bg-green-500 hover:bg-green-400' : 'bg-destructive/60 hover:bg-destructive/50'
                        )}
                        style={{ height: `${bar.height}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                    <span>Jan</span>
                    <span>Jun</span>
                    <span>Dez</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Receitas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-destructive/60" />
                    <span>Despesas</span>
                  </div>
                </div>

                {/* Instruction */}
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg py-2">
                  <MousePointerClick className="w-4 h-4" />
                  <span>Experimente! Clique nos cards e barras</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
