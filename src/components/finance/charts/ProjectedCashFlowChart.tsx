import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { formatCurrency } from '@/types/finance';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface ProjectedData {
  month: string;
  receitas: number;
  despesas: number;
  saldo: number;
  saldoAcumulado: number;
}

interface ProjectedCashFlowChartProps {
  data: ProjectedData[];
  currentBalance: number;
}

export function ProjectedCashFlowChart({ data, currentBalance }: ProjectedCashFlowChartProps) {
  const hasNegativeProjection = useMemo(() => {
    return data.some(d => d.saldoAcumulado < 0);
  }, [data]);

  const chartData = useMemo(() => {
    let acumulado = currentBalance;
    return data.map(d => {
      acumulado += d.saldo;
      return {
        ...d,
        saldoAcumulado: acumulado,
      };
    });
  }, [data, currentBalance]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Fluxo de Caixa Projetado (12 meses)
        </CardTitle>
        {hasNegativeProjection && (
          <div className="flex items-center gap-1 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Projeção negativa
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value).replace('R$', '')}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: 'var(--foreground)' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
              <Area 
                type="monotone" 
                dataKey="receitas" 
                stroke="hsl(var(--chart-2))" 
                fillOpacity={1}
                fill="url(#colorReceitas)"
                name="Receitas Previstas"
              />
              <Area 
                type="monotone" 
                dataKey="despesas" 
                stroke="hsl(var(--chart-1))" 
                fillOpacity={1}
                fill="url(#colorDespesas)"
                name="Despesas Previstas"
              />
              <Area 
                type="monotone" 
                dataKey="saldoAcumulado" 
                stroke="hsl(var(--chart-3))" 
                fillOpacity={1}
                fill="url(#colorSaldo)"
                name="Saldo Projetado"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
