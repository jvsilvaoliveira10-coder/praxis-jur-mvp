

# Redesign Premium dos Cards de Preco + Limpeza de Textos "Gratis"

## Objetivo

1. Redesenhar os cards de plano (tanto na landing page quanto na pagina `/pricing`) com visual premium e sofisticado
2. Redesenhar o bloco de garantia de 7 dias para ser mais impactante e imersivo
3. Remover todas as referencias a "gratis", "sem cartao de credito" e "periodo gratuito" em toda a landing page

---

## Mudancas

### 1. Cards de Plano - Visual Premium (ambos os arquivos)

Redesenhar os cards em `PricingSection.tsx` e `Pricing.tsx` com:

- Fundo com gradiente sutil diferenciado por plano (neutro para Essencial, primary para Profissional, escuro/sofisticado para Escritorio)
- Card do plano Profissional (destacado) com fundo gradiente primary, texto claro, borda luminosa e sombra colorida
- Icone decorativo por plano no topo do card (ex: Scale, Crown, Building2)
- Separador visual entre preco e features
- Badge de economia com fundo colorido mais forte
- Botao do plano destacado com gradiente e efeito hover
- Rounded-2xl com padding maior para respirar
- Feature list com checks em circulos preenchidos ao inves de simples

### 2. Bloco de Garantia - Visual Impactante (ambos os arquivos)

Redesenhar o bloco de garantia para ser mais grandioso:

- Borda dupla com gradiente animado sutil (pulse)
- Icone do escudo maior (48px) com fundo em gradiente e sombra
- Tipografia maior e mais bold no titulo
- Os 3 pontos da checklist em cards individuais com icone, titulo e subtitulo
- Fundo com pattern decorativo (dots ou grid sutil)

### 3. HeroSection.tsx - Remover referencias a "gratis"

- Badge "Gratis por tempo limitado" -> "Plataforma juridica completa" ou "Hub 360 para advogados"
- Botao "Comecar Gratuitamente" -> "Comecar Agora" direcionando para `/pricing`
- Trust indicator "Sem cartao de credito" -> "Garantia de 7 dias" ou "Risco zero"

### 4. FAQSection.tsx - Atualizar FAQ sobre periodo gratuito

- Mudar pergunta "Como funciona o periodo gratuito?" para "Como funciona a garantia de 7 dias?"
- Atualizar resposta explicando que ao assinar, a pessoa tem 7 dias para testar e, se nao gostar, recebe reembolso integral sem perguntas

---

## Secao Tecnica

### Arquivos modificados

| Arquivo | Mudanca |
|---------|-----------|
| `src/components/landing/PricingSection.tsx` | Cards premium + garantia impactante |
| `src/pages/Pricing.tsx` | Cards premium + garantia impactante (mesmo estilo) |
| `src/components/landing/HeroSection.tsx` | Remover "gratis", "sem cartao", atualizar CTA |
| `src/components/landing/FAQSection.tsx` | Atualizar FAQ sobre periodo gratuito -> garantia 7 dias |

### Nenhum arquivo novo necessario

Todas as mudancas sao em arquivos existentes.

### Design dos cards por tier

- **Essencial**: Card com fundo `bg-card`, borda normal, icone Scale em muted
- **Profissional**: Card com fundo gradiente primary (`from-primary to-primary/90`), texto branco, borda primary com glow (`shadow-primary/25`), badge "Mais Popular" branco, icone Crown
- **Escritorio**: Card com fundo `bg-card` com borda mais forte, icone Building2 em foreground

### Garantia - layout dos 3 pontos

Em vez de uma lista simples, os 3 pontos de garantia serao apresentados como mini-cards lado a lado, cada um com:
- Icone em circulo (ShieldCheck, Mail, ThumbsUp)
- Titulo bold
- Subtitulo em muted

