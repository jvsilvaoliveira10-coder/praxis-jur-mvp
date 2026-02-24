

# Atualizar Landing Page e Onboarding com as Novidades

## Visao Geral

Adicionar as 4 funcionalidades premium recentes na landing page e no sistema de onboarding (tour + checklist), para que visitantes e novos usuarios conheçam os novos recursos.

---

## 1. Landing Page - FeaturesSection

Adicionar as novidades nos modulos existentes da `FeaturesSection.tsx`:

### Modulo "Producao Juridica"
- **Modelos de Peticao com IA**: "Escolha entre 8 modelos especializados (Habeas Corpus, Embargos, etc.) com preenchimento automatico por IA."
  - Icone: `BookTemplate`
- **Relatorios PDF para Clientes**: "Gere relatorios executivos em PDF com movimentacoes, prazos e situacao financeira do processo."
  - Icone: `FileText` ou `FileDown`

### Modulo "Gestao de Processos"
- **Painel de Prazos com Countdown**: "Veja seus prazos em countdown em tempo real com alertas visuais por urgencia (vermelho, amarelo, verde)."
  - Icone: `Timer`
- **Alertas por Email**: "Receba alertas urgentes e resumo diario de movimentacoes por email automaticamente."
  - Icone: `Mail`

Substituir ou reorganizar features existentes para incluir as novas (manter 6 por modulo para layout consistente).

---

## 2. Landing Page - AISection

Atualizar a lista de beneficios em `AISection.tsx` para incluir:
- "8 modelos especializados com prompts otimizados"
- "Preenchimento automatico de dados do caso e cliente"

---

## 3. Landing Page - HeroSection

Atualizar os indicadores de confianca (trust indicators) no `HeroSection.tsx`:
- Adicionar: "Alertas por email em tempo real" ou "Prazos com countdown inteligente"

---

## 4. Onboarding - Tour Steps

Atualizar `tourSteps.ts` para incluir mencao as novidades nas descricoes dos steps existentes:

| Step existente | Mudanca na descricao |
|----------------|---------------------|
| `dashboard` | Mencionar o painel de prazos com countdown |
| `petitions` | Mencionar os 8 modelos especializados com IA |
| `notifications` | Mencionar alertas urgentes por email |

Nao sera necessario adicionar novos steps - as novidades complementam funcionalidades ja mapeadas no tour.

---

## 5. Onboarding - Checklist Modules

Atualizar `checklistModules.ts` para adicionar novas tarefas nos modulos existentes:

### Modulo Juridico - Novas tarefas
| Tarefa | Descricao | Rota | Campo de progresso |
|--------|-----------|------|--------------------|
| Usar modelo de peticao IA | Gere uma peticao usando um dos modelos especializados | `/petitions/new` | `ai_template_used` |
| Gerar relatorio para cliente | Crie um relatorio PDF executivo | `/reports` | `client_report_generated` |

### Modulo Juridico - Atualizar descricao existente
- Task `petition`: atualizar descricao para mencionar os modelos IA

**Nota:** Os novos campos de progresso (`ai_template_used`, `client_report_generated`) precisarao de uma migracao para adicionar colunas na tabela `onboarding_progress` (se existir) ou serao tratados via localStorage/estado local.

---

## Secao Tecnica

### Arquivos modificados

| Arquivo | Mudanca |
|---------|---------|
| `src/components/landing/FeaturesSection.tsx` | Substituir 2 features no modulo juridico e 2 no modulo processos pelas novidades |
| `src/components/landing/AISection.tsx` | Adicionar 2 beneficios sobre modelos IA |
| `src/components/landing/HeroSection.tsx` | Atualizar trust indicator |
| `src/components/onboarding/tourSteps.ts` | Atualizar descricoes dos steps dashboard, petitions e notifications |
| `src/components/onboarding/checklistModules.ts` | Adicionar 2 novas tarefas ao modulo juridico |

### Migracao de banco (se necessario)

Verificar se a tabela `onboarding_progress` existe e se precisa de novas colunas para os campos `ai_template_used` e `client_report_generated`. Caso a tabela nao tenha essas colunas, criar migracao:

```sql
ALTER TABLE public.onboarding_progress 
  ADD COLUMN IF NOT EXISTS ai_template_used BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS client_report_generated BOOLEAN DEFAULT false;
```

### Nenhuma nova dependencia necessaria

Todos os icones (Timer, Mail, BookTemplate) ja estao disponiveis no lucide-react instalado.

