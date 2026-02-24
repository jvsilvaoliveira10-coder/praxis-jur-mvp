export type SubscriptionTier = 'essencial' | 'profissional' | 'escritorio';

export interface PlanConfig {
  tier: SubscriptionTier;
  name: string;
  productIds: string[];
  monthlyPriceId: string;
  annualPriceId: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  annualTotalPrice: number;
  features: string[];
  highlight?: boolean;
}

export const PLANS: PlanConfig[] = [
  {
    tier: 'essencial',
    name: 'Essencial',
    productIds: ['prod_U2JKWQG6ra59dJ', 'prod_U2JK1MpaIZReIm'],
    monthlyPriceId: 'price_1T4Ei8PqhqW4mgcyPYs81KLM',
    annualPriceId: 'price_1T4EhpPqhqW4mgcyPv0oF24S',
    monthlyPrice: 79.90,
    annualMonthlyPrice: 59.90,
    annualTotalPrice: 718.80,
    features: [
      'Até 30 processos ativos',
      'Gestão de clientes e prazos',
      'Templates manuais de petições',
      'Monitoramento de 10 processos (DataJud)',
      '1 usuário',
    ],
  },
  {
    tier: 'profissional',
    name: 'Profissional',
    productIds: ['prod_U2JK6KBRVIRC9M', 'prod_U2JKSQOtK8tZOB'],
    monthlyPriceId: 'price_1T4Ei1PqhqW4mgcy7wtM0cXp',
    annualPriceId: 'price_1T4EhjPqhqW4mgcy9HdkVd9a',
    monthlyPrice: 119.90,
    annualMonthlyPrice: 99.90,
    annualTotalPrice: 1198.80,
    features: [
      'Processos ilimitados',
      'Geração de petições com IA (8 modelos)',
      'Alertas por e-mail automáticos',
      'Relatórios PDF para clientes',
      'Módulo financeiro completo',
      'Até 3 usuários',
    ],
    highlight: true,
  },
  {
    tier: 'escritorio',
    name: 'Escritório',
    productIds: ['prod_U2JKi2ypHG8dZ2', 'prod_U2JKjLHa51e2oA'],
    monthlyPriceId: 'price_1T4EhvPqhqW4mgcyYMAsQx3G',
    annualPriceId: 'price_1T4EhZPqhqW4mgcyZ6ISU4bL',
    monthlyPrice: 179.90,
    annualMonthlyPrice: 149.90,
    annualTotalPrice: 1798.80,
    features: [
      'Tudo do Profissional',
      'Usuários ilimitados',
      'Dashboards financeiros avançados (DRE, Fluxo de Caixa)',
      'Insights de IA para o negócio',
      'Suporte prioritário',
    ],
  },
];

export function getTierFromProductId(productId: string | null): SubscriptionTier | null {
  if (!productId) return null;
  for (const plan of PLANS) {
    if (plan.productIds.includes(productId)) {
      return plan.tier;
    }
  }
  return null;
}

export function getPlanByTier(tier: SubscriptionTier): PlanConfig | undefined {
  return PLANS.find(p => p.tier === tier);
}
