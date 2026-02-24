import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sparkles, AlertTriangle, Lightbulb, Target, RefreshCw, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Insights {
  alerts: { text: string; severity: 'high' | 'medium' | 'low' }[];
  insights: string[];
  suggestions: string[];
  generatedAt: number;
}

const CACHE_KEY = 'praxis_ai_insights';
const TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

const AIInsightsCard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [fetched, setFetched] = useState(false);

  const loadCached = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached: Insights = JSON.parse(raw);
        if (Date.now() - cached.generatedAt < TTL_MS) {
          setData(cached);
          return true;
        }
      }
    } catch { /* ignore */ }
    return false;
  };

  const fetchInsights = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dashboard-insights`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({}),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Erro ao gerar insights');
      }

      const result = await resp.json();
      const insights: Insights = {
        alerts: result.alerts || [],
        insights: result.insights || [],
        suggestions: result.suggestions || [],
        generatedAt: Date.now(),
      };

      setData(insights);
      localStorage.setItem(CACHE_KEY, JSON.stringify(insights));
    } catch (e) {
      console.error('AI Insights error:', e);
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Fetch only on first open
  const handleToggle = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !fetched && user) {
      setFetched(true);
      if (!loadCached()) {
        fetchInsights();
      }
    }
  };

  const severityColor = (s: string) => {
    switch (s) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  return (
    <Collapsible open={open} onOpenChange={handleToggle}>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Resumo Inteligente</p>
                <p className="text-xs text-muted-foreground">Clique para ver a análise do seu escritório</p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="flex justify-end mb-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={fetchInsights}
                disabled={loading}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            {loading && !data && (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-10 w-5/6" />
              </div>
            )}

            {error && !data && (
              <p className="text-sm text-muted-foreground py-2">{error}</p>
            )}

            {data && (
              <div className="space-y-4">
                {data.alerts.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <AlertTriangle className="w-3.5 h-3.5" /> Alertas
                    </div>
                    {data.alerts.map((a, i) => (
                      <div key={i} className={`text-sm px-3 py-2 rounded-lg border ${severityColor(a.severity)}`}>
                        {a.text}
                      </div>
                    ))}
                  </div>
                )}

                {data.insights.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Lightbulb className="w-3.5 h-3.5" /> Insights
                    </div>
                    {data.insights.map((t, i) => (
                      <div key={i} className="text-sm px-3 py-2 rounded-lg bg-muted/50 border border-border text-foreground">
                        {t}
                      </div>
                    ))}
                  </div>
                )}

                {data.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Target className="w-3.5 h-3.5" /> Sugestões
                    </div>
                    {data.suggestions.map((t, i) => (
                      <div key={i} className="text-sm px-3 py-2 rounded-lg bg-accent/30 border border-accent/20 text-foreground">
                        {t}
                      </div>
                    ))}
                  </div>
                )}

                {data.alerts.length === 0 && data.insights.length === 0 && data.suggestions.length === 0 && (
                  <p className="text-sm text-muted-foreground py-2">Tudo em dia! Nenhum alerta ou insight no momento.</p>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default AIInsightsCard;
