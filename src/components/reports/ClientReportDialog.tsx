import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Loader2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFirmSettings } from '@/hooks/useFirmSettings';
import { generateClientReport } from '@/lib/client-report-export';
import { ACTION_TYPE_LABELS } from '@/types/database';
import { toast } from 'sonner';

interface ClientReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CaseOption {
  id: string;
  process_number: string | null;
  court: string;
  action_type: string;
  opposing_party: string;
  client: { name: string } | { name: string }[];
}

const ClientReportDialog = ({ open, onOpenChange }: ClientReportDialogProps) => {
  const { user } = useAuth();
  const { firmSettings } = useFirmSettings();
  const [cases, setCases] = useState<CaseOption[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [options, setOptions] = useState({
    includeMovements: true,
    includeDeadlines: true,
    includeFinancial: true,
  });

  useEffect(() => {
    if (open && user) {
      supabase
        .from('cases')
        .select('id, process_number, court, action_type, opposing_party, client:clients(name)')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) setCases(data as unknown as CaseOption[]);
        });
    }
  }, [open, user]);

  const handleGenerate = async () => {
    if (!selectedCaseId) {
      toast.error('Selecione um processo');
      return;
    }

    setGenerating(true);

    try {
      const caseData = cases.find(c => c.id === selectedCaseId);
      if (!caseData) throw new Error('Processo não encontrado');

      const clientInfo = Array.isArray(caseData.client) ? caseData.client[0] : caseData.client;

      // Fetch movements from tracked_processes
      let movements: any[] = [];
      if (options.includeMovements) {
        const { data: tracked } = await supabase
          .from('tracked_processes')
          .select('id')
          .eq('case_id', selectedCaseId)
          .limit(1)
          .maybeSingle();

        if (tracked) {
          const { data: movs } = await supabase
            .from('process_movements')
            .select('nome, data_hora, orgao_julgador')
            .eq('tracked_process_id', tracked.id)
            .order('data_hora', { ascending: false })
            .limit(10);
          movements = movs || [];
        }
      }

      // Fetch deadlines
      let deadlines: any[] = [];
      if (options.includeDeadlines) {
        const { data: dls } = await supabase
          .from('deadlines')
          .select('title, deadline_datetime, deadline_type')
          .eq('case_id', selectedCaseId)
          .gte('deadline_datetime', new Date().toISOString())
          .order('deadline_datetime', { ascending: true })
          .limit(10);
        deadlines = dls || [];
      }

      // Fetch financial
      let financial = { totalAmount: 0, totalPaid: 0, totalPending: 0 };
      if (options.includeFinancial) {
        const { data: recs } = await supabase
          .from('receivables')
          .select('amount, amount_paid')
          .eq('case_id', selectedCaseId);

        if (recs) {
          financial.totalAmount = recs.reduce((s, r) => s + Number(r.amount), 0);
          financial.totalPaid = recs.reduce((s, r) => s + Number(r.amount_paid), 0);
          financial.totalPending = financial.totalAmount - financial.totalPaid;
        }
      }

      await generateClientReport(
        {
          processNumber: caseData.process_number,
          court: caseData.court,
          actionType: ACTION_TYPE_LABELS[caseData.action_type as keyof typeof ACTION_TYPE_LABELS] || caseData.action_type,
          opposingParty: caseData.opposing_party,
          clientName: clientInfo?.name || 'Cliente',
        },
        {
          firmName: firmSettings?.firm_name || undefined,
          lawyerName: firmSettings?.lawyer_name || undefined,
          oabNumber: firmSettings?.oab_number || undefined,
          oabState: firmSettings?.oab_state || undefined,
          phone: firmSettings?.phone || undefined,
          email: firmSettings?.email || undefined,
        },
        movements,
        deadlines,
        financial,
        options
      );

      toast.success('Relatório PDF gerado com sucesso!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Relatório para Cliente
          </DialogTitle>
          <DialogDescription>
            Gere um PDF executivo com andamento, prazos e financeiro do processo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Processo</Label>
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o processo" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c) => {
                  const client = Array.isArray(c.client) ? c.client[0] : c.client;
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      {client?.name} - {c.process_number || c.court}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Seções do Relatório</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="movements"
                checked={options.includeMovements}
                onCheckedChange={(v) => setOptions(p => ({ ...p, includeMovements: !!v }))}
              />
              <label htmlFor="movements" className="text-sm">Últimas Movimentações</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="deadlines"
                checked={options.includeDeadlines}
                onCheckedChange={(v) => setOptions(p => ({ ...p, includeDeadlines: !!v }))}
              />
              <label htmlFor="deadlines" className="text-sm">Próximos Prazos</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="financial"
                checked={options.includeFinancial}
                onCheckedChange={(v) => setOptions(p => ({ ...p, includeFinancial: !!v }))}
              />
              <label htmlFor="financial" className="text-sm">Situação Financeira</label>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={generating || !selectedCaseId} className="w-full">
            {generating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Gerar Relatório PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientReportDialog;
