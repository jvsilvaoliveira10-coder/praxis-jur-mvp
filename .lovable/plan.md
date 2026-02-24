

# Plano: Edge Functions de Alerta por Email + Resumo Diario

## Visao Geral

Criar as duas Edge Functions de envio de email via Resend, integrar com `check-deadlines`, adicionar UNIQUE constraint na tabela `notification_preferences`, e garantir que usuarios existentes tenham notificacoes por email desativadas por padrao enquanto novos usuarios recebem ativadas.

---

## Passo 1: Solicitar RESEND_API_KEY

Usar a ferramenta de secrets para pedir ao usuario a chave API do Resend.

---

## Passo 2: Migracao de Banco

Duas mudancas na tabela `notification_preferences`:

1. **UNIQUE constraint** em `user_id` para permitir `upsert` na tela de configuracoes
2. **Trigger para novos usuarios**: criar automaticamente uma linha em `notification_preferences` com `email_alerts_enabled = true` quando um novo usuario se registra (via trigger no `auth.users`)

Para usuarios existentes que ainda nao tem linha na tabela, a UI vai mostrar email desativado por padrao (mudanca no componente `NotificationPreferencesTab`).

```sql
-- Unique constraint
ALTER TABLE public.notification_preferences 
  ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);

-- Trigger para auto-criar preferencias para novos usuarios (com email ativado)
CREATE OR REPLACE FUNCTION public.handle_new_user_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id, email_alerts_enabled)
  VALUES (NEW.id, true);
  RETURN NEW;
END;
$$;

-- Nota: o trigger sera criado no auth.users via a mesma abordagem dos triggers existentes
```

---

## Passo 3: Mudanca no Frontend - Default para usuarios existentes

No componente `NotificationPreferencesTab` em `Settings.tsx`, mudar o estado inicial de `email_alerts_enabled` de `true` para `false`. Assim:

- **Usuarios existentes** (sem linha na tabela): verao email desativado
- **Novos usuarios** (com linha auto-criada pelo trigger): verao email ativado (valor do banco)

Mudanca na linha 61:
```typescript
// De:
email_alerts_enabled: true,
// Para:
email_alerts_enabled: false,
```

---

## Passo 4: Edge Function `send-urgent-alerts`

**Arquivo:** `supabase/functions/send-urgent-alerts/index.ts`

Recebe `user_id`, `deadline_title`, `message` no body. Logica:

1. Busca `notification_preferences` do usuario (via service role)
2. Se `email_alerts_enabled` e `urgent_alerts_enabled` estao ativos:
   - Busca email do usuario na tabela `profiles`
   - Envia email HTML via Resend com template de alerta urgente (fundo vermelho, dados do prazo)
3. Retorna status do envio

Template do email:
- Assunto: "URGENTE: Prazo vence hoje/amanha"
- Corpo: alerta visual com detalhes do prazo e link para a plataforma

---

## Passo 5: Edge Function `send-daily-digest`

**Arquivo:** `supabase/functions/send-daily-digest/index.ts`

Funcao para ser chamada via cron (1x/dia as 07:00 BRT). Logica:

1. Busca todos usuarios com `daily_digest_enabled = true`
2. Para cada usuario:
   - Busca `tracked_processes` ativos
   - Busca `process_movements` das ultimas 24h desses processos
   - Se nao houver movimentacoes, pula
   - Busca email em `profiles`
   - Monta email HTML com lista de processos e movimentacoes
   - Envia via Resend
3. Retorna contadores

Template do email:
- Assunto: "Resumo Diario - X processos com movimentacao"
- Corpo: tabela com cada processo e suas movimentacoes do dia

---

## Passo 6: Integrar `check-deadlines` com alertas

Modificar `supabase/functions/check-deadlines/index.ts`:

Apos inserir notificacoes de prazo urgente (1 dia), fazer chamada HTTP interna para `send-urgent-alerts` para cada usuario afetado, passando os dados do prazo.

---

## Passo 7: Agendar digest diario via pg_cron

Criar cron job para chamar `send-daily-digest` diariamente as 10:00 UTC (07:00 BRT):

```sql
SELECT cron.schedule(
  'send-daily-digest-7am',
  '0 10 * * *',
  $$ SELECT net.http_post(...) $$
);
```

---

## Resumo de Arquivos

| Acao | Arquivo |
|------|---------|
| Criar | `supabase/functions/send-urgent-alerts/index.ts` |
| Criar | `supabase/functions/send-daily-digest/index.ts` |
| Modificar | `supabase/functions/check-deadlines/index.ts` (adicionar chamada ao send-urgent-alerts) |
| Modificar | `src/pages/Settings.tsx` (mudar default email_alerts_enabled para false) |
| Migracao | UNIQUE constraint + trigger para novos usuarios |

## Secrets necessarios

| Secret | Status |
|--------|--------|
| `RESEND_API_KEY` | Precisa ser adicionado pelo usuario |

