import { LucideIcon } from 'lucide-react';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen,
  FileText, 
  Kanban,
  Bell,
  BookTemplate,
  Search,
  Radar,
  CalendarDays,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  FileSignature,
  BarChart3,
  Settings,
} from 'lucide-react';
import { TooltipPlacement } from './TourTooltip';

export interface TourStep {
  id: string;
  target: string;
  title: string;
  description: string;
  icon: LucideIcon;
  placement: TooltipPlacement;
  module: 'juridico' | 'financeiro';
}

export const TOUR_JURIDICO: TourStep[] = [
  {
    id: 'dashboard',
    target: '[data-tour="dashboard"]',
    title: 'Central de Comando',
    description: 'Seu painel com visão geral de tudo: prazos urgentes, processos ativos e métricas do escritório.',
    icon: LayoutDashboard,
    placement: 'right',
    module: 'juridico',
  },
  {
    id: 'clients',
    target: '[data-tour="clients"]',
    title: 'Base de Clientes',
    description: 'Gerencie seus clientes com dados completos, documentos e histórico de processos.',
    icon: Users,
    placement: 'right',
    module: 'juridico',
  },
  {
    id: 'cases',
    target: '[data-tour="cases"]',
    title: 'Processos Ativos',
    description: 'Todos os seus processos organizados com informações essenciais e vinculação a clientes.',
    icon: FolderOpen,
    placement: 'right',
    module: 'juridico',
  },
  {
    id: 'pipeline',
    target: '[data-tour="pipeline"]',
    title: 'Gestão Visual Kanban',
    description: 'Acompanhe o fluxo de cada processo através de etapas personalizáveis em um quadro visual.',
    icon: Kanban,
    placement: 'right',
    module: 'juridico',
  },
  {
    id: 'petitions',
    target: '[data-tour="petitions"]',
    title: 'Gerador de Petições IA',
    description: 'Crie petições completas com ajuda da inteligência artificial em poucos minutos.',
    icon: FileText,
    placement: 'right',
    module: 'juridico',
  },
  {
    id: 'templates',
    target: '[data-tour="templates"]',
    title: 'Biblioteca de Modelos',
    description: 'Salve e organize seus modelos de petições para reutilização rápida.',
    icon: BookTemplate,
    placement: 'right',
    module: 'juridico',
  },
  {
    id: 'jurisprudence',
    target: '[data-tour="jurisprudence"]',
    title: 'Pesquisa Jurisprudencial',
    description: 'Busque jurisprudência do STJ e outros tribunais diretamente na plataforma.',
    icon: Search,
    placement: 'right',
    module: 'juridico',
  },
  {
    id: 'tracking',
    target: '[data-tour="tracking"]',
    title: 'Acompanhamento Processual',
    description: 'Monitore movimentações de processos automaticamente via integração com tribunais.',
    icon: Radar,
    placement: 'right',
    module: 'juridico',
  },
  {
    id: 'agenda',
    target: '[data-tour="agenda"]',
    title: 'Agenda de Prazos',
    description: 'Visualize audiências, prazos processuais e compromissos em um calendário integrado.',
    icon: CalendarDays,
    placement: 'right',
    module: 'juridico',
  },
  {
    id: 'notifications',
    target: '[data-tour="notifications"]',
    title: 'Central de Alertas',
    description: 'Receba notificações de prazos, movimentações e lembretes importantes.',
    icon: Bell,
    placement: 'left',
    module: 'juridico',
  },
];

export const TOUR_FINANCEIRO: TourStep[] = [
  {
    id: 'finance-dashboard',
    target: '[data-tour="finance-dashboard"]',
    title: 'Painel Financeiro',
    description: 'Visão completa da saúde financeira do escritório: receitas, despesas e projeções.',
    icon: Wallet,
    placement: 'right',
    module: 'financeiro',
  },
  {
    id: 'receivables',
    target: '[data-tour="receivables"]',
    title: 'Contas a Receber',
    description: 'Controle de honorários, parcelas e valores a receber com status de pagamento.',
    icon: ArrowDownCircle,
    placement: 'right',
    module: 'financeiro',
  },
  {
    id: 'payables',
    target: '[data-tour="payables"]',
    title: 'Contas a Pagar',
    description: 'Gerencie custas processuais, despesas do escritório e contas fixas.',
    icon: ArrowUpCircle,
    placement: 'right',
    module: 'financeiro',
  },
  {
    id: 'transactions',
    target: '[data-tour="transactions"]',
    title: 'Extrato de Movimentações',
    description: 'Histórico completo de todas as transações financeiras do escritório.',
    icon: Receipt,
    placement: 'right',
    module: 'financeiro',
  },
  {
    id: 'contracts',
    target: '[data-tour="contracts"]',
    title: 'Contratos de Honorários',
    description: 'Cadastre contratos por tipo: mensalidade, êxito, por ato ou misto.',
    icon: FileSignature,
    placement: 'right',
    module: 'financeiro',
  },
  {
    id: 'finance-reports',
    target: '[data-tour="finance-reports"]',
    title: 'Relatórios Gerenciais',
    description: 'DRE, fluxo de caixa, análise de clientes e relatórios de inadimplência.',
    icon: BarChart3,
    placement: 'right',
    module: 'financeiro',
  },
  {
    id: 'finance-settings',
    target: '[data-tour="finance-settings"]',
    title: 'Configurações Financeiras',
    description: 'Personalize categorias, contas bancárias e centros de custo.',
    icon: Settings,
    placement: 'right',
    module: 'financeiro',
  },
];

export const TOUR_COMPLETO = [...TOUR_JURIDICO, ...TOUR_FINANCEIRO];

export type TourModule = 'juridico' | 'financeiro' | 'completo';

export const getTourSteps = (module: TourModule): TourStep[] => {
  switch (module) {
    case 'juridico':
      return TOUR_JURIDICO;
    case 'financeiro':
      return TOUR_FINANCEIRO;
    case 'completo':
      return TOUR_COMPLETO;
  }
};

export const getTourModuleName = (module: TourModule): string => {
  switch (module) {
    case 'juridico':
      return 'Jurídico';
    case 'financeiro':
      return 'Financeiro';
    case 'completo':
      return 'Completo';
  }
};
