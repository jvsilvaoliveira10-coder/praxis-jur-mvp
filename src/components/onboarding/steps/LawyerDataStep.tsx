import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Phone } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Dados do Advogado</h2>
        <p className="text-muted-foreground mt-1">
          Preencha suas informações profissionais
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lawyer_name">Nome Completo *</Label>
          <Input
            id="lawyer_name"
            placeholder="Dr. João da Silva"
            value={data.lawyer_name}
            onChange={(e) => onChange('lawyer_name', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="oab_number">Número OAB *</Label>
            <Input
              id="oab_number"
              placeholder="123456"
              value={data.oab_number}
              onChange={(e) => onChange('oab_number', e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oab_state">Estado *</Label>
            <Select 
              value={data.oab_state} 
              onValueChange={(value) => onChange('oab_state', value)}
            >
              <SelectTrigger>
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

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            placeholder="000.000.000-00"
            value={data.cpf}
            onChange={(e) => onChange('cpf', formatCPF(e.target.value))}
            maxLength={14}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                className="pl-10"
                placeholder="(11) 3333-4444"
                value={data.phone}
                onChange={(e) => onChange('phone', formatPhone(e.target.value))}
                maxLength={15}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="whatsapp"
                className="pl-10"
                placeholder="(11) 99999-8888"
                value={data.whatsapp}
                onChange={(e) => onChange('whatsapp', formatPhone(e.target.value))}
                maxLength={15}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerDataStep;
