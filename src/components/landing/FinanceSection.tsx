import { 
  Wallet, 
  Receipt, 
  TrendingUp, 
  FileSignature, 
  BarChart3, 
  FileSpreadsheet,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

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
const mockupMetrics = [
  { 
    label: 'Receita do Mês', 
    value: 'R$ 45.000', 
    change: '+15.2%', 
    positive: true,
    icon: ArrowUpRight,
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-600'
  },
  { 
    label: 'Despesas do Mês', 
    value: 'R$ 18.000', 
    change: '+3.5%', 
    positive: false,
    icon: ArrowDownRight,
    bgColor: 'bg-destructive/10',
    textColor: 'text-destructive'
  },
  { 
    label: 'Lucro Líquido', 
    value: 'R$ 27.000', 
    change: '+28.4%', 
    positive: true,
    icon: ArrowUpRight,
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-600'
  },
  { 
    label: 'Saldo Total', 
    value: 'R$ 85.000', 
    change: '+12.1%', 
    positive: true,
    icon: ArrowUpRight,
    bgColor: 'bg-primary/10',
    textColor: 'text-primary'
  },
];

// Mini chart bars
const chartBars = [
  { height: 40, revenue: true },
  { height: 25, revenue: false },
  { height: 55, revenue: true },
  { height: 30, revenue: false },
  { height: 70, revenue: true },
  { height: 35, revenue: false },
  { height: 60, revenue: true },
  { height: 28, revenue: false },
  { height: 80, revenue: true },
  { height: 40, revenue: false },
  { height: 75, revenue: true },
  { height: 32, revenue: false },
];

export function FinanceSection() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section id="financeiro" className="py-20 bg-green-500/5 scroll-mt-16">
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

            {/* Mockup do Dashboard */}
            <div 
              className={cn(
                'order-1 lg:order-2 transition-all duration-700 delay-300',
                isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              )}
            >
              <div className="bg-card border rounded-xl p-4 shadow-lg">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {mockupMetrics.map((metric, index) => (
                    <div 
                      key={index}
                      className={cn(
                        'rounded-lg p-3 border',
                        metric.bgColor
                      )}
                    >
                      <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                      <p className="text-lg font-bold text-foreground">{metric.value}</p>
                      <div className={cn('flex items-center gap-1 text-xs', metric.textColor)}>
                        <metric.icon className="w-3 h-3" />
                        <span>{metric.change}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mini Chart */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-3">Receitas vs Despesas</p>
                  <div className="flex items-end justify-between gap-1 h-20">
                    {chartBars.map((bar, index) => (
                      <div 
                        key={index}
                        className={cn(
                          'flex-1 rounded-t transition-all duration-500',
                          bar.revenue ? 'bg-green-500' : 'bg-destructive/60'
                        )}
                        style={{ 
                          height: `${bar.height}%`,
                          transitionDelay: `${index * 50}ms`
                        }}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
