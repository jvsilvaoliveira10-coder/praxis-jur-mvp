
# Corrigir Logos e Credito "Por: Joao Oliveira"

## Resumo

Adicionar os SVGs corretos ao projeto e usar a versao adequada de cada logo conforme o fundo:
- **Logo branca** em fundos escuros (sidebar, onboarding sidebar)
- **Logo colorida** em fundos claros (landing page, auth, pricing, mobile header)
- Centralizar o texto "Por: Joao Oliveira" abaixo da logo, em branco e negrito

## Arquivos de logo

Copiar os 3 SVGs enviados para `src/assets/`:
- `praxis_jur_logo_white.svg` (logo branca para fundos escuros)
- `praxis_jur_logo_color.svg` (logo colorida para fundos claros)
- `praxis_jur_icon_only.svg` (icone solo, para sidebar colapsado)

## Mapeamento de uso

| Local | Fundo | Logo a usar |
|-------|-------|-------------|
| Sidebar desktop (expandido) | Azul escuro | Branca |
| Sidebar desktop (colapsado) | Azul escuro | Icon only (branca) -- usaremos o icon_only |
| Sidebar mobile | Azul escuro | Branca |
| OnboardingSidebar | Azul escuro gradiente | Branca |
| LandingHeader | Claro | Colorida |
| LandingFooter | Claro (bg-card) | Colorida |
| Auth page | Claro | Colorida |
| Pricing page | Claro | Colorida |
| MainLayout mobile header | Header escuro | Branca |

## Credito "Por: Joao Oliveira"

Ajustar nos locais onde ja existe e onde faz sentido:
- **Sidebar**: centralizado abaixo da logo, texto branco (`text-white`) e negrito (`font-bold`), `text-[10px]`
- **LandingFooter**: centralizado abaixo da logo, texto branco (`text-white`) e negrito (`font-bold`), `text-[10px]`

---

## Secao Tecnica

### Arquivos modificados

| Arquivo | Mudanca |
|---------|---------|
| `src/assets/` | Copiar 3 SVGs (white, color, icon_only) |
| `src/components/layout/Sidebar.tsx` | Import logo branca + icon_only; centralizar credito; texto branco bold |
| `src/components/landing/LandingHeader.tsx` | Import logo colorida SVG |
| `src/components/landing/LandingFooter.tsx` | Import logo colorida SVG; centralizar credito; texto branco bold |
| `src/components/onboarding/OnboardingSidebar.tsx` | Import logo branca SVG |
| `src/pages/Auth.tsx` | Import logo colorida SVG |
| `src/pages/Pricing.tsx` | Import logo colorida SVG |
| `src/components/layout/MainLayout.tsx` | Import logo branca SVG (mobile header tem fundo escuro) |

### Padrao de importacao

Usar ES6 imports de `src/assets/` para melhor bundling:

```typescript
import logoWhite from "@/assets/praxis_jur_logo_white.svg";
import logoColor from "@/assets/praxis_jur_logo_color.svg";
import logoIcon from "@/assets/praxis_jur_icon_only.svg";
```

### Estilo do credito

```html
<p class="text-[10px] text-white font-bold mt-0.5 text-center">
  Por: Joao Oliveira
</p>
```
