import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { z } from 'zod';
import { RECEIVABLE_TYPE_LABELS, RECURRENCE_TYPE_LABELS } from '@/types/finance';

const schema = z.object({
  description: z.string().min(2, 'Descrição obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  due_date: z.string().min(1, 'Data de vencimento obrigatória'),
  receivable_type: z.string().min(1, 'Tipo obrigatório'),
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

const ReceivableForm = () => {
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
    description: '',
    amount: '',
    due_date: '',
    receivable_type: 'honorario_contratual',
    client_id: 'none',
    case_id: 'none',
    recurrence: 'unico',
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

      // If editing, fetch receivable
      if (isEdit) {
        const { data, error } = await supabase
          .from('receivables')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error || !data) {
          toast({ variant: 'destructive', title: 'Registro não encontrado' });
          navigate('/financeiro/receber');
        } else {
          setForm({
            description: data.description || '',
            amount: String(data.amount) || '',
            due_date: data.due_date || '',
            receivable_type: data.receivable_type || 'honorario_contratual',
            client_id: data.client_id || 'none',
            case_id: data.case_id || 'none',
            recurrence: data.recurrence || 'unico',
            notes: data.notes || '',
          });
        }
      }
    };
    fetchData();
  }, [id, isEdit, navigate, toast]);

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const filteredCases = form.client_id 
    ? cases.filter(c => c.client_id === form.client_id)
    : cases;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = schema.safeParse({
      description: form.description,
      amount: parseFloat(form.amount.replace(',', '.')) || 0,
      due_date: form.due_date,
      receivable_type: form.receivable_type,
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
      description: form.description,
      amount: parseFloat(form.amount.replace(',', '.')) || 0,
      due_date: form.due_date,
      receivable_type: form.receivable_type as 'honorario_contratual' | 'honorario_exito' | 'consulta' | 'acordo' | 'reembolso' | 'outros',
      client_id: form.client_id && form.client_id !== 'none' ? form.client_id : null,
      case_id: form.case_id && form.case_id !== 'none' ? form.case_id : null,
      recurrence: form.recurrence as 'unico' | 'semanal' | 'mensal' | 'trimestral' | 'anual',
      notes: form.notes || null,
      status: 'pendente' as const,
      amount_paid: 0,
    };

    if (isEdit) {
      const { error } = await supabase
        .from('receivables')
        .update(payload)
        .eq('id', id);

      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao atualizar', description: error.message });
      } else {
        toast({ title: 'Conta a receber atualizada com sucesso' });
        navigate('/financeiro/receber');
      }
    } else {
      const { error } = await supabase
        .from('receivables')
        .insert([{ ...payload, user_id: user?.id! }]);

      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao criar', description: error.message });
      } else {
        toast({ title: 'Conta a receber criada com sucesso' });
        navigate('/financeiro/receber');
      }
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/financeiro/receber')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
            {isEdit ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? 'Atualize as informações do recebível' : 'Cadastre uma nova receita ou honorário'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Receita</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  placeholder="Ex: Honorários contratuais - Janeiro/2026"
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivable_type">Tipo *</Label>
                <Select value={form.receivable_type} onValueChange={(v) => handleChange('receivable_type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RECEIVABLE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.receivable_type && <p className="text-sm text-destructive">{errors.receivable_type}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$) *</Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={form.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Data de Vencimento *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={form.due_date}
                  onChange={(e) => handleChange('due_date', e.target.value)}
                />
                {errors.due_date && <p className="text-sm text-destructive">{errors.due_date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurrence">Recorrência</Label>
                <Select value={form.recurrence} onValueChange={(v) => handleChange('recurrence', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RECURRENCE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_id">Cliente (opcional)</Label>
                <Select value={form.client_id} onValueChange={(v) => handleChange('client_id', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="case_id">Processo (opcional)</Label>
                <Select value={form.case_id} onValueChange={(v) => handleChange('case_id', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um processo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {filteredCases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.process_number || c.opposing_party}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais..."
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => navigate('/financeiro/receber')}>
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

export default ReceivableForm;
