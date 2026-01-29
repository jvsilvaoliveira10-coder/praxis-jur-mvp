import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PetitionTemplate, PieceType, PIECE_TYPE_LABELS, TemplateFolder } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Edit, Trash2, ToggleLeft, ToggleRight, FolderInput, Folder, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderList } from '@/components/templates/FolderList';
import { FolderDialog } from '@/components/templates/FolderDialog';
import { MoveTemplateDialog } from '@/components/templates/MoveTemplateDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Templates = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<TemplateFolder | null>(null);
  const [moveTemplateDialogOpen, setMoveTemplateDialogOpen] = useState(false);
  const [templateToMove, setTemplateToMove] = useState<PetitionTemplate | null>(null);
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);

  // Fetch folders
  const { data: folders = [] } = useQuery({
    queryKey: ['template-folders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_folders')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as TemplateFolder[];
    },
    enabled: !!user,
  });

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['petition-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('petition_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PetitionTemplate[];
    },
    enabled: !!user,
  });

  // Calculate template counts per folder
  const templateCounts = useMemo(() => {
    if (!templates) return {};
    
    const counts: Record<string, number> = { uncategorized: 0 };
    
    templates.forEach((template) => {
      if (template.folder_id) {
        counts[template.folder_id] = (counts[template.folder_id] || 0) + 1;
      } else {
        counts.uncategorized++;
      }
    });
    
    return counts;
  }, [templates]);

  // Filter templates based on selected folder
  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    
    if (selectedFolderId === null) {
      return templates;
    }
    
    if (selectedFolderId === 'uncategorized') {
      return templates.filter((t) => !t.folder_id);
    }
    
    return templates.filter((t) => t.folder_id === selectedFolderId);
  }, [templates, selectedFolderId]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('petition_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petition-templates'] });
      toast({ title: 'Modelo excluído com sucesso' });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: 'Erro ao excluir modelo', variant: 'destructive' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from('petition_templates')
        .update({ active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petition-templates'] });
      toast({ title: 'Status do modelo atualizado' });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleOpenFolderDialog = () => {
    setEditingFolder(null);
    setFolderDialogOpen(true);
  };

  const handleEditFolder = (folder: TemplateFolder) => {
    setEditingFolder(folder);
    setFolderDialogOpen(true);
  };

  const handleMoveTemplate = (template: PetitionTemplate) => {
    setTemplateToMove(template);
    setMoveTemplateDialogOpen(true);
  };

  const getFolderName = (folderId: string | null | undefined): string | null => {
    if (!folderId) return null;
    const folder = folders.find((f) => f.id === folderId);
    return folder?.name || null;
  };

  const getFolderColor = (folderId: string | null | undefined): string | undefined => {
    if (!folderId) return undefined;
    const folder = folders.find((f) => f.id === folderId);
    return folder?.color || undefined;
  };

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId);
    if (isMobile) {
      setFolderSheetOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={isMobile ? "space-y-4" : "flex h-[calc(100vh-8rem)]"}>
      {/* Desktop: Folder Sidebar */}
      {!isMobile && (
        <FolderList
          folders={folders}
          templateCounts={templateCounts}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onCreateFolder={handleOpenFolderDialog}
          onEditFolder={handleEditFolder}
        />
      )}

      {/* Main Content */}
      <div className={isMobile ? "space-y-4" : "flex-1 overflow-auto p-6 space-y-6"}>
        {/* Responsive header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Modelos de Petições</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {selectedFolderId === null
                ? 'Todos os modelos do seu escritório'
                : selectedFolderId === 'uncategorized'
                ? 'Modelos sem categoria'
                : `Modelos em: ${getFolderName(selectedFolderId)}`}
            </p>
          </div>
          <Button onClick={() => navigate('/templates/new')} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Novo Modelo
          </Button>
        </div>

        {/* Mobile: Folder selector */}
        {isMobile && (
          <Sheet open={folderSheetOpen} onOpenChange={setFolderSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  {selectedFolderId === null 
                    ? 'Todos os Modelos' 
                    : selectedFolderId === 'uncategorized'
                    ? 'Sem categoria'
                    : getFolderName(selectedFolderId)}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh]">
              <div className="py-4">
                <FolderList
                  folders={folders}
                  templateCounts={templateCounts}
                  selectedFolderId={selectedFolderId}
                  onSelectFolder={handleFolderSelect}
                  onCreateFolder={() => {
                    setFolderSheetOpen(false);
                    handleOpenFolderDialog();
                  }}
                  onEditFolder={(folder) => {
                    setFolderSheetOpen(false);
                    handleEditFolder(folder);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}

        {filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="mb-2 text-center">
                {selectedFolderId === null
                  ? 'Nenhum modelo cadastrado'
                  : 'Nenhum modelo nesta pasta'}
              </CardTitle>
              <CardDescription className="text-center mb-4">
                {selectedFolderId === null
                  ? 'Cadastre modelos de petições do seu escritório para que a IA utilize como base na geração automática.'
                  : 'Adicione modelos a esta pasta ou crie novos modelos.'}
              </CardDescription>
              <Button onClick={() => navigate('/templates/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Novo Modelo
              </Button>
            </CardContent>
          </Card>
        ) : isMobile ? (
          // Mobile: Card list view
          <div className="space-y-3">
            {filteredTemplates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{template.title}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {PIECE_TYPE_LABELS[template.piece_type as PieceType]}
                        </Badge>
                        <Badge variant={template.active ? 'default' : 'secondary'} className="text-xs">
                          {template.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {selectedFolderId === null && template.folder_id && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Folder
                        className="h-3.5 w-3.5"
                        style={{ color: getFolderColor(template.folder_id) }}
                      />
                      <span>{getFolderName(template.folder_id)}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Criado em {formatDate(template.created_at)}
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveTemplate(template)}
                      className="flex-1"
                    >
                      <FolderInput className="h-4 w-4 mr-1" />
                      Mover
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleMutation.mutate({ 
                        id: template.id, 
                        active: !template.active 
                      })}
                    >
                      {template.active ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/templates/${template.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(template.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Desktop: Table view
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedFolderId === null ? 'Seus Modelos' : getFolderName(selectedFolderId) || 'Sem categoria'}
              </CardTitle>
              <CardDescription>
                {filteredTemplates.length} modelo(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo de Peça</TableHead>
                      {selectedFolderId === null && <TableHead>Pasta</TableHead>}
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {PIECE_TYPE_LABELS[template.piece_type as PieceType]}
                          </Badge>
                        </TableCell>
                        {selectedFolderId === null && (
                          <TableCell>
                            {template.folder_id ? (
                              <div className="flex items-center gap-1.5">
                                <Folder
                                  className="h-3.5 w-3.5"
                                  style={{ color: getFolderColor(template.folder_id) }}
                                />
                                <span className="text-sm">{getFolderName(template.folder_id)}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Sem categoria</span>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge variant={template.active ? 'default' : 'secondary'}>
                            {template.active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(template.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMoveTemplate(template)}
                              title="Mover para pasta"
                            >
                              <FolderInput className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleMutation.mutate({ 
                                id: template.id, 
                                active: !template.active 
                              })}
                              title={template.active ? 'Desativar' : 'Ativar'}
                            >
                              {template.active ? (
                                <ToggleRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/templates/${template.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(template.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <FolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        folder={editingFolder}
      />

      <MoveTemplateDialog
        open={moveTemplateDialogOpen}
        onOpenChange={setMoveTemplateDialogOpen}
        template={templateToMove}
        folders={folders}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita.
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

export default Templates;
