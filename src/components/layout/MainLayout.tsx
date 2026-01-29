import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Scale } from 'lucide-react';
import { useState } from 'react';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Mobile layout with Sheet sidebar
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border">
                <Sidebar onNavigate={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <Scale className="w-4 h-4 text-sidebar-primary-foreground" />
              </div>
              <span className="font-serif font-bold text-sidebar-foreground">LegalTech</span>
            </div>
          </div>
          <NotificationBell />
        </header>

        {/* Main content with top padding for fixed header */}
        <main className="pt-14">
          <div className="p-4">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  // Desktop layout with fixed sidebar
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 transition-all duration-300">
        <div className="flex justify-end p-4 border-b">
          <NotificationBell />
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
