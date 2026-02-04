import { useState } from 'react';
import { Search, Loader2, Filter, Calendar, Globe, Database } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { STJ_ORGAOS, STJ_CLASSES, STJSearchParams } from '@/lib/api/stj-jurisprudence';

interface STJSearchProps {
  onSearch: (params: STJSearchParams) => void;
  isLoading: boolean;
}

const STJSearch = ({ onSearch, isLoading }: STJSearchProps) => {
  const [query, setQuery] = useState('');
  const [orgao, setOrgao] = useState<string>('');
  const [classe, setClasse] = useState<string>('');
  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [fetchRemote, setFetchRemote] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 3) {
      onSearch({
        query: query.trim(),
        orgao: orgao || undefined,
        classe: classe || undefined,
        dataInicio: dataInicio ? format(dataInicio, 'yyyy-MM-dd') : undefined,
        dataFim: dataFim ? format(dataFim, 'yyyy-MM-dd') : undefined,
        fetchRemote,
      });
    }
  };

  const clearFilters = () => {
    setOrgao('');
    setClasse('');
    setDataInicio(undefined);
    setDataFim(undefined);
    setFetchRemote(false);
  };

  const hasFilters = orgao || classe || dataInicio || dataFim;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Busca principal */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Digite palavras-chave para buscar jurisprudência do STJ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        
        <Button
          type="button"
          variant={showFilters ? "secondary" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          disabled={isLoading}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtros
          {hasFilters && (
            <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2">
              {[orgao, classe, dataInicio, dataFim].filter(Boolean).length}
            </span>
          )}
        </Button>

        <Button type="submit" disabled={isLoading || query.trim().length < 3}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </>
          )}
        </Button>
      </div>

      {/* Toggle busca remota */}
      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-dashed">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3">
                <Switch
                  id="fetch-remote"
                  checked={fetchRemote}
                  onCheckedChange={setFetchRemote}
                  disabled={isLoading}
                />
                <Label htmlFor="fetch-remote" className="flex items-center gap-2 cursor-pointer">
                  {fetchRemote ? (
                    <Globe className="h-4 w-4 text-primary" />
                  ) : (
                    <Database className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={fetchRemote ? "text-primary font-medium" : ""}>
                    {fetchRemote ? "Buscar na fonte oficial (mais lento)" : "Busca rápida (cache local)"}
                  </span>
                </Label>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                <strong>Busca rápida:</strong> Busca nos acórdãos já baixados localmente (mais rápido).
              </p>
              <p className="mt-1">
                <strong>Fonte oficial:</strong> Consulta a API do Datajud/CNJ em tempo real para obter os dados mais atualizados. Os resultados são importados automaticamente para buscas futuras.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Filtros avançados */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg border">
          {/* Órgão Julgador */}
          <div className="space-y-2">
            <Label>Órgão Julgador</Label>
            <Select value={orgao} onValueChange={setOrgao} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {STJ_ORGAOS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Classe Processual */}
          <div className="space-y-2">
            <Label>Classe Processual</Label>
            <Select value={classe} onValueChange={setClasse} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {STJ_CLASSES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label} ({c.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Início */}
          <div className="space-y-2">
            <Label>Julgados a partir de</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={isLoading}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dataInicio ? format(dataInicio, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dataInicio}
                  onSelect={setDataInicio}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data Fim */}
          <div className="space-y-2">
            <Label>Julgados até</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={isLoading}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dataFim ? format(dataFim, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dataFim}
                  onSelect={setDataFim}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Botão limpar filtros */}
          {hasFilters && (
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      )}

      {query.length > 0 && query.length < 3 && (
        <p className="text-sm text-muted-foreground">
          Digite pelo menos 3 caracteres para buscar
        </p>
      )}
    </form>
  );
};

export default STJSearch;
