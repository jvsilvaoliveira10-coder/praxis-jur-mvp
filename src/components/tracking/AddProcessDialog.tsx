import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AddProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProcessData {
  numeroProcesso: string;
  tribunal: string;
  dataAjuizamento: string | null;
  classe: string | null;
  assuntos: string[];
  orgaoJulgador: string | null;
  ultimoMovimento: string | null;
  ultimoMovimentoData: string | null;
}

interface SearchResult {
  found: boolean;
  processo?: ProcessData;
  movimentos?: Array<{
    codigo: number;
    nome: string;
    dataHora: string;
  }>;
  error?: string;
}

const tribunais = [
  { value: 'auto', label: 'Detectar automaticamente' },
  { group: 'Justiça Estadual', items: [
    { value: 'TJSP', label: 'TJSP - São Paulo' },
    { value: 'TJRJ', label: 'TJRJ - Rio de Janeiro' },
    { value: 'TJMG', label: 'TJMG - Minas Gerais' },
    { value: 'TJRS', label: 'TJRS - Rio Grande do Sul' },
    { value: 'TJPR', label: 'TJPR - Paraná' },
    { value: 'TJSC', label: 'TJSC - Santa Catarina' },
    { value: 'TJBA', label: 'TJBA - Bahia' },
    { value: 'TJPE', label: 'TJPE - Pernambuco' },
    { value: 'TJCE', label: 'TJCE - Ceará' },
    { value: 'TJGO', label: 'TJGO - Goiás' },
    { value: 'TJDFT', label: 'TJDFT - Distrito Federal' },
    { value: 'TJES', label: 'TJES - Espírito Santo' },
    { value: 'TJMT', label: 'TJMT - Mato Grosso' },
    { value: 'TJMS', label: 'TJMS - Mato Grosso do Sul' },
    { value: 'TJPA', label: 'TJPA - Pará' },
    { value: 'TJAM', label: 'TJAM - Amazonas' },
    { value: 'TJMA', label: 'TJMA - Maranhão' },
    { value: 'TJPB', label: 'TJPB - Paraíba' },
    { value: 'TJRN', label: 'TJRN - Rio Grande do Norte' },
    { value: 'TJPI', label: 'TJPI - Piauí' },
    { value: 'TJAL', label: 'TJAL - Alagoas' },
    { value: 'TJSE', label: 'TJSE - Sergipe' },
    { value: 'TJTO', label: 'TJTO - Tocantins' },
    { value: 'TJRO', label: 'TJRO - Rondônia' },
    { value: 'TJAC', label: 'TJAC - Acre' },
    { value: 'TJAP', label: 'TJAP - Amapá' },
    { value: 'TJRR', label: 'TJRR - Roraima' },
  ]},
  { group: 'Justiça Federal', items: [
    { value: 'TRF1', label: 'TRF1 - 1ª Região' },
    { value: 'TRF2', label: 'TRF2 - 2ª Região' },
    { value: 'TRF3', label: 'TRF3 - 3ª Região' },
    { value: 'TRF4', label: 'TRF4 - 4ª Região' },
    { value: 'TRF5', label: 'TRF5 - 5ª Região' },
    { value: 'TRF6', label: 'TRF6 - 6ª Região' },
  ]},
  { group: 'Justiça do Trabalho', items: [
    { value: 'TRT1', label: 'TRT1 - Rio de Janeiro' },
    { value: 'TRT2', label: 'TRT2 - São Paulo' },
    { value: 'TRT3', label: 'TRT3 - Minas Gerais' },
    { value: 'TRT4', label: 'TRT4 - Rio Grande do Sul' },
    { value: 'TRT5', label: 'TRT5 - Bahia' },
    { value: 'TRT6', label: 'TRT6 - Pernambuco' },
    { value: 'TRT7', label: 'TRT7 - Ceará' },
    { value: 'TRT8', label: 'TRT8 - Pará/Amapá' },
    { value: 'TRT9', label: 'TRT9 - Paraná' },
    { value: 'TRT10', label: 'TRT10 - DF/Tocantins' },
    { value: 'TRT11', label: 'TRT11 - Amazonas/Roraima' },
    { value: 'TRT12', label: 'TRT12 - Santa Catarina' },
    { value: 'TRT13', label: 'TRT13 - Paraíba' },
    { value: 'TRT14', label: 'TRT14 - Rondônia/Acre' },
    { value: 'TRT15', label: 'TRT15 - Campinas' },
    { value: 'TRT16', label: 'TRT16 - Maranhão' },
    { value: 'TRT17', label: 'TRT17 - Espírito Santo' },
    { value: 'TRT18', label: 'TRT18 - Goiás' },
    { value: 'TRT19', label: 'TRT19 - Alagoas' },
    { value: 'TRT20', label: 'TRT20 - Sergipe' },
    { value: 'TRT21', label: 'TRT21 - Rio Grande do Norte' },
    { value: 'TRT22', label: 'TRT22 - Piauí' },
    { value: 'TRT23', label: 'TRT23 - Mato Grosso' },
    { value: 'TRT24', label: 'TRT24 - Mato Grosso do Sul' },
  ]},
  { group: 'Tribunais Superiores', items: [
    { value: 'STJ', label: 'STJ - Superior Tribunal de Justiça' },
    { value: 'TST', label: 'TST - Tribunal Superior do Trabalho' },
    { value: 'TSE', label: 'TSE - Tribunal Superior Eleitoral' },
    { value: 'STM', label: 'STM - Superior Tribunal Militar' },
  ]},
];

const AddProcessDialog = ({ open, onOpenChange }: AddProcessDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [processNumber, setProcessNumber] = useState('');
  const [tribunal, setTribunal] = useState('auto');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [step, setStep] = useState<'input' | 'preview'>('input');

  const resetDialog = () => {
    setProcessNumber('');
    setTribunal('auto');
    setSearchResult(null);
    setStep('input');
    setIsSearching(false);
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  const formatProcessNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 20);
    if (digits.length <= 7) return digits;
    if (digits.length <= 9) return `${digits.slice(0, 7)}-${digits.slice(7)}`;
    if (digits.length <= 13) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9)}`;
    if (digits.length <= 14) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13)}`;
    if (digits.length <= 16) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14)}`;
    return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14, 16)}.${digits.slice(16, 20)}`;
  };

  const handleProcessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProcessNumber(formatProcessNumber(e.target.value));
  };

  const isValidProcessNumber = () => {
    const digits = processNumber.replace(/\D/g, '');
    return digits.length === 20;
  };

  const searchProcess = async () => {
    if (!isValidProcessNumber()) {
      toast({
        title: 'Número inválido',
        description: 'O número do processo deve ter 20 dígitos.',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/search-datajud`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          processNumber: processNumber.replace(/\D/g, ''),
          tribunal: tribunal === 'auto' ? null : tribunal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSearchResult({ found: false, error: data.error || 'Erro ao buscar processo' });
      } else {
        setSearchResult(data);
        if (data.found) {
          setStep('preview');
        }
      }
    } catch (error) {
      setSearchResult({ found: false, error: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsSearching(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!searchResult?.processo || !user) throw new Error('Dados inválidos');

      const { processo, movimentos } = searchResult;

      // Inserir processo
      const { data: trackedProcess, error: processError } = await supabase
        .from('tracked_processes')
        .insert({
          user_id: user.id,
          process_number: processo.numeroProcesso,
          tribunal: processo.tribunal,
          classe: processo.classe,
          assuntos: processo.assuntos,
          orgao_julgador: processo.orgaoJulgador,
          data_ajuizamento: processo.dataAjuizamento,
          ultimo_movimento: processo.ultimoMovimento,
          ultimo_movimento_data: processo.ultimoMovimentoData,
          last_checked_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (processError) throw processError;

      // Inserir movimentações
      if (movimentos && movimentos.length > 0) {
        const { error: movementsError } = await supabase
          .from('process_movements')
          .insert(
            movimentos.map((m) => ({
              tracked_process_id: trackedProcess.id,
              codigo: m.codigo,
              nome: m.nome,
              data_hora: m.dataHora,
              notified: true, // Marcar como já notificado para não gerar notificações antigas
            }))
          );

        if (movementsError) throw movementsError;
      }

      return trackedProcess;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracked-processes'] });
      toast({
        title: 'Processo adicionado!',
        description: 'Você receberá notificações de novas movimentações.',
      });
      handleClose();
    },
    onError: (error: Error) => {
      if (error.message?.includes('unique')) {
        toast({
          title: 'Processo já monitorado',
          description: 'Este processo já está sendo acompanhado.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro ao salvar',
          description: 'Não foi possível adicionar o processo. Tente novamente.',
          variant: 'destructive',
        });
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Processo</DialogTitle>
          <DialogDescription>
            {step === 'input'
              ? 'Informe o número CNJ do processo para buscar os dados'
              : 'Confirme os dados do processo antes de adicionar'}
          </DialogDescription>
        </DialogHeader>

        {step === 'input' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="processNumber">Número do Processo (CNJ)</Label>
              <Input
                id="processNumber"
                placeholder="0000000-00.0000.0.00.0000"
                value={processNumber}
                onChange={handleProcessNumberChange}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tribunal">Tribunal</Label>
              <Select value={tribunal} onValueChange={setTribunal}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tribunal" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="auto">Detectar automaticamente</SelectItem>
                  {tribunais.slice(1).map((group) => (
                    'group' in group && (
                      <div key={group.group}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {group.group}
                        </div>
                        {group.items.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </div>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>

            {searchResult && !searchResult.found && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">{searchResult.error || 'Processo não encontrado'}</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={searchProcess}
                disabled={!isValidProcessNumber() || isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Processo
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {searchResult?.processo && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">Processo Encontrado</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Número</p>
                    <p className="font-mono">{formatProcessNumber(searchResult.processo.numeroProcesso)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{searchResult.processo.tribunal}</Badge>
                  </div>
                  {searchResult.processo.classe && (
                    <div>
                      <p className="text-xs text-muted-foreground">Classe</p>
                      <p className="text-sm">{searchResult.processo.classe}</p>
                    </div>
                  )}
                  {searchResult.processo.orgaoJulgador && (
                    <div>
                      <p className="text-xs text-muted-foreground">Órgão Julgador</p>
                      <p className="text-sm">{searchResult.processo.orgaoJulgador}</p>
                    </div>
                  )}
                  {searchResult.processo.assuntos && searchResult.processo.assuntos.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Assuntos</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {searchResult.processo.assuntos.slice(0, 3).map((assunto, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {assunto}
                          </Badge>
                        ))}
                        {searchResult.processo.assuntos.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{searchResult.processo.assuntos.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {searchResult.movimentos && searchResult.movimentos.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {searchResult.movimentos.length} movimentações encontradas
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep('input')}>
                Voltar
              </Button>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Adicionar ao Acompanhamento'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddProcessDialog;
