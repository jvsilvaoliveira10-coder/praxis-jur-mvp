
# Plano: Adicionar Contato (WhatsApp + Email) na Landing Page e Sistema Interno

## Informacoes de Contato
- **WhatsApp**: 16992159284
- **Email**: sac@praxisjur.com

---

## Resumo das Alteracoes

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    IMPLEMENTACAO DE CONTATO                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. LANDING PAGE (/)                                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  • Botao flutuante WhatsApp (canto inferior direito)         │  │
│  │  • Animacao de pulse suave para chamar atencao               │  │
│  │  • Link direto: wa.me/5516992159284                          │  │
│  │  • Email no rodape (LandingFooter)                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  2. SIDEBAR INTERNA (/dashboard, etc)                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  • Menu "Contato" + "Configuracoes" fixos no bottom          │  │
│  │  • Separados das categorias colapsaveis (Juridico/Financ.)   │  │
│  │  • Permanecem visiveis mesmo com sidebar colapsada           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  3. PAGINA DE CONTATO (/contato)                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  • Cards com WhatsApp e Email                                │  │
│  │  • Botoes de acao direta (abrir WhatsApp, copiar email)      │  │
│  │  • Design premium consistente com o sistema                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/components/landing/WhatsAppButton.tsx` | **CRIAR** | Botao flutuante do WhatsApp |
| `src/pages/Index.tsx` | MODIFICAR | Adicionar WhatsAppButton |
| `src/components/landing/LandingFooter.tsx` | MODIFICAR | Adicionar email e WhatsApp |
| `src/pages/Contact.tsx` | **CRIAR** | Pagina de contato interna |
| `src/components/layout/Sidebar.tsx` | MODIFICAR | Fixar Contato + Config no bottom |
| `src/App.tsx` | MODIFICAR | Adicionar rota /contato |

---

## Detalhes Tecnicos

### 1. Botao Flutuante WhatsApp (Landing Page)

Componente que fica fixo no canto inferior direito com animacao de pulse:

```typescript
// src/components/landing/WhatsAppButton.tsx
import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '5516992159284';
const WHATSAPP_MESSAGE = 'Olá! Gostaria de saber mais sobre o Práxis AI.';

export function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center 
                 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full 
                 shadow-lg hover:shadow-xl transition-all duration-300
                 animate-pulse-subtle group"
      aria-label="Contato via WhatsApp"
    >
      {/* Icone WhatsApp SVG oficial */}
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.789l4.89-1.284A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.32 0-4.473-.64-6.32-1.748l-.453-.27-2.902.762.775-2.833-.296-.469A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
      
      {/* Tooltip on hover */}
      <span className="absolute right-16 bg-foreground text-background 
                       px-3 py-1.5 rounded-lg text-sm font-medium
                       opacity-0 group-hover:opacity-100 transition-opacity
                       whitespace-nowrap shadow-md">
        Fale conosco
      </span>
    </a>
  );
}
```

CSS para animacao suave (adicionar ao index.css se nao existir):

```css
@keyframes pulse-subtle {
  0%, 100% { transform: scale(1); box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 4px 30px rgba(34, 197, 94, 0.6); }
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}
```

### 2. Rodape da Landing Page Atualizado

Adicionar secao de contato no LandingFooter:

```typescript
// Adicionar ao LandingFooter.tsx
<div className="flex flex-col md:flex-row items-center gap-4 text-sm">
  <a 
    href="mailto:sac@praxisjur.com" 
    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
  >
    <Mail className="w-4 h-4" />
    sac@praxisjur.com
  </a>
  <a 
    href="https://wa.me/5516992159284" 
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
  >
    <MessageCircle className="w-4 h-4" />
    (16) 99215-9284
  </a>
</div>
```

### 3. Sidebar com Bottom Fixo

A estrutura sera reorganizada para ter tres areas distintas:

```typescript
// Sidebar.tsx - Nova estrutura

// Categorias colapsaveis (Juridico e Financeiro)
const categories: NavCategory[] = [
  { id: 'juridico', ... },
  { id: 'financeiro', ... },
];

// Links fixos no bottom (NAO fazem parte do scroll)
const fixedBottomLinks: NavItem[] = [
  { to: '/contato', icon: MessageCircle, label: 'Contato' },
  { to: '/configuracoes', icon: Settings, label: 'Configuracoes' },
];

// Layout:
<aside className="... flex flex-col">
  {/* Header com logo */}
  <div className="h-[72px] ...">...</div>
  
  {/* Area scrollavel - APENAS categorias */}
  <nav className="flex-1 overflow-y-auto scrollbar-hidden p-3">
    {categories.map(category => renderCategory(category))}
  </nav>
  
  {/* Bottom FIXO - Contato + Config + User */}
  <div className="border-t border-sidebar-border">
    {/* Links fixos */}
    <div className="p-3 space-y-1">
      {fixedBottomLinks.map(item => renderNavItem(item))}
    </div>
    
    {/* User info + Logout */}
    <div className="p-3 border-t border-sidebar-border">
      {profile && <div>...</div>}
      <Button onClick={signOut}>Sair</Button>
    </div>
  </div>
</aside>
```

### 4. Pagina de Contato

Pagina simples e elegante com os dois canais:

```typescript
// src/pages/Contact.tsx
const Contact = () => {
  const WHATSAPP_NUMBER = '5516992159284';
  const EMAIL = 'sac@praxisjur.com';
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contato</h1>
        <p className="text-muted-foreground">
          Estamos aqui para ajudar. Escolha o melhor canal para voce.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
        {/* WhatsApp Card */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">WhatsApp</h2>
              <p className="text-sm text-muted-foreground">Resposta rapida</p>
            </div>
            <p className="font-mono text-lg">(16) 99215-9284</p>
            <Button asChild className="w-full bg-green-500 hover:bg-green-600">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank">
                Iniciar Conversa
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
                Enviar E-mail
              </a>
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Horario de atendimento */}
      <Card className="p-4 bg-muted/50 max-w-2xl">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Horario de Atendimento</p>
            <p className="text-sm text-muted-foreground">
              Segunda a Sexta, das 9h as 18h
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
```

---

## Visualizacao da Sidebar

```text
┌────────────────────────────────┐
│  [Logo] Praxis AI         [<] │
├────────────────────────────────┤
│                                │
│  v Juridico                    │  <- Categoria colapsavel
│    > Dashboard                 │
│    > Clientes                  │
│    > Processos                 │
│    > Gestao de Processos       │
│    > Peticoes                  │
│    > ...                       │
│                                │
│  v Financeiro                  │  <- Categoria colapsavel
│    > Painel                    │
│    > Contas a Receber          │
│    > ...                       │
│                                │
│  (area scrollavel termina)     │
│                                │
├────────────────────────────────┤  <- Border fixo
│  [msg] Contato                 │  <- FIXO (nao scroll)
│  [cfg] Configuracoes           │  <- FIXO (nao scroll)
├────────────────────────────────┤
│  Dr. Joao Silva                │
│  Advogado                      │
│  [Sair]                        │
└────────────────────────────────┘
```

---

## Ordem de Implementacao

1. Criar `WhatsAppButton.tsx` - Componente flutuante
2. Modificar `Index.tsx` - Adicionar botao flutuante
3. Modificar `LandingFooter.tsx` - Adicionar email e WhatsApp
4. Criar `Contact.tsx` - Pagina interna de contato
5. Modificar `App.tsx` - Adicionar rota /contato
6. Modificar `Sidebar.tsx` - Reorganizar para bottom fixo
7. Adicionar animacao CSS ao `index.css`

---

## Resultado Esperado

Apos a implementacao:
- Landing page com botao flutuante do WhatsApp (canto inferior direito)
- Footer da landing com email e WhatsApp visiveis
- Menu interno com "Contato" e "Configuracoes" sempre fixos no bottom
- Os links fixos permanecem visiveis independente do scroll ou collapse das categorias
- Pagina /contato com design premium e botoes de acao direta
- Experiencia consistente em desktop e mobile
