import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'A IA substitui o trabalho do advogado?',
    answer: 'Não. A IA é uma ferramenta de auxílio que acelera a produção de peças processuais. O advogado continua sendo essencial para revisar, ajustar e aprovar o conteúdo gerado, aplicando seu conhecimento jurídico e estratégico ao caso concreto.',
  },
  {
    question: 'Meus dados estão seguros?',
    answer: 'Sim. Utilizamos criptografia de ponta a ponta, servidores seguros e seguimos rigorosamente a LGPD. Seus dados são acessíveis apenas por você e nunca são compartilhados com terceiros.',
  },
  {
    question: 'Posso usar meus próprios modelos de petição?',
    answer: 'Sim! Você pode fazer upload dos modelos do seu escritório em PDF, DOCX ou TXT. A IA utilizará esses modelos como referência de estilo e estrutura, mantendo a identidade do seu trabalho.',
  },
  {
    question: 'A plataforma funciona para qual área do direito?',
    answer: 'Atualmente, a plataforma é focada em direito cível, com suporte para ações de obrigação de fazer, cobrança e indenização por danos morais. Estamos expandindo para outras áreas do direito.',
  },
  {
    question: 'Como funciona o período gratuito?',
    answer: 'Durante o período de lançamento, a plataforma é totalmente gratuita. Você pode criar sua conta, cadastrar clientes, gerar petições e usar todas as funcionalidades sem nenhum custo ou necessidade de cartão de crédito.',
  },
  {
    question: 'Preciso instalar algum software?',
    answer: 'Não. A plataforma funciona 100% online, diretamente no seu navegador. Basta acessar pelo computador, tablet ou celular. Seus dados ficam sincronizados e disponíveis de qualquer lugar.',
  },
  {
    question: 'A plataforma substitui meu software financeiro?',
    answer: 'O módulo financeiro do Práxis Jur foi desenvolvido especificamente para escritórios de advocacia, com funcionalidades como controle de honorários, custas processuais, contratos recorrentes e DRE. Para a maioria dos advogados autônomos e pequenos escritórios, ele é suficiente.',
  },
  {
    question: 'Como funciona a gestão de processos estilo Kanban?',
    answer: 'Você visualiza todos os seus processos em um quadro com colunas representando cada etapa (Consulta Inicial, Documentação, Protocolado, etc.). Basta arrastar o card do processo para a próxima etapa. O sistema registra automaticamente o histórico de movimentações e você pode adicionar checklists e prazos.',
  },
  {
    question: 'Posso ver quanto lucro cada cliente me gera?',
    answer: 'Sim! O módulo de relatórios permite analisar receitas e custos por cliente e por processo, mostrando o ROI de cada relacionamento. Isso ajuda a identificar clientes rentáveis e processos que dão prejuízo.',
  },
  {
    question: 'Os módulos funcionam de forma integrada?',
    answer: 'Sim! Ao cadastrar um cliente, você já pode vincular honorários. Ao acompanhar um processo no pipeline, você vê as custas lançadas e o saldo financeiro. Ao gerar uma petição, a tarefa no checklist é marcada como concluída. Tudo conectado.',
  },
];

export function FAQSection() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section id="faq" className="py-8 sm:py-10 scroll-mt-16">
      <div className="container mx-auto px-4">
        <div ref={ref} className="max-w-3xl mx-auto text-center mb-12">
          <h2 
            className={cn(
              'text-3xl sm:text-4xl font-serif font-bold text-foreground transition-all duration-700',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Perguntas Frequentes
          </h2>
          <p 
            className={cn(
              'mt-4 text-lg text-muted-foreground transition-all duration-700 delay-100',
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Tire suas dúvidas sobre a plataforma
          </p>
        </div>

        <div 
          className={cn(
            'max-w-3xl mx-auto transition-all duration-700 delay-200',
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
