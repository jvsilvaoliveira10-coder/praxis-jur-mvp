import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, GripVertical, Trash2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CaseStage } from '@/types/pipeline';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface SortableStageItemProps {
  stage: CaseStage;
  onUpdate: (id: string, updates: Partial<CaseStage>) => void;
  onDelete: (id: string) => void;
}

const SortableStageItem = ({ stage, onUpdate, onDelete }: SortableStageItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 bg-card border rounded-lg',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div
        className="w-4 h-4 rounded-full flex-shrink-0 cursor-pointer"
        style={{ backgroundColor: stage.color }}
        onClick={() => {
          const newColor = prompt('Cor (hex):', stage.color);
          if (newColor) onUpdate(stage.id, { color: newColor });
        }}
      />

      <Input
        value={stage.name}
        onChange={(e) => onUpdate(stage.id, { name: e.target.value })}
        className="flex-1"
        placeholder="Nome da etapa"
      />

      <Input
        value={stage.description || ''}
        onChange={(e) => onUpdate(stage.id, { description: e.target.value })}
        className="flex-1"
        placeholder="Descrição (opcional)"
      />

      <div className="flex items-center gap-2">
        <Label htmlFor={`final-${stage.id}`} className="text-xs text-muted-foreground">
          Final
        </Label>
        <Switch
          id={`final-${stage.id}`}
          checked={stage.is_final}
          onCheckedChange={(checked) => onUpdate(stage.id, { is_final: checked })}
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(stage.id)}
        disabled={stage.is_default}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

const PipelineSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [stages, setStages] = useState<CaseStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const loadStages = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('case_stages')
        .select('*')
        .eq('user_id', user.id)
        .order('position');

      if (!error && data) {
        setStages(data as CaseStage[]);
      }
      setLoading(false);
    };

    loadStages();
  }, [user]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setStages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((item, idx) => ({ ...item, position: idx + 1 }));
      });
    }
  };

  const handleUpdate = (id: string, updates: Partial<CaseStage>) => {
    setStages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleDelete = (id: string) => {
    const stage = stages.find((s) => s.id === id);
    if (stage?.is_default) {
      toast({
        title: 'Não permitido',
        description: 'Etapas padrão não podem ser excluídas',
        variant: 'destructive',
      });
      return;
    }
    setStages((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddStage = () => {
    if (!user) return;
    const newStage: CaseStage = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      name: 'Nova Etapa',
      description: '',
      color: '#6B7280',
      position: stages.length + 1,
      is_default: false,
      is_final: false,
      created_at: new Date().toISOString(),
    };
    setStages((prev) => [...prev, newStage]);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Delete removed stages (only non-default)
      const { data: currentStages } = await supabase
        .from('case_stages')
        .select('id')
        .eq('user_id', user.id);

      const currentIds = currentStages?.map((s) => s.id) || [];
      const newIds = stages.filter((s) => !s.id.startsWith('temp-')).map((s) => s.id);
      const toDelete = currentIds.filter((id) => !newIds.includes(id));

      if (toDelete.length > 0) {
        await supabase
          .from('case_stages')
          .delete()
          .in('id', toDelete)
          .eq('is_default', false);
      }

      // Upsert all stages
      for (const stage of stages) {
        const stageData = {
          user_id: user.id,
          name: stage.name,
          description: stage.description,
          color: stage.color,
          position: stage.position,
          is_default: stage.is_default,
          is_final: stage.is_final,
        };

        if (stage.id.startsWith('temp-')) {
          await supabase.from('case_stages').insert(stageData);
        } else {
          await supabase
            .from('case_stages')
            .update(stageData)
            .eq('id', stage.id);
        }
      }

      // Reload stages
      const { data: updatedStages } = await supabase
        .from('case_stages')
        .select('*')
        .eq('user_id', user.id)
        .order('position');

      if (updatedStages) {
        setStages(updatedStages as CaseStage[]);
      }

      toast({ title: 'Etapas salvas com sucesso' });
    } catch (error) {
      console.error('Error saving stages:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/pipeline')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-serif font-bold">Configurar Etapas</h1>
          <p className="text-muted-foreground">
            Personalize as etapas do seu pipeline de processos
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Etapas do Pipeline</CardTitle>
          <CardDescription>
            Arraste para reordenar. Clique na cor para alterar. Etapas padrão não podem ser excluídas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={stages.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {stages.map((stage) => (
                  <SortableStageItem
                    key={stage.id}
                    stage={stage}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Separator />

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleAddStage}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Etapa
            </Button>

            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PipelineSettings;
