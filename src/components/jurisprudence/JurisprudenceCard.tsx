import { Calendar, User, Building, FileText, ExternalLink, Plus, Check } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JurisprudenceResult } from '@/lib/api/jurisprudence';

interface JurisprudenceCardProps {
  result: JurisprudenceResult;
  onSelect?: (result: JurisprudenceResult) => void;
  isSelected?: boolean;
  showSelectButton?: boolean;
}

const JurisprudenceCard = ({ 
  result, 
  onSelect, 
  isSelected = false,
  showSelectButton = true 
}: JurisprudenceCardProps) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'}`}>
      <CardContent className="pt-6 space-y-4">
        {/* Header with badges */}
        <div className="flex flex-wrap items-center gap-2">
          {result.decision_type && (
            <Badge variant="secondary">{result.decision_type}</Badge>
          )}
          {result.process_number && (
            <Badge variant="outline" className="font-mono text-xs">
              {result.process_number}
            </Badge>
          )}
        </div>

        {/* Ementa */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Ementa</h4>
          <p className="text-sm leading-relaxed line-clamp-6">
            {result.ementa}
          </p>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {result.relator && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Rel. {result.relator}</span>
            </div>
          )}
          
          {result.orgao_julgador && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{result.orgao_julgador}</span>
            </div>
          )}
          
          {result.judgment_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>{formatDate(result.judgment_date)}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 pt-0">
        {result.pdf_url && (
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href={result.pdf_url} target="_blank" rel="noopener noreferrer">
              <FileText className="mr-2 h-4 w-4" />
              Ver PDF
              <ExternalLink className="ml-2 h-3 w-3" />
            </a>
          </Button>
        )}
        
        {showSelectButton && onSelect && (
          <Button
            variant={isSelected ? "default" : "secondary"}
            size="sm"
            onClick={() => onSelect(result)}
          >
            {isSelected ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Selecionado
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Usar na petição
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default JurisprudenceCard;
