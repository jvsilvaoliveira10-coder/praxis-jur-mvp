import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, Building2, Users, CreditCard, Save, Loader2, Upload, 
  Phone, Mail, Globe, MapPin, Scale, FileText, X 
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useFirmSettings, FirmSettings } from '@/hooks/useFirmSettings';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const practiceAreas = [
  { id: 'civel', label: 'Cível' },
  { id: 'criminal', label: 'Criminal' },
  { id: 'trabalhista', label: 'Trabalhista' },
  { id: 'tributario', label: 'Tributário' },
  { id: 'empresarial', label: 'Empresarial' },
  { id: 'familia', label: 'Família e Sucessões' },
  { id: 'previdenciario', label: 'Previdenciário' },
  { id: 'consumidor', label: 'Direito do Consumidor' },
  { id: 'ambiental', label: 'Ambiental' },
  { id: 'digital', label: 'Digital/LGPD' },
  { id: 'imobiliario', label: 'Imobiliário' },
  { id: 'administrativo', label: 'Administrativo' },
];

const courts = [
  { id: 'tjsp', label: 'TJSP' },
  { id: 'tjrj', label: 'TJRJ' },
  { id: 'tjmg', label: 'TJMG' },
  { id: 'trt', label: 'TRT' },
  { id: 'trf', label: 'TRF' },
  { id: 'stj', label: 'STJ' },
  { id: 'stf', label: 'STF' },
  { id: 'tst', label: 'TST' },
  { id: 'juizado', label: 'Juizados Especiais' },
];

const Settings = () => {
  const { user, profile } = useAuth();
  const { firmSettings, isLoading, updateSettings, uploadLogo } = useFirmSettings();
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<{
    lawyer_name: string;
    oab_number: string;
    oab_state: string;
    cpf: string;
    phone: string;
    whatsapp: string;
    firm_name: string;
    cnpj: string;
    email: string;
    website: string;
    logo_url: string;
    address_zip: string;
    address_street: string;
    address_number: string;
    address_complement: string;
    address_neighborhood: string;
    address_city: string;
    address_state: string;
    firm_type: 'solo' | 'partnership' | 'firm';
    lawyers_count: number;
    interns_count: number;
    staff_count: number;
    clients_range: '1-10' | '11-50' | '51-200' | '200+';
    practice_areas: string[];
    main_courts: string[];
    cases_monthly_avg: number;
    signature_text: string;
    bank_info: string;
  }>({
    lawyer_name: '',
    oab_number: '',
    oab_state: '',
    cpf: '',
    phone: '',
    whatsapp: '',
    firm_name: '',
    cnpj: '',
    email: '',
    website: '',
    logo_url: '',
    address_zip: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    firm_type: 'solo' as const,
    lawyers_count: 1,
    interns_count: 0,
    staff_count: 0,
    clients_range: '1-10' as const,
    practice_areas: [] as string[],
    main_courts: [] as string[],
    cases_monthly_avg: 0,
    signature_text: '',
    bank_info: '',
  });

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
        signature_text: firmSettings.signature_text || '',
        bank_info: firmSettings.bank_info || '',
      });
      setLogoPreview(firmSettings.logo_url || null);
    }
  }, [firmSettings]);

  const handleChange = (field: string, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const searchCEP = async () => {
    const cep = formData.address_zip.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const result = await response.json();
      
      if (!result.erro) {
        setFormData(prev => ({
          ...prev,
          address_street: result.logradouro || '',
          address_neighborhood: result.bairro || '',
          address_city: result.localidade || '',
          address_state: result.uf || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);
    
    const url = await uploadLogo(file);
    if (url) {
      handleChange('logo_url', url);
    }
  }, [uploadLogo]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const toggleArea = (areaId: string) => {
    const current = formData.practice_areas;
    const updated = current.includes(areaId)
      ? current.filter((id) => id !== areaId)
      : [...current, areaId];
    handleChange('practice_areas', updated);
  };

  const toggleCourt = (courtId: string) => {
    const current = formData.main_courts;
    const updated = current.includes(courtId)
      ? current.filter((id) => id !== courtId)
      : [...current, courtId];
    handleChange('main_courts', updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings.mutateAsync(formData as Partial<FirmSettings>);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as informações do seu escritório</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="firm" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Escritório</span>
          </TabsTrigger>
          <TabsTrigger value="structure" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Estrutura</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Assinatura</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Advogado</CardTitle>
              <CardDescription>Suas informações profissionais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lawyer_name">Nome Completo</Label>
                  <Input
                    id="lawyer_name"
                    value={formData.lawyer_name}
                    onChange={(e) => handleChange('lawyer_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleChange('cpf', formatCPF(e.target.value))}
                    maxLength={14}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="oab_number">Número OAB</Label>
                  <Input
                    id="oab_number"
                    value={formData.oab_number}
                    onChange={(e) => handleChange('oab_number', e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oab_state">Estado OAB</Label>
                  <Select value={formData.oab_state} onValueChange={(v) => handleChange('oab_state', v)}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>
                      {brazilianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_profile">E-mail</Label>
                  <Input id="email_profile" value={profile?.email || ''} disabled />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
                    maxLength={15}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange('whatsapp', formatPhone(e.target.value))}
                    maxLength={15}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firm Tab */}
        <TabsContent value="firm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Identidade do Escritório</CardTitle>
              <CardDescription>Logo e informações de contato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo */}
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={logoPreview} />
                        <AvatarFallback>{formData.firm_name?.charAt(0) || 'E'}</AvatarFallback>
                      </Avatar>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 w-6 h-6"
                        onClick={() => { setLogoPreview(null); handleChange('logo_url', ''); }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      {...getRootProps()}
                      className={cn(
                        "w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer",
                        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                      )}
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <p>Clique ou arraste para fazer upload</p>
                    <p>PNG, JPG, SVG (máx. 5MB)</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firm_name">Nome do Escritório</Label>
                  <Input
                    id="firm_name"
                    value={formData.firm_name}
                    onChange={(e) => handleChange('firm_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => handleChange('cnpj', formatCNPJ(e.target.value))}
                    maxLength={18}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail Comercial</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="w-40 space-y-2">
                  <Label htmlFor="address_zip">CEP</Label>
                  <Input
                    id="address_zip"
                    value={formData.address_zip}
                    onChange={(e) => handleChange('address_zip', formatCEP(e.target.value))}
                    onBlur={searchCEP}
                    maxLength={9}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-3 space-y-2">
                  <Label htmlFor="address_street">Logradouro</Label>
                  <Input
                    id="address_street"
                    value={formData.address_street}
                    onChange={(e) => handleChange('address_street', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_number">Número</Label>
                  <Input
                    id="address_number"
                    value={formData.address_number}
                    onChange={(e) => handleChange('address_number', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="address_complement">Complemento</Label>
                  <Input
                    id="address_complement"
                    value={formData.address_complement}
                    onChange={(e) => handleChange('address_complement', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_neighborhood">Bairro</Label>
                  <Input
                    id="address_neighborhood"
                    value={formData.address_neighborhood}
                    onChange={(e) => handleChange('address_neighborhood', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="address_city">Cidade</Label>
                  <Input
                    id="address_city"
                    value={formData.address_city}
                    onChange={(e) => handleChange('address_city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_state">Estado</Label>
                  <Select value={formData.address_state} onValueChange={(v) => handleChange('address_state', v)}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>
                      {brazilianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados para Documentos</CardTitle>
              <CardDescription>Informações usadas em petições e contratos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signature_text">Texto de Assinatura Padrão</Label>
                <Textarea
                  id="signature_text"
                  rows={3}
                  placeholder="Ex: Dr. João da Silva - OAB/SP 123456"
                  value={formData.signature_text}
                  onChange={(e) => handleChange('signature_text', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_info">Dados Bancários para Honorários</Label>
                <Textarea
                  id="bank_info"
                  rows={3}
                  placeholder="Banco, Agência, Conta, PIX..."
                  value={formData.bank_info}
                  onChange={(e) => handleChange('bank_info', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Structure Tab */}
        <TabsContent value="structure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Atuação</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={formData.firm_type} onValueChange={(v) => handleChange('firm_type', v)}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">Advogado Solo</SelectItem>
                  <SelectItem value="partnership">Advogados Associados</SelectItem>
                  <SelectItem value="firm">Sociedade de Advogados</SelectItem>
                </SelectContent>
              </Select>

              {formData.firm_type !== 'solo' && (
                <div className="grid gap-4 sm:grid-cols-3 mt-4">
                  <div className="space-y-2">
                    <Label>Advogados</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.lawyers_count}
                      onChange={(e) => handleChange('lawyers_count', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estagiários</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.interns_count}
                      onChange={(e) => handleChange('interns_count', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Administrativo</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.staff_count}
                      onChange={(e) => handleChange('staff_count', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-2">
                <Label>Faixa de Clientes Ativos</Label>
                <Select value={formData.clients_range} onValueChange={(v) => handleChange('clients_range', v)}>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1 a 10 clientes</SelectItem>
                    <SelectItem value="11-50">11 a 50 clientes</SelectItem>
                    <SelectItem value="51-200">51 a 200 clientes</SelectItem>
                    <SelectItem value="200+">Mais de 200 clientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Áreas de Atuação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-3">
                {practiceAreas.map((area) => (
                  <label
                    key={area.id}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                      formData.practice_areas.includes(area.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Checkbox
                      checked={formData.practice_areas.includes(area.id)}
                      onCheckedChange={() => toggleArea(area.id)}
                    />
                    <span className="text-sm">{area.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Tribunais Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-3">
                {courts.map((court) => (
                  <label
                    key={court.id}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                      formData.main_courts.includes(court.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Checkbox
                      checked={formData.main_courts.includes(court.id)}
                      onCheckedChange={() => toggleCourt(court.id)}
                    />
                    <span className="text-sm">{court.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <Label>Média de novos processos por mês</Label>
                <Input
                  type="number"
                  min="0"
                  className="w-32"
                  value={formData.cases_monthly_avg || ''}
                  onChange={(e) => handleChange('cases_monthly_avg', parseInt(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plano Atual</CardTitle>
              <CardDescription>Gerencie sua assinatura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Plano Trial</p>
                  <p className="text-sm text-muted-foreground">Acesso completo por 14 dias</p>
                </div>
                <Button variant="outline" disabled>
                  Em breve
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Opções de assinatura estarão disponíveis em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
