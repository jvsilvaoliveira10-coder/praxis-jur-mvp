import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Case, DeadlineType, DEADLINE_TYPE_LABELS } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, CalendarIcon, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { format, parseISO, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const deadlineSchema = z.object({
  case_id: z.string().min(1, 'Processo obrigatório'),
  deadline_type: z.enum(['prazo_processual', 'audiencia', 'compromisso']),
  title: z.string().min(2, 'Título deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  date: z.date({ required_error: 'Data obrigatória' }),
  time: z.string().min(5, 'Hora obrigatória'),
});

const DeadlineForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [form, setForm] = useState({
    case_id: '',
    deadline_type: 'prazo_processual' as DeadlineType,
    title: '',
    description: '',
    date: undefined as Date | undefined,
    time: '09:00',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCases = async () => {
      const { data } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setCases(data as Case[]);
    };
    fetchCases();
  }, []);

  useEffect(() => {
    if (isEdit) {
      const fetchDeadline = async () => {
        const { data, error } = await supabase
          .from('deadlines')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error || !data) {
          toast({
            variant: 'destructive',
            title: 'Prazo não encontrado',
          });
          navigate('/agenda');
        } else {
          const deadlineDate = parseISO(data.deadline_datetime);
          setForm({
            case_id: data.case_id,
            deadline_type: data.deadline_type as DeadlineType,
            title: data.title,
            description: data.description || '',
            date: deadlineDate,
            time: format(deadlineDate, 'HH:mm'),
          });
        }
      };
      fetchDeadline();
    }
  }, [id, isEdit, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = deadlineSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    // Combine date and time with Brazil timezone
    const [hours, minutes] = form.time.split(':').map(Number);
    let deadlineDateTime = setMinutes(setHours(form.date!, hours), minutes);
    
    // Format as ISO string for Supabase (will be stored in UTC)
    const payload = {
      case_id: form.case_id,
      deadline_type: form.deadline_type,
      title: form.title,
      description: form.description || null,
      deadline_datetime: deadlineDateTime.toISOString(),
    };

    if (isEdit) {
      const { error } = await supabase
        .from('deadlines')
        .update(payload)
        .eq('id', id);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao atualizar prazo',
          description: error.message,
        });
      } else {
        toast({ title: 'Prazo atualizado com sucesso' });
        navigate('/agenda');
      }
    } else {
      const { error } = await supabase.from('deadlines').insert({
        ...payload,
        user_id: user?.id,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao criar prazo',
          description: error.message,
        });
      } else {
        toast({ title: 'Prazo criado com sucesso' });
        navigate('/agenda');
      }
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase.from('deadlines').delete().eq('id', id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir prazo',
        description: error.message,
      });
    } else {
      toast({ title: 'Prazo excluído com sucesso' });
      navigate('/agenda');
    }
    setShowDeleteDialog(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/agenda')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-serif font-bold text-foreground">
            {isEdit ? 'Editar Prazo' : 'Novo Prazo'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? 'Atualize os dados do prazo' : 'Cadastre um novo prazo ou compromisso'}
          </p>
        </div>
        {isEdit && (
          <Button variant="destructive" size="icon" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Prazo</CardTitle>
          <CardDescription>
            Preencha as informações do prazo processual ou compromisso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="case_id">Processo Vinculado *</Label>
              <Select
                value={form.case_id}
                onValueChange={(v) => setForm({ ...form, case_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o processo" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.process_number || 'Sem número'} - {c.opposing_party}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.case_id && <p className="text-sm text-destructive">{errors.case_id}</p>}
              {cases.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum processo cadastrado.{' '}
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/cases/new')}>
                    Criar processo
                  </Button>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline_type">Tipo *</Label>
              <Select
                value={form.deadline_type}
                onValueChange={(v) => setForm({ ...form, deadline_type: v as DeadlineType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DEADLINE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ex: Prazo para contestação"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Detalhes adicionais sobre o prazo..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.date ? format(form.date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.date}
                      onSelect={(date) => setForm({ ...form, date })}
                      locale={ptBR}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Hora *</Label>
                <Input
                  id="time"
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
                {errors.time && <p className="text-sm text-destructive">{errors.time}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/agenda')}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este prazo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeadlineForm;
