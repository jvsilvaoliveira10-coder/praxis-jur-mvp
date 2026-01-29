import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Deadline, Case, DEADLINE_TYPE_LABELS } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, CalendarDays, List, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, isSameDay, startOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DeadlineWithCase extends Deadline {
  case: Case;
}

const Agenda = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deadlines, setDeadlines] = useState<DeadlineWithCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const fetchDeadlines = async () => {
    const { data, error } = await supabase
      .from('deadlines')
      .select(`
        *,
        case:cases(*)
      `)
      .order('deadline_datetime', { ascending: true });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar prazos',
        description: error.message,
      });
    } else {
      setDeadlines(data as DeadlineWithCase[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const getDeadlineStatus = (deadline: Deadline) => {
    const now = new Date();
    const deadlineDate = parseISO(deadline.deadline_datetime);
    const daysUntil = differenceInDays(deadlineDate, now);

    if (daysUntil < 0) {
      return { status: 'vencido', color: 'destructive' as const, icon: AlertTriangle };
    }
    if (daysUntil <= 1) {
      return { status: 'urgente', color: 'destructive' as const, icon: AlertTriangle };
    }
    if (daysUntil <= 3) {
      return { status: 'atenção', color: 'secondary' as const, icon: Clock };
    }
    if (daysUntil <= 7) {
      return { status: 'próximo', color: 'secondary' as const, icon: Clock };
    }
    return { status: 'ok', color: 'outline' as const, icon: CheckCircle };
  };

  const deadlinesForDate = (date: Date) => {
    return deadlines.filter((d) => 
      isSameDay(parseISO(d.deadline_datetime), date)
    );
  };

  const hasDeadline = (date: Date) => {
    return deadlines.some((d) => 
      isSameDay(parseISO(d.deadline_datetime), date)
    );
  };

  const upcomingDeadlines = deadlines.filter(d => {
    const deadlineDate = parseISO(d.deadline_datetime);
    return deadlineDate >= startOfDay(new Date());
  });

  const overdueDeadlines = deadlines.filter(d => {
    const deadlineDate = parseISO(d.deadline_datetime);
    return deadlineDate < startOfDay(new Date());
  });

  const selectedDateDeadlines = deadlinesForDate(selectedDate);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie prazos processuais, audiências e compromissos
          </p>
        </div>
        <Button asChild>
          <Link to="/agenda/new">
            <Plus className="w-4 h-4 mr-2" />
            Novo Prazo
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Próximos 7 dias</CardDescription>
            <CardTitle className="text-2xl">
              {deadlines.filter(d => {
                const days = differenceInDays(parseISO(d.deadline_datetime), new Date());
                return days >= 0 && days <= 7;
              }).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className={overdueDeadlines.length > 0 ? 'border-destructive' : ''}>
          <CardHeader className="pb-2">
            <CardDescription className={overdueDeadlines.length > 0 ? 'text-destructive' : ''}>
              Vencidos
            </CardDescription>
            <CardTitle className={cn("text-2xl", overdueDeadlines.length > 0 && "text-destructive")}>
              {overdueDeadlines.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de prazos</CardDescription>
            <CardTitle className="text-2xl">{deadlines.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <List className="w-4 h-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarDays className="w-4 h-4" />
            Calendário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Prazos</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : deadlines.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">
                    Nenhum prazo cadastrado
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Clique em "Novo Prazo" para começar
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Processo</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deadlines.map((deadline) => {
                      const { status, color, icon: Icon } = getDeadlineStatus(deadline);
                      return (
                        <TableRow key={deadline.id}>
                          <TableCell>
                            <Badge variant={color} className="gap-1">
                              <Icon className="w-3 h-3" />
                              {status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{deadline.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {DEADLINE_TYPE_LABELS[deadline.deadline_type]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {deadline.case?.process_number || 'Sem número'}
                          </TableCell>
                          <TableCell>
                            {format(parseISO(deadline.deadline_datetime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/agenda/${deadline.id}/edit`}>Editar</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <div className="grid gap-6 md:grid-cols-[350px_1fr]">
            <Card>
              <CardContent className="pt-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={ptBR}
                  className="rounded-md border pointer-events-auto"
                  modifiers={{
                    hasDeadline: (date) => hasDeadline(date),
                  }}
                  modifiersStyles={{
                    hasDeadline: {
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                      borderRadius: '50%',
                    },
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </CardTitle>
                <CardDescription>
                  {selectedDateDeadlines.length} prazo(s) nesta data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDateDeadlines.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum prazo para esta data
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateDeadlines.map((deadline) => {
                      const { status, color, icon: Icon } = getDeadlineStatus(deadline);
                      return (
                        <div
                          key={deadline.id}
                          className="flex items-start gap-4 p-4 border rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            <Badge variant={color} className="gap-1">
                              <Icon className="w-3 h-3" />
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium">{deadline.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(deadline.deadline_datetime), "HH:mm", { locale: ptBR })} - {DEADLINE_TYPE_LABELS[deadline.deadline_type]}
                            </p>
                            {deadline.description && (
                              <p className="text-sm mt-1">{deadline.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Processo: {deadline.case?.process_number || 'Sem número'}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/agenda/${deadline.id}/edit`}>Editar</Link>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Agenda;
