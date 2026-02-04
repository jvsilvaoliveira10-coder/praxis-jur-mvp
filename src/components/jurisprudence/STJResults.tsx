import { Loader2, Database, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import STJResultCard from './STJResultCard';
import { STJAcordao } from '@/lib/api/stj-jurisprudence';

interface STJResultsProps {
  results: STJAcordao[];
  isLoading: boolean;
  hasSearched: boolean;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  selectedIds: Set<string>;
  onSelect: (acordao: STJAcordao) => void;
  onPageChange?: (page: number) => void;
}

const STJResults = ({
  results,
  isLoading,
  hasSearched,
  error,
  pagination,
  selectedIds,
  onSelect,
  onPageChange,
}: STJResultsProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Buscando jurisprudência do STJ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro na busca</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium">Busque jurisprudência do STJ</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Digite palavras-chave para encontrar acórdãos relevantes
          </p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Database className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium">Nenhum resultado encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tente usar termos diferentes ou remova alguns filtros
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com contagem */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
          <Database className="mr-1 h-3 w-3" />
          Dados Reais - STJ
        </Badge>
          <span className="text-sm text-muted-foreground">
            {pagination?.total || results.length} resultado(s) encontrado(s)
          </span>
        </div>
      </div>

      {/* Lista de resultados */}
      <div className="space-y-4">
        {results.map((acordao) => (
          <STJResultCard
            key={acordao.id}
            acordao={acordao}
            onSelect={onSelect}
            isSelected={selectedIds.has(acordao.id)}
          />
        ))}
      </div>

      {/* Paginação */}
      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <span className="text-sm text-muted-foreground px-4">
            Página {pagination.page} de {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default STJResults;
