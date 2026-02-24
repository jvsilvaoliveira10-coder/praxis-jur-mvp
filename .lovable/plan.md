

# Implementar Monetizacao com Stripe - 3 Planos de Assinatura

## Visao Geral

Integrar o Stripe para cobrar assinaturas mensais e anuais com 3 tiers. O preco anual e exibido por padrao na UI. Cobranca imediata com garantia de reembolso em 7 dias (via email).

---

## Precos Finais

| Plano | Anual (por mes) | Total Anual | Mensal |
|-------|-----------------|-------------|--------|
| Essencial | R$59,90/mes | R$718,80/ano | R$79,90/mes |
| Profissional | R$99,90/mes | R$1.198,80/ano | R$119,90/mes |
| Escritorio | R$149,90/mes | R$1.798,80/ano | R$179,90/mes |

---

## Etapas de Implementacao

### 1. Criar Produtos e Precos no Stripe

3 produtos com 2 precos cada (6 precos no total):

- **Essencial**: mensal R$79,90 (7990 centavos) + anual R$718,80 (71880 centavos)
- **Profissional**: mensal R$119,90 (11990 centavos) + anual R$1.198,80 (119880 centavos)
- **Escritorio**: mensal R$179,90 (17990 centavos) + anual R$1.798,80 (179880 centavos)

### 2. Edge Function: `check-subscription`

Verifica se o usuario tem assinatura ativa no Stripe (busca por email). Retorna:
- `subscribed` (boolean)
- `product_id` (identifica o tier)
- `subscription_end` (data)

Chamada automaticamente no login, page load e a cada minuto.

### 3. Edge Function: `create-checkout`

Recebe `price_id`, cria ou reutiliza customer no Stripe vinculado ao email do usuario, retorna URL do Stripe Checkout (abre em nova aba).

### 4. Edge Function: `customer-portal`

Cria sessao do Stripe Customer Portal para gerenciar cartao, faturas e cancelamento.

### 5. Atualizar AuthContext

Adicionar ao estado global:
- `subscribed` (boolean)
- `subscriptionTier` ("essencial" | "profissional" | "escritorio" | null)
- `subscriptionEnd` (string | null)

Chamar `check-subscription` apos login e periodicamente.

### 6. Nova pagina `/pricing`

- Toggle Anual/Mensal (anual por padrao)
- 3 cards com nome, preco, badge "Economize R$X" no anual
- Badge "Mais Popular" no Profissional
- Lista de funcionalidades por plano
- Botao "Assinar" que redireciona para Stripe Checkout
- Nota: "Garantia de 7 dias - cancele e receba reembolso integral"

**Funcionalidades por plano:**

**Essencial:**
- Ate 30 processos ativos
- Gestao de clientes e prazos
- Templates manuais de peticoes
- Monitoramento de 10 processos (DataJud)
- 1 usuario

**Profissional (Mais Popular):**
- Processos ilimitados
- Geracao de peticoes com IA (8 modelos)
- Alertas por email automaticos
- Relatorios PDF para clientes
- Modulo financeiro completo
- Ate 3 usuarios

**Escritorio:**
- Tudo do Profissional
- Usuarios ilimitados
- Dashboards financeiros avancados (DRE, Fluxo de Caixa)
- Insights de IA para o negocio
- Suporte prioritario

### 7. Atualizar Settings - Aba Assinatura

- Plano atual, status, proxima cobranca
- Botao "Gerenciar Assinatura" (Customer Portal)
- Se nao tem assinatura, link para `/pricing`

### 8. Landing Header + Rota

- Adicionar "Precos" no nav do `LandingHeader.tsx`
- Adicionar rota `/pricing` no `App.tsx`

---

## Secao Tecnica

### Arquivos criados

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/Pricing.tsx` | Pagina de precos com toggle anual/mensal |
| `supabase/functions/check-subscription/index.ts` | Verifica assinatura via Stripe API |
| `supabase/functions/create-checkout/index.ts` | Cria sessao de checkout |
| `supabase/functions/customer-portal/index.ts` | Cria sessao do portal do cliente |

### Arquivos modificados

| Arquivo | Mudanca |
|---------|---------|
| `src/App.tsx` | Rota `/pricing` |
| `src/contexts/AuthContext.tsx` | Estado de subscription + check automatico |
| `src/pages/Settings.tsx` | Aba Assinatura com dados reais |
| `src/components/landing/LandingHeader.tsx` | Link "Precos" |

### Mapeamento de tiers

Constante no frontend com product_ids e price_ids do Stripe para cada plano, permitindo identificar qual tier o usuario possui e qual preco enviar ao checkout.

### Sem tabela de subscriptions

Verificacao feita diretamente via API do Stripe (por email), sem tabela local.

### Sem webhook

Arquitetura usa polling via `check-subscription`.

