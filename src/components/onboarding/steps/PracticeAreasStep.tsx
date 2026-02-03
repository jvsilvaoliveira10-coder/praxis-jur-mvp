import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale, FileText, TrendingUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PracticeAreasStepProps {
  data: {
    practice_areas: string[];
    main_courts: string[];
    cases_monthly_avg: number;
  };
  onChange: (field: string, value: string[] | number) => void;
}

const practiceAreas = [
  { id: 'civel', label: 'Cível' },
  { id: 'criminal', label: 'Criminal' },
  { id: 'trabalhista', label: 'Trabalhista' },
  { id: 'tributario', label: 'Tributário' },
  { id: 'empresarial', label: 'Empresarial' },
  { id: 'familia', label: 'Família e Sucessões' },
  { id: 'previdenciario', label: 'Previdenciário' },
  { id: 'consumidor', label: 'Dir. do Consumidor' },
  { id: 'ambiental', label: 'Ambiental' },
  { id: 'digital', label: 'Digital/LGPD' },
  { id: 'imobiliario', label: 'Imobiliário' },
  { id: 'administrativo', label: 'Administrativo' },
];

const courts = [
  { id: 'tjsp', label: 'TJSP' },
  { id: 'tjrj', label: 'TJRJ' },
  { id: 'tjmg', label: 'TJMG' },
  { id: 'trt', label: 'TRTs' },
  { id: 'trf', label: 'TRFs' },
  { id: 'stj', label: 'STJ' },
  { id: 'stf', label: 'STF' },
  { id: 'tst', label: 'TST' },
  { id: 'juizado', label: 'Juizados' },
];

const PracticeAreasStep = ({ data, onChange }: PracticeAreasStepProps) => {
  const toggleArea = (areaId: string) => {
    const current = data.practice_areas || [];
    const updated = current.includes(areaId)
      ? current.filter((id) => id !== areaId)
      : [...current, areaId];
    onChange('practice_areas', updated);
  };

  const toggleCourt = (courtId: string) => {
    const current = data.main_courts || [];
    const updated = current.includes(courtId)
      ? current.filter((id) => id !== courtId)
      : [...current, courtId];
    onChange('main_courts', updated);
  };

  return (
    <div className="space-y-8">
      {/* Practice Areas */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Scale className="w-4 h-4 text-muted-foreground" />
          Áreas de Atuação
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {practiceAreas.map((area) => {
            const isSelected = (data.practice_areas || []).includes(area.id);
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => toggleArea(area.id)}
                className={cn(
                  "relative flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 hover:border-primary/50 hover:bg-muted/30 text-foreground"
                )}
              >
                {isSelected && (
                  <Check className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="truncate">{area.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Courts */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          Tribunais mais utilizados
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {courts.map((court) => {
            const isSelected = (data.main_courts || []).includes(court.id);
            return (
              <button
                key={court.id}
                type="button"
                onClick={() => toggleCourt(court.id)}
                className={cn(
                  "relative flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 hover:border-primary/50 hover:bg-muted/30 text-foreground"
                )}
              >
                {isSelected && (
                  <Check className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{court.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Monthly Cases */}
      <div className="space-y-2 max-w-xs">
        <Label htmlFor="cases_monthly_avg" className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          Média de novos processos por mês
        </Label>
        <Input
          id="cases_monthly_avg"
          type="number"
          min="0"
          placeholder="Ex: 10"
          value={data.cases_monthly_avg || ''}
          onChange={(e) => onChange('cases_monthly_avg', parseInt(e.target.value) || 0)}
          className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
        />
      </div>
    </div>
  );
};

export default PracticeAreasStep;
