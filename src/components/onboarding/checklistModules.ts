import { LucideIcon } from 'lucide-react';
import { 
  User, 
  Users, 
  FileText, 
  Kanban, 
  Search, 
  Radar,
  FolderOpen,
  Wallet,
  ArrowDownCircle,
  FileSignature,
  BarChart3,
  BookTemplate,
  FileDown,
} from 'lucide-react';

export interface ChecklistTask {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  route?: string;
  actionLabel?: string;
  // Field to check in progress object
  progressField?: string;
  // Custom check function for complex validations
  customCheck?: boolean;
}

export interface ChecklistModule {
  id: 'juridico' | 'financeiro';
  title: string;
  icon: LucideIcon;
  gradient: string;
  badge: {
    id: string;
    name: string;
    icon: string;
    description: string;
  };
  tasks: ChecklistTask[];
}

export const CHECKLIST_MODULES: ChecklistModule[] = [
  {
    id: 'juridico',
    title: 'Módulo Jurídico',
    icon: FolderOpen,
    gradient: 'from-teal-500 to-cyan-500',
    badge: {
      id: 'jurista',
      name: 'Jurista Digital',
      icon: '⚖️',
      description: 'Completou o módulo jurídico',
    },
    tasks: [
      {
        id: 'profile',
        title: 'Completar perfil profissional',
        description: 'Preencha seus dados de advogado',
        icon: User,
        route: '/configuracoes',
        actionLabel: 'Configurações',
        customCheck: true, // Checked via firmSettings
      },
      {
        id: 'client',
        title: 'Cadastrar primeiro cliente',
        description: 'Adicione seu primeiro cliente',
        icon: Users,
        route: '/clients/new',
        actionLabel: 'Novo Cliente',
        progressField: 'first_client_created',
      },
      {
        id: 'case',
        title: 'Registrar primeiro processo',
        description: 'Crie um processo judicial',
        icon: FolderOpen,
        route: '/cases/new',
        actionLabel: 'Novo Processo',
        progressField: 'first_case_created',
      },
      {
        id: 'petition',
        title: 'Gerar petição com IA',
        description: 'Use a IA com 8 modelos especializados',
        icon: FileText,
        route: '/petitions/new',
        actionLabel: 'Nova Petição',
        progressField: 'first_petition_generated',
      },
      {
        id: 'ai-template',
        title: 'Usar modelo de petição IA',
        description: 'Gere uma petição usando um modelo especializado',
        icon: BookTemplate,
        route: '/petitions/new',
        actionLabel: 'Usar Modelo',
        progressField: 'ai_template_used',
      },
      {
        id: 'client-report',
        title: 'Gerar relatório para cliente',
        description: 'Crie um relatório PDF executivo',
        icon: FileDown,
        route: '/reports',
        actionLabel: 'Gerar Relatório',
        progressField: 'client_report_generated',
      },
      {
        id: 'pipeline',
        title: 'Organizar processos no Kanban',
        description: 'Explore a gestão visual',
        icon: Kanban,
        route: '/pipeline',
        actionLabel: 'Ver Pipeline',
        progressField: 'pipeline_visited',
      },
      {
        id: 'jurisprudence',
        title: 'Fazer pesquisa jurisprudencial',
        description: 'Busque jurisprudência do STJ',
        icon: Search,
        route: '/jurisprudence',
        actionLabel: 'Pesquisar',
        progressField: 'jurisprudence_searched',
      },
      {
        id: 'tracking',
        title: 'Monitorar um processo',
        description: 'Acompanhe movimentações',
        icon: Radar,
        route: '/tracking',
        actionLabel: 'Acompanhar',
        progressField: 'tracking_used',
      },
    ],
  },
  {
    id: 'financeiro',
    title: 'Módulo Financeiro',
    icon: Wallet,
    gradient: 'from-green-500 to-emerald-500',
    badge: {
      id: 'gestor',
      name: 'Gestor Financeiro',
      icon: '💰',
      description: 'Completou o módulo financeiro',
    },
    tasks: [
      {
        id: 'finance-visit',
        title: 'Explorar painel financeiro',
        description: 'Conheça o dashboard financeiro',
        icon: Wallet,
        route: '/financeiro',
        actionLabel: 'Ver Painel',
        progressField: 'finance_dashboard_visited',
      },
      {
        id: 'receivable',
        title: 'Criar conta a receber',
        description: 'Registre um honorário',
        icon: ArrowDownCircle,
        route: '/financeiro/receber/new',
        actionLabel: 'Nova Conta',
        progressField: 'first_receivable_created',
      },
      {
        id: 'contract',
        title: 'Cadastrar contrato de honorários',
        description: 'Crie um contrato de honorários',
        icon: FileSignature,
        route: '/financeiro/contratos/new',
        actionLabel: 'Novo Contrato',
        progressField: 'first_contract_created',
      },
      {
        id: 'report',
        title: 'Gerar relatório financeiro',
        description: 'Visualize um relatório gerencial',
        icon: BarChart3,
        route: '/financeiro/relatorios',
        actionLabel: 'Ver Relatórios',
        progressField: 'finance_report_generated',
      },
    ],
  },
];

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: 'module_juridico' | 'module_financeiro' | 'all_complete';
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'jurista',
    name: 'Jurista Digital',
    description: 'Completou o módulo jurídico',
    icon: '⚖️',
    condition: 'module_juridico',
  },
  {
    id: 'gestor',
    name: 'Gestor Financeiro',
    description: 'Completou o módulo financeiro',
    icon: '💰',
    condition: 'module_financeiro',
  },
  {
    id: 'mestre',
    name: 'Mestre da Práxis',
    description: 'Dominou toda a plataforma',
    icon: '🏆',
    condition: 'all_complete',
  },
];
