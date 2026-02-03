import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFirmSettings } from '@/hooks/useFirmSettings';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { firmSettings, isLoading: loadingSettings, refetch } = useFirmSettings();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if onboarding should be shown
  useEffect(() => {
    if (!loadingSettings && firmSettings && !firmSettings.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [firmSettings, loadingSettings]);

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

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    refetch();
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
  };

  // Mobile layout with Sheet sidebar
  if (isMobile) {
    return (
      <>
        <OnboardingWizard 
          open={showOnboarding} 
          onClose={handleOnboardingClose} 
          onComplete={handleOnboardingComplete} 
        />
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
                <img src="/favicon.svg" alt="Práxis AI" className="w-8 h-8" />
                <span className="font-serif font-bold text-sidebar-foreground">Práxis AI</span>
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
      </>
    );
  }

  // Desktop layout with fixed sidebar
  return (
    <>
      <OnboardingWizard 
        open={showOnboarding} 
        onClose={handleOnboardingClose} 
        onComplete={handleOnboardingComplete} 
      />
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <main className="ml-64 flex-1 flex flex-col min-h-screen transition-all duration-300">
          <TopHeader />
          <div className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default MainLayout;
