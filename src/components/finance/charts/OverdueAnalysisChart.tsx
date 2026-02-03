import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { formatCurrency } from '@/types/finance';
import { AlertTriangle } from 'lucide-react';

interface OverdueData {
  range: string;
  value: number;
  count: number;
}

interface OverdueAnalysisChartProps {
  data: OverdueData[];
  totalOverdue: number;
}

const COLORS = [
  'hsl(48 96% 53%)',   // 1-15 dias - amarelo
  'hsl(38 92% 50%)',   // 16-30 dias - laranja
  'hsl(0 84% 60%)',    // 31-60 dias - vermelho
  'hsl(0 72% 51%)',    // >60 dias - vermelho escuro
];

export function OverdueAnalysisChart({ data, totalOverdue }: OverdueAnalysisChartProps) {
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: OverdueData }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{item.range}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(item.value)}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.count} {item.count === 1 ? 'título' : 'títulos'}
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
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Análise de Inadimplência
        </CardTitle>
        <span className="text-sm font-semibold text-destructive">
          {formatCurrency(totalOverdue)}
        </span>
      </CardHeader>
      <CardContent>
        {data.every(d => d.value === 0) ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p>Nenhuma inadimplência!</p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => formatCurrency(value).replace('R$', '')}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    type="category"
                    dataKey="range"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              {data.map((item, index) => (
                <div key={index} className="text-xs">
                  <div 
                    className="w-full h-1.5 rounded mb-1"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-muted-foreground">{item.count} títulos</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
