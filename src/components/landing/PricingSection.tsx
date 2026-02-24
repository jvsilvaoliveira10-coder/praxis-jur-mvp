import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Shield, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PLANS } from '@/lib/stripe-plans';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const { ref: guaranteeRef, isInView: guaranteeInView } = useInView({ threshold: 0.2 });

  return (
    <section id="precos" className="py-14 sm:py-20 relative">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={cn(
            'text-center mb-12 transition-all duration-700',
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Planos e Preços
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
            Escolha o plano ideal para você
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Automatize sua rotina jurídica e foque no que realmente importa: seus clientes.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3">
            <Label className={cn("text-sm font-medium cursor-pointer", !isAnnual ? "text-foreground" : "text-muted-foreground")}>
              Mensal
            </Label>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <Label className={cn("text-sm font-medium cursor-pointer", isAnnual ? "text-foreground" : "text-muted-foreground")}>
              Anual
            </Label>
            {isAnnual && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Economize até 25%
              </Badge>
            )}
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {PLANS.map((plan, index) => {
            const price = isAnnual ? plan.annualMonthlyPrice : plan.monthlyPrice;
            const saving = isAnnual
              ? ((plan.monthlyPrice * 12 - plan.annualTotalPrice)).toFixed(0)
              : null;

            return (
              <Card
                key={plan.tier}
                className={cn(
                  'relative flex flex-col transition-all duration-700',
                  plan.highlight && 'border-primary shadow-lg scale-[1.02]',
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
                style={{ transitionDelay: isInView ? `${(index + 1) * 150}ms` : '0ms' }}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Mais Popular
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
                    asChild
                  >
                    <Link to="/pricing">
                      Ver planos
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Guarantee Block - ROBUST */}
        <div
          ref={guaranteeRef}
          className={cn(
            'max-w-3xl mx-auto mt-16 transition-all duration-700',
            guaranteeInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="relative rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-8 sm:p-10 text-center overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-5">
                <ShieldCheck className="w-9 h-9 text-primary" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-3">
                Garantia Absoluta de 7 Dias
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                Teste o Práxis Jur sem nenhum risco. Se não estiver 100% satisfeito nos primeiros 7 dias, 
                basta enviar um e-mail e devolvemos cada centavo. <strong className="text-foreground">Sem perguntas, sem burocracia.</strong>
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                {[
                  'Reembolso integral, sem perguntas',
                  'Cancele por e-mail a qualquer momento',
                  'Sem risco nenhum para você',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
