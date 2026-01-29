import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ActionType, ACTION_TYPE_LABELS, Client } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, FileText, Briefcase } from 'lucide-react';
import { z } from 'zod';
import DocumentsTab from '@/components/documents/DocumentsTab';

const caseSchema = z.object({
  client_id: z.string().min(1, 'Selecione um cliente'),
  process_number: z.string().optional(),
  court: z.string().min(2, 'Informe a vara/comarca'),
  action_type: z.enum(['obrigacao_de_fazer', 'cobranca', 'indenizacao_danos_morais']),
  opposing_party: z.string().min(2, 'Informe a parte contrária'),
});

const CaseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({
    client_id: '',
    process_number: '',
    court: '',
    action_type: 'obrigacao_de_fazer' as ActionType,
    opposing_party: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      setClients(data as Client[] || []);
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (isEdit) {
      const fetchCase = async () => {
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error || !data) {
          toast({
            variant: 'destructive',
            title: 'Processo não encontrado',
          });
          navigate('/cases');
        } else {
          setForm({
            client_id: data.client_id,
            process_number: data.process_number || '',
            court: data.court,
            action_type: data.action_type as ActionType,
            opposing_party: data.opposing_party,
          });
        }
      };
      fetchCase();
    }
  }, [id, isEdit, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = caseSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    const payload = {
      ...form,
      process_number: form.process_number || null,
    };

    if (isEdit) {
      const { error } = await supabase
        .from('cases')
        .update(payload)
        .eq('id', id);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao atualizar processo',
          description: error.message,
        });
      } else {
        toast({ title: 'Processo atualizado com sucesso' });
        navigate('/cases');
      }
    } else {
      const { error } = await supabase.from('cases').insert({
        ...payload,
        user_id: user?.id,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao criar processo',
          description: error.message,
        });
      } else {
        toast({ title: 'Processo criado com sucesso' });
        navigate('/cases');
      }
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/cases')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            {isEdit ? 'Editar Processo' : 'Novo Processo'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? 'Atualize os dados do processo' : 'Cadastre um novo processo'}
          </p>
        </div>
      </div>

      {isEdit ? (
        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dados" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Dados do Processo
            </TabsTrigger>
            <TabsTrigger value="documentos" className="gap-2">
              <FileText className="w-4 h-4" />
              Documentos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dados" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Processo</CardTitle>
                <CardDescription>
                  Preencha as informações do processo judicial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {renderFormFields()}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="documentos" className="mt-4">
            <DocumentsTab caseId={id} />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Dados do Processo</CardTitle>
            <CardDescription>
              Preencha as informações do processo judicial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {renderFormFields()}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );

  function renderFormFields() {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="client_id">Cliente</Label>
          <Select 
            value={form.client_id} 
            onValueChange={(v) => setForm({ ...form, client_id: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.client_id && <p className="text-sm text-destructive">{errors.client_id}</p>}
          {clients.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum cliente cadastrado.{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/clients/new')}>
                Cadastre um cliente primeiro.
              </Button>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="process_number">Número do Processo (opcional)</Label>
          <Input
            id="process_number"
            placeholder="0000000-00.0000.0.00.0000"
            value={form.process_number}
            onChange={(e) => setForm({ ...form, process_number: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="court">Vara / Comarca</Label>
          <Input
            id="court"
            placeholder="1ª Vara Cível - Comarca de São Paulo"
            value={form.court}
            onChange={(e) => setForm({ ...form, court: e.target.value })}
          />
          {errors.court && <p className="text-sm text-destructive">{errors.court}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="action_type">Tipo de Ação</Label>
          <Select 
            value={form.action_type} 
            onValueChange={(v) => setForm({ ...form, action_type: v as ActionType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ACTION_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="opposing_party">Parte Contrária</Label>
          <Input
            id="opposing_party"
            placeholder="Nome da parte contrária"
            value={form.opposing_party}
            onChange={(e) => setForm({ ...form, opposing_party: e.target.value })}
          />
          {errors.opposing_party && <p className="text-sm text-destructive">{errors.opposing_party}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={loading || clients.length === 0}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/cases')}>
            Cancelar
          </Button>
        </div>
      </>
    );
  }
};

export default CaseForm;
