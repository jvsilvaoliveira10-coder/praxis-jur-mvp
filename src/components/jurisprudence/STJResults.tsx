import { Loader2, Database, Search, ChevronLeft, ChevronRight, Globe, Download } from 'lucide-react';
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
  source?: 'local' | 'datajud' | 'mixed';
  imported?: number;
  localCount?: number;
  remoteCount?: number;
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
  source,
  imported,
  localCount,
  remoteCount,
}: STJResultsProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Buscando jurisprudência do STJ...</p>
        <p className="text-xs text-muted-foreground">
          Consultando base local e API Datajud...
        </p>
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
            Digite palavras-chave para encontrar acórdãos relevantes.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            A busca procura primeiro na base local. Se necessário, consulta a API do Datajud em tempo real.
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
            Tente usar termos diferentes ou ative a opção "Buscar na fonte oficial"
          </p>
        </div>
      </div>
    );
  }

  // Determina o badge de fonte
  const getSourceBadge = () => {
    if (source === 'datajud') {
      return (
        <Badge variant="outline" className="bg-accent/50 text-accent-foreground border-accent">
          <Globe className="mr-1 h-3 w-3" />
          API Datajud (tempo real)
        </Badge>
      );
    }
    if (source === 'mixed') {
      return (
        <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border">
          <Database className="mr-1 h-3 w-3" />
          Misto (local + API)
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
        <Database className="mr-1 h-3 w-3" />
        Base Local
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header com contagem e fonte */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {getSourceBadge()}
          <span className="text-sm text-muted-foreground">
            {pagination?.total || results.length} resultado(s) encontrado(s)
          </span>
        </div>
        
        {/* Indicadores de origem */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {localCount !== undefined && localCount > 0 && (
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              {localCount} local
            </span>
          )}
          {remoteCount !== undefined && remoteCount > 0 && (
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {remoteCount} API
            </span>
          )}
          {imported !== undefined && imported > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Download className="mr-1 h-3 w-3" />
              {imported} importados
            </Badge>
          )}
        </div>
      </div>

      {/* Mensagem de importação */}
      {imported !== undefined && imported > 0 && (
        <Alert className="bg-primary/5 border-primary/20">
          <Download className="h-4 w-4 text-primary" />
          <AlertTitle className="text-foreground">Novos acórdãos importados!</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            {imported} acórdão(s) foram adicionados à sua base local. Nas próximas buscas, esses resultados serão carregados instantaneamente.
          </AlertDescription>
        </Alert>
      )}

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
