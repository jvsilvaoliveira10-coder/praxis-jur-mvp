import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { formatCurrency } from '@/types/finance';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BalanceData {
  month: string;
  saldo: number;
}

interface BalanceEvolutionChartProps {
  data: BalanceData[];
}

export function BalanceEvolutionChart({ data }: BalanceEvolutionChartProps) {
  const firstValue = data.length > 0 ? data[0].saldo : 0;
  const lastValue = data.length > 0 ? data[data.length - 1].saldo : 0;
  const change = lastValue - firstValue;
  const changePercent = firstValue !== 0 ? ((change / firstValue) * 100).toFixed(1) : '0';

  const getTrendIcon = () => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            Saldo: <span className="font-semibold">{formatCurrency(payload[0].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          {getTrendIcon()}
          Evolução Patrimonial
        </CardTitle>
        <div className={`text-sm font-medium ${change >= 0 ? 'text-green-500' : 'text-destructive'}`}>
          {change >= 0 ? '+' : ''}{changePercent}%
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => formatCurrency(value).replace('R$', '')}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
