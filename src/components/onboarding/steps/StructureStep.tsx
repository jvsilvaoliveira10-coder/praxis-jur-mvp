import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Building, UserCheck, GraduationCap, Briefcase, Check } from 'lucide-react';
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
    <div className="space-y-8 max-w-xl">
      {/* Firm Type Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Tipo de Atuação</Label>
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
                  "relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left group",
                  isSelected
                    ? "border-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-sm"
                    : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0",
                  isSelected 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "bg-muted group-hover:bg-muted/80"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Text */}
                <div className="flex-1">
                  <p className={cn(
                    "font-medium transition-colors",
                    isSelected && "text-primary"
                  )}>
                    {type.label}
                  </p>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>

                {/* Check indicator */}
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Team Count */}
      {data.firm_type !== 'solo' && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tamanho da Equipe</Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lawyers_count" className="text-xs text-muted-foreground flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                Advogados
              </Label>
              <Input
                id="lawyers_count"
                type="number"
                min="1"
                value={data.lawyers_count}
                onChange={(e) => onChange('lawyers_count', parseInt(e.target.value) || 1)}
                className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors text-center"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interns_count" className="text-xs text-muted-foreground flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Estagiários
              </Label>
              <Input
                id="interns_count"
                type="number"
                min="0"
                value={data.interns_count}
                onChange={(e) => onChange('interns_count', parseInt(e.target.value) || 0)}
                className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors text-center"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff_count" className="text-xs text-muted-foreground flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                Administrativo
              </Label>
              <Input
                id="staff_count"
                type="number"
                min="0"
                value={data.staff_count}
                onChange={(e) => onChange('staff_count', parseInt(e.target.value) || 0)}
                className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors text-center"
              />
            </div>
          </div>
        </div>
      )}

      {/* Clients Range */}
      <div className="space-y-2">
        <Label htmlFor="clients_range" className="text-sm font-medium flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          Quantidade de Clientes Ativos
        </Label>
        <Select
          value={data.clients_range}
          onValueChange={(value) => onChange('clients_range', value)}
        >
          <SelectTrigger className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors">
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
  );
};

export default StructureStep;
