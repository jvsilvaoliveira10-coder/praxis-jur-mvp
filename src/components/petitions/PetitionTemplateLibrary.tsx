import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { AI_PETITION_TEMPLATES, type AITemplate } from '@/lib/petition-ai-templates';

interface PetitionTemplateLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: AITemplate) => void;
}

const PetitionTemplateLibrary = ({ open, onOpenChange, onSelectTemplate }: PetitionTemplateLibraryProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Modelos de Petição com IA
          </SheetTitle>
          <SheetDescription>
            Selecione um modelo e a IA preencherá automaticamente com os dados do seu caso.
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-1 gap-3">
          {AI_PETITION_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all group"
              onClick={() => {
                onSelectTemplate(template);
                onOpenChange(false);
              }}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <span className="text-2xl">{template.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">
                      {template.name}
                    </p>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                      IA
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PetitionTemplateLibrary;
