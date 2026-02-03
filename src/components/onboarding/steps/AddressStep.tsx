import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddressStepProps {
  data: {
    address_zip: string;
    address_street: string;
    address_number: string;
    address_complement: string;
    address_neighborhood: string;
    address_city: string;
    address_state: string;
  };
  onChange: (field: string, value: string) => void;
}

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const AddressStep = ({ data, onChange }: AddressStepProps) => {
  const [loadingCep, setLoadingCep] = useState(false);

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const searchCEP = async () => {
    const cep = data.address_zip.replace(/\D/g, '');
    if (cep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const result = await response.json();
      
      if (!result.erro) {
        onChange('address_street', result.logradouro || '');
        onChange('address_neighborhood', result.bairro || '');
        onChange('address_city', result.localidade || '');
        onChange('address_state', result.uf || '');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCEPChange = (value: string) => {
    const formatted = formatCEP(value);
    onChange('address_zip', formatted);
    
    // Auto-search when CEP is complete
    if (formatted.replace(/\D/g, '').length === 8) {
      setTimeout(searchCEP, 300);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Endereço Comercial</h2>
        <p className="text-muted-foreground mt-1">
          Informe a localização do seu escritório
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="address_zip">CEP</Label>
            <Input
              id="address_zip"
              placeholder="00000-000"
              value={data.address_zip}
              onChange={(e) => handleCEPChange(e.target.value)}
              maxLength={9}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              onClick={searchCEP}
              disabled={loadingCep || data.address_zip.replace(/\D/g, '').length !== 8}
            >
              {loadingCep ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Buscar'
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address_street">Logradouro</Label>
          <Input
            id="address_street"
            placeholder="Rua, Avenida, etc."
            value={data.address_street}
            onChange={(e) => onChange('address_street', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address_number">Número</Label>
            <Input
              id="address_number"
              placeholder="123"
              value={data.address_number}
              onChange={(e) => onChange('address_number', e.target.value)}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="address_complement">Complemento</Label>
            <Input
              id="address_complement"
              placeholder="Sala 101, Bloco A"
              value={data.address_complement}
              onChange={(e) => onChange('address_complement', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address_neighborhood">Bairro</Label>
          <Input
            id="address_neighborhood"
            placeholder="Centro"
            value={data.address_neighborhood}
            onChange={(e) => onChange('address_neighborhood', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="address_city">Cidade</Label>
            <Input
              id="address_city"
              placeholder="São Paulo"
              value={data.address_city}
              onChange={(e) => onChange('address_city', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_state">Estado</Label>
            <Select
              value={data.address_state}
              onValueChange={(value) => onChange('address_state', value)}
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
      </div>
    </div>
  );
};

export default AddressStep;
