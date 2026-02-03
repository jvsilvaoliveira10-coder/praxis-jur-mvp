import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Scale, 
  Users, 
  FolderOpen, 
  FileText, 
  LogOut,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarDays,
  BookTemplate,
  Search,
  Radar,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  FileSignature,
  Settings,
  BarChart3,
  Kanban,
  LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SidebarProps {
  onNavigate?: () => void;
}

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

interface NavCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    juridico: true,
    financeiro: true,
  });

  // On mobile, sidebar is always expanded (inside Sheet)
  const isCollapsed = isMobile ? false : collapsed;

  const categories: NavCategory[] = [
    {
      id: 'juridico',
      label: 'Jurídico',
      icon: Scale,
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/clients', icon: Users, label: 'Clientes' },
        { to: '/cases', icon: FolderOpen, label: 'Processos' },
        { to: '/pipeline', icon: Kanban, label: 'Gestão de Processos' },
        { to: '/petitions', icon: FileText, label: 'Petições' },
        { to: '/templates', icon: BookTemplate, label: 'Modelos' },
        { to: '/jurisprudence', icon: Search, label: 'Jurisprudência' },
        { to: '/tracking', icon: Radar, label: 'Acompanhamento' },
        { to: '/agenda', icon: CalendarDays, label: 'Agenda' },
        { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
      ],
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      icon: Wallet,
      items: [
        { to: '/financeiro', icon: LayoutDashboard, label: 'Painel' },
        { to: '/financeiro/receber', icon: ArrowDownCircle, label: 'Contas a Receber' },
        { to: '/financeiro/pagar', icon: ArrowUpCircle, label: 'Contas a Pagar' },
        { to: '/financeiro/extrato', icon: Receipt, label: 'Extrato' },
        { to: '/financeiro/contratos', icon: FileSignature, label: 'Contratos' },
        { to: '/financeiro/relatorios', icon: BarChart3, label: 'Relatórios' },
        { to: '/financeiro/config', icon: Settings, label: 'Configurações Fin.' },
      ],
    },
  ];

  const bottomLinks: NavItem[] = [
    { to: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  const isActive = (path: string) => {
    if (path === '/financeiro') {
      return location.pathname === '/financeiro';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isCategoryActive = (category: NavCategory) => {
    return category.items.some(item => isActive(item.to));
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleSignOut = () => {
    signOut();
    if (onNavigate) {
      onNavigate();
    }
  };

  const renderNavItem = (item: NavItem, inCollapsedSidebar: boolean = false) => (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={handleNavClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
        isActive(item.to)
          ? "bg-sidebar-accent text-sidebar-primary font-medium"
          : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground",
        inCollapsedSidebar && "justify-center px-2"
      )}
    >
      <item.icon className="w-4 h-4 flex-shrink-0" />
      {!inCollapsedSidebar && <span>{item.label}</span>}
    </NavLink>
  );

  const renderCategory = (category: NavCategory, inCollapsedSidebar: boolean = false) => {
    const isOpen = openCategories[category.id];
    const hasActiveItem = isCategoryActive(category);

    if (inCollapsedSidebar) {
      // In collapsed mode, just show icons
      return (
        <div key={category.id} className="space-y-1">
          <div className={cn(
            "flex items-center justify-center p-2 rounded-lg",
            hasActiveItem && "bg-sidebar-accent/30"
          )}>
            <category.icon className="w-5 h-5 text-sidebar-foreground/70" />
          </div>
          {category.items.map(item => renderNavItem(item, true))}
        </div>
      );
    }

    return (
      <Collapsible
        key={category.id}
        open={isOpen}
        onOpenChange={() => toggleCategory(category.id)}
      >
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-colors",
              hasActiveItem
                ? "bg-sidebar-accent/30 text-sidebar-foreground"
                : "hover:bg-sidebar-accent/30 text-sidebar-foreground/80 hover:text-sidebar-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <category.icon className="w-5 h-5" />
              <span className="font-medium">{category.label}</span>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 mt-1 space-y-0.5">
          {category.items.map(item => renderNavItem(item))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // Mobile sidebar (inside Sheet - no fixed positioning)
  if (isMobile) {
    return (
    <div className="h-full bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo - altura fixa de 72px para alinhar com TopHeader */}
      <div className="h-[72px] px-4 flex items-center border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="Práxis AI" className="w-10 h-10" />
          <div className="overflow-hidden">
            <h1 className="font-serif font-bold text-lg leading-tight">Práxis AI</h1>
            <p className="text-xs text-sidebar-foreground/70">Hub Jurídico Inteligente</p>
          </div>
        </div>
      </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-hidden">
          {categories.map(category => renderCategory(category))}
          
          {/* Bottom links */}
          <div className="pt-2 mt-2 border-t border-sidebar-border">
            {bottomLinks.map(item => renderNavItem(item))}
          </div>
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-sidebar-border">
          {profile && (
            <div className="mb-3 px-3">
              <p className="font-medium text-sm truncate">{profile.name}</p>
              <p className="text-xs text-sidebar-foreground/70 capitalize">{profile.role}</p>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </Button>
        </div>
      </div>
    );
  }

  // Desktop sidebar (fixed positioning)
  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col z-50",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo + botão de recolher - altura fixa de 72px para alinhar com TopHeader */}
      <div className="h-[72px] px-4 flex items-center justify-between border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="Práxis AI" className="w-10 h-10" />
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-serif font-bold text-lg leading-tight">Práxis AI</h1>
              <p className="text-xs text-sidebar-foreground/70">Hub Jurídico Inteligente</p>
            </div>
          )}
        </div>
        {/* Botão de recolher no header */}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setCollapsed(!collapsed)}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-hidden">
        {categories.map(category => renderCategory(category, isCollapsed))}
        
        {/* Bottom links */}
        <div className="pt-2 mt-2 border-t border-sidebar-border">
          {bottomLinks.map(item => renderNavItem(item, isCollapsed))}
        </div>
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-sidebar-border">
        {!isCollapsed && profile && (
          <div className="mb-3 px-3">
            <p className="font-medium text-sm truncate">{profile.name}</p>
            <p className="text-xs text-sidebar-foreground/70 capitalize">{profile.role}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
            isCollapsed && "justify-center px-0"
          )}
          onClick={signOut}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
