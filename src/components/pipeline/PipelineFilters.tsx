import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PipelineFiltersState, CasePriority, ACTION_TYPE_LABELS } from '@/types/pipeline';

interface Client {
  id: string;
  name: string;
}

interface PipelineFiltersProps {
  filters: PipelineFiltersState;
  onFiltersChange: (filters: PipelineFiltersState) => void;
  clients: Client[];
}

export const PipelineFilters = ({ filters, onFiltersChange, clients }: PipelineFiltersProps) => {
  const hasFilters = filters.search || filters.clientId || filters.actionType || filters.priority;

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      clientId: null,
      actionType: null,
      priority: null,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar processo..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.clientId || 'all'}
        onValueChange={(value) => onFiltersChange({ ...filters, clientId: value === 'all' ? null : value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Cliente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os clientes</SelectItem>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.actionType || 'all'}
        onValueChange={(value) => onFiltersChange({ ...filters, actionType: value === 'all' ? null : value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo de Ação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {Object.entries(ACTION_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority || 'all'}
        onValueChange={(value) => onFiltersChange({ ...filters, priority: value === 'all' ? null : value as CasePriority })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="urgente">Urgente</SelectItem>
          <SelectItem value="alta">Alta</SelectItem>
          <SelectItem value="media">Média</SelectItem>
          <SelectItem value="baixa">Baixa</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="w-4 h-4" />
          Limpar
        </Button>
      )}
    </div>
  );
};
