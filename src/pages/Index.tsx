import { Scale, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-xl">LegalTech</span>
          </div>
          <Button asChild>
            <Link to="/auth">
              Entrar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground leading-tight">
            Geração Automática de{' '}
            <span className="text-primary">Petições Jurídicas</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Sistema inteligente para advogados. Cadastre clientes, gerencie processos e 
            gere petições cíveis de forma rápida e profissional.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              title: 'Cadastro Simples',
              description: 'Cadastre clientes e processos de forma rápida e organizada.',
            },
            {
              title: 'Geração Automática',
              description: 'Petições geradas automaticamente com base em templates jurídicos.',
            },
            {
              title: 'Exportação PDF',
              description: 'Exporte suas petições em PDF pronto para protocolo.',
            },
          ].map((feature, i) => (
            <div 
              key={i} 
              className="p-6 rounded-xl bg-card border shadow-sm animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <h3 className="font-serif font-bold text-lg text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <p className="text-center text-sm text-muted-foreground">
          © 2024 LegalTech MVP. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Index;
