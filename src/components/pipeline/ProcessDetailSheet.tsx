import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CaseWithPipeline, CaseStage, CasePriority, CaseActivity, CaseTask, ACTION_TYPE_LABELS } from '@/types/pipeline';
import { TaskChecklist } from './TaskChecklist';
import { ActivityTimeline } from './ActivityTimeline';
import { PriorityBadge } from './PriorityBadge';
import { DueDateBadge } from './DueDateBadge';
import { 
  User, 
  Building, 
  Calendar, 
  FileText, 
  Wallet,
  ExternalLink,
  Save,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProcessDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseData: CaseWithPipeline | null;
  stages: CaseStage[];
  activities: CaseActivity[];
  tasks: CaseTask[];
  onStageChange: (stageId: string) => void;
  onPriorityChange: (priority: CasePriority) => void;
  onDueDateChange: (date: string | null) => void;
  onNotesChange: (notes: string) => void;
  onTaskToggle: (taskId: string, completed: boolean) => void;
  onTaskAdd: (title: string) => void;
  onTaskDelete: (taskId: string) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export const ProcessDetailSheet = ({
  open,
  onOpenChange,
  caseData,
  stages,
  activities,
  tasks,
  onStageChange,
  onPriorityChange,
  onDueDateChange,
  onNotesChange,
  onTaskToggle,
  onTaskAdd,
  onTaskDelete,
  onSave,
  isSaving,
}: ProcessDetailSheetProps) => {
  const navigate = useNavigate();
  const [localNotes, setLocalNotes] = useState(caseData?.pipeline?.notes || '');
  const [localDueDate, setLocalDueDate] = useState(caseData?.pipeline?.due_date || '');

  if (!caseData) return null;

  const currentStage = stages.find(s => s.id === caseData.pipeline?.stage_id);

  const handleSave = () => {
    onNotesChange(localNotes);
    onDueDateChange(localDueDate || null);
    onSave();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
        <SheetHeader className="space-y-4">
          {/* Header with client info */}
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{caseData.client?.name || 'Cliente não vinculado'}</span>
            </div>
            <SheetTitle className="text-xl mt-1">
              vs. {caseData.opposing_party}
            </SheetTitle>
            {caseData.process_number && (
              <p className="text-sm font-mono text-muted-foreground mt-1">
                {caseData.process_number}
              </p>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">
              {ACTION_TYPE_LABELS[caseData.action_type] || caseData.action_type}
            </Badge>
            {caseData.pipeline?.priority && (
              <PriorityBadge priority={caseData.pipeline.priority} />
            )}
            {caseData.pipeline?.due_date && (
              <DueDateBadge date={caseData.pipeline.due_date} />
            )}
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Dados</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="activities">Histórico</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-4">
            {/* Stage */}
            <div className="space-y-2">
              <Label>Etapa Atual</Label>
              <div className="flex items-center gap-2">
                {currentStage && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: currentStage.color }}
                  />
                )}
                <Select
                  value={caseData.pipeline?.stage_id || ''}
                  onValueChange={onStageChange}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecionar etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                          {stage.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {caseData.pipeline?.entered_at && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Nesta etapa desde {format(new Date(caseData.pipeline.entered_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={caseData.pipeline?.priority || 'media'}
                onValueChange={(value) => onPriorityChange(value as CasePriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label>Prazo desta Etapa</Label>
              <Input
                type="date"
                value={localDueDate}
                onChange={(e) => setLocalDueDate(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                placeholder="Anotações sobre a etapa atual..."
                rows={4}
              />
            </div>

            {/* Case Info */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm">Informações do Processo</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Vara:</span>
                  <span>{caseData.court}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Criado em:</span>
                  <span>{format(new Date(caseData.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <TaskChecklist
              tasks={tasks}
              onTaskToggle={onTaskToggle}
              onTaskAdd={onTaskAdd}
              onTaskDelete={onTaskDelete}
            />
          </TabsContent>

          <TabsContent value="activities" className="mt-4">
            <ActivityTimeline activities={activities} />
          </TabsContent>

          <TabsContent value="links" className="mt-4 space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => navigate(`/cases/${caseData.id}/edit`)}
            >
              <FileText className="w-4 h-4" />
              Editar Processo
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => navigate('/petitions/new', { state: { caseId: caseData.id } })}
            >
              <FileText className="w-4 h-4" />
              Nova Petição
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => navigate(`/clients/${caseData.client_id}/edit`)}
            >
              <User className="w-4 h-4" />
              Ver Cliente
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => navigate('/financeiro/receber', { state: { caseId: caseData.id } })}
            >
              <Wallet className="w-4 h-4" />
              Ver Financeiro
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
