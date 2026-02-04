import { Calendar, User, Building, Tag, BookOpen, Plus, Check, Eye } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { STJAcordao } from '@/lib/api/stj-jurisprudence';

interface STJResultCardProps {
  acordao: STJAcordao;
  onSelect?: (acordao: STJAcordao) => void;
  onViewDetails?: (acordao: STJAcordao) => void;
  isSelected?: boolean;
  showSelectButton?: boolean;
}

const STJResultCard = ({ 
  acordao, 
  onSelect, 
  onViewDetails,
  isSelected = false,
  showSelectButton = true 
}: STJResultCardProps) => {
  const formatDate = (dateStr?: string | null) => {
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
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground">
            STJ
          </Badge>
          {acordao.classe && (
            <Badge variant="secondary">{acordao.classe}</Badge>
          )}
          {acordao.processo && (
            <Badge variant="outline" className="font-mono text-xs">
              {acordao.processo}
            </Badge>
          )}
        </div>

        {/* Ementa */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Ementa</h4>
          <p className="text-sm leading-relaxed line-clamp-6">
            {acordao.ementa}
          </p>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {acordao.relator && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{acordao.relator}</span>
            </div>
          )}
          
          {acordao.orgao_julgador && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{acordao.orgao_julgador}</span>
            </div>
          )}
          
          {acordao.data_julgamento && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Julgado em {formatDate(acordao.data_julgamento)}</span>
            </div>
          )}

          {acordao.data_publicacao && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4 flex-shrink-0" />
              <span>Publicado em {formatDate(acordao.data_publicacao)}</span>
            </div>
          )}
        </div>

        {/* Palavras-chave */}
        {acordao.palavras_destaque && acordao.palavras_destaque.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Tag className="h-3 w-3" />
              Palavras-chave
            </div>
            <div className="flex flex-wrap gap-1">
              {acordao.palavras_destaque.slice(0, 8).map((palavra, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {palavra}
                </Badge>
              ))}
              {acordao.palavras_destaque.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{acordao.palavras_destaque.length - 8}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Referências legais */}
        {acordao.referencias_legais && acordao.referencias_legais.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              Referências Legais
            </div>
            <div className="flex flex-wrap gap-1">
              {acordao.referencias_legais.slice(0, 5).map((ref, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {ref}
                </Badge>
              ))}
              {acordao.referencias_legais.length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{acordao.referencias_legais.length - 5}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 pt-0">
        {onViewDetails && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(acordao)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver detalhes
          </Button>
        )}
        {showSelectButton && onSelect && (
          <Button
            variant={isSelected ? "default" : "secondary"}
            size="sm"
            onClick={() => onSelect(acordao)}
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

export default STJResultCard;
