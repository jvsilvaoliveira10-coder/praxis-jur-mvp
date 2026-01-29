import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface JurisprudenceSearchProps {
  onSearch: (query: string, decisionType?: string) => void;
  isLoading: boolean;
}

const JurisprudenceSearch = ({ onSearch, isLoading }: JurisprudenceSearchProps) => {
  const [query, setQuery] = useState('');
  const [decisionType, setDecisionType] = useState<string>('A');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 3) {
      // Pass undefined if "ALL" is selected
      onSearch(query.trim(), decisionType === 'ALL' ? undefined : decisionType);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Digite palavras-chave para buscar jurisprudência..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        
        <Select value={decisionType} onValueChange={setDecisionType} disabled={isLoading}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Tipo de decisão" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">Acórdãos</SelectItem>
            <SelectItem value="M">Decisões Monocráticas</SelectItem>
            <SelectItem value="ALL">Todos</SelectItem>
          </SelectContent>
        </Select>

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
      
      {query.length > 0 && query.length < 3 && (
        <p className="text-sm text-muted-foreground">
          Digite pelo menos 3 caracteres para buscar
        </p>
      )}
    </form>
  );
};

export default JurisprudenceSearch;
