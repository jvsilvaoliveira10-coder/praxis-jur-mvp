import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { useFirmSettings, FirmSettings } from '@/hooks/useFirmSettings';
import OnboardingProgress from './OnboardingProgress';
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

const OnboardingWizard = ({ open, onClose, onComplete }: OnboardingWizardProps) => {
  const { firmSettings, updateSettings, uploadLogo, completeOnboarding } = useFirmSettings();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  
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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleSkip()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src="/favicon.svg" alt="Práxis AI" className="w-8 h-8" />
              <div>
                <h1 className="font-serif font-bold text-lg">Bem-vindo ao Práxis AI</h1>
                <p className="text-xs text-muted-foreground">Configure seu escritório em poucos minutos</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <OnboardingProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Pular por agora
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            )}
            <Button onClick={handleNext} disabled={saving}>
              {currentStep === TOTAL_STEPS ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Finalizar
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
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWizard;
