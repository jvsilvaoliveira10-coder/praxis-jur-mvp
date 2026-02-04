import { Mail, MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '5516992159284';
const EMAIL = 'sac@praxisjur.com';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-6 sm:py-8 border-t bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/praxis-jur-logo.png" alt="Práxis Jur" className="h-10" />
            </div>

            {/* Links */}
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="#funcionalidades" className="hover:text-foreground transition-colors">
                Funcionalidades
              </a>
              <a href="#como-funciona" className="hover:text-foreground transition-colors">
                Como Funciona
              </a>
              <a href="#seguranca" className="hover:text-foreground transition-colors">
                Segurança
              </a>
              <a href="#faq" className="hover:text-foreground transition-colors">
                FAQ
              </a>
            </nav>

            {/* Contact */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <a 
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4" />
                {EMAIL}
              </a>
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                (16) 99215-9284
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Práxis Jur. Todos os direitos reservados.
            </p>
          </div>

          {/* Bottom text */}
          <div className="mt-8 pt-8 border-t text-center">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              Práxis Jur é a plataforma completa para advogados: produção jurídica, gestão de processos e controle financeiro em um só lugar.
              As petições geradas devem ser revisadas pelo profissional responsável. 
              A utilização da plataforma não substitui o trabalho e a responsabilidade do advogado.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
