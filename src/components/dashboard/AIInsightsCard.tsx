import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, AlertTriangle, Lightbulb, Target, RefreshCw } from 'lucide-react';
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

  useEffect(() => {
    if (!user) return;
    if (!loadCached()) {
      fetchInsights();
    }
  }, [user]);

  const severityColor = (s: string) => {
    switch (s) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Resumo Inteligente</CardTitle>
              <p className="text-xs text-muted-foreground">Análise automática do seu escritório</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={fetchInsights} 
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
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
            {/* Alerts */}
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

            {/* Insights */}
            {data.insights.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Lightbulb className="w-3.5 h-3.5" /> Insights
                </div>
                {data.insights.map((t, i) => (
                  <div key={i} className="text-sm px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10 text-foreground">
                    {t}
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {data.suggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Target className="w-3.5 h-3.5" /> Sugestões
                </div>
                {data.suggestions.map((t, i) => (
                  <div key={i} className="text-sm px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/10 text-foreground">
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
    </Card>
  );
};

export default AIInsightsCard;
