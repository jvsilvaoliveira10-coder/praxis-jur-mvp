
# Plano: Landing Page Profissional e Completa

## Objetivo
Transformar a pagina inicial basica em uma landing page profissional, institucional e comercial que apresente todas as funcionalidades da plataforma, transmita confianca e converta visitantes em usuarios.

---

## Estrutura da Nova Landing Page

A pagina sera dividida em secoes distintas, cada uma com proposito especifico:

```text
+------------------------------------------+
|              HEADER/NAVEGACAO            |
|  Logo | Funcionalidades | Seguranca | CTA|
+------------------------------------------+
|                                          |
|              HERO SECTION                |
|  Titulo impactante + Subtitulo           |
|  CTA Principal + CTA Secundario          |
|  Badge "Gratis por tempo limitado"       |
|                                          |
+------------------------------------------+
|                                          |
|         PROBLEMAS QUE RESOLVEMOS         |
|  3 cards com dores do advogado           |
|                                          |
+------------------------------------------+
|                                          |
|        FUNCIONALIDADES PRINCIPAIS        |
|  6-8 cards com icones e descricoes       |
|  Organizados em grid responsivo          |
|                                          |
+------------------------------------------+
|                                          |
|          COMO FUNCIONA (STEPS)           |
|  4 passos visuais do fluxo de uso        |
|                                          |
+------------------------------------------+
|                                          |
|        GERACAO DE PETICOES COM IA        |
|  Secao destacada com mockup/visual       |
|  Explicacao do diferencial da IA         |
|                                          |
+------------------------------------------+
|                                          |
|       SEGURANCA E PRIVACIDADE            |
|  Cards com selos de seguranca            |
|  LGPD, criptografia, dados protegidos    |
|                                          |
+------------------------------------------+
|                                          |
|         PARA QUEM E A PLATAFORMA         |
|  Perfis de usuarios ideais               |
|  Advogados autonomos, pequenos escrit.   |
|                                          |
+------------------------------------------+
|                                          |
|              FAQ / DUVIDAS               |
|  Accordion com perguntas frequentes      |
|                                          |
+------------------------------------------+
|                                          |
|          CTA FINAL (CONVERSAO)           |
|  Chamada forte + Botao de cadastro       |
|  "Comece gratis agora"                   |
|                                          |
+------------------------------------------+
|              FOOTER                      |
|  Links, redes sociais, copyright         |
+------------------------------------------+
```

---

## Componentes a Criar

### 1. Componentes de Landing Page (nova pasta)

Criar pasta `src/components/landing/` com componentes reutilizaveis:

- **HeroSection.tsx**: Secao principal com headline, subtitulo e CTAs
- **ProblemSection.tsx**: Cards com as dores/problemas dos advogados
- **FeaturesSection.tsx**: Grid de funcionalidades com icones
- **HowItWorksSection.tsx**: Passos visuais do fluxo de uso
- **AISection.tsx**: Destaque para geracao de peticoes com IA
- **SecuritySection.tsx**: Selos e garantias de seguranca
- **TargetAudienceSection.tsx**: Perfis de usuarios ideais
- **FAQSection.tsx**: Perguntas frequentes em accordion
- **CTASection.tsx**: Chamada final para conversao
- **LandingHeader.tsx**: Header fixo com navegacao
- **LandingFooter.tsx**: Footer completo

---

## Conteudo por Secao

### Hero Section
- **Headline**: "Petições jurídicas em minutos, não em horas"
- **Subtitulo**: "Plataforma inteligente para advogados brasileiros. Gere petições com IA, organize modelos e acompanhe processos automaticamente."
- **Badge**: "✨ Grátis por tempo limitado"
- **CTA Principal**: "Começar Gratuitamente"
- **CTA Secundario**: "Ver funcionalidades"

### Problemas que Resolvemos
3 cards destacando as dores:
1. **Tempo perdido**: "Horas redigindo peças repetitivas"
2. **Desorganizacao**: "Modelos espalhados em pastas e emails"
3. **Acompanhamento manual**: "Consultas diárias aos portais dos tribunais"

### Funcionalidades Principais
Grid com 6-8 funcionalidades:
1. Geracao de peticoes com IA
2. Upload de modelos proprios
3. IA que aprende seu estilo
4. Organizacao em pastas
5. Acompanhamento processual automatico
6. Agenda de prazos
7. Pesquisa de jurisprudencia
8. Exportacao em PDF

### Como Funciona
4 passos visuais:
1. **Cadastre** - Clientes e processos
2. **Selecione** - Tipo de peticao e modelo
3. **Gere** - IA cria a peticao completa
4. **Exporte** - PDF pronto para protocolo

### Seguranca e Privacidade
- Dados criptografados
- Conformidade LGPD
- Servidores seguros
- Acesso exclusivo do usuario

### Para Quem
- Advogados autonomos
- Pequenos escritorios
- Profissionais que valorizam produtividade

### FAQ
5-6 perguntas frequentes:
- "A IA substitui o trabalho do advogado?"
- "Meus dados estao seguros?"
- "Posso usar meus proprios modelos?"
- "A plataforma funciona para qual area do direito?"
- "Como funciona o periodo gratuito?"

---

## Aspectos Visuais

### Animacoes
- Fade-in ao scroll (intersection observer)
- Hover suave em cards e botoes
- Transicoes suaves entre secoes

### Responsividade
- Mobile-first design
- Grid adaptativo (1 coluna mobile, 2-3 desktop)
- Header colapsavel em mobile (menu hamburger)

### Cores e Tipografia
- Manter paleta Navy + Gold existente
- Usar fonte serif para titulos (transmite seriedade juridica)
- Gradientes sutis para secoes alternadas

### Icones
- Usar Lucide React (ja instalado)
- Icones relevantes: Scale, FileText, Shield, Clock, Folder, Bell, Search, Download

---

## Arquivos a Criar/Modificar

### Novos Arquivos
```text
src/components/landing/
├── HeroSection.tsx
├── ProblemSection.tsx
├── FeaturesSection.tsx
├── HowItWorksSection.tsx
├── AISection.tsx
├── SecuritySection.tsx
├── TargetAudienceSection.tsx
├── FAQSection.tsx
├── CTASection.tsx
├── LandingHeader.tsx
└── LandingFooter.tsx
```

### Arquivos a Modificar
- **src/pages/Index.tsx**: Reescrever para usar os novos componentes
- **src/index.css**: Adicionar animacoes de scroll se necessario

---

## Fluxo de Navegacao

### Header Fixo
Links de ancoragem para secoes:
- Funcionalidades (#funcionalidades)
- Como Funciona (#como-funciona)
- Seguranca (#seguranca)
- FAQ (#faq)
- Botao "Entrar" (link para /auth)

### Scroll Suave
Implementar scroll suave ao clicar nos links de ancoragem.

---

## Detalhes Tecnicos

### Intersection Observer
Usar para animacoes de entrada ao scroll:
```typescript
// Hook customizado para detectar visibilidade
const useInView = (options) => {
  // Retorna ref e booleano isInView
}
```

### Estrutura do Componente Principal
```typescript
// Index.tsx
<LandingHeader />
<main>
  <HeroSection />
  <ProblemSection />
  <FeaturesSection />
  <HowItWorksSection />
  <AISection />
  <SecuritySection />
  <TargetAudienceSection />
  <FAQSection />
  <CTASection />
</main>
<LandingFooter />
```

---

## Tarefas de Implementacao

1. **Criar estrutura de componentes landing**
   - Criar pasta src/components/landing/
   - Criar componentes base

2. **Implementar HeroSection**
   - Headline, subtitulo, badge, CTAs
   - Animacao de entrada

3. **Implementar ProblemSection**
   - 3 cards com problemas/dores
   - Icones e descricoes

4. **Implementar FeaturesSection**
   - Grid de 6-8 funcionalidades
   - Cards com icones Lucide

5. **Implementar HowItWorksSection**
   - 4 passos visuais conectados
   - Numeracao e setas/linhas

6. **Implementar AISection**
   - Secao destacada
   - Visual diferenciado (fundo gradiente)

7. **Implementar SecuritySection**
   - Selos de seguranca
   - LGPD, criptografia

8. **Implementar TargetAudienceSection**
   - Perfis de usuarios
   - Cards com descricao

9. **Implementar FAQSection**
   - Accordion com perguntas
   - Usar componente Accordion do shadcn

10. **Implementar CTASection**
    - Chamada final forte
    - Botao grande de conversao

11. **Implementar LandingHeader**
    - Header fixo
    - Navegacao com ancoragem
    - Menu mobile (hamburger)

12. **Implementar LandingFooter**
    - Links uteis
    - Copyright atualizado

13. **Reescrever Index.tsx**
    - Montar pagina com todos os componentes
    - Manter logica de redirect para usuarios logados

14. **Adicionar animacoes CSS**
    - Classes para fade-in on scroll
    - Transicoes suaves

---

## Resultado Esperado

Uma landing page profissional que:
- Apresenta claramente o produto e suas funcionalidades
- Transmite confianca e seguranca
- Destaca o diferencial da IA
- Converte visitantes em usuarios
- Funciona perfeitamente em desktop e mobile
- Mantém a identidade visual Navy + Gold do projeto
