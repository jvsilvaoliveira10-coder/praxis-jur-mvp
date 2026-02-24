import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Shield, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PLANS, PlanConfig } from '@/lib/stripe-plans';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user, subscriptionTier } = useAuth();

  const handleSubscribe = async (plan: PlanConfig) => {
    if (!user) {
      toast.error('Faça login para assinar um plano');
      return;
    }

    setLoadingPlan(plan.tier);
    try {
      const priceId = isAnnual ? plan.annualPriceId : plan.monthlyPriceId;
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { price_id: priceId },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast.error('Erro ao iniciar checkout: ' + (error.message || 'Tente novamente'));
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <img src="/praxis-jur-logo.png" alt="Práxis Jur" className="h-8" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Title */}
        <div className="text-center mb-10 space-y-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            Escolha o plano ideal para o seu escritório
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Automatize sua rotina jurídica e foque no que realmente importa: seus clientes.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <Label htmlFor="billing-toggle" className={cn("text-sm font-medium", !isAnnual && "text-foreground", isAnnual && "text-muted-foreground")}>
              Mensal
            </Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <Label htmlFor="billing-toggle" className={cn("text-sm font-medium", isAnnual && "text-foreground", !isAnnual && "text-muted-foreground")}>
              Anual
            </Label>
            {isAnnual && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Economize até 25%
              </Badge>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const price = isAnnual ? plan.annualMonthlyPrice : plan.monthlyPrice;
            const isCurrentPlan = subscriptionTier === plan.tier;
            const saving = isAnnual
              ? ((plan.monthlyPrice * 12 - plan.annualTotalPrice) / 1).toFixed(0)
              : null;

            return (
              <Card
                key={plan.tier}
                className={cn(
                  "relative flex flex-col transition-all",
                  plan.highlight && "border-primary shadow-lg scale-[1.02]",
                  isCurrentPlan && "ring-2 ring-primary"
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Mais Popular
                    </Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="outline" className="bg-card border-primary text-primary">
                      Seu Plano
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-serif">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-foreground">
                      R${price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                  {isAnnual && saving && (
                    <p className="text-xs text-primary font-medium mt-1">
                      Economize R${saving} por ano
                    </p>
                  )}
                  {isAnnual && (
                    <p className="text-xs text-muted-foreground">
                      Cobrado R${plan.annualTotalPrice.toFixed(2).replace('.', ',')} por ano
                    </p>
                  )}
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.highlight ? "default" : "outline"}
                    disabled={isCurrentPlan || loadingPlan === plan.tier}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {isCurrentPlan
                      ? 'Plano Atual'
                      : loadingPlan === plan.tier
                        ? 'Redirecionando...'
                        : 'Assinar'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Guarantee */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-6 py-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">Garantia de 7 dias</strong> — cancele por e-mail e receba reembolso integral
            </span>
          </div>
        </div>

        {/* Login CTA */}
        {!user && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/auth" className="text-primary font-medium hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
