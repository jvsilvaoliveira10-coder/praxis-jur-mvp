import { useState } from 'react';
import { CaseWithPipeline } from '@/types/pipeline';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PipelineCalendarViewProps {
  cases: CaseWithPipeline[];
  onCardClick: (caseData: CaseWithPipeline) => void;
}

export const PipelineCalendarView = ({ cases, onCardClick }: PipelineCalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getCasesForDate = (date: Date) => {
    return cases.filter(c => {
      if (!c.pipeline?.due_date) return false;
      return isSameDay(new Date(c.pipeline.due_date), date);
    });
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Hoje
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Week days header */}
        <div className="grid grid-cols-7 bg-muted">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const dayCases = getCasesForDate(day);

            return (
              <div
                key={idx}
                className={cn(
                  'min-h-[100px] p-2 border-t border-l first:border-l-0',
                  !isCurrentMonth && 'bg-muted/30',
                  isToday && 'bg-primary/5'
                )}
              >
                <div className={cn(
                  'text-sm mb-1',
                  !isCurrentMonth && 'text-muted-foreground',
                  isToday && 'font-bold text-primary'
                )}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-1">
                  {dayCases.slice(0, 2).map((caseData) => (
                    <button
                      key={caseData.id}
                      onClick={() => onCardClick(caseData)}
                      className="w-full text-left"
                    >
                      <Badge
                        variant="secondary"
                        className="w-full justify-start truncate text-xs py-0.5 px-1.5 cursor-pointer hover:bg-primary/20"
                        style={{
                          borderLeftWidth: '3px',
                          borderLeftColor: caseData.stage?.color || '#6B7280',
                        }}
                      >
                        {caseData.client?.name || 'N/A'}
                      </Badge>
                    </button>
                  ))}
                  {dayCases.length > 2 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{dayCases.length - 2} mais
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
