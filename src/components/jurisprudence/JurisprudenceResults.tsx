import { Scale, Search, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { JurisprudenceResult } from '@/lib/api/jurisprudence';
import JurisprudenceCard from './JurisprudenceCard';

interface JurisprudenceResultsProps {
  results: JurisprudenceResult[];
  isLoading: boolean;
  hasSearched: boolean;
  error?: string;
  cached?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (result: JurisprudenceResult) => void;
}

const JurisprudenceResults = ({
  results,
  isLoading,
  hasSearched,
  error,
  cached,
  selectedIds = new Set(),
  onSelect,
}: JurisprudenceResultsProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        <p className="text-muted-foreground">Buscando jurisprudências...</p>
        <p className="text-sm text-muted-foreground">
          Isso pode levar alguns segundos
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Search className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Pesquise jurisprudência do TJSP</h3>
          <p className="text-muted-foreground max-w-md">
            Digite palavras-chave no campo acima para buscar decisões do Tribunal de Justiça de São Paulo
          </p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Scale className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Nenhum resultado encontrado</h3>
          <p className="text-muted-foreground max-w-md">
            Tente usar termos diferentes ou mais genéricos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
        </p>
        {cached && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            Resultados em cache
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {results.map((result) => (
          <JurisprudenceCard
            key={result.id}
            result={result}
            onSelect={onSelect}
            isSelected={selectedIds.has(result.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default JurisprudenceResults;
