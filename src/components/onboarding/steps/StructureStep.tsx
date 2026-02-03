import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Building, UserCheck, GraduationCap, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StructureStepProps {
  data: {
    firm_type: string;
    lawyers_count: number;
    interns_count: number;
    staff_count: number;
    clients_range: string;
  };
  onChange: (field: string, value: string | number) => void;
}

const firmTypes = [
  { value: 'solo', label: 'Advogado Solo', description: 'Atuo individualmente', icon: UserCheck },
  { value: 'partnership', label: 'Advogados Associados', description: '2 ou mais advogados', icon: Users },
  { value: 'firm', label: 'Sociedade de Advogados', description: 'Estrutura formal de sociedade', icon: Building },
];

const clientRanges = [
  { value: '1-10', label: '1 a 10 clientes' },
  { value: '11-50', label: '11 a 50 clientes' },
  { value: '51-200', label: '51 a 200 clientes' },
  { value: '200+', label: 'Mais de 200 clientes' },
];

const StructureStep = ({ data, onChange }: StructureStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Estrutura do Escritório</h2>
        <p className="text-muted-foreground mt-1">
          Nos conte sobre o tamanho da sua equipe
        </p>
      </div>

      <div className="space-y-6">
        {/* Firm Type Selection */}
        <div className="space-y-3">
          <Label>Tipo de Atuação</Label>
          <div className="grid gap-3">
            {firmTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = data.firm_type === type.value;
              
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => onChange('firm_type', type.value)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{type.label}</p>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Team Count */}
        {data.firm_type !== 'solo' && (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lawyers_count" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Advogados
              </Label>
              <Input
                id="lawyers_count"
                type="number"
                min="1"
                value={data.lawyers_count}
                onChange={(e) => onChange('lawyers_count', parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interns_count" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Estagiários
              </Label>
              <Input
                id="interns_count"
                type="number"
                min="0"
                value={data.interns_count}
                onChange={(e) => onChange('interns_count', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff_count" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Administrativo
              </Label>
              <Input
                id="staff_count"
                type="number"
                min="0"
                value={data.staff_count}
                onChange={(e) => onChange('staff_count', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        )}

        {/* Clients Range */}
        <div className="space-y-2">
          <Label htmlFor="clients_range">Quantidade de Clientes Ativos</Label>
          <Select
            value={data.clients_range}
            onValueChange={(value) => onChange('clients_range', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a faixa" />
            </SelectTrigger>
            <SelectContent>
              {clientRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default StructureStep;
