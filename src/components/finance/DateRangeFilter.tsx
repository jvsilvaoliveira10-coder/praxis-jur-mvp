import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, X, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subDays, startOfQuarter, endOfQuarter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

export type DateFilterField = 'due_date' | 'transaction_date' | 'created_at' | 'payment_date' | 'start_date';

export type PresetPeriod = 'today' | 'week' | 'month' | 'last_month' | 'quarter' | 'year' | 'all' | 'custom';

interface DateRangeFilterProps {
  dateRange: { from: Date; to: Date } | null;
  onDateRangeChange: (range: { from: Date; to: Date } | null) => void;
  filterField?: DateFilterField;
  onFilterFieldChange?: (field: DateFilterField) => void;
  showFieldSelector?: boolean;
  fieldOptions?: { value: DateFilterField; label: string }[];
  compact?: boolean;
  className?: string;
}

const DEFAULT_FIELD_OPTIONS: { value: DateFilterField; label: string }[] = [
  { value: 'due_date', label: 'Vencimento' },
  { value: 'created_at', label: 'Criação' },
  { value: 'payment_date', label: 'Pagamento' },
];

export function DateRangeFilter({ 
  dateRange, 
  onDateRangeChange,
  filterField = 'due_date',
  onFilterFieldChange,
  showFieldSelector = false,
  fieldOptions = DEFAULT_FIELD_OPTIONS,
  compact = false,
  className,
}: DateRangeFilterProps) {
  const [preset, setPreset] = useState<PresetPeriod>('month');

  // Initialize with current month on mount
  useEffect(() => {
    if (!dateRange) {
      const now = new Date();
      onDateRangeChange({ from: startOfMonth(now), to: endOfMonth(now) });
    }
  }, []);

  const handlePresetChange = (value: PresetPeriod) => {
    setPreset(value);
    const now = new Date();
    let from: Date;
    let to: Date;

    switch (value) {
      case 'today':
        from = to = now;
        break;
      case 'week':
        from = subDays(now, 7);
        to = now;
        break;
      case 'month':
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      case 'last_month':
        from = startOfMonth(subMonths(now, 1));
        to = endOfMonth(subMonths(now, 1));
        break;
      case 'quarter':
        from = startOfQuarter(now);
        to = endOfQuarter(now);
        break;
      case 'year':
        from = startOfYear(now);
        to = endOfYear(now);
        break;
      case 'all':
        onDateRangeChange(null);
        return;
      case 'custom':
        return;
      default:
        from = startOfMonth(now);
        to = endOfMonth(now);
    }

    onDateRangeChange({ from, to });
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setPreset('custom');
      onDateRangeChange({ from: range.from, to: range.to });
    } else if (range?.from) {
      setPreset('custom');
      onDateRangeChange({ from: range.from, to: range.from });
    }
  };

  const handleClear = () => {
    setPreset('all');
    onDateRangeChange(null);
  };

  const presetLabels: Record<PresetPeriod, string> = {
    today: 'Hoje',
    week: 'Últimos 7 dias',
    month: 'Este mês',
    last_month: 'Mês anterior',
    quarter: 'Este trimestre',
    year: 'Este ano',
    all: 'Todo período',
    custom: 'Personalizado',
  };

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-lg",
      compact && "p-2",
      className
    )}>
      <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
      
      {showFieldSelector && onFilterFieldChange && (
        <Select value={filterField} onValueChange={(v) => onFilterFieldChange(v as DateFilterField)}>
          <SelectTrigger className={cn("w-[130px]", compact && "h-8 text-xs")}>
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            {fieldOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={preset} onValueChange={(v) => handlePresetChange(v as PresetPeriod)}>
        <SelectTrigger className={cn("w-[150px]", compact && "h-8 text-xs")}>
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hoje</SelectItem>
          <SelectItem value="week">Últimos 7 dias</SelectItem>
          <SelectItem value="month">Este mês</SelectItem>
          <SelectItem value="last_month">Mês anterior</SelectItem>
          <SelectItem value="quarter">Este trimestre</SelectItem>
          <SelectItem value="year">Este ano</SelectItem>
          <SelectItem value="all">Todo período</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            className={cn(
              "justify-start text-left font-normal",
              !dateRange && "text-muted-foreground",
              compact && "h-8 text-xs px-2"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime() ? (
                <>
                  {format(dateRange.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                  {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange ? { from: dateRange.from, to: dateRange.to } : undefined}
            onSelect={handleDateRangeSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      {dateRange && (
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", compact && "h-6 w-6")}
          onClick={handleClear}
          title="Limpar filtro"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {dateRange && !compact && (
        <span className="text-sm text-muted-foreground hidden lg:inline">
          {format(dateRange.from, "dd 'de' MMMM", { locale: ptBR })} a{' '}
          {format(dateRange.to, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </span>
      )}
    </div>
  );
}
