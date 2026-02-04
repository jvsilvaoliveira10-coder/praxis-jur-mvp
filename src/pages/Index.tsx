import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ProcessManagementSection } from '@/components/landing/ProcessManagementSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { AISection } from '@/components/landing/AISection';
import { FinanceSection } from '@/components/landing/FinanceSection';
import { IntegrationSection } from '@/components/landing/IntegrationSection';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { TargetAudienceSection } from '@/components/landing/TargetAudienceSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { WhatsAppButton } from '@/components/landing/WhatsAppButton';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Show nothing while checking auth to avoid flash
  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main className="relative">
        {/* Global gradient overlay for continuous flow */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/5 to-background pointer-events-none" />
        
        {/* Decorative blur circles that span sections */}
        <div className="absolute top-[20%] left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[40%] right-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[60%] left-1/4 w-72 h-72 bg-primary/3 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[80%] right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Content sections */}
        <div className="relative z-10">
          <HeroSection />
          <ProblemSection />
          <FeaturesSection />
          <ProcessManagementSection />
          <AISection />
          <HowItWorksSection />
          <FinanceSection />
          <IntegrationSection />
          <SecuritySection />
          <TargetAudienceSection />
          <FAQSection />
          <CTASection />
        </div>
      </main>
      <LandingFooter />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
