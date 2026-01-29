import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PieceType, PIECE_TYPE_LABELS, TemplateFolder } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, Loader2, Folder, FolderX } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const TemplateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [pieceType, setPieceType] = useState<PieceType>('peticao_inicial');
  const [content, setContent] = useState('');
  const [active, setActive] = useState(true);
  const [folderId, setFolderId] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);

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

  // Fetch template if editing
  const { data: template, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ['petition-template', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('petition_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setPieceType(template.piece_type as PieceType);
      setContent(template.content);
      setActive(template.active);
      setFolderId(template.folder_id || '');
    }
  }, [template]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      const templateData = {
        user_id: user.id,
        title,
        piece_type: pieceType,
        content,
        active,
        folder_id: folderId || null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('petition_templates')
          .update(templateData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('petition_templates')
          .insert(templateData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petition-templates'] });
      toast({ title: isEditing ? 'Modelo atualizado com sucesso' : 'Modelo criado com sucesso' });
      navigate('/templates');
    },
    onError: (error) => {
      console.error('Error saving template:', error);
      toast({ title: 'Erro ao salvar modelo', variant: 'destructive' });
    },
  });

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'text/plain') {
      return await file.text();
    }
    
    throw new Error('Por favor, copie o conteúdo do arquivo e cole no campo de texto abaixo.');
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsExtracting(true);

    try {
      const text = await extractTextFromFile(file);
      setContent(text);
      toast({ title: 'Conteúdo extraído com sucesso' });
    } catch (error) {
      toast({ 
        title: 'Aviso', 
        description: error instanceof Error ? error.message : 'Erro ao extrair texto',
        variant: 'destructive'
      });
    } finally {
      setIsExtracting(false);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({ title: 'Informe o título do modelo', variant: 'destructive' });
      return;
    }
    
    if (!content.trim()) {
      toast({ title: 'Informe o conteúdo do modelo', variant: 'destructive' });
      return;
    }

    saveMutation.mutate();
  };

  if (isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/templates')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Modelo' : 'Novo Modelo'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? 'Atualize as informações do modelo de petição'
              : 'Cadastre um novo modelo de petição do seu escritório'
            }
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Modelo</CardTitle>
            <CardDescription>
              Defina o tipo, título e pasta do modelo de petição
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Modelo *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Petição Inicial - Consumidor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pieceType">Tipo de Peça *</Label>
                <Select value={pieceType} onValueChange={(v) => setPieceType(v as PieceType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {Object.entries(PIECE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="folder">Pasta</Label>
                <Select value={folderId || '__none__'} onValueChange={(v) => setFolderId(v === '__none__' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma pasta" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="__none__">
                      <div className="flex items-center gap-2">
                        <FolderX className="h-4 w-4 text-muted-foreground" />
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

              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={active}
                    onCheckedChange={setActive}
                  />
                  <Label htmlFor="active">Modelo ativo</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conteúdo do Modelo</CardTitle>
            <CardDescription>
              Cole o texto do modelo ou faça upload de um arquivo (.txt, .pdf, .docx)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              {isExtracting ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Extraindo texto...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive 
                      ? 'Solte o arquivo aqui...'
                      : 'Arraste um arquivo ou clique para selecionar'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: .txt, .pdf, .docx
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo do Modelo *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Cole aqui o texto completo do modelo de petição..."
                className="min-h-[400px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {content.length} caracteres
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/templates')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Atualizar Modelo' : 'Salvar Modelo'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TemplateForm;
