import { BookOpen, Scale, Clock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PetitionMetadata } from '@/hooks/usePetitionGeneration';

interface PetitionMetadataCardProps {
  metadata: PetitionMetadata;
}

export const PetitionMetadataCard = ({ metadata }: PetitionMetadataCardProps) => {
  const timeSeconds = (metadata.generationTimeMs / 1000).toFixed(1);

  return (
    <Card className="card-premium border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm">Fundamentação Utilizada</CardTitle>
          <Badge variant="outline" className="ml-auto text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {timeSeconds}s
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {metadata.legislationFound.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <BookOpen className="w-3.5 h-3.5" />
              Legislação ({metadata.legislationFound.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {metadata.legislationFound.map((item, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {item.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {metadata.jurisprudenceFound.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Scale className="w-3.5 h-3.5" />
              Jurisprudência ({metadata.jurisprudenceFound.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {metadata.jurisprudenceFound.map((item, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {item.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {metadata.templateUsed && (
          <div className="text-xs text-muted-foreground">
            Modelo: <span className="font-medium">{metadata.templateUsed}</span>
          </div>
        )}

        {metadata.model && (
          <div className="text-xs text-muted-foreground">
            Motor: <span className="font-medium">{metadata.model}</span>
          </div>
        )}

        {metadata.legislationFound.length === 0 && metadata.jurisprudenceFound.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            Nenhuma referência adicional encontrada. Ative o n8n para fundamentação automática.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
