import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface ReportFiltersProps {
  dateRange: { from: Date; to: Date };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
  presetOptions?: boolean;
}

type PresetPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'last_month' | 'custom';

export function ReportFilters({ 
  dateRange, 
  onDateRangeChange,
  presetOptions = true 
}: ReportFiltersProps) {
  const [preset, setPreset] = useState<PresetPeriod>('month');
  const [isCustom, setIsCustom] = useState(false);

  const handlePresetChange = (value: PresetPeriod) => {
    setPreset(value);
    const now = new Date();
    let from: Date;
    let to: Date;

    switch (value) {
      case 'today':
        from = to = now;
        setIsCustom(false);
        break;
      case 'week':
        from = subDays(now, 7);
        to = now;
        setIsCustom(false);
        break;
      case 'month':
        from = startOfMonth(now);
        to = endOfMonth(now);
        setIsCustom(false);
        break;
      case 'quarter':
        from = startOfMonth(subMonths(now, 2));
        to = endOfMonth(now);
        setIsCustom(false);
        break;
      case 'year':
        from = startOfYear(now);
        to = endOfYear(now);
        setIsCustom(false);
        break;
      case 'last_month':
        from = startOfMonth(subMonths(now, 1));
        to = endOfMonth(subMonths(now, 1));
        setIsCustom(false);
        break;
      case 'custom':
        setIsCustom(true);
        return;
      default:
        from = startOfMonth(now);
        to = endOfMonth(now);
        setIsCustom(false);
    }

    onDateRangeChange({ from, to });
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onDateRangeChange({ from: range.from, to: range.to });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg">
      <Filter className="h-4 w-4 text-muted-foreground" />
      
      {presetOptions && (
        <Select value={preset} onValueChange={(v) => handlePresetChange(v as PresetPeriod)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Últimos 7 dias</SelectItem>
            <SelectItem value="month">Este mês</SelectItem>
            <SelectItem value="last_month">Mês anterior</SelectItem>
            <SelectItem value="quarter">Trimestre</SelectItem>
            <SelectItem value="year">Este ano</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                  {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione o período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={handleDateRangeSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      <span className="text-sm text-muted-foreground">
        {format(dateRange.from, "dd 'de' MMMM", { locale: ptBR })} a{' '}
        {format(dateRange.to, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
      </span>
    </div>
  );
}
