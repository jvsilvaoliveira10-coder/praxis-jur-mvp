import { Scale } from 'lucide-react';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/favicon.svg" alt="Práxis AI" className="w-10 h-10" />
              <span className="font-serif font-bold text-xl text-foreground">Práxis AI</span>
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

            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © {currentYear} Práxis AI. Todos os direitos reservados.
            </p>
          </div>

          {/* Bottom text */}
          <div className="mt-8 pt-8 border-t text-center">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              Práxis AI é uma plataforma de produtividade para advogados.
              As petições geradas devem ser revisadas pelo profissional responsável. 
              A utilização da plataforma não substitui o trabalho e a responsabilidade do advogado.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
