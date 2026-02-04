import { useState } from 'react';
import { Scale, Sparkles, Rocket, Database, FlaskConical, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { jurisprudenceApi, JurisprudenceResult } from '@/lib/api/jurisprudence';
import { stjJurisprudenceApi, STJAcordao, STJSearchParams } from '@/lib/api/stj-jurisprudence';
import JurisprudenceSearch from '@/components/jurisprudence/JurisprudenceSearch';
import JurisprudenceResults from '@/components/jurisprudence/JurisprudenceResults';
import STJSearch from '@/components/jurisprudence/STJSearch';
import STJResults from '@/components/jurisprudence/STJResults';
import { STJSyncPanel } from '@/components/jurisprudence/STJSyncPanel';

const Jurisprudence = () => {
  const { toast } = useToast();
  
  // TJSP state (demo)
  const [tjspLoading, setTjspLoading] = useState(false);
  const [tjspResults, setTjspResults] = useState<JurisprudenceResult[]>([]);
  const [tjspHasSearched, setTjspHasSearched] = useState(false);
  const [tjspError, setTjspError] = useState<string>();
  const [tjspCached, setTjspCached] = useState(false);
  const [tjspIsMock, setTjspIsMock] = useState(false);
  const [tjspSelectedIds, setTjspSelectedIds] = useState<Set<string>>(new Set());
  
  // STJ state (real)
  const [stjLoading, setStjLoading] = useState(false);
  const [stjResults, setStjResults] = useState<STJAcordao[]>([]);
  const [stjHasSearched, setStjHasSearched] = useState(false);
  const [stjError, setStjError] = useState<string>();
  const [stjPagination, setStjPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>();
  const [stjSelectedIds, setStjSelectedIds] = useState<Set<string>>(new Set());
  const [lastStjParams, setLastStjParams] = useState<STJSearchParams | null>(null);

  // TJSP Search Handler (demo)
  const handleTjspSearch = async (query: string, decisionType?: string) => {
    setTjspLoading(true);
    setTjspError(undefined);
    setTjspHasSearched(true);

    try {
      const response = await jurisprudenceApi.search(query, decisionType);
      
      if (response.success && response.data) {
        setTjspResults(response.data);
        setTjspCached(response.cached || false);
        setTjspIsMock(response.mock || false);
        
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
        setTjspError(response.error || 'Erro ao buscar jurisprudência');
        setTjspResults([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setTjspError(errorMessage);
      setTjspResults([]);
    } finally {
      setTjspLoading(false);
    }
  };

  // STJ Search Handler (real)
  const handleStjSearch = async (params: STJSearchParams) => {
    setStjLoading(true);
    setStjError(undefined);
    setStjHasSearched(true);
    setLastStjParams(params);

    try {
      const response = await stjJurisprudenceApi.search(params);
      
      if (response.success && response.data) {
        setStjResults(response.data);
        setStjPagination(response.pagination);
        
        if (response.data.length === 0) {
          toast({
            title: 'Nenhum resultado',
            description: 'Não foram encontrados acórdãos do STJ para esta busca.',
          });
        } else {
          toast({
            title: 'Busca concluída',
            description: `${response.pagination?.total || response.data.length} acórdão(s) encontrado(s).`,
          });
        }
      } else {
        setStjError(response.error || 'Erro ao buscar jurisprudência do STJ');
        setStjResults([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setStjError(errorMessage);
      setStjResults([]);
    } finally {
      setStjLoading(false);
    }
  };

  const handleStjPageChange = async (page: number) => {
    if (lastStjParams) {
      await handleStjSearch({ ...lastStjParams, page });
    }
  };

  const handleTjspSelect = (result: JurisprudenceResult) => {
    setTjspSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(result.id)) {
        newSet.delete(result.id);
      } else {
        newSet.add(result.id);
      }
      return newSet;
    });

    toast({
      title: tjspSelectedIds.has(result.id) ? 'Jurisprudência removida' : 'Jurisprudência selecionada',
      description: tjspSelectedIds.has(result.id)
        ? 'A jurisprudência foi removida da seleção.'
        : 'A jurisprudência foi adicionada à seleção.',
    });
  };

  const handleStjSelect = (acordao: STJAcordao) => {
    setStjSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(acordao.id)) {
        newSet.delete(acordao.id);
      } else {
        newSet.add(acordao.id);
      }
      return newSet;
    });

    toast({
      title: stjSelectedIds.has(acordao.id) ? 'Acórdão removido' : 'Acórdão selecionado',
      description: stjSelectedIds.has(acordao.id)
        ? 'O acórdão foi removido da seleção.'
        : 'O acórdão foi adicionado à seleção.',
    });
  };

  const totalSelected = tjspSelectedIds.size + stjSelectedIds.size;

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
            Busque decisões judiciais para fundamentar suas petições
          </p>
        </div>
      </div>

      {/* Tabs para selecionar fonte */}
      <Tabs defaultValue="stj" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="stj" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            STJ (Real)
          </TabsTrigger>
          <TabsTrigger value="tjsp" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            TJSP (Demo)
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Admin
          </TabsTrigger>
        </TabsList>

        {/* STJ Tab - Dados Reais */}
        <TabsContent value="stj" className="space-y-6">
          <Alert className="border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
            <Database className="h-5 w-5 text-primary" />
            <AlertTitle className="text-primary font-semibold">
              Base de Dados Real do STJ
            </AlertTitle>
            <AlertDescription className="text-foreground/80 mt-2">
              <p>
                Esta busca utiliza dados oficiais do <strong>Portal de Dados Abertos do STJ</strong>. 
                Os acórdãos são reais e podem ser citados em suas petições.
              </p>
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Buscar no STJ</CardTitle>
              <CardDescription>
                Busque acórdãos por palavras-chave, órgão julgador, classe processual ou período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <STJSearch onSearch={handleStjSearch} isLoading={stjLoading} />
            </CardContent>
          </Card>

          <STJResults
            results={stjResults}
            isLoading={stjLoading}
            hasSearched={stjHasSearched}
            error={stjError}
            pagination={stjPagination}
            selectedIds={stjSelectedIds}
            onSelect={handleStjSelect}
            onPageChange={handleStjPageChange}
          />
        </TabsContent>

        {/* TJSP Tab - Demo */}
        <TabsContent value="tjsp" className="space-y-6">
          <Alert className="border-muted bg-muted/50">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <AlertTitle className="text-foreground font-semibold flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Prévia - Modo Demonstração
            </AlertTitle>
            <AlertDescription className="text-muted-foreground mt-2">
              <p className="mb-2">
                Esta é uma <strong className="text-foreground">demonstração interativa</strong> da ferramenta de pesquisa do TJSP. 
                Os resultados exibidos são exemplos ilustrativos.
              </p>
              <p className="text-sm">
                🚀 <strong className="text-foreground">Em breve:</strong> Integração real com a base do TJSP.
              </p>
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Buscar no TJSP</CardTitle>
              <CardDescription>
                Digite palavras-chave ou termos jurídicos para buscar jurisprudências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JurisprudenceSearch onSearch={handleTjspSearch} isLoading={tjspLoading} />
            </CardContent>
          </Card>

          <JurisprudenceResults
            results={tjspResults}
            isLoading={tjspLoading}
            hasSearched={tjspHasSearched}
            error={tjspError}
            cached={tjspCached}
            isMock={tjspIsMock}
            selectedIds={tjspSelectedIds}
            onSelect={handleTjspSelect}
          />
        </TabsContent>

        {/* Admin Tab - Painel de Sincronização */}
        <TabsContent value="admin" className="space-y-6">
          <Alert className="border-muted bg-muted/50">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <AlertTitle className="text-foreground font-semibold">
              Administração da Base de Dados
            </AlertTitle>
            <AlertDescription className="text-muted-foreground mt-2">
              Gerencie a importação de acórdãos do Portal de Dados Abertos do STJ. 
              A sincronização importa arquivos JSON mensais automaticamente.
            </AlertDescription>
          </Alert>

          <STJSyncPanel />
        </TabsContent>
      </Tabs>

      {/* Selected count indicator */}
      {totalSelected > 0 && (
        <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg">
          {totalSelected} jurisprudência{totalSelected !== 1 ? 's' : ''} selecionada{totalSelected !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default Jurisprudence;
