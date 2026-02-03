import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CaseWithPipeline, CaseStage, ACTION_TYPE_LABELS } from '@/types/pipeline';
import { PriorityBadge } from './PriorityBadge';
import { DueDateBadge } from './DueDateBadge';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PipelineListViewProps {
  cases: CaseWithPipeline[];
  stages: CaseStage[];
  onCardClick: (caseData: CaseWithPipeline) => void;
  onStageChange: (caseId: string, stageId: string) => void;
}

export const PipelineListView = ({ cases, stages, onCardClick, onStageChange }: PipelineListViewProps) => {
  if (cases.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Nenhum processo encontrado</p>
        <p className="text-sm">Cadastre um novo processo para começar</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Processo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Etapa</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead>Vara</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((caseData) => {
            const currentStage = stages.find(s => s.id === caseData.pipeline?.stage_id);

            return (
              <TableRow
                key={caseData.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onCardClick(caseData)}
              >
                <TableCell className="font-medium">
                  <div>
                    <p>{caseData.client?.name || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">vs. {caseData.opposing_party}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {caseData.process_number ? (
                    <span className="font-mono text-sm">{caseData.process_number}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {ACTION_TYPE_LABELS[caseData.action_type] || caseData.action_type}
                  </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={caseData.pipeline?.stage_id || ''}
                    onValueChange={(value) => onStageChange(caseData.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center gap-2">
                        {currentStage && (
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: currentStage.color }}
                          />
                        )}
                        <SelectValue placeholder="Selecionar" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: stage.color }}
                            />
                            {stage.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {caseData.pipeline?.priority && (
                    <PriorityBadge priority={caseData.pipeline.priority} />
                  )}
                </TableCell>
                <TableCell>
                  <DueDateBadge date={caseData.pipeline?.due_date || null} />
                </TableCell>
                <TableCell className="max-w-[150px] truncate">
                  {caseData.court}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
