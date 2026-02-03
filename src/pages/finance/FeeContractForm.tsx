import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { z } from 'zod';
import { CONTRACT_TYPE_LABELS } from '@/types/finance';

const schema = z.object({
  contract_name: z.string().min(2, 'Nome do contrato obrigatório'),
  client_id: z.string().min(1, 'Cliente obrigatório'),
  contract_type: z.string().min(1, 'Tipo obrigatório'),
  start_date: z.string().min(1, 'Data de início obrigatória'),
});

interface Client {
  id: string;
  name: string;
}

interface Case {
  id: string;
  process_number: string | null;
  opposing_party: string;
  client_id: string;
}

const FeeContractForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    contract_name: '',
    client_id: '',
    case_id: '',
    contract_type: 'mensal_fixo',
    monthly_amount: '',
    success_fee_percentage: '',
    per_act_amount: '',
    billing_day: '10',
    start_date: '',
    end_date: '',
    is_active: true,
    auto_generate_receivables: false,
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');
      if (clientsData) setClients(clientsData);

      // Fetch cases
      const { data: casesData } = await supabase
        .from('cases')
        .select('id, process_number, opposing_party, client_id')
        .order('created_at', { ascending: false });
      if (casesData) setCases(casesData);

      // If editing, fetch contract
      if (isEdit) {
        const { data, error } = await supabase
          .from('fee_contracts')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error || !data) {
          toast({ variant: 'destructive', title: 'Contrato não encontrado' });
          navigate('/financeiro/contratos');
        } else {
          setForm({
            contract_name: data.contract_name || '',
            client_id: data.client_id || '',
            case_id: data.case_id || '',
            contract_type: data.contract_type || 'mensal_fixo',
            monthly_amount: data.monthly_amount ? String(data.monthly_amount) : '',
            success_fee_percentage: data.success_fee_percentage ? String(data.success_fee_percentage) : '',
            per_act_amount: data.per_act_amount ? String(data.per_act_amount) : '',
            billing_day: data.billing_day ? String(data.billing_day) : '10',
            start_date: data.start_date || '',
            end_date: data.end_date || '',
            is_active: data.is_active ?? true,
            auto_generate_receivables: data.auto_generate_receivables ?? false,
            notes: data.notes || '',
          });
        }
      }
    };
    fetchData();
  }, [id, isEdit, navigate, toast]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const filteredCases = form.client_id 
    ? cases.filter(c => c.client_id === form.client_id)
    : cases;

  const showMonthlyAmount = ['mensal_fixo', 'misto'].includes(form.contract_type);
  const showSuccessFee = ['exito', 'misto'].includes(form.contract_type);
  const showPerActAmount = ['por_ato', 'misto'].includes(form.contract_type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = schema.safeParse({
      contract_name: form.contract_name,
      client_id: form.client_id,
      contract_type: form.contract_type,
      start_date: form.start_date,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    const payload = {
      contract_name: form.contract_name,
      client_id: form.client_id,
      case_id: form.case_id || null,
      contract_type: form.contract_type as 'mensal_fixo' | 'por_ato' | 'exito' | 'misto',
      monthly_amount: form.monthly_amount ? parseFloat(form.monthly_amount.replace(',', '.')) : null,
      success_fee_percentage: form.success_fee_percentage ? parseFloat(form.success_fee_percentage.replace(',', '.')) : null,
      per_act_amount: form.per_act_amount ? parseFloat(form.per_act_amount.replace(',', '.')) : null,
      billing_day: form.billing_day ? parseInt(form.billing_day) : null,
      start_date: form.start_date,
      end_date: form.end_date || null,
      is_active: form.is_active,
      auto_generate_receivables: form.auto_generate_receivables,
      notes: form.notes || null,
    };

    if (isEdit) {
      const { error } = await supabase
        .from('fee_contracts')
        .update(payload)
        .eq('id', id);

      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao atualizar', description: error.message });
      } else {
        toast({ title: 'Contrato atualizado com sucesso' });
        navigate('/financeiro/contratos');
      }
    } else {
      const { error } = await supabase
        .from('fee_contracts')
        .insert([{ ...payload, user_id: user?.id! }]);

      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao criar', description: error.message });
      } else {
        toast({ title: 'Contrato criado com sucesso' });
        navigate('/financeiro/contratos');
      }
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/financeiro/contratos')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
            {isEdit ? 'Editar Contrato' : 'Novo Contrato de Honorários'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? 'Atualize as informações do contrato' : 'Cadastre um novo contrato de honorários'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="contract_name">Nome do Contrato *</Label>
                <Input
                  id="contract_name"
                  placeholder="Ex: Honorários mensais - Empresa XYZ"
                  value={form.contract_name}
                  onChange={(e) => handleChange('contract_name', e.target.value)}
                />
                {errors.contract_name && <p className="text-sm text-destructive">{errors.contract_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_id">Cliente *</Label>
                <Select value={form.client_id} onValueChange={(v) => handleChange('client_id', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.client_id && <p className="text-sm text-destructive">{errors.client_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="case_id">Processo (opcional)</Label>
                <Select value={form.case_id} onValueChange={(v) => handleChange('case_id', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um processo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {filteredCases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.process_number || c.opposing_party}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract_type">Tipo de Contrato *</Label>
                <Select value={form.contract_type} onValueChange={(v) => handleChange('contract_type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.contract_type && <p className="text-sm text-destructive">{errors.contract_type}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_day">Dia de Vencimento</Label>
                <Select value={form.billing_day} onValueChange={(v) => handleChange('billing_day', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={String(day)}>Dia {day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showMonthlyAmount && (
                <div className="space-y-2">
                  <Label htmlFor="monthly_amount">Valor Mensal (R$)</Label>
                  <Input
                    id="monthly_amount"
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={form.monthly_amount}
                    onChange={(e) => handleChange('monthly_amount', e.target.value)}
                  />
                </div>
              )}

              {showSuccessFee && (
                <div className="space-y-2">
                  <Label htmlFor="success_fee_percentage">Percentual de Êxito (%)</Label>
                  <Input
                    id="success_fee_percentage"
                    type="text"
                    inputMode="decimal"
                    placeholder="20"
                    value={form.success_fee_percentage}
                    onChange={(e) => handleChange('success_fee_percentage', e.target.value)}
                  />
                </div>
              )}

              {showPerActAmount && (
                <div className="space-y-2">
                  <Label htmlFor="per_act_amount">Valor por Ato (R$)</Label>
                  <Input
                    id="per_act_amount"
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={form.per_act_amount}
                    onChange={(e) => handleChange('per_act_amount', e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="start_date">Data de Início *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                />
                {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Data de Fim (opcional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Contrato Ativo</Label>
                  <p className="text-sm text-muted-foreground">Este contrato está em vigor</p>
                </div>
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) => handleChange('is_active', checked)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Gerar Recebíveis</Label>
                  <p className="text-sm text-muted-foreground">Criar automaticamente contas a receber</p>
                </div>
                <Switch
                  checked={form.auto_generate_receivables}
                  onCheckedChange={(checked) => handleChange('auto_generate_receivables', checked)}
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais sobre o contrato..."
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => navigate('/financeiro/contratos')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeeContractForm;
