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
import { Save, FileText, Briefcase, User, Gavel, Scale, Users } from 'lucide-react';
import { z } from 'zod';
import DocumentsTab from '@/components/documents/DocumentsTab';
import PremiumFormHeader from '@/components/forms/PremiumFormHeader';

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
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <PremiumFormHeader
        icon={<Briefcase className="w-6 h-6 text-primary" />}
        title={isEdit ? 'Editar Processo' : 'Novo Processo'}
        subtitle={isEdit ? 'Atualize os dados do processo judicial' : 'Cadastre um novo processo judicial'}
        backPath="/cases"
      />

      {isEdit ? (
        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-muted/50">
            <TabsTrigger value="dados" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Briefcase className="w-4 h-4" />
              Dados do Processo
            </TabsTrigger>
            <TabsTrigger value="documentos" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="w-4 h-4" />
              Documentos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dados" className="mt-6">
            <Card className="card-premium">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Dados do Processo</CardTitle>
                <CardDescription>
                  Preencha as informações do processo judicial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {renderFormFields()}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="documentos" className="mt-6">
            <DocumentsTab caseId={id} />
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="card-premium">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Dados do Processo</CardTitle>
            <CardDescription>
              Preencha as informações do processo judicial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
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
          <Label className="label-premium">
            <User className="w-4 h-4 text-muted-foreground" />
            Cliente <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={form.client_id} 
            onValueChange={(v) => setForm({ ...form, client_id: v })}
          >
            <SelectTrigger className="select-premium">
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
              <Button variant="link" className="p-0 h-auto text-primary" onClick={() => navigate('/clients/new')}>
                Cadastre um cliente primeiro.
              </Button>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="label-premium">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Número do Processo <span className="text-muted-foreground text-xs">(opcional)</span>
          </Label>
          <Input
            id="process_number"
            placeholder="0000000-00.0000.0.00.0000"
            value={form.process_number}
            onChange={(e) => setForm({ ...form, process_number: e.target.value })}
            className="input-premium"
          />
        </div>

        <div className="space-y-2">
          <Label className="label-premium">
            <Gavel className="w-4 h-4 text-muted-foreground" />
            Vara / Comarca <span className="text-destructive">*</span>
          </Label>
          <Input
            id="court"
            placeholder="1ª Vara Cível - Comarca de São Paulo"
            value={form.court}
            onChange={(e) => setForm({ ...form, court: e.target.value })}
            className="input-premium"
          />
          {errors.court && <p className="text-sm text-destructive">{errors.court}</p>}
        </div>

        <div className="space-y-2">
          <Label className="label-premium">
            <Scale className="w-4 h-4 text-muted-foreground" />
            Tipo de Ação <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={form.action_type} 
            onValueChange={(v) => setForm({ ...form, action_type: v as ActionType })}
          >
            <SelectTrigger className="select-premium">
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
          <Label className="label-premium">
            <Users className="w-4 h-4 text-muted-foreground" />
            Parte Contrária <span className="text-destructive">*</span>
          </Label>
          <Input
            id="opposing_party"
            placeholder="Nome da parte contrária"
            value={form.opposing_party}
            onChange={(e) => setForm({ ...form, opposing_party: e.target.value })}
            className="input-premium"
          />
          {errors.opposing_party && <p className="text-sm text-destructive">{errors.opposing_party}</p>}
        </div>

        <div className="flex gap-3 pt-6">
          <Button 
            type="submit" 
            disabled={loading || clients.length === 0}
            className="btn-premium flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Processo'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/cases')}
            className="h-11 px-6 rounded-xl"
          >
            Cancelar
          </Button>
        </div>
      </>
    );
  }
};

export default CaseForm;
