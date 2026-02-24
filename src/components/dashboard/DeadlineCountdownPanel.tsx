import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Clock, ChevronDown, ChevronUp, AlertTriangle, CalendarDays, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeadlineRow {
  id: string;
  title: string;
  deadline_datetime: string;
  deadline_type: string;
  case_id: string;
  case: { process_number: string | null; court: string } | { process_number: string | null; court: string }[] | null;
}

const DEADLINE_TYPE_LABELS: Record<string, string> = {
  prazo_processual: 'Prazo Processual',
  audiencia: 'Audiência',
  compromisso: 'Compromisso',
};

function getCountdown(deadlineDatetime: string) {
  const now = new Date();
  const deadline = new Date(deadlineDatetime);
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) return { label: 'VENCIDO', diffDays: -1 };

  const totalMinutes = Math.floor(diffMs / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  if (days > 0) return { label: `${days}d ${hours}h ${minutes}m`, diffDays: days };
  if (hours > 0) return { label: `${hours}h ${minutes}m`, diffDays: 0 };
  return { label: `${minutes}m`, diffDays: 0 };
}

function getColorClass(diffDays: number) {
  if (diffDays < 0) return 'border-muted bg-muted/30 text-muted-foreground';
  if (diffDays === 0) return 'border-destructive/50 bg-destructive/5 text-destructive';
  if (diffDays <= 3) return 'border-warning/50 bg-warning/5 text-warning-foreground';
  return 'border-primary/30 bg-primary/5 text-foreground';
}

function getCountdownBadgeClass(diffDays: number) {
  if (diffDays < 0) return 'bg-muted text-muted-foreground';
  if (diffDays === 0) return 'bg-destructive text-destructive-foreground';
  if (diffDays <= 3) return 'bg-warning text-warning-foreground';
  return 'bg-primary/10 text-primary';
}

const DeadlineCountdownPanel = () => {
  const [deadlines, setDeadlines] = useState<DeadlineRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => {
    const fetchDeadlines = async () => {
      const { data, error } = await supabase
        .from('deadlines')
        .select('id, title, deadline_datetime, deadline_type, case_id, case:cases(process_number, court)')
        .gte('deadline_datetime', new Date(Date.now() - 86400000).toISOString())
        .order('deadline_datetime', { ascending: true })
        .limit(10);

      if (!error && data) {
        setDeadlines(data as unknown as DeadlineRow[]);
      }
      setLoading(false);
    };

    fetchDeadlines();
  }, []);

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || deadlines.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="card-premium overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Clock className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Prazos Próximos</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {deadlines.length} prazo{deadlines.length !== 1 ? 's' : ''} monitorado{deadlines.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-3">
            {deadlines.map((d) => {
              const { label, diffDays } = getCountdown(d.deadline_datetime);
              const caseInfo = Array.isArray(d.case) ? d.case[0] : d.case;

              return (
                <div
                  key={d.id}
                  className={cn(
                    'flex items-center justify-between gap-3 p-3 rounded-xl border transition-all',
                    getColorClass(diffDays)
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">{d.title}</p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
                        {DEADLINE_TYPE_LABELS[d.deadline_type] || d.deadline_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {caseInfo?.process_number || 'Sem número'} • {caseInfo?.court || ''}
                    </p>
                  </div>
                  <div className={cn('px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap', getCountdownBadgeClass(diffDays))}>
                    {diffDays < 0 && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                    {label}
                  </div>
                </div>
              );
            })}

            <Button variant="ghost" asChild className="w-full mt-2 text-muted-foreground hover:text-foreground">
              <Link to="/agenda" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Ver todos os prazos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default DeadlineCountdownPanel;
