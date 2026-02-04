import { Scale, Rocket, CheckCircle2, Search, Calendar, User, Building2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// Dados mock para demonstração
const mockJurisprudencia = [
  {
    id: 'demo-1',
    processo: 'REsp 1.234.567/SP',
    classe: 'Recurso Especial',
    relator: 'Min. Maria Silva',
    orgao: 'Terceira Turma',
    ementa: 'CIVIL. RESPONSABILIDADE CIVIL. DANOS MORAIS. FALHA NA PRESTAÇÃO DE SERVIÇOS BANCÁRIOS. INSCRIÇÃO INDEVIDA EM CADASTRO DE INADIMPLENTES. QUANTUM INDENIZATÓRIO. RAZOABILIDADE. I - A inscrição indevida do nome do consumidor em cadastros de inadimplentes configura dano moral in re ipsa, prescindindo de comprovação do efetivo prejuízo. II - O valor da indenização por danos morais deve atender ao caráter compensatório para a vítima e punitivo-pedagógico para o ofensor. III - Recurso especial parcialmente provido.',
    data: '2024-01-15',
  },
  {
    id: 'demo-2',
    processo: 'REsp 2.345.678/RJ',
    classe: 'Recurso Especial',
    relator: 'Min. Carlos Santos',
    orgao: 'Quarta Turma',
    ementa: 'PROCESSUAL CIVIL. CONTRATO DE CONSUMO. CLÁUSULA ABUSIVA. NULIDADE. CÓDIGO DE DEFESA DO CONSUMIDOR. INTERPRETAÇÃO FAVORÁVEL AO CONSUMIDOR. I - São nulas de pleno direito as cláusulas contratuais que estabeleçam obrigações iníquas, abusivas ou que coloquem o consumidor em desvantagem exagerada. II - Na dúvida, as cláusulas contratuais serão interpretadas de maneira mais favorável ao consumidor. III - Recurso especial conhecido e provido.',
    data: '2024-02-22',
  },
  {
    id: 'demo-3',
    processo: 'AgInt no AREsp 3.456.789/MG',
    classe: 'Agravo Interno',
    relator: 'Min. Ana Oliveira',
    orgao: 'Segunda Seção',
    ementa: 'AGRAVO INTERNO. RECURSO ESPECIAL. DIREITO DO CONSUMIDOR. PLANO DE SAÚDE. NEGATIVA DE COBERTURA. TRATAMENTO PRESCRITO POR MÉDICO. ABUSIVIDADE. I - É abusiva a negativa de cobertura de procedimento médico prescrito pelo profissional que acompanha o paciente, quando há previsão contratual de cobertura para a doença. II - O rol de procedimentos da ANS é exemplificativo e não taxativo. III - Agravo interno desprovido.',
    data: '2024-03-10',
  },
];

const upcomingFeatures = [
  'Busca em tempo real no STJ e tribunais estaduais',
  'Integração direta com o gerador de petições',
  'Cache inteligente para buscas mais rápidas',
  'Seleção e citação automática de acórdãos',
  'Filtros avançados por área, tribunal e período',
];

const Jurisprudence = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Scale className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold">Pesquisa de Jurisprudência</h1>
          <p className="text-muted-foreground">
            Busque decisões judiciais para fundamentar suas petições
          </p>
        </div>
      </div>

      {/* Banner "Em Breve" */}
      <Alert className="border-primary/40 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <Rocket className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Em Desenvolvimento
        </AlertTitle>
        <AlertDescription className="mt-3 space-y-4">
          <p className="text-foreground/80">
            Estamos desenvolvendo uma ferramenta completa de pesquisa de jurisprudência 
            para fundamentar suas petições automaticamente.
          </p>
          
          <div className="grid gap-2 text-sm">
            {upcomingFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-foreground/70">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </AlertDescription>
      </Alert>

      {/* Card de Prévia */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Prévia da Funcionalidade</CardTitle>
              <CardDescription>
                Veja como será a pesquisa de jurisprudência quando lançarmos
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              DEMONSTRAÇÃO
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campo de busca desabilitado */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Ex: danos morais, responsabilidade civil, contrato de consumo..."
                className="pl-10"
                disabled
              />
            </div>
            <Button disabled>
              Buscar
            </Button>
          </div>

          {/* Resultados de exemplo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Resultados de exemplo</span>
              <span>{mockJurisprudencia.length} acórdãos</span>
            </div>

            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {mockJurisprudencia.map((item) => (
                  <Card key={item.id} className="relative overflow-hidden border-muted">
                    {/* Badge Demo */}
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="text-xs bg-muted/50">
                        EXEMPLO
                      </Badge>
                    </div>

                    <CardContent className="pt-4 pb-4 space-y-3">
                      {/* Processo e Classe */}
                      <div className="flex items-start justify-between pr-20">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {item.processo}
                          </h4>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {item.classe}
                          </Badge>
                        </div>
                      </div>

                      {/* Metadados */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{item.relator}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>{item.orgao}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(item.data).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      {/* Ementa */}
                      <p className="text-sm text-muted-foreground line-clamp-4">
                        {item.ementa}
                      </p>

                      {/* Ações */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" disabled>
                          Ver detalhes
                        </Button>
                        <Button size="sm" disabled>
                          Usar na petição
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Jurisprudence;
