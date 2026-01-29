import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Radar, RefreshCw, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import AddProcessDialog from '@/components/tracking/AddProcessDialog';
import ProcessMovementsSheet from '@/components/tracking/ProcessMovementsSheet';
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

interface TrackedProcess {
  id: string;
  process_number: string;
  tribunal: string;
  classe: string | null;
  assuntos: string[] | null;
  orgao_julgador: string | null;
  data_ajuizamento: string | null;
  ultimo_movimento: string | null;
  ultimo_movimento_data: string | null;
  last_checked_at: string | null;
  active: boolean;
  created_at: string;
}

const Tracking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<TrackedProcess | null>(null);
  const [processToDelete, setProcessToDelete] = useState<TrackedProcess | null>(null);

  const { data: processes, isLoading } = useQuery({
    queryKey: ['tracked-processes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracked_processes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TrackedProcess[];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (processId: string) => {
      const { error } = await supabase
        .from('tracked_processes')
        .delete()
        .eq('id', processId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracked-processes'] });
      toast({
        title: 'Processo removido',
        description: 'O processo foi removido do acompanhamento.',
      });
      setProcessToDelete(null);
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o processo.',
        variant: 'destructive',
      });
    },
  });

  const formatProcessNumber = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.length !== 20) return num;
    return `${clean.slice(0, 7)}-${clean.slice(7, 9)}.${clean.slice(9, 13)}.${clean.slice(13, 14)}.${clean.slice(14, 16)}.${clean.slice(16, 20)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Acompanhamento Processual</h1>
          <p className="text-muted-foreground">Monitore processos e receba notificações de movimentações</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Processo
        </Button>
      </div>

      {/* Process List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : processes?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Radar className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum processo monitorado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Adicione processos para acompanhar movimentações automaticamente
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Processo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {processes?.map((process) => (
            <Card key={process.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-mono">
                      {formatProcessNumber(process.process_number)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline">{process.tribunal}</Badge>
                      {process.active ? (
                        <Badge variant="secondary" className="text-primary">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {process.classe && (
                  <p className="text-sm font-medium">{process.classe}</p>
                )}
                {process.orgao_julgador && (
                  <p className="text-sm text-muted-foreground">{process.orgao_julgador}</p>
                )}
                
                {process.ultimo_movimento && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Última movimentação:</p>
                    <p className="text-sm">{process.ultimo_movimento}</p>
                    {process.ultimo_movimento_data && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(process.ultimo_movimento_data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedProcess(process)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver Movimentações
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setProcessToDelete(process)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {process.last_checked_at && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    Verificado em {format(new Date(process.last_checked_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AddProcessDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <ProcessMovementsSheet
        process={selectedProcess}
        onClose={() => setSelectedProcess(null)}
      />

      <AlertDialog open={!!processToDelete} onOpenChange={() => setProcessToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover processo?</AlertDialogTitle>
            <AlertDialogDescription>
              O processo {processToDelete && formatProcessNumber(processToDelete.process_number)} será removido do acompanhamento. 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => processToDelete && deleteMutation.mutate(processToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Tracking;
