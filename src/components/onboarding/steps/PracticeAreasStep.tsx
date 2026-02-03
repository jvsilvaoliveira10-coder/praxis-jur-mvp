import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Scale, FileText } from 'lucide-react';
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
  { id: 'consumidor', label: 'Direito do Consumidor' },
  { id: 'ambiental', label: 'Ambiental' },
  { id: 'digital', label: 'Digital/LGPD' },
  { id: 'imobiliario', label: 'Imobiliário' },
  { id: 'administrativo', label: 'Administrativo' },
];

const courts = [
  { id: 'tjsp', label: 'TJSP - Tribunal de Justiça de São Paulo' },
  { id: 'tjrj', label: 'TJRJ - Tribunal de Justiça do Rio de Janeiro' },
  { id: 'tjmg', label: 'TJMG - Tribunal de Justiça de Minas Gerais' },
  { id: 'trt', label: 'TRT - Tribunais Regionais do Trabalho' },
  { id: 'trf', label: 'TRF - Tribunais Regionais Federais' },
  { id: 'stj', label: 'STJ - Superior Tribunal de Justiça' },
  { id: 'stf', label: 'STF - Supremo Tribunal Federal' },
  { id: 'tst', label: 'TST - Tribunal Superior do Trabalho' },
  { id: 'juizado', label: 'Juizados Especiais' },
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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Scale className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Áreas de Atuação</h2>
        <p className="text-muted-foreground mt-1">
          Selecione suas principais áreas e tribunais
        </p>
      </div>

      <div className="space-y-6">
        {/* Practice Areas */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Áreas de Atuação
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {practiceAreas.map((area) => {
              const isSelected = (data.practice_areas || []).includes(area.id);
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => toggleArea(area.id)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border transition-all text-left text-sm",
                    isSelected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Checkbox checked={isSelected} className="pointer-events-none" />
                  <span>{area.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Courts */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Tribunais mais utilizados
          </Label>
          <div className="grid gap-2">
            {courts.map((court) => {
              const isSelected = (data.main_courts || []).includes(court.id);
              return (
                <button
                  key={court.id}
                  type="button"
                  onClick={() => toggleCourt(court.id)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border transition-all text-left text-sm",
                    isSelected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Checkbox checked={isSelected} className="pointer-events-none" />
                  <span>{court.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Monthly Cases */}
        <div className="space-y-2">
          <Label htmlFor="cases_monthly_avg">Média de novos processos por mês</Label>
          <Input
            id="cases_monthly_avg"
            type="number"
            min="0"
            placeholder="Ex: 10"
            value={data.cases_monthly_avg || ''}
            onChange={(e) => onChange('cases_monthly_avg', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  );
};

export default PracticeAreasStep;
