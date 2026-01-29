import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TemplateFolder } from '@/types/database';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Folder, FolderOpen, Plus, MoreHorizontal, Pencil, Trash2, FolderX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface FolderListProps {
  folders: TemplateFolder[];
  templateCounts: Record<string, number>;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: () => void;
  onEditFolder: (folder: TemplateFolder) => void;
}

const FOLDER_COLORS = [
  { value: '#3b82f6', label: 'Azul' },
  { value: '#22c55e', label: 'Verde' },
  { value: '#f59e0b', label: 'Amarelo' },
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#8b5cf6', label: 'Roxo' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#6b7280', label: 'Cinza' },
];

export const FolderList = ({
  folders,
  templateCounts,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onEditFolder,
}: FolderListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const uncategorizedCount = templateCounts['uncategorized'] || 0;
  const totalCount = Object.values(templateCounts).reduce((sum, count) => sum + count, 0);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('template_folders')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-folders'] });
      queryClient.invalidateQueries({ queryKey: ['petition-templates'] });
      toast({ title: 'Pasta excluída com sucesso' });
      setDeleteId(null);
      if (selectedFolderId === deleteId) {
        onSelectFolder(null);
      }
    },
    onError: () => {
      toast({ title: 'Erro ao excluir pasta', variant: 'destructive' });
    },
  });

  return (
    <div className={cn(
      "border-r bg-muted/30 flex flex-col",
      isMobile ? "w-full border-r-0" : "w-64"
    )}>
      <div className="p-4 border-b">
        <Button onClick={onCreateFolder} className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nova Pasta
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* All templates */}
          <button
            onClick={() => onSelectFolder(null)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-3 sm:py-2 rounded-md text-sm transition-colors',
              selectedFolderId === null
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            <FolderOpen className="h-4 w-4" />
            <span className="flex-1 text-left">Todos os Modelos</span>
            <span className="text-xs opacity-70">{totalCount}</span>
          </button>

          {/* Folders list */}
          {folders.map((folder) => (
            <div key={folder.id} className="group relative">
              <button
                onClick={() => onSelectFolder(folder.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-3 sm:py-2 rounded-md text-sm transition-colors',
                  selectedFolderId === folder.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <Folder
                  className="h-4 w-4"
                  style={{ color: folder.color || undefined }}
                />
                <span className="flex-1 text-left truncate">{folder.name}</span>
                <span className="text-xs opacity-70">
                  {templateCounts[folder.id] || 0}
                </span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6',
                      isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                      selectedFolderId === folder.id && 'opacity-100'
                    )}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuItem onClick={() => onEditFolder(folder)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Renomear
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteId(folder.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          {/* Uncategorized */}
          {uncategorizedCount > 0 && (
            <button
              onClick={() => onSelectFolder('uncategorized')}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-3 sm:py-2 rounded-md text-sm transition-colors',
                selectedFolderId === 'uncategorized'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <FolderX className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-left">Sem categoria</span>
              <span className="text-xs opacity-70">{uncategorizedCount}</span>
            </button>
          )}
        </div>
      </ScrollArea>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pasta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta pasta? Os modelos dentro dela
              serão movidos para "Sem categoria".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export { FOLDER_COLORS };
