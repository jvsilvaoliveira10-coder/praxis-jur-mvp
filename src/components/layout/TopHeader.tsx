import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFirmSettings } from '@/hooks/useFirmSettings';
import NotificationBell from '@/components/notifications/NotificationBell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Search, User, Settings, LogOut, ChevronRight } from 'lucide-react';

// Route to title mapping
const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clients': 'Clientes',
  '/cases': 'Processos',
  '/pipeline': 'Gestão de Processos',
  '/pipeline/settings': 'Configurar Pipeline',
  '/petitions': 'Petições',
  '/templates': 'Modelos',
  '/jurisprudence': 'Jurisprudência',
  '/tracking': 'Acompanhamento',
  '/agenda': 'Agenda',
  '/relatorios': 'Relatórios',
  '/financeiro': 'Painel Financeiro',
  '/financeiro/receber': 'Contas a Receber',
  '/financeiro/pagar': 'Contas a Pagar',
  '/financeiro/extrato': 'Extrato',
  '/financeiro/contratos': 'Contratos de Honorários',
  '/financeiro/relatorios': 'Relatórios Financeiros',
  '/financeiro/configuracoes': 'Configurações Financeiras',
  '/configuracoes': 'Configurações',
};

// Get parent route info for breadcrumbs
const getParentRoute = (path: string): { title: string; path: string } | null => {
  if (path.startsWith('/financeiro/') && path !== '/financeiro') {
    return { title: 'Financeiro', path: '/financeiro' };
  }
  if (path.startsWith('/clients/') && path !== '/clients') {
    return { title: 'Clientes', path: '/clients' };
  }
  if (path.startsWith('/cases/') && path !== '/cases') {
    return { title: 'Processos', path: '/cases' };
  }
  if (path.startsWith('/pipeline/') && path !== '/pipeline') {
    return { title: 'Pipeline', path: '/pipeline' };
  }
  return null;
};

const TopHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { firmSettings } = useFirmSettings();

  // Get current page title
  const currentPath = location.pathname;
  const pageTitle = routeTitles[currentPath] || 'Página';
  
  // Get parent route for breadcrumb
  const parentRoute = getParentRoute(currentPath);

  // Get user initials
  const getUserInitials = () => {
    const name = firmSettings?.lawyer_name || user?.email || '';
    if (!name) return 'U';
    
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-40 h-[72px] border-b border-sidebar-border bg-[hsl(var(--header-background))] text-[hsl(var(--header-foreground))] backdrop-blur flex items-center justify-between px-4 md:px-6">
      {/* Left side - Page title and breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        {parentRoute && (
          <>
            <button
              onClick={() => navigate(parentRoute.path)}
              className="text-sm text-white/70 hover:text-white transition-colors hidden sm:block"
            >
              {parentRoute.title}
            </button>
            <ChevronRight className="h-4 w-4 text-white/50 hidden sm:block flex-shrink-0" />
          </>
        )}
        <h1 className="text-base md:text-lg font-semibold text-white truncate">{pageTitle}</h1>
      </div>

      {/* Right side - Search, notifications, avatar */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Global Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            type="search"
            placeholder="Buscar clientes, processos..."
            className="pl-9 w-48 xl:w-72 h-9 bg-white/10 border-0 text-white placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-white/30"
          />
        </div>

        {/* Notifications */}
        <div data-tour="notifications">
          <NotificationBell />
        </div>

        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--header-background))] rounded-full">
              <Avatar className="h-9 w-9 cursor-pointer border-2 border-white/20">
                <AvatarImage src={firmSettings?.logo_url || undefined} />
                <AvatarFallback className="bg-white/20 text-white text-sm font-medium">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover z-50">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">
                {firmSettings?.lawyer_name || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => navigate('/configuracoes')}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/configuracoes')}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopHeader;
