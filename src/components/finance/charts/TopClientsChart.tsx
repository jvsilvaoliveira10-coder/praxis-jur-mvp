import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/types/finance';
import { Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ClientData {
  id: string;
  name: string;
  value: number;
  count: number;
}

interface TopClientsChartProps {
  clients: ClientData[];
  totalRevenue: number;
}

export function TopClientsChart({ clients, totalRevenue }: TopClientsChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Top 5 Clientes por Receita
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Sem dados de clientes
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client, index) => {
              const percentage = totalRevenue > 0 ? (client.value / totalRevenue) * 100 : 0;
              return (
                <div key={client.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground w-5">
                        {index + 1}º
                      </span>
                      <span className="font-medium truncate max-w-[150px]">
                        {client.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">
                        {formatCurrency(client.value)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {client.count} {client.count === 1 ? 'pagamento' : 'pagamentos'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
