import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie, Settings, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'praxisjur_cookie_consent';

type ConsentLevel = 'all' | 'necessary' | null;

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (level: ConsentLevel) => {
    localStorage.setItem(CONSENT_KEY, level || 'necessary');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-5 duration-500">
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl shadow-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Cookie className="w-6 h-6 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">
                Política de Cookies e Privacidade
              </h3>
              <button
                onClick={() => handleConsent('necessary')}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Utilizamos cookies essenciais para o funcionamento do site. Ao continuar navegando, você concorda com nossa{' '}
              <Link to="/privacidade" className="text-primary underline hover:text-primary/80">
                Política de Privacidade
              </Link>{' '}
              e nossos{' '}
              <Link to="/termos" className="text-primary underline hover:text-primary/80">
                Termos de Uso
              </Link>
              , em conformidade com a LGPD (Lei nº 13.709/2018).
            </p>

            {showConfig && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Cookies Essenciais</p>
                    <p className="text-muted-foreground text-xs">Necessários para o funcionamento básico do site (sessão, preferências de layout).</p>
                  </div>
                  <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded">Sempre ativo</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Cookies de Análise</p>
                    <p className="text-muted-foreground text-xs">Não utilizamos cookies de rastreamento ou analytics de terceiros.</p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Não utilizado</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button size="sm" onClick={() => handleConsent('all')}>
                Aceitar Todos
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleConsent('necessary')}>
                Apenas Necessários
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowConfig(!showConfig)}
                className="text-muted-foreground"
              >
                <Settings className="w-4 h-4 mr-1" />
                {showConfig ? 'Ocultar Detalhes' : 'Configurar'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
