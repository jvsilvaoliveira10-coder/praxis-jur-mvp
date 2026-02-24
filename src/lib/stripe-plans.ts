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
    productIds: ['prod_U2HJxy9725eS7E', 'prod_U2HJ5RnTZpOH5o'],
    monthlyPriceId: 'price_1T4CkfLxZi5ok9e05SUiRmoq',
    annualPriceId: 'price_1T4CknLxZi5ok9e0YBjnQ0uB',
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
    productIds: ['prod_U2HJ1gWpK2s5gf', 'prod_U2HJRM5rNtE50H'],
    monthlyPriceId: 'price_1T4CkhLxZi5ok9e0KRfkH5a1',
    annualPriceId: 'price_1T4CkoLxZi5ok9e0O7bkUS78',
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
    productIds: ['prod_U2HJTdbwYQwjLV', 'prod_U2HJyN3xghEFdG'],
    monthlyPriceId: 'price_1T4CkiLxZi5ok9e0BVhz67Ef',
    annualPriceId: 'price_1T4CkoLxZi5ok9e0h6RGm3yk',
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
