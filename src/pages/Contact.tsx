import { MessageCircle, Mail, Clock, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const WHATSAPP_NUMBER = '5516992159284';
const EMAIL = 'sac@praxisjur.com';

const Contact = () => {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Preciso de suporte com o Práxis Jur.')}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contato</h1>
        <p className="text-muted-foreground">
          Estamos aqui para ajudar. Escolha o melhor canal para você.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
        {/* WhatsApp Card */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-[hsl(142,70%,45%)]/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-[hsl(142,70%,45%)]" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">WhatsApp</h2>
              <p className="text-sm text-muted-foreground">Resposta rápida</p>
            </div>
            <p className="font-mono text-lg">(16) 99215-9284</p>
            <Button 
              asChild 
              className="w-full bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-white"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                Iniciar Conversa
                <ExternalLink className="w-3 h-3 ml-2" />
              </a>
            </Button>
          </div>
        </Card>
        
        {/* Email Card */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">E-mail</h2>
              <p className="text-sm text-muted-foreground">Suporte detalhado</p>
            </div>
            <p className="font-mono text-lg">{EMAIL}</p>
            <Button asChild variant="outline" className="w-full">
              <a href={`mailto:${EMAIL}`}>
                <Mail className="w-4 h-4 mr-2" />
                Enviar E-mail
              </a>
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Horário de atendimento */}
      <Card className="p-4 bg-muted/50 max-w-2xl">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Horário de Atendimento</p>
            <p className="text-sm text-muted-foreground">
              Segunda a Sexta, das 9h às 18h
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Contact;
