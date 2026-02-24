

# Plano: 3 Funcionalidades Premium + Alertas WhatsApp/Email

## Visao Geral

Implementar as 3 funcionalidades premium ja aprovadas (Painel de Prazos, Modelos de Peticao com IA, Relatorios PDF para Clientes) e adicionar integracao de alertas via WhatsApp e email com dois fluxos:
- **Alertas urgentes** (prazos com menos de 24h): enviados imediatamente via WhatsApp e email
- **Resumo diario**: email enviado 1x por dia com todos os processos que tiveram novas movimentacoes

---

## 1. Painel de Prazos Inteligente com Countdown

### Novo arquivo
| Arquivo | Descricao |
|---------|-----------|
| `src/components/dashboard/DeadlineCountdownPanel.tsx` | Componente colapsavel com cards de countdown coloridos |

### Arquivo modificado
| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Dashboard.tsx` | Adicionar `<DeadlineCountdownPanel />` apos o AIInsightsCard |

### Logica
- Buscar proximos 10 prazos do usuario (`deadlines` com `deadline_datetime > now()`)
- Cards com countdown em tempo real (atualizado a cada minuto via `setInterval`)
- Cores: vermelho (menos de 24h), amarelo (1-3 dias), verde (mais de 3 dias), cinza (vencido)
- Badge com tipo do prazo, link para `/agenda`
- Colapsavel igual ao AIInsightsCard (abre ao clicar)

---

## 2. Modelos de Peticao com Preenchimento Automatico por IA

### Novos arquivos
| Arquivo | Descricao |
|---------|-----------|
| `src/components/petitions/PetitionTemplateLibrary.tsx` | Sheet com grade de modelos disponiveis |
| `src/lib/petition-ai-templates.ts` | Prompts especializados por tipo de peticao |

### Arquivo modificado
| Arquivo | Mudanca |
|---------|---------|
| `src/pages/PetitionForm.tsx` | Adicionar botao "Usar Modelo IA" que abre a biblioteca |

### Modelos disponiveis
Peticao Inicial, Contestacao, Recurso de Apelacao, Agravo de Instrumento, Embargos de Declaracao, Habeas Corpus, Mandado de Seguranca, Peticao Intercorrente

### Logica
- Cada modelo tem prompt especializado (ex: Embargos foca em omissao/contradicao/obscuridade)
- Ao selecionar: seta `petition_type`, pre-preenche campos guia, injeta dados do caso/cliente
- Usa o hook `usePetitionGeneration` e a edge function `generate-petition` existentes

---

## 3. Relatorios PDF Executivos para Clientes

### Novos arquivos
| Arquivo | Descricao |
|---------|-----------|
| `src/lib/client-report-export.ts` | Funcao que gera PDF com jsPDF (cabecalho branded, movimentacoes, prazos, financeiro) |
| `src/components/reports/ClientReportDialog.tsx` | Dialog para selecionar secoes a incluir |

### Arquivo modificado
| Arquivo | Mudanca |
|---------|---------|
| `src/pages/LegalReports.tsx` | Nova aba "Relatorio para Cliente" com selecao de processo e botao de geracao |

### Estrutura do PDF
Cabecalho com logo/OAB do escritorio, resumo do processo, ultimas 10 movimentacoes, proximos prazos, situacao financeira (honorarios pagos/pendentes), assinatura do advogado.

---

## 4. Alertas via WhatsApp e Email

### 4a. Infraestrutura de Email (Resend)

Sera necessario configurar um servico de envio de email. O Resend eh a opcao mais simples e tem plano gratuito com 100 emails/dia.

**Secret necessario:** `RESEND_API_KEY` (sera solicitado ao usuario)

### 4b. Integracao WhatsApp (API do WhatsApp Business / Twilio)

Para envio de mensagens no WhatsApp, sera necessario um provedor como Twilio ou a API oficial do WhatsApp Business.

**Secrets necessarios:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` (sera solicitado ao usuario)

### 4c. Tabela de preferencias de notificacao

Nova tabela `notification_preferences` para armazenar:
- `user_id` (referencia)
- `email_alerts_enabled` (boolean, default true)
- `whatsapp_alerts_enabled` (boolean, default false)
- `whatsapp_number` (text, numero do usuario)
- `daily_digest_enabled` (boolean, default true)
- `urgent_alerts_enabled` (boolean, default true)
- RLS: acesso exclusivo do proprietario

### 4d. Edge Function: `send-urgent-alerts`

Nova edge function que sera chamada pela `check-deadlines` existente quando um prazo tem menos de 24h:
- Busca preferencias do usuario na `notification_preferences`
- Se `email_alerts_enabled`: envia email via Resend com detalhes do prazo urgente
- Se `whatsapp_alerts_enabled`: envia mensagem via Twilio/WhatsApp
- Template de mensagem: "URGENTE: Prazo [titulo] vence [hoje/amanha]. Processo: [numero]."

### 4e. Edge Function: `send-daily-digest`

Nova edge function agendada via `pg_cron` para rodar 1x por dia as 07:00 BRT:
- Para cada usuario com `daily_digest_enabled = true`:
  - Busca movimentacoes das ultimas 24h na tabela `process_movements`
  - Se houver movimentacoes, monta email HTML com:
    - Lista de processos com novas movimentacoes
    - Detalhes de cada movimentacao (nome, data, orgao julgador)
    - Link para a plataforma
  - Envia via Resend

### 4f. Modificacoes nas Edge Functions existentes

| Arquivo | Mudanca |
|---------|---------|
| `supabase/functions/check-deadlines/index.ts` | Apos criar notificacao de 1 dia, chamar `send-urgent-alerts` para o usuario |
| `supabase/functions/check-movements/index.ts` | Nenhuma mudanca (o digest roda separado) |

### 4g. Tela de Configuracao

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Settings.tsx` | Nova aba "Notificacoes" com toggles para email/WhatsApp, campo de numero WhatsApp, toggle de resumo diario |

---

## Secao Tecnica

### Ordem de implementacao

1. Painel de Prazos (componente isolado, sem dependencias)
2. Modelos de Peticao com IA (usa infra existente)
3. Relatorios PDF para Clientes (usa jsPDF existente)
4. Tabela `notification_preferences` + tela de configuracao
5. Edge Function `send-urgent-alerts` (apos usuario configurar RESEND_API_KEY e opcionalmente Twilio)
6. Edge Function `send-daily-digest` + agendamento via pg_cron
7. Integrar `check-deadlines` com alertas urgentes

### Migracao de banco necessaria

```sql
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  whatsapp_alerts_enabled BOOLEAN NOT NULL DEFAULT false,
  whatsapp_number TEXT,
  daily_digest_enabled BOOLEAN NOT NULL DEFAULT true,
  urgent_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Politicas RLS
CREATE POLICY "Users can view their own preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);
```

### Secrets necessarios

| Secret | Servico | Obrigatorio |
|--------|---------|-------------|
| `RESEND_API_KEY` | Resend (email) | Sim, para email |
| `TWILIO_ACCOUNT_SID` | Twilio (WhatsApp) | Opcional |
| `TWILIO_AUTH_TOKEN` | Twilio (WhatsApp) | Opcional |
| `TWILIO_WHATSAPP_FROM` | Twilio (WhatsApp) | Opcional |

### Dependencias existentes (nenhuma nova)

jsPDF, date-fns, lucide-react, recharts - todos ja instalados.

### Fluxo de alertas urgentes

```text
pg_cron (diario 06:00)
  |
  v
check-deadlines (edge function)
  |
  |--> Prazo <= 24h detectado
  |      |
  |      v
  |    Cria notificacao in-app (notifications table)
  |      |
  |      v
  |    Chama send-urgent-alerts
  |      |
  |      |--> Busca notification_preferences do usuario
  |      |--> Email habilitado? --> Envia via Resend
  |      |--> WhatsApp habilitado? --> Envia via Twilio
  |
  v
check-movements (edge function separada)
  |
  |--> Novas movimentacoes detectadas
  |      |
  |      v
  |    Cria notificacao in-app
  |    (movimentacoes serao consolidadas no digest)
```

### Fluxo do resumo diario

```text
pg_cron (diario 07:00)
  |
  v
send-daily-digest (nova edge function)
  |
  |--> Para cada usuario com daily_digest_enabled = true:
  |      |
  |      v
  |    Busca process_movements das ultimas 24h
  |    (via tracked_processes do usuario)
  |      |
  |      |--> Sem movimentacoes? --> Pula usuario
  |      |--> Com movimentacoes? --> Monta HTML e envia email via Resend
```

