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
      <main>
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
      </main>
      <LandingFooter />
    </div>
  );
};

export default Index;
