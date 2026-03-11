import { useState } from 'react';
import { Scale, Search, Calendar, Building2, ExternalLink, ChevronLeft, ChevronRight, Loader2, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

type Resultado = {
  titulo: string;
  ementa: string;
  data: string;
  autoridade: string;
  tipo: string;
  urn: string;
  link: string;
};

const POR_PAGINA = 10;

function ResultCard({ item }: { item: Resultado }) {
  const [expandido, setExpandido] = useState(false);
  const ementaCurta = item.ementa.slice(0, 300);
  const temMais = item.ementa.length > 300;

  return (
    <Card className="border-border hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-4 space-y-3">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {item.tipo || 'Jurisprudência'}
          </Badge>
          {item.autoridade && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span className="font-medium text-foreground/80">{item.autoridade}</span>
            </div>
          )}
          {item.data && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Calendar className="h-3 w-3" />
              <span>{formatarData(item.data)}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h4 className="font-semibold text-sm text-foreground leading-snug">
          {item.titulo}
        </h4>

        {/* Ementa */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {expandido ? item.ementa : ementaCurta}
          {temMais && !expandido && '...'}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          {temMais && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => setExpandido(!expandido)}
            >
              {expandido ? 'Ver menos' : 'Ver ementa completa'}
            </Button>
          )}
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto"
            >
              <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                <ExternalLink className="h-3 w-3" />
                Acessar documento
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatarData(data: string) {
  if (!data) return '';
  try {
    return new Date(data).toLocaleDateString('pt-BR');
  } catch {
    return data;
  }
}

const Jurisprudence = () => {
  const [query, setQuery] = useState('');
  const [pagina, setPagina] = useState(1);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [buscaFeita, setBuscaFeita] = useState(false);

  const totalPaginas = Math.ceil(total / POR_PAGINA);

  async function buscar(novaPagina = 1) {
    if (!query.trim() || query.trim().length < 3) return;
    setCarregando(true);
    setErro('');
    setPagina(novaPagina);

    try {
      const { data, error } = await supabase.functions.invoke('buscar-lexml', {
        body: { query: query.trim(), pagina: novaPagina, porPagina: POR_PAGINA },
      });

      if (error) throw new Error(error.message);
      if (data?.erro) throw new Error(data.erro);

      setResultados(data.resultados || []);
      setTotal(data.total || 0);
      setBuscaFeita(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao buscar jurisprudência';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Scale className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold">Pesquisa de Jurisprudência</h1>
          <p className="text-muted-foreground text-sm">
            Base LexML · Acórdãos, súmulas e decisões de tribunais brasileiros
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ex: danos morais, rescisão contratual, habeas corpus..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscar(1)}
            disabled={carregando}
          />
        </div>
        <Button onClick={() => buscar(1)} disabled={carregando || query.trim().length < 3}>
          {carregando ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
        </Button>
      </div>

      {/* Tips */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
        <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
        <span>
          Use <code className="bg-muted px-1 rounded">AND</code>, <code className="bg-muted px-1 rounded">OR</code>, <code className="bg-muted px-1 rounded">NOT</code> entre termos. 
          Aspas para frase exata: <code className="bg-muted px-1 rounded">"dano moral"</code>
        </span>
      </div>

      {/* Error */}
      {erro && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {carregando && (
        <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Consultando base LexML...</span>
        </div>
      )}

      {/* No results */}
      {buscaFeita && !carregando && resultados.length === 0 && !erro && (
        <div className="text-center py-12 text-muted-foreground">
          <Scale className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nenhum documento encontrado para "<strong>{query}</strong>"</p>
          <p className="text-xs mt-1">Tente termos mais simples ou use operadores de busca</p>
        </div>
      )}

      {/* Results */}
      {resultados.length > 0 && !carregando && (
        <>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{total.toLocaleString('pt-BR')} resultados encontrados</span>
            <span>Página {pagina} de {totalPaginas}</span>
          </div>

          <ScrollArea className="h-[600px] pr-2">
            <div className="space-y-3">
              {resultados.map((item, i) => (
                <ResultCard key={`${pagina}-${i}`} item={item} />
              ))}
            </div>
          </ScrollArea>

          {/* Pagination */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => buscar(pagina - 1)}
                disabled={pagina === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                {pagina} / {totalPaginas}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => buscar(pagina + 1)}
                disabled={pagina >= totalPaginas}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Jurisprudence;
