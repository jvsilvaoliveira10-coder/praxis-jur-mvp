import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ShieldCheck, ArrowRight, Sparkles, Scale, Crown, Building2, Mail, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PLANS } from '@/lib/stripe-plans';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

const tierConfig = {
  essencial: {
    icon: Scale,
    cardClass: 'bg-card border-border',
    iconClass: 'text-muted-foreground',
    iconBg: 'bg-muted',
    textClass: 'text-foreground',
    mutedClass: 'text-muted-foreground',
    priceClass: 'text-foreground',
    checkClass: 'bg-primary/10 text-primary',
    btnVariant: 'outline' as const,
  },
  profissional: {
    icon: Crown,
    cardClass: 'bg-gradient-to-br from-primary to-primary/85 border-primary shadow-2xl shadow-primary/20',
    iconClass: 'text-primary-foreground',
    iconBg: 'bg-primary-foreground/20',
    textClass: 'text-primary-foreground',
    mutedClass: 'text-primary-foreground/70',
    priceClass: 'text-primary-foreground',
    checkClass: 'bg-primary-foreground/20 text-primary-foreground',
    btnVariant: 'secondary' as const,
  },
  escritorio: {
    icon: Building2,
    cardClass: 'bg-card border-foreground/20',
    iconClass: 'text-foreground',
    iconBg: 'bg-foreground/5',
    textClass: 'text-foreground',
    mutedClass: 'text-muted-foreground',
    priceClass: 'text-foreground',
    checkClass: 'bg-primary/10 text-primary',
    btnVariant: 'outline' as const,
  },
};

const guaranteeItems = [
  {
    icon: ShieldCheck,
    title: 'Reembolso Integral',
    subtitle: 'Devolvemos 100% do valor, sem perguntas e sem burocracia.',
  },
  {
    icon: Mail,
    title: 'Cancele por E-mail',
    subtitle: 'Basta um e-mail simples. Sem formulários, sem ligações.',
  },
  {
    icon: ThumbsUp,
    title: 'Risco Zero',
    subtitle: 'Você testa com total liberdade. Não gostou? Dinheiro de volta.',
  },
];

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
            'text-center mb-14 transition-all duration-700',
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

          <div className="flex items-center justify-center gap-3">
            <Label className={cn("text-sm font-medium cursor-pointer", !isAnnual ? "text-foreground" : "text-muted-foreground")}>
              Mensal
            </Label>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <Label className={cn("text-sm font-medium cursor-pointer", isAnnual ? "text-foreground" : "text-muted-foreground")}>
              Anual
            </Label>
            {isAnnual && (
              <Badge variant="secondary" className="ml-2 text-xs bg-primary/10 text-primary border-primary/20">
                Economize até 25%
              </Badge>
            )}
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto items-start">
          {PLANS.map((plan, index) => {
            const price = isAnnual ? plan.annualMonthlyPrice : plan.monthlyPrice;
            const saving = isAnnual
              ? ((plan.monthlyPrice * 12 - plan.annualTotalPrice)).toFixed(0)
              : null;
            const config = tierConfig[plan.tier];
            const TierIcon = config.icon;

            return (
              <div
                key={plan.tier}
                className={cn(
                  'relative flex flex-col rounded-2xl border-2 p-8 transition-all duration-700',
                  config.cardClass,
                  plan.highlight && 'scale-[1.04] z-10',
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
                style={{ transitionDelay: isInView ? `${(index + 1) * 150}ms` : '0ms' }}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary-foreground text-primary px-4 py-1 text-sm font-semibold shadow-lg">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Mais Popular
                    </Badge>
                  </div>
                )}

                {/* Icon */}
                <div className={cn('inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5', config.iconBg)}>
                  <TierIcon className={cn('w-6 h-6', config.iconClass)} />
                </div>

                {/* Name */}
                <h3 className={cn('text-xl font-serif font-bold mb-1', config.textClass)}>
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mt-3 mb-1">
                  <span className={cn('text-4xl font-bold tracking-tight', config.priceClass)}>
                    R${price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className={cn('text-sm ml-1', config.mutedClass)}>/mês</span>
                </div>
                {isAnnual && saving && (
                  <p className={cn('text-xs font-semibold mt-1', plan.highlight ? 'text-primary-foreground/90' : 'text-primary')}>
                    Economize R${saving}/ano
                  </p>
                )}
                {isAnnual && (
                  <p className={cn('text-xs mb-4', config.mutedClass)}>
                    Cobrado R${plan.annualTotalPrice.toFixed(2).replace('.', ',')} por ano
                  </p>
                )}

                {/* Divider */}
                <div className={cn('h-px w-full my-5', plan.highlight ? 'bg-primary-foreground/20' : 'bg-border')} />

                {/* Features */}
                <ul className="space-y-3.5 flex-1 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <div className={cn('flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5', config.checkClass)}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className={config.textClass}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    'w-full h-12 text-base font-semibold rounded-xl',
                    plan.highlight && 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                  )}
                  variant={config.btnVariant}
                  asChild
                >
                  <Link to="/pricing">
                    Ver planos
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Guarantee Block - Premium */}
        <div
          ref={guaranteeRef}
          className={cn(
            'max-w-4xl mx-auto mt-20 transition-all duration-700',
            guaranteeInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="relative rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/5 p-10 sm:p-14 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-5 -left-5 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 text-center">
              {/* Shield icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/25 mb-6">
                <ShieldCheck className="w-10 h-10 text-primary-foreground" />
              </div>

              <h3 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
                Garantia Absoluta de 7 Dias
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                Teste o Práxis Jur sem nenhum risco. Se não estiver 100% satisfeito nos primeiros 7 dias,
                basta enviar um e-mail e devolvemos cada centavo.{' '}
                <strong className="text-foreground">Sem perguntas, sem burocracia.</strong>
              </p>

              {/* 3 mini-cards */}
              <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
                {guaranteeItems.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 text-center"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                        <ItemIcon className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.subtitle}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
