
# Reforcar a Garantia de 7 Dias - Risco Zero

## Objetivo

Transformar a garantia de 7 dias de um simples banner discreto em um elemento de destaque que transmita confianca absoluta ao visitante. A mensagem central: **"Voce nao tem nenhum risco. Se nao gostar, devolvemos 100% do seu dinheiro em ate 7 dias."**

---

## Mudancas

### 1. Pagina `/pricing` (`src/pages/Pricing.tsx`)

Substituir o banner discreto atual (linha 170-177) por um bloco de garantia grande e visualmente impactante:

- Card com borda verde/primary, icone de escudo grande (32px+), fundo com gradiente sutil
- Titulo em destaque: "Garantia Absoluta de 7 Dias"
- Subtitulo explicativo: "Teste o Praxis Jur sem nenhum risco. Se nao estiver 100% satisfeito nos primeiros 7 dias, basta enviar um e-mail e devolvemos cada centavo. Sem perguntas, sem burocracia."
- Checklist visual com 3 pontos:
  - "Reembolso integral, sem perguntas"
  - "Cancele por e-mail a qualquer momento"
  - "Sem risco nenhum para voce"

### 2. Landing Page - Nova secao de garantia (`src/components/landing/PricingSection.tsx`)

Criar o componente `PricingSection` que inclui:

- Toggle anual/mensal + 3 cards de plano (reutilizando dados de `stripe-plans.ts`)
- Botoes "Ver planos" que direcionam para `/pricing`
- Logo abaixo dos cards, o **mesmo bloco de garantia robusto** descrito acima, com animacao de entrada (useInView)
- `id="precos"` para scroll suave do header

### 3. Landing Page - Inserir secao (`src/pages/Index.tsx`)

Importar e renderizar `<PricingSection />` entre `TargetAudienceSection` e `FAQSection`.

### 4. CTA Section (`src/components/landing/CTASection.tsx`)

- Trocar o botao "Criar Conta Gratuita" por "Comece Agora" direcionando para `#precos` ou `/pricing`
- Substituir o texto "Sem cartao de credito / Gratis por tempo limitado" por uma frase de garantia: "7 dias de garantia absoluta - seu dinheiro de volta se nao gostar"

### 5. Header da Landing (`src/components/landing/LandingHeader.tsx`)

- Mudar o link "Precos" de rota `/pricing` para ancora `#precos` (scroll suave na propria landing)

---

## Secao Tecnica

### Arquivos criados

| Arquivo | Descricao |
|---------|-----------|
| `src/components/landing/PricingSection.tsx` | Secao completa de precos + garantia para a landing page |

### Arquivos modificados

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Pricing.tsx` | Substituir banner de garantia discreto por bloco grande e impactante |
| `src/pages/Index.tsx` | Importar e renderizar PricingSection |
| `src/components/landing/CTASection.tsx` | Atualizar botao e texto para refletir modelo pago com garantia |
| `src/components/landing/LandingHeader.tsx` | Link "Precos" como ancora `#precos` |
