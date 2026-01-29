import { useState } from 'react';
import { Scale } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { jurisprudenceApi, JurisprudenceResult } from '@/lib/api/jurisprudence';
import JurisprudenceSearch from '@/components/jurisprudence/JurisprudenceSearch';
import JurisprudenceResults from '@/components/jurisprudence/JurisprudenceResults';

const Jurisprudence = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<JurisprudenceResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string>();
  const [cached, setCached] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const handleSearch = async (query: string, decisionType?: string) => {
    setIsLoading(true);
    setError(undefined);
    setHasSearched(true);

    try {
      const response = await jurisprudenceApi.search(query, decisionType);
      
      if (response.success && response.data) {
        setResults(response.data);
        setCached(response.cached || false);
        setIsMock(response.mock || false);
        
        if (response.data.length === 0) {
          toast({
            title: 'Nenhum resultado',
            description: response.message || 'Não foram encontradas jurisprudências para esta busca.',
          });
        } else {
          toast({
            title: 'Busca concluída',
            description: `${response.data.length} resultado(s) encontrado(s)${response.cached ? ' (cache)' : ''}.`,
          });
        }
      } else {
        setError(response.error || 'Erro ao buscar jurisprudência');
        setResults([]);
        toast({
          title: 'Erro na busca',
          description: response.error || 'Ocorreu um erro ao buscar jurisprudências.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setResults([]);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (result: JurisprudenceResult) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(result.id)) {
        newSet.delete(result.id);
      } else {
        newSet.add(result.id);
      }
      return newSet;
    });

    toast({
      title: selectedIds.has(result.id) ? 'Jurisprudência removida' : 'Jurisprudência selecionada',
      description: selectedIds.has(result.id)
        ? 'A jurisprudência foi removida da seleção.'
        : 'A jurisprudência foi adicionada à seleção. Você pode usá-la ao criar uma petição.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Scale className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold">Pesquisa de Jurisprudência</h1>
          <p className="text-muted-foreground">
            Busque decisões do TJSP para fundamentar suas petições
          </p>
        </div>
      </div>

      {/* Search Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar no TJSP</CardTitle>
          <CardDescription>
            Digite palavras-chave ou termos jurídicos para buscar jurisprudências
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JurisprudenceSearch onSearch={handleSearch} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Results */}
      <JurisprudenceResults
        results={results}
        isLoading={isLoading}
        hasSearched={hasSearched}
        error={error}
        cached={cached}
        isMock={isMock}
        selectedIds={selectedIds}
        onSelect={handleSelect}
      />

      {/* Selected count indicator */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg">
          {selectedIds.size} jurisprudência{selectedIds.size !== 1 ? 's' : ''} selecionada{selectedIds.size !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default Jurisprudence;
