import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ClientType, 
  CLIENT_TYPE_LABELS, 
  MaritalStatus, 
  MARITAL_STATUS_LABELS,
  BRAZILIAN_STATES 
} from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Save, User, Building2, MapPin, UserCircle, Mail, Phone, FileText, Globe, Briefcase, CreditCard, Hash } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import PremiumFormHeader from '@/components/forms/PremiumFormHeader';
import { Check } from 'lucide-react';

// Validation schemas
const basePFSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  document: z.string().min(11, 'CPF inválido'),
  nationality: z.string().min(2, 'Nacionalidade obrigatória'),
  marital_status: z.string().min(1, 'Estado civil obrigatório'),
  profession: z.string().min(2, 'Profissão obrigatória'),
  rg: z.string().min(5, 'RG inválido'),
  issuing_body: z.string().min(2, 'Órgão expedidor obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
});

const basePJSchema = z.object({
  name: z.string().min(2, 'Razão social deve ter no mínimo 2 caracteres'),
  document: z.string().min(14, 'CNPJ inválido'),
  trade_name: z.string().optional(),
  state_registration: z.string().optional(),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  legal_rep_name: z.string().min(2, 'Nome do representante obrigatório'),
  legal_rep_cpf: z.string().min(11, 'CPF do representante inválido'),
  legal_rep_position: z.string().min(2, 'Cargo do representante obrigatório'),
});

const addressSchema = z.object({
  address_street: z.string().min(2, 'Rua obrigatória'),
  address_number: z.string().min(1, 'Número obrigatório'),
  address_neighborhood: z.string().min(2, 'Bairro obrigatório'),
  address_city: z.string().min(2, 'Cidade obrigatória'),
  address_state: z.string().min(2, 'Estado obrigatório'),
  address_zip: z.string().min(8, 'CEP inválido'),
});

interface FormData {
  type: ClientType;
  name: string;
  document: string;
  nationality: string;
  marital_status: MaritalStatus | '';
  profession: string;
  rg: string;
  issuing_body: string;
  email: string;
  phone: string;
  address_street: string;
  address_number: string;
  address_complement: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  trade_name: string;
  state_registration: string;
  legal_rep_name: string;
  legal_rep_cpf: string;
  legal_rep_position: string;
}

const initialFormData: FormData = {
  type: 'pessoa_fisica',
  name: '',
  document: '',
  nationality: 'brasileiro(a)',
  marital_status: '',
  profession: '',
  rg: '',
  issuing_body: '',
  email: '',
  phone: '',
  address_street: '',
  address_number: '',
  address_complement: '',
  address_neighborhood: '',
  address_city: '',
  address_state: '',
  address_zip: '',
  trade_name: '',
  state_registration: '',
  legal_rep_name: '',
  legal_rep_cpf: '',
  legal_rep_position: '',
};

const STEPS = {
  pessoa_fisica: [
    { id: 1, title: 'Dados Pessoais', icon: User },
    { id: 2, title: 'Endereço', icon: MapPin },
  ],
  pessoa_juridica: [
    { id: 1, title: 'Dados da Empresa', icon: Building2 },
    { id: 2, title: 'Endereço', icon: MapPin },
    { id: 3, title: 'Representante Legal', icon: UserCircle },
  ],
};

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isEdit = !!id;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = STEPS[form.type];
  const totalSteps = steps.length;

  useEffect(() => {
    if (isEdit) {
      const fetchClient = async () => {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error || !data) {
          toast({
            variant: 'destructive',
            title: 'Cliente não encontrado',
          });
          navigate('/clients');
        } else {
          setForm({
            type: data.type as ClientType,
            name: data.name || '',
            document: data.document || '',
            nationality: data.nationality || 'brasileiro(a)',
            marital_status: (data.marital_status as MaritalStatus) || '',
            profession: data.profession || '',
            rg: data.rg || '',
            issuing_body: data.issuing_body || '',
            email: data.email || '',
            phone: data.phone || '',
            address_street: data.address_street || '',
            address_number: data.address_number || '',
            address_complement: data.address_complement || '',
            address_neighborhood: data.address_neighborhood || '',
            address_city: data.address_city || '',
            address_state: data.address_state || '',
            address_zip: data.address_zip || '',
            trade_name: data.trade_name || '',
            state_registration: data.state_registration || '',
            legal_rep_name: data.legal_rep_name || '',
            legal_rep_cpf: data.legal_rep_cpf || '',
            legal_rep_position: data.legal_rep_position || '',
          });
        }
      };
      fetchClient();
    }
  }, [id, isEdit, navigate, toast]);

  const formatDocument = (value: string, type: ClientType) => {
    const numbers = value.replace(/\D/g, '');
    
    if (type === 'pessoa_fisica') {
      return numbers
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    } else {
      return numbers
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2');
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return numbers
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleChange = (field: keyof FormData, value: string) => {
    let formattedValue = value;
    
    if (field === 'document') {
      formattedValue = formatDocument(value, form.type);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    } else if (field === 'address_zip') {
      formattedValue = formatCEP(value);
    } else if (field === 'legal_rep_cpf') {
      formattedValue = formatCPF(value);
    }
    
    setForm({ ...form, [field]: formattedValue });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleTypeChange = (type: ClientType) => {
    setForm({ ...initialFormData, type });
    setStep(1);
    setErrors({});
  };

  const validateStep = () => {
    let schema: z.ZodSchema;
    let dataToValidate: Record<string, unknown>;

    if (form.type === 'pessoa_fisica') {
      if (step === 1) {
        schema = basePFSchema;
        dataToValidate = {
          name: form.name,
          document: form.document,
          nationality: form.nationality,
          marital_status: form.marital_status,
          profession: form.profession,
          rg: form.rg,
          issuing_body: form.issuing_body,
          email: form.email,
          phone: form.phone,
        };
      } else {
        schema = addressSchema;
        dataToValidate = {
          address_street: form.address_street,
          address_number: form.address_number,
          address_neighborhood: form.address_neighborhood,
          address_city: form.address_city,
          address_state: form.address_state,
          address_zip: form.address_zip,
        };
      }
    } else {
      if (step === 1) {
        schema = basePJSchema.pick({
          name: true,
          document: true,
          trade_name: true,
          state_registration: true,
          email: true,
          phone: true,
        });
        dataToValidate = {
          name: form.name,
          document: form.document,
          trade_name: form.trade_name,
          state_registration: form.state_registration,
          email: form.email,
          phone: form.phone,
        };
      } else if (step === 2) {
        schema = addressSchema;
        dataToValidate = {
          address_street: form.address_street,
          address_number: form.address_number,
          address_neighborhood: form.address_neighborhood,
          address_city: form.address_city,
          address_state: form.address_state,
          address_zip: form.address_zip,
        };
      } else {
        schema = basePJSchema.pick({
          legal_rep_name: true,
          legal_rep_cpf: true,
          legal_rep_position: true,
        });
        dataToValidate = {
          legal_rep_name: form.legal_rep_name,
          legal_rep_cpf: form.legal_rep_cpf,
          legal_rep_position: form.legal_rep_position,
        };
      }
    }

    const result = schema.safeParse(dataToValidate);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) return;

    setLoading(true);

    const payload = {
      type: form.type,
      name: form.name,
      document: form.document,
      nationality: form.nationality || null,
      marital_status: form.marital_status || null,
      profession: form.profession || null,
      rg: form.rg || null,
      issuing_body: form.issuing_body || null,
      email: form.email || null,
      phone: form.phone || null,
      address_street: form.address_street || null,
      address_number: form.address_number || null,
      address_complement: form.address_complement || null,
      address_neighborhood: form.address_neighborhood || null,
      address_city: form.address_city || null,
      address_state: form.address_state || null,
      address_zip: form.address_zip || null,
      trade_name: form.trade_name || null,
      state_registration: form.state_registration || null,
      legal_rep_name: form.legal_rep_name || null,
      legal_rep_cpf: form.legal_rep_cpf || null,
      legal_rep_position: form.legal_rep_position || null,
    };

    if (isEdit) {
      const { error } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', id);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao atualizar cliente',
          description: error.message,
        });
      } else {
        toast({ title: 'Cliente atualizado com sucesso' });
        navigate('/clients');
      }
    } else {
      const { error } = await supabase.from('clients').insert({
        ...payload,
        user_id: user?.id,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao criar cliente',
          description: error.message,
        });
      } else {
        toast({ title: 'Cliente criado com sucesso' });
        navigate('/clients');
      }
    }

    setLoading(false);
  };

  const renderPFStep1 = () => (
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
      <div className="sm:col-span-2 space-y-2">
        <Label className="label-premium">
          <User className="w-4 h-4 text-muted-foreground" />
          Nome Completo <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="João da Silva"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="input-premium"
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          CPF <span className="text-destructive">*</span>
        </Label>
        <Input
          id="document"
          placeholder="000.000.000-00"
          value={form.document}
          onChange={(e) => handleChange('document', e.target.value)}
          className="input-premium"
        />
        {errors.document && <p className="text-sm text-destructive">{errors.document}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <Globe className="w-4 h-4 text-muted-foreground" />
          Nacionalidade <span className="text-destructive">*</span>
        </Label>
        <Input
          id="nationality"
          placeholder="brasileiro(a)"
          value={form.nationality}
          onChange={(e) => handleChange('nationality', e.target.value)}
          className="input-premium"
        />
        {errors.nationality && <p className="text-sm text-destructive">{errors.nationality}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <User className="w-4 h-4 text-muted-foreground" />
          Estado Civil <span className="text-destructive">*</span>
        </Label>
        <Select 
          value={form.marital_status} 
          onValueChange={(v) => handleChange('marital_status', v)}
        >
          <SelectTrigger className="select-premium">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MARITAL_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.marital_status && <p className="text-sm text-destructive">{errors.marital_status}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          Profissão <span className="text-destructive">*</span>
        </Label>
        <Input
          id="profession"
          placeholder="Engenheiro"
          value={form.profession}
          onChange={(e) => handleChange('profession', e.target.value)}
          className="input-premium"
        />
        {errors.profession && <p className="text-sm text-destructive">{errors.profession}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <FileText className="w-4 h-4 text-muted-foreground" />
          RG <span className="text-destructive">*</span>
        </Label>
        <Input
          id="rg"
          placeholder="00.000.000-0"
          value={form.rg}
          onChange={(e) => handleChange('rg', e.target.value)}
          className="input-premium"
        />
        {errors.rg && <p className="text-sm text-destructive">{errors.rg}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          Órgão Expedidor <span className="text-destructive">*</span>
        </Label>
        <Input
          id="issuing_body"
          placeholder="SSP/SP"
          value={form.issuing_body}
          onChange={(e) => handleChange('issuing_body', e.target.value)}
          className="input-premium"
        />
        {errors.issuing_body && <p className="text-sm text-destructive">{errors.issuing_body}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <Mail className="w-4 h-4 text-muted-foreground" />
          E-mail <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="joao@email.com"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="input-premium"
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <Phone className="w-4 h-4 text-muted-foreground" />
          Telefone <span className="text-destructive">*</span>
        </Label>
        <Input
          id="phone"
          placeholder="(11) 99999-9999"
          value={form.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="input-premium"
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>
    </div>
  );

  const renderPJStep1 = () => (
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
      <div className="sm:col-span-2 space-y-2">
        <Label className="label-premium">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          Razão Social <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Empresa LTDA"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="input-premium"
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          Nome Fantasia
        </Label>
        <Input
          id="trade_name"
          placeholder="Nome Fantasia"
          value={form.trade_name}
          onChange={(e) => handleChange('trade_name', e.target.value)}
          className="input-premium"
        />
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          CNPJ <span className="text-destructive">*</span>
        </Label>
        <Input
          id="document"
          placeholder="00.000.000/0000-00"
          value={form.document}
          onChange={(e) => handleChange('document', e.target.value)}
          className="input-premium"
        />
        {errors.document && <p className="text-sm text-destructive">{errors.document}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <Hash className="w-4 h-4 text-muted-foreground" />
          Inscrição Estadual
        </Label>
        <Input
          id="state_registration"
          placeholder="Opcional"
          value={form.state_registration}
          onChange={(e) => handleChange('state_registration', e.target.value)}
          className="input-premium"
        />
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <Mail className="w-4 h-4 text-muted-foreground" />
          E-mail <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="contato@empresa.com"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="input-premium"
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <Phone className="w-4 h-4 text-muted-foreground" />
          Telefone <span className="text-destructive">*</span>
        </Label>
        <Input
          id="phone"
          placeholder="(11) 99999-9999"
          value={form.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="input-premium"
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>
    </div>
  );

  const renderAddressStep = () => (
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
      <div className="sm:col-span-2 space-y-2">
        <Label className="label-premium">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          Rua <span className="text-destructive">*</span>
        </Label>
        <Input
          id="address_street"
          placeholder="Av. Paulista"
          value={form.address_street}
          onChange={(e) => handleChange('address_street', e.target.value)}
          className="input-premium"
        />
        {errors.address_street && <p className="text-sm text-destructive">{errors.address_street}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <Hash className="w-4 h-4 text-muted-foreground" />
          Número <span className="text-destructive">*</span>
        </Label>
        <Input
          id="address_number"
          placeholder="1000"
          value={form.address_number}
          onChange={(e) => handleChange('address_number', e.target.value)}
          className="input-premium"
        />
        {errors.address_number && <p className="text-sm text-destructive">{errors.address_number}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          Complemento
        </Label>
        <Input
          id="address_complement"
          placeholder="Apto 101"
          value={form.address_complement}
          onChange={(e) => handleChange('address_complement', e.target.value)}
          className="input-premium"
        />
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          Bairro <span className="text-destructive">*</span>
        </Label>
        <Input
          id="address_neighborhood"
          placeholder="Centro"
          value={form.address_neighborhood}
          onChange={(e) => handleChange('address_neighborhood', e.target.value)}
          className="input-premium"
        />
        {errors.address_neighborhood && <p className="text-sm text-destructive">{errors.address_neighborhood}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          CEP <span className="text-destructive">*</span>
        </Label>
        <Input
          id="address_zip"
          placeholder="00000-000"
          value={form.address_zip}
          onChange={(e) => handleChange('address_zip', e.target.value)}
          className="input-premium"
        />
        {errors.address_zip && <p className="text-sm text-destructive">{errors.address_zip}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          Cidade <span className="text-destructive">*</span>
        </Label>
        <Input
          id="address_city"
          placeholder="São Paulo"
          value={form.address_city}
          onChange={(e) => handleChange('address_city', e.target.value)}
          className="input-premium"
        />
        {errors.address_city && <p className="text-sm text-destructive">{errors.address_city}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <Globe className="w-4 h-4 text-muted-foreground" />
          Estado <span className="text-destructive">*</span>
        </Label>
        <Select 
          value={form.address_state} 
          onValueChange={(v) => handleChange('address_state', v)}
        >
          <SelectTrigger className="select-premium">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {BRAZILIAN_STATES.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.address_state && <p className="text-sm text-destructive">{errors.address_state}</p>}
      </div>
    </div>
  );

  const renderLegalRepStep = () => (
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
      <div className="sm:col-span-2 space-y-2">
        <Label className="label-premium">
          <UserCircle className="w-4 h-4 text-muted-foreground" />
          Nome do Representante Legal <span className="text-destructive">*</span>
        </Label>
        <Input
          id="legal_rep_name"
          placeholder="João da Silva"
          value={form.legal_rep_name}
          onChange={(e) => handleChange('legal_rep_name', e.target.value)}
          className="input-premium"
        />
        {errors.legal_rep_name && <p className="text-sm text-destructive">{errors.legal_rep_name}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          CPF do Representante <span className="text-destructive">*</span>
        </Label>
        <Input
          id="legal_rep_cpf"
          placeholder="000.000.000-00"
          value={form.legal_rep_cpf}
          onChange={(e) => handleChange('legal_rep_cpf', e.target.value)}
          className="input-premium"
        />
        {errors.legal_rep_cpf && <p className="text-sm text-destructive">{errors.legal_rep_cpf}</p>}
      </div>

      <div className="space-y-2">
        <Label className="label-premium">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          Cargo <span className="text-destructive">*</span>
        </Label>
        <Input
          id="legal_rep_position"
          placeholder="Sócio-Administrador"
          value={form.legal_rep_position}
          onChange={(e) => handleChange('legal_rep_position', e.target.value)}
          className="input-premium"
        />
        {errors.legal_rep_position && <p className="text-sm text-destructive">{errors.legal_rep_position}</p>}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    if (form.type === 'pessoa_fisica') {
      return step === 1 ? renderPFStep1() : renderAddressStep();
    } else {
      if (step === 1) return renderPJStep1();
      if (step === 2) return renderAddressStep();
      return renderLegalRepStep();
    }
  };

  const isLastStep = step === totalSteps;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <PremiumFormHeader
        icon={form.type === 'pessoa_fisica' ? <User className="w-6 h-6 text-primary" /> : <Building2 className="w-6 h-6 text-primary" />}
        title={isEdit ? 'Editar Cliente' : 'Novo Cliente'}
        subtitle="Preencha a qualificação completa do cliente"
        backPath="/clients"
      />

      {/* Premium Step Indicator */}
      <div className="flex items-center justify-center gap-3">
        {steps.map((s, index) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isCompleted = step > s.id;
          
          return (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive && "bg-primary text-primary-foreground shadow-lg shadow-primary/25",
                  isCompleted && "bg-primary/10 text-primary",
                  !isActive && !isCompleted && "bg-muted/50 text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium",
                  isActive && "bg-primary-foreground/20",
                  isCompleted && "bg-primary text-primary-foreground",
                  !isActive && !isCompleted && "bg-muted"
                )}>
                  {isCompleted ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{s.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-12 h-1 mx-2 rounded-full transition-colors duration-200",
                  step > s.id ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>

      <Card className="card-premium">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-lg">{steps[step - 1].title}</CardTitle>
              <CardDescription>
                Etapa {step} de {totalSteps}
              </CardDescription>
            </div>
            {step === 1 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tipo de Pessoa</Label>
                <Select value={form.type} onValueChange={(v) => handleTypeChange(v as ClientType)}>
                  <SelectTrigger className="w-[180px] h-10 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CLIENT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderCurrentStep()}

            <div className="flex justify-between pt-6 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={step === 1 ? () => navigate('/clients') : handlePrev}
                className="h-11 px-5 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {step === 1 ? 'Cancelar' : 'Anterior'}
              </Button>

              {isLastStep ? (
                <Button type="submit" disabled={loading} className="btn-premium">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar Cliente'}
                </Button>
              ) : (
                <Button type="button" onClick={handleNext} className="btn-premium">
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientForm;
