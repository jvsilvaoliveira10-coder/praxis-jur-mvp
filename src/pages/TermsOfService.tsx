import { Link } from 'react-router-dom';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao início
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Termos de Uso</h1>
        <p className="text-sm text-muted-foreground mb-8">Última atualização: 24 de fevereiro de 2026</p>

        <div className="prose prose-sm max-w-none text-foreground space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar ou utilizar a plataforma Práxis Jur, você concorda com estes Termos de Uso. 
              Caso não concorde com algum dos termos, não utilize a plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              A Práxis Jur é uma plataforma de gestão jurídica que oferece ferramentas para:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Gestão de processos judiciais e clientes.</li>
              <li>Geração e edição de petições com auxílio de Inteligência Artificial.</li>
              <li>Controle de prazos e agenda jurídica.</li>
              <li>Gestão financeira do escritório (contas a receber/pagar, contratos de honorários).</li>
              <li>Pesquisa de jurisprudência e legislação.</li>
              <li>Acompanhamento processual via integração com tribunais.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Cadastro e Conta</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para utilizar a plataforma, é necessário criar uma conta com informações verdadeiras e atualizadas. 
              Você é responsável pela segurança e confidencialidade da sua senha e por todas as atividades realizadas na sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Uso da Inteligência Artificial</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>IMPORTANTE:</strong> As petições e conteúdos gerados por Inteligência Artificial são ferramentas de apoio e 
              <strong> não substituem o trabalho e a responsabilidade do advogado</strong>. O profissional responsável deve:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Revisar integralmente todo conteúdo gerado pela IA antes de seu uso.</li>
              <li>Verificar a adequação jurídica, atualidade legislativa e jurisprudencial.</li>
              <li>Adaptar o conteúdo às particularidades de cada caso concreto.</li>
              <li>Assumir total responsabilidade pelo uso das peças geradas.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              A Práxis Jur não se responsabiliza por prejuízos decorrentes do uso de conteúdo gerado por IA sem a devida revisão profissional.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Responsabilidades do Usuário</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Utilizar a plataforma em conformidade com a legislação vigente e as normas da OAB.</li>
              <li>Manter a confidencialidade das informações de seus clientes inseridas na plataforma.</li>
              <li>Não utilizar a plataforma para fins ilegais ou antiéticos.</li>
              <li>Manter seus dados cadastrais atualizados.</li>
              <li>Não compartilhar credenciais de acesso com terceiros.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              A plataforma Práxis Jur, incluindo sua interface, código-fonte, design, logotipos e funcionalidades, 
              é propriedade intelectual protegida. O conteúdo jurídico inserido pelo usuário permanece de sua titularidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Planos e Pagamento</h2>
            <p className="text-muted-foreground leading-relaxed">
              A Práxis Jur oferece planos de assinatura com diferentes funcionalidades. O pagamento é processado 
              pelo Stripe, com cobrança recorrente conforme o plano escolhido. O cancelamento pode ser feito a 
              qualquer momento, com acesso mantido até o fim do período pago.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              A Práxis Jur não se responsabiliza por:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Decisões jurídicas tomadas com base em conteúdo gerado pela plataforma.</li>
              <li>Perda de prazos por falha na configuração de alertas pelo usuário.</li>
              <li>Indisponibilidade temporária da plataforma por motivos técnicos ou de manutenção.</li>
              <li>Dados incorretos inseridos pelo usuário.</li>
              <li>Alterações na legislação ou jurisprudência posteriores à geração de conteúdo.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Rescisão</h2>
            <p className="text-muted-foreground leading-relaxed">
              O usuário pode encerrar sua conta a qualquer momento. A Práxis Jur reserva-se o direito de 
              suspender ou encerrar contas que violem estes Termos de Uso, sem prejuízo de outras medidas cabíveis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Foro</h2>
            <p className="text-muted-foreground leading-relaxed">
              Fica eleito o foro da Comarca de Ribeirão Preto/SP para dirimir quaisquer controvérsias 
              decorrentes destes Termos de Uso, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">11. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para dúvidas sobre estes Termos de Uso, entre em contato:
            </p>
            <p className="text-muted-foreground">
              E-mail: <strong>sac@praxisjur.com</strong><br />
              WhatsApp: <strong>(16) 99215-9284</strong>
            </p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default TermsOfService;
