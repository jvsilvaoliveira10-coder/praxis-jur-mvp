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
import { ArrowLeft, Upload, Loader2, Folder, FolderX, FileText, CheckCircle2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Badge } from '@/components/ui/badge';

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
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/...;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const ext = file.name.toLowerCase().split('.').pop();
    setIsExtracting(true);
    setUploadedFileName(null);

    try {
      if (ext === 'txt') {
        // Read TXT directly in browser
        const text = await file.text();
        setContent(text);
        setUploadedFileName(file.name);
        toast({ title: 'Conteúdo extraído com sucesso', description: file.name });
      } else if (ext === 'docx') {
        // Send to edge function for DOCX extraction
        const base64 = await fileToBase64(file);
        
        const { data, error } = await supabase.functions.invoke('extract-template', {
          body: { fileBase64: base64, fileName: file.name },
        });

        if (error) throw error;
        
        // Use HTML if available, fallback to text
        const extractedContent = data.html || data.text || '';
        setContent(extractedContent);
        setUploadedFileName(file.name);
        toast({ title: 'Conteúdo extraído com sucesso', description: file.name });
      } else {
        toast({ 
          title: 'Formato não suportado', 
          description: 'Use arquivos .docx ou .txt',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error extracting file:', error);
      toast({ 
        title: 'Erro ao extrair conteúdo', 
        description: error instanceof Error ? error.message : 'Tente novamente',
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
              Faça upload de um arquivo do escritório (.docx, .txt) ou cole o texto manualmente
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
                  <p className="text-sm text-muted-foreground">Extraindo conteúdo do arquivo...</p>
                </div>
              ) : uploadedFileName ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{uploadedFileName}</p>
                    <Badge variant="secondary" className="text-xs">Extraído</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Arraste outro arquivo para substituir
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive 
                      ? 'Solte o arquivo aqui...'
                      : 'Arraste um arquivo do escritório ou clique para selecionar'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: .docx, .txt
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
