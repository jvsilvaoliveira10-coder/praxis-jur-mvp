import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Case, ACTION_TYPE_LABELS } from '@/types/database';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, Search, FolderOpen, Edit, Trash2 } from 'lucide-react';
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
import { useIsMobile } from '@/hooks/use-mobile';

const Cases = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCases = async () => {
    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        client:clients(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar processos',
        description: error.message,
      });
    } else {
      setCases(data as any[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('cases').delete().eq('id', deleteId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir processo',
        description: error.message,
      });
    } else {
      toast({ title: 'Processo excluído com sucesso' });
      fetchCases();
    }
    setDeleteId(null);
  };

  const filteredCases = cases.filter((c) =>
    (c.client as any)?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.court.toLowerCase().includes(search.toLowerCase()) ||
    c.opposing_party.toLowerCase().includes(search.toLowerCase()) ||
    (c.process_number && c.process_number.includes(search))
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Responsive header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Processos</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gerencie seus processos judiciais
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/cases/new">
            <Plus className="w-4 h-4 mr-2" />
            Novo Processo
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar processos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                {search ? 'Nenhum processo encontrado' : 'Nenhum processo cadastrado'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? 'Tente outro termo de busca' : 'Clique em "Novo Processo" para começar'}
              </p>
            </div>
          ) : isMobile ? (
            // Mobile: Card list view
            <div className="space-y-3">
              {filteredCases.map((c) => (
                <div
                  key={c.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{(c.client as any)?.name || '-'}</p>
                      <Badge variant="secondary" className="flex-shrink-0 text-xs">
                        {ACTION_TYPE_LABELS[c.action_type]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {c.process_number || 'Sem número'}
                    </p>
                    <p className="text-sm">{c.court}</p>
                    <p className="text-sm text-muted-foreground">
                      vs. {c.opposing_party}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link to={`/cases/${c.id}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(c.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop: Table view with horizontal scroll
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Vara/Comarca</TableHead>
                    <TableHead>Tipo de Ação</TableHead>
                    <TableHead>Parte Contrária</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {(c.client as any)?.name || '-'}
                      </TableCell>
                      <TableCell>{c.process_number || '-'}</TableCell>
                      <TableCell>{c.court}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {ACTION_TYPE_LABELS[c.action_type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{c.opposing_party}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/cases/${c.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(c.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="w-full sm:w-auto">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cases;
