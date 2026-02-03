import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Phone, FileText, MapPin } from 'lucide-react';

interface LawyerDataStepProps {
  data: {
    lawyer_name: string;
    oab_number: string;
    oab_state: string;
    cpf: string;
    phone: string;
    whatsapp: string;
  };
  onChange: (field: string, value: string) => void;
}

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const LawyerDataStep = ({ data, onChange }: LawyerDataStepProps) => {
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

  return (
    <div className="space-y-6 max-w-lg">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="lawyer_name" className="text-sm font-medium flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          Nome Completo <span className="text-destructive">*</span>
        </Label>
        <Input
          id="lawyer_name"
          placeholder="Dr. João da Silva"
          value={data.lawyer_name}
          onChange={(e) => onChange('lawyer_name', e.target.value)}
          className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
        />
      </div>

      {/* OAB */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="oab_number" className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Número OAB <span className="text-destructive">*</span>
          </Label>
          <Input
            id="oab_number"
            placeholder="123456"
            value={data.oab_number}
            onChange={(e) => onChange('oab_number', e.target.value.replace(/\D/g, ''))}
            className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="oab_state" className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            UF <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={data.oab_state} 
            onValueChange={(value) => onChange('oab_state', value)}
          >
            <SelectTrigger className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors">
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              {brazilianStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* CPF */}
      <div className="space-y-2">
        <Label htmlFor="cpf" className="text-sm font-medium text-muted-foreground">
          CPF (opcional)
        </Label>
        <Input
          id="cpf"
          placeholder="000.000.000-00"
          value={data.cpf}
          onChange={(e) => onChange('cpf', formatCPF(e.target.value))}
          maxLength={14}
          className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
        />
      </div>

      {/* Phones */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            Telefone
          </Label>
          <Input
            id="phone"
            placeholder="(11) 3333-4444"
            value={data.phone}
            onChange={(e) => onChange('phone', formatPhone(e.target.value))}
            maxLength={15}
            className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="text-sm font-medium flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            WhatsApp
          </Label>
          <Input
            id="whatsapp"
            placeholder="(11) 99999-8888"
            value={data.whatsapp}
            onChange={(e) => onChange('whatsapp', formatPhone(e.target.value))}
            maxLength={15}
            className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default LawyerDataStep;
