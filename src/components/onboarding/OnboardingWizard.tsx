import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { useFirmSettings, FirmSettings } from '@/hooks/useFirmSettings';
import OnboardingSidebar from './OnboardingSidebar';
import LawyerDataStep from './steps/LawyerDataStep';
import FirmDataStep from './steps/FirmDataStep';
import AddressStep from './steps/AddressStep';
import StructureStep from './steps/StructureStep';
import PracticeAreasStep from './steps/PracticeAreasStep';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const TOTAL_STEPS = 5;

const stepInfo = [
  { title: 'Dados do Advogado', subtitle: 'Preencha suas informações profissionais para personalizar documentos e petições.' },
  { title: 'Dados do Escritório', subtitle: 'Configure a identidade visual e informações comerciais do seu escritório.' },
  { title: 'Endereço Comercial', subtitle: 'Informe a localização do seu escritório para documentos e comunicações.' },
  { title: 'Estrutura do Escritório', subtitle: 'Nos conte sobre o tamanho da sua equipe para otimizarmos sua experiência.' },
  { title: 'Áreas de Atuação', subtitle: 'Selecione suas principais áreas para recomendações personalizadas.' },
];

const OnboardingWizard = ({ open, onClose, onComplete }: OnboardingWizardProps) => {
  const { firmSettings, updateSettings, uploadLogo, completeOnboarding } = useFirmSettings();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  
  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Lawyer Data
    lawyer_name: '',
    oab_number: '',
    oab_state: '',
    cpf: '',
    phone: '',
    whatsapp: '',
    // Step 2: Firm Data
    firm_name: '',
    cnpj: '',
    email: '',
    website: '',
    logo_url: '',
    // Step 3: Address
    address_zip: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    // Step 4: Structure
    firm_type: 'solo',
    lawyers_count: 1,
    interns_count: 0,
    staff_count: 0,
    clients_range: '1-10',
    // Step 5: Practice Areas
    practice_areas: [] as string[],
    main_courts: [] as string[],
    cases_monthly_avg: 0,
  });

  // Load existing data
  useEffect(() => {
    if (firmSettings) {
      setFormData({
        lawyer_name: firmSettings.lawyer_name || '',
        oab_number: firmSettings.oab_number || '',
        oab_state: firmSettings.oab_state || '',
        cpf: firmSettings.cpf || '',
        phone: firmSettings.phone || '',
        whatsapp: firmSettings.whatsapp || '',
        firm_name: firmSettings.firm_name || '',
        cnpj: firmSettings.cnpj || '',
        email: firmSettings.email || '',
        website: firmSettings.website || '',
        logo_url: firmSettings.logo_url || '',
        address_zip: firmSettings.address_zip || '',
        address_street: firmSettings.address_street || '',
        address_number: firmSettings.address_number || '',
        address_complement: firmSettings.address_complement || '',
        address_neighborhood: firmSettings.address_neighborhood || '',
        address_city: firmSettings.address_city || '',
        address_state: firmSettings.address_state || '',
        firm_type: firmSettings.firm_type || 'solo',
        lawyers_count: firmSettings.lawyers_count || 1,
        interns_count: firmSettings.interns_count || 0,
        staff_count: firmSettings.staff_count || 0,
        clients_range: firmSettings.clients_range || '1-10',
        practice_areas: firmSettings.practice_areas || [],
        main_courts: firmSettings.main_courts || [],
        cases_monthly_avg: firmSettings.cases_monthly_avg || 0,
      });
      setCurrentStep(firmSettings.onboarding_step || 1);
    }
  }, [firmSettings]);

  const handleChange = (field: string, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (file: File) => {
    const url = await uploadLogo(file);
    return url;
  };

  const saveCurrentStep = async () => {
    setSaving(true);
    try {
      await updateSettings.mutateAsync({
        ...formData,
        onboarding_step: currentStep + 1,
      } as Partial<FirmSettings>);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await saveCurrentStep();
    
    if (currentStep < TOTAL_STEPS) {
      setSlideDirection('right');
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      await completeOnboarding();
      toast.success('Configuração concluída!', {
        description: 'Seu escritório está pronto para usar o Práxis AI.',
      });
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setSlideDirection('left');
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    toast.info('Você pode completar seu perfil depois', {
      description: 'Acesse Configurações no menu lateral.',
    });
    onClose();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <LawyerDataStep
            data={{
              lawyer_name: formData.lawyer_name,
              oab_number: formData.oab_number,
              oab_state: formData.oab_state,
              cpf: formData.cpf,
              phone: formData.phone,
              whatsapp: formData.whatsapp,
            }}
            onChange={handleChange}
          />
        );
      case 2:
        return (
          <FirmDataStep
            data={{
              firm_name: formData.firm_name,
              cnpj: formData.cnpj,
              email: formData.email,
              website: formData.website,
              logo_url: formData.logo_url,
            }}
            onChange={handleChange}
            onLogoUpload={handleLogoUpload}
          />
        );
      case 3:
        return (
          <AddressStep
            data={{
              address_zip: formData.address_zip,
              address_street: formData.address_street,
              address_number: formData.address_number,
              address_complement: formData.address_complement,
              address_neighborhood: formData.address_neighborhood,
              address_city: formData.address_city,
              address_state: formData.address_state,
            }}
            onChange={handleChange}
          />
        );
      case 4:
        return (
          <StructureStep
            data={{
              firm_type: formData.firm_type,
              lawyers_count: formData.lawyers_count,
              interns_count: formData.interns_count,
              staff_count: formData.staff_count,
              clients_range: formData.clients_range,
            }}
            onChange={handleChange}
          />
        );
      case 5:
        return (
          <PracticeAreasStep
            data={{
              practice_areas: formData.practice_areas,
              main_courts: formData.main_courts,
              cases_monthly_avg: formData.cases_monthly_avg,
            }}
            onChange={handleChange}
          />
        );
      default:
        return null;
    }
  };

  const currentStepInfo = stepInfo[currentStep - 1];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleSkip()}>
      <DialogContent 
        hideCloseButton 
        className="sm:max-w-4xl max-h-[90vh] h-[650px] overflow-hidden flex p-0 gap-0"
      >
        {/* Sidebar */}
        <OnboardingSidebar
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onSkip={handleSkip}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-background rounded-r-lg overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                  {currentStepInfo.title}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {currentStepInfo.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Content with Animation */}
          <div className="flex-1 overflow-hidden relative">
            <div
              key={currentStep}
              className={cn(
                "absolute inset-0 overflow-y-auto px-8 py-6",
                "animate-in duration-300 ease-out",
                slideDirection === 'right' 
                  ? "slide-in-from-right-4 fade-in-0" 
                  : "slide-in-from-left-4 fade-in-0"
              )}
            >
              {renderStep()}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-border bg-muted/30 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Etapa {currentStep} de {TOTAL_STEPS}
            </div>
            
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  className="h-11 px-5"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
              )}
              <Button 
                onClick={handleNext} 
                disabled={saving}
                className="h-11 px-6 bg-gradient-to-r from-primary to-[hsl(222,80%,45%)] hover:from-primary/90 hover:to-[hsl(222,80%,40%)] shadow-lg shadow-primary/25"
              >
                {currentStep === TOTAL_STEPS ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Finalizar Configuração
                  </>
                ) : (
                  <>
                    Continuar
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWizard;
