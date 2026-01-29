import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, FileText } from 'lucide-react';

interface ProcessMovementsSheetProps {
  process: {
    id: string;
    process_number: string;
    tribunal: string;
    classe: string | null;
  } | null;
  onClose: () => void;
}

interface Movement {
  id: string;
  codigo: number | null;
  nome: string;
  data_hora: string;
  orgao_julgador: string | null;
  complementos: Record<string, unknown> | null;
  notified: boolean;
  created_at: string;
}

const ProcessMovementsSheet = ({ process, onClose }: ProcessMovementsSheetProps) => {
  const { data: movements, isLoading } = useQuery({
    queryKey: ['process-movements', process?.id],
    queryFn: async () => {
      if (!process) return [];
      
      const { data, error } = await supabase
        .from('process_movements')
        .select('*')
        .eq('tracked_process_id', process.id)
        .order('data_hora', { ascending: false });

      if (error) throw error;
      return data as Movement[];
    },
    enabled: !!process,
  });

  const formatProcessNumber = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.length !== 20) return num;
    return `${clean.slice(0, 7)}-${clean.slice(7, 9)}.${clean.slice(9, 13)}.${clean.slice(13, 14)}.${clean.slice(14, 16)}.${clean.slice(16, 20)}`;
  };

  return (
    <Sheet open={!!process} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-mono text-base">
            {process && formatProcessNumber(process.process_number)}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <Badge variant="outline">{process?.tribunal}</Badge>
            {process?.classe && <span className="text-sm">{process.classe}</span>}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Histórico de Movimentações
          </h3>

          <ScrollArea className="h-[calc(100vh-200px)]">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border-l-2 border-muted pl-4 pb-4">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
            ) : movements?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma movimentação registrada</p>
              </div>
            ) : (
              <div className="space-y-1">
                {movements?.map((movement, index) => (
                  <div
                    key={movement.id}
                    className={`
                      relative pl-4 pb-4
                      before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:rounded-full
                      before:bg-primary
                      ${index < (movements?.length || 0) - 1 ? 'border-l-2 border-muted ml-1' : 'ml-1'}
                    `}
                  >
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {format(new Date(movement.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      {movement.codigo && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          #{movement.codigo}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{movement.nome}</p>
                    {movement.orgao_julgador && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {movement.orgao_julgador}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProcessMovementsSheet;
