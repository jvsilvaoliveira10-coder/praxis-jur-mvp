import { Calendar, User, Building, BookOpen, Tag, ExternalLink, Plus, Check } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { STJAcordao } from '@/lib/api/stj-jurisprudence';

interface STJDetailSheetProps {
  acordao: STJAcordao | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (acordao: STJAcordao) => void;
  isSelected: boolean;
}

const STJDetailSheet = ({ acordao, isOpen, onClose, onSelect, isSelected }: STJDetailSheetProps) => {
  if (!acordao) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Não informada';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Link para o processo no portal do STJ
  const stjUrl = acordao.processo 
    ? `https://processo.stj.jus.br/processo/pesquisa/?termo=${encodeURIComponent(acordao.processo)}`
    : null;

  const handleSelect = () => {
    onSelect(acordao);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground">
              STJ
            </Badge>
            {acordao.classe && (
              <Badge variant="secondary">{acordao.classe}</Badge>
            )}
          </div>
          <SheetTitle className="text-lg font-semibold mt-2">
            {acordao.processo || 'Processo não identificado'}
          </SheetTitle>
          <SheetDescription>
            Detalhes do acórdão do Superior Tribunal de Justiça
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-6">
            {/* Metadados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {acordao.relator && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Relator</p>
                    <p className="text-sm font-medium">{acordao.relator}</p>
                  </div>
                </div>
              )}
              
              {acordao.orgao_julgador && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Órgão Julgador</p>
                    <p className="text-sm font-medium">{acordao.orgao_julgador}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Data do Julgamento</p>
                  <p className="text-sm font-medium">{formatDate(acordao.data_julgamento)}</p>
                </div>
              </div>

              {acordao.data_publicacao && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Data da Publicação</p>
                    <p className="text-sm font-medium">{formatDate(acordao.data_publicacao)}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Ementa Completa */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Ementa
              </h4>
              <div className="bg-muted/50 rounded-lg p-4 border">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                  {acordao.ementa}
                </p>
              </div>
            </div>

            {/* Notas adicionais */}
            {acordao.notas && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Notas</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {acordao.notas}
                  </p>
                </div>
              </>
            )}

            {/* Palavras-chave / Assuntos */}
            {acordao.palavras_destaque && acordao.palavras_destaque.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Assuntos / Palavras-chave
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {acordao.palavras_destaque.map((palavra, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {palavra}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Referências Legais */}
            {acordao.referencias_legais && acordao.referencias_legais.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Referências Legais
                  </h4>
                  <ul className="space-y-1">
                    {acordao.referencias_legais.map((ref, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {ref}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        <SheetFooter className="flex-row gap-2 sm:justify-between">
          {stjUrl && (
            <Button variant="outline" asChild className="flex-1 sm:flex-none">
              <a href={stjUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver no STJ
              </a>
            </Button>
          )}
          <Button 
            onClick={handleSelect} 
            variant={isSelected ? "secondary" : "default"}
            className="flex-1 sm:flex-none"
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default STJDetailSheet;
