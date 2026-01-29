import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TemplateFolder, PetitionTemplate } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Folder, FolderX } from 'lucide-react';

interface MoveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: PetitionTemplate | null;
  folders: TemplateFolder[];
}

export const MoveTemplateDialog = ({
  open,
  onOpenChange,
  template,
  folders,
}: MoveTemplateDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');

  const mutation = useMutation({
    mutationFn: async () => {
      if (!template) throw new Error('Modelo não selecionado');

      const folderId = selectedFolderId === 'uncategorized' ? null : selectedFolderId;

      const { error } = await supabase
        .from('petition_templates')
        .update({ folder_id: folderId })
        .eq('id', template.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petition-templates'] });
      toast({ title: 'Modelo movido com sucesso' });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: 'Erro ao mover modelo', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFolderId) {
      toast({ title: 'Selecione uma pasta', variant: 'destructive' });
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Mover Modelo</DialogTitle>
            <DialogDescription>
              Selecione a pasta de destino para o modelo "{template?.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-2">
              <Label>Pasta de Destino</Label>
              <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma pasta" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="uncategorized">
                    <div className="flex items-center gap-2">
                      <FolderX className="h-4 w-4" />
                      Sem categoria
                    </div>
                  </SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2">
                        <Folder
                          className="h-4 w-4"
                          style={{ color: folder.color || undefined }}
                        />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              Mover
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
