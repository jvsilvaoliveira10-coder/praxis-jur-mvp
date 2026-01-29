import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TemplateFolder } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FOLDER_COLORS } from './FolderList';

interface FolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder?: TemplateFolder | null;
}

export const FolderDialog = ({ open, onOpenChange, folder }: FolderDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!folder;

  const [name, setName] = useState('');
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (folder) {
      setName(folder.name);
      setColor(folder.color || null);
    } else {
      setName('');
      setColor(null);
    }
  }, [folder, open]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      const data = {
        name: name.trim(),
        color,
        user_id: user.id,
      };

      if (isEditing && folder) {
        const { error } = await supabase
          .from('template_folders')
          .update({ name: data.name, color: data.color })
          .eq('id', folder.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('template_folders')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-folders'] });
      toast({
        title: isEditing ? 'Pasta atualizada' : 'Pasta criada com sucesso',
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: isEditing ? 'Erro ao atualizar pasta' : 'Erro ao criar pasta',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Informe o nome da pasta', variant: 'destructive' });
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Pasta' : 'Nova Pasta'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Atualize as informações da pasta'
                : 'Crie uma nova pasta para organizar seus modelos'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Nome da Pasta *</Label>
              <Input
                id="folder-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Petições Iniciais"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Cor (opcional)</Label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setColor(null)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center',
                    color === null ? 'border-primary' : 'border-transparent'
                  )}
                >
                  <div className="w-5 h-5 rounded-full bg-muted-foreground/30" />
                </button>
                {FOLDER_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={cn(
                      'w-8 h-8 rounded-full border-2',
                      color === c.value ? 'border-primary' : 'border-transparent'
                    )}
                    title={c.label}
                  >
                    <div
                      className="w-full h-full rounded-full"
                      style={{ backgroundColor: c.value }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? 'Salvar' : 'Criar Pasta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
