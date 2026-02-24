import { Link } from 'react-router-dom';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao início
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mb-8">Última atualização: 24 de fevereiro de 2026</p>

        <div className="prose prose-sm max-w-none text-foreground space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Introdução</h2>
            <p className="text-muted-foreground leading-relaxed">
              A Práxis Jur ("nós", "nossa plataforma") está comprometida com a proteção dos dados pessoais dos seus usuários, 
              em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD – Lei nº 13.709/2018). Esta Política de Privacidade 
              descreve como coletamos, utilizamos, armazenamos e compartilhamos seus dados pessoais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Dados Coletados</h2>
            <p className="text-muted-foreground leading-relaxed">Coletamos os seguintes tipos de dados:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong>Dados de identificação:</strong> nome, e-mail, telefone, CPF/CNPJ, número da OAB.</li>
              <li><strong>Dados profissionais:</strong> informações do escritório, áreas de atuação, endereço profissional.</li>
              <li><strong>Dados de uso:</strong> informações sobre como você utiliza a plataforma (páginas acessadas, funcionalidades utilizadas).</li>
              <li><strong>Dados de processos:</strong> informações jurídicas inseridas por você para gestão de casos, clientes e petições.</li>
              <li><strong>Dados financeiros:</strong> informações de faturamento e pagamento processadas pelo Stripe.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Finalidade do Tratamento</h2>
            <p className="text-muted-foreground leading-relaxed">Seus dados são tratados para as seguintes finalidades:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Prestação dos serviços da plataforma (gestão de processos, geração de petições, controle financeiro).</li>
              <li>Autenticação e segurança da conta do usuário.</li>
              <li>Processamento de pagamentos e gestão de assinaturas.</li>
              <li>Comunicação sobre atualizações, alertas de prazos e novidades do serviço.</li>
              <li>Melhoria contínua da plataforma e experiência do usuário.</li>
              <li>Cumprimento de obrigações legais e regulatórias.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Base Legal</h2>
            <p className="text-muted-foreground leading-relaxed">
              O tratamento dos seus dados pessoais é fundamentado nas seguintes bases legais da LGPD (Art. 7º):
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong>Execução de contrato:</strong> para a prestação dos serviços contratados.</li>
              <li><strong>Consentimento:</strong> para comunicações de marketing e cookies não essenciais.</li>
              <li><strong>Legítimo interesse:</strong> para melhoria dos serviços e segurança da plataforma.</li>
              <li><strong>Obrigação legal:</strong> para cumprimento de exigências legais e regulatórias.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos apenas cookies estritamente necessários para o funcionamento da plataforma:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong>Cookies de sessão:</strong> para manter sua autenticação durante o uso da plataforma.</li>
              <li><strong>Cookies de preferência:</strong> para armazenar configurações de interface (ex.: estado da barra lateral).</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Não utilizamos cookies de rastreamento, analytics de terceiros ou publicidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">Seus dados podem ser compartilhados com:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong>Stripe:</strong> processador de pagamentos, para gestão de assinaturas e cobranças.</li>
              <li><strong>Provedores de IA:</strong> para funcionalidades de geração de petições e análise jurídica. Os dados são enviados de forma anonimizada quando possível.</li>
              <li><strong>Autoridades competentes:</strong> quando exigido por lei ou ordem judicial.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Não vendemos, alugamos ou comercializamos seus dados pessoais a terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Segurança dos Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Criptografia em trânsito (HTTPS/TLS) e em repouso.</li>
              <li>Controle de acesso baseado em políticas de segurança (RLS).</li>
              <li>Criptografia de chaves de API de integrações de terceiros.</li>
              <li>Autenticação segura com verificação de e-mail.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Direitos do Titular</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conforme a LGPD, você tem os seguintes direitos sobre seus dados pessoais:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Confirmação da existência de tratamento.</li>
              <li>Acesso aos dados pessoais.</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários.</li>
              <li>Portabilidade dos dados.</li>
              <li>Eliminação dos dados tratados com consentimento.</li>
              <li>Informação sobre compartilhamento de dados.</li>
              <li>Revogação do consentimento.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Para exercer seus direitos, entre em contato pelo e-mail: <strong>sac@praxisjur.com</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Retenção de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Seus dados são mantidos enquanto a conta estiver ativa ou conforme necessário para cumprir obrigações legais. 
              Após o cancelamento da conta, os dados serão eliminados em até 30 dias, salvo obrigações legais de retenção.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Encarregado de Proteção de Dados (DPO)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para questões relacionadas à proteção de dados pessoais, entre em contato com nosso encarregado:
            </p>
            <p className="text-muted-foreground">
              E-mail: <strong>sac@praxisjur.com</strong><br />
              WhatsApp: <strong>(16) 99215-9284</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">11. Alterações nesta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Esta política pode ser atualizada periodicamente. Notificaremos sobre alterações significativas por e-mail ou aviso na plataforma.
            </p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default PrivacyPolicy;
