import { Scale, Search, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Jurisprudence = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <Card className="max-w-lg w-full border-dashed border-2">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Search className="w-10 h-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Pesquisa de Jurisprudência
            </h1>
            <p className="text-muted-foreground">
              Em breve você poderá pesquisar jurisprudências diretamente do sistema
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Funcionalidade em desenvolvimento</span>
          </div>

          <div className="pt-4 space-y-3 text-left bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium text-foreground">O que está por vir:</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <Scale className="w-4 h-4 mt-0.5 text-primary" />
                <span>Busca integrada nos principais tribunais</span>
              </li>
              <li className="flex items-start gap-2">
                <Scale className="w-4 h-4 mt-0.5 text-primary" />
                <span>Análise de relevância com IA</span>
              </li>
              <li className="flex items-start gap-2">
                <Scale className="w-4 h-4 mt-0.5 text-primary" />
                <span>Exportação de decisões para petições</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Jurisprudence;
