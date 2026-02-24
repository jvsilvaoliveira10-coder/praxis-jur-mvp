
# Corrigir Sobreposicao Checklist/IA + Credito "Por: João Oliveira"

## Problema 1: Sobreposicao no canto inferior direito

O checklist de onboarding e o botao da IA juridica usam a mesma posicao (`fixed bottom-6 right-6 z-50`), causando sobreposicao.

**Solucao:** Reposicionar o checklist de onboarding:
- **Minimizado**: mover para `bottom-6 right-24` (ao lado esquerdo do botao da IA)
- **Expandido**: mover para `bottom-24 right-6` (acima do botao da IA)

O `LegalChatWidget` permanece inalterado na posicao original.

## Problema 2: Credito "Por: João Oliveira"

Adicionar o texto discreto "Por: João Oliveira" em dois locais:

### Sidebar (desktop e mobile)
- Logo do texto abaixo da logo, em `text-[10px] text-sidebar-foreground/50`
- No modo colapsado, o texto fica oculto

### Landing Page Footer
- Abaixo da logo, mesmo estilo discreto

---

## Secao Tecnica

| Arquivo | Mudanca |
|---------|---------|
| `src/components/onboarding/OnboardingChecklist.tsx` | Alterar posicao `fixed` do minimizado para `right-24` e do expandido para `bottom-24` |
| `src/components/layout/Sidebar.tsx` | Adicionar "Por: João Oliveira" abaixo da logo (mobile e desktop) |
| `src/components/landing/LandingFooter.tsx` | Adicionar "Por: João Oliveira" abaixo da logo |
