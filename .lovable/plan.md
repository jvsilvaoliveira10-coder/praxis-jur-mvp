
# Plano: Sistema de Onboarding e Configuracoes do Escritorio

## Visao Geral

Vou implementar um sistema completo com duas partes:
1. **Onboarding Wizard** - Popup progressivo apos o cadastro para coletar dados do escritorio
2. **Pagina de Configuracoes** - Onde o usuario pode editar esses dados posteriormente

---

## Analise da Situacao Atual

### Banco de Dados
A tabela `profiles` atual e muito simples:
- `id`, `user_id`, `name`, `email`, `role`, `created_at`, `updated_at`

Nao existe storage bucket para logos.

### Fluxo de Autenticacao
- Apos signup, usuario e redirecionado direto para `/dashboard`
- Nao ha nenhuma verificacao de "perfil completo"

---

## Estrutura de Dados Proposta

### Nova Tabela: `law_firm_settings`

Dados do escritorio/advogado que serao coletados:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK para auth.users |
| `firm_name` | text | Nome do escritorio |
| `lawyer_name` | text | Nome do advogado titular |
| `oab_number` | text | Numero da OAB |
| `oab_state` | text | Estado da OAB (SP, RJ, etc) |
| `logo_url` | text | URL do logo (storage) |
| `phone` | text | Telefone principal |
| `whatsapp` | text | WhatsApp do escritorio |
| `email` | text | Email de contato |
| `website` | text | Site do escritorio |
| **Endereco** | | |
| `address_street` | text | Logradouro |
| `address_number` | text | Numero |
| `address_complement` | text | Complemento |
| `address_neighborhood` | text | Bairro |
| `address_city` | text | Cidade |
| `address_state` | text | Estado |
| `address_zip` | text | CEP |
| **Estrutura do Escritorio** | | |
| `firm_type` | enum | solo, partnership, firm |
| `lawyers_count` | integer | Quantidade de advogados |
| `interns_count` | integer | Quantidade de estagiarios |
| `staff_count` | integer | Funcionarios administrativos |
| `clients_range` | enum | 1-10, 11-50, 51-200, 200+ |
| `cases_monthly_avg` | integer | Media de processos por mes |
| **Areas de Atuacao** | | |
| `practice_areas` | text[] | Array de areas (Civel, Criminal, Trabalhista, etc) |
| `main_courts` | text[] | Tribunais mais usados |
| **Preferencias** | | |
| `onboarding_completed` | boolean | Se completou o onboarding |
| `onboarding_step` | integer | Etapa atual do onboarding (para retomar) |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### Storage Bucket: `firm-logos`
Para armazenar os logos dos escritorios.

---

## Onboarding Wizard

### Design do Fluxo

```text
+------------------------------------------------------------------+
|                                                                  |
|   [====--------------------] Etapa 1 de 5                        |
|                                                                  |
|   Bem-vindo ao Praxis AI!                                        |
|   Vamos configurar seu escritorio em poucos minutos.             |
|                                                                  |
|   +----------------------------------------------------------+   |
|   |                                                          |   |
|   |   ETAPA ATUAL: Dados do Advogado                         |   |
|   |                                                          |   |
|   |   Nome Completo: [____________________________]          |   |
|   |   OAB: [_______] - [SP v]                                |   |
|   |   Telefone: [____________________________]               |   |
|   |   WhatsApp: [____________________________]               |   |
|   |                                                          |   |
|   +----------------------------------------------------------+   |
|                                                                  |
|   [Pular por agora]                        [Continuar ->]        |
|                                                                  |
+------------------------------------------------------------------+
```

### Etapas do Wizard

**Etapa 1: Dados do Advogado**
- Nome completo
- Numero OAB + Estado
- Telefone
- WhatsApp

**Etapa 2: Escritorio**
- Nome do escritorio
- Logo (upload)
- Email comercial
- Website (opcional)

**Etapa 3: Endereco**
- CEP (com busca automatica)
- Logradouro, numero, complemento
- Bairro, cidade, estado

**Etapa 4: Estrutura**
- Tipo de escritorio (Solo / Associado / Sociedade)
- Quantos advogados
- Quantos estagiarios
- Quantos funcionarios
- Faixa de clientes ativos

**Etapa 5: Areas de Atuacao**
- Checkbox com areas principais
- Tribunais mais utilizados
- Media de novos processos por mes

### Comportamento
- Apos signup, verifica se `onboarding_completed = false`
- Se nao completou, abre o wizard automaticamente
- Dados salvos a cada etapa (pode retomar depois)
- Botao "Pular" disponivel (completa mais tarde)
- Ao finalizar, redireciona para Dashboard com toast de boas-vindas

---

## Pagina de Configuracoes

Nova pagina `/configuracoes` com abas:

### Tab 1: Meu Perfil
- Dados pessoais do usuario
- OAB
- Alterar senha

### Tab 2: Escritorio
- Logo
- Nome do escritorio
- Contatos (telefone, email, WhatsApp, site)
- Endereco completo

### Tab 3: Estrutura
- Tipo de escritorio
- Quantidade de colaboradores
- Areas de atuacao
- Tribunais

### Tab 4: Assinatura
- Plano atual
- Link para Stripe (futuro)

---

## Dados Sugeridos para Coletar (Adicionais)

Baseado em sistemas juridicos profissionais:

1. **Identificacao Profissional**
   - Nome completo
   - OAB (numero + estado)
   - CPF (para documentos)
   - Email profissional

2. **Escritorio**
   - Nome fantasia
   - CNPJ (opcional)
   - Logo
   - Cores da marca (futuro: para PDFs personalizados)

3. **Contatos**
   - Telefone fixo
   - WhatsApp
   - Email comercial
   - Site
   - LinkedIn (opcional)

4. **Endereco Comercial**
   - Endereco completo
   - CEP (com auto-complete de endereco)

5. **Estrutura**
   - Tipo: Solo / Associados / Sociedade de Advogados
   - Numero de advogados
   - Numero de estagiarios
   - Numero de funcionarios administrativos
   - Faixa de clientes ativos

6. **Perfil de Atuacao**
   - Areas principais (multiselect):
     - Civel
     - Criminal
     - Trabalhista
     - Tributario
     - Empresarial
     - Familia e Sucessoes
     - Previdenciario
     - Ambiental
     - Digital/LGPD
     - Outro
   - Tribunais mais usados (multiselect)
   - Volume mensal de processos

7. **Dados para Documentos** (bonus)
   - Texto de assinatura padrao
   - Conta bancaria para honorarios

---

## Arquivos a Criar/Modificar

### Novos Arquivos

| Arquivo | Descricao |
|---------|-----------|
| `src/components/onboarding/OnboardingWizard.tsx` | Componente principal do wizard |
| `src/components/onboarding/steps/LawyerDataStep.tsx` | Etapa 1 |
| `src/components/onboarding/steps/FirmDataStep.tsx` | Etapa 2 |
| `src/components/onboarding/steps/AddressStep.tsx` | Etapa 3 |
| `src/components/onboarding/steps/StructureStep.tsx` | Etapa 4 |
| `src/components/onboarding/steps/PracticeAreasStep.tsx` | Etapa 5 |
| `src/components/onboarding/OnboardingProgress.tsx` | Barra de progresso |
| `src/pages/Settings.tsx` | Pagina de configuracoes geral |
| `src/hooks/useFirmSettings.ts` | Hook para buscar/atualizar configuracoes |

### Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/App.tsx` | Adicionar rota `/configuracoes` |
| `src/components/layout/MainLayout.tsx` | Adicionar verificacao de onboarding |
| `src/components/layout/Sidebar.tsx` | Adicionar link para Configuracoes |
| `src/contexts/AuthContext.tsx` | Adicionar `firmSettings` ao contexto |

### Migracao de Banco

1. Criar enum `firm_type` (solo, partnership, firm)
2. Criar enum `clients_range` (1-10, 11-50, 51-200, 200+)
3. Criar tabela `law_firm_settings`
4. Criar bucket `firm-logos`
5. RLS policies para a tabela

---

## Fluxo Tecnico

```text
Usuario faz signup
        |
        v
Auth redireciona para /dashboard
        |
        v
MainLayout verifica firmSettings.onboarding_completed
        |
   [false?] -----> Abre OnboardingWizard (modal)
        |                    |
        |                    v
        |            Usuario completa wizard
        |                    |
        |                    v
        |            Atualiza onboarding_completed = true
        |                    |
   [true]<-------------------+
        |
        v
Dashboard normal
```

---

## Interface do Wizard

O wizard sera um Dialog em tela cheia (ou quase) com:

- Header com logo Praxis AI
- Barra de progresso visual (5 etapas)
- Titulo da etapa atual
- Conteudo do formulario
- Footer com "Pular" e "Continuar"
- Animacao de transicao entre etapas

### Responsividade
- Desktop: Dialog centralizado 600px
- Mobile: Tela cheia com scroll

---

## Seguranca

- RLS: Usuario so acessa suas proprias configuracoes
- Storage: Bucket com politica de upload apenas para usuario autenticado
- Validacao de OAB (formato valido)
- Sanitizacao de inputs

---

## Ordem de Implementacao

1. **Migracao**: Criar tabela e storage
2. **Hook**: `useFirmSettings` para CRUD
3. **Wizard**: Componente base + etapas
4. **Integracao**: MainLayout verifica onboarding
5. **Pagina Settings**: Configuracoes editaveis
6. **Sidebar**: Link para /configuracoes
7. **Testes**: Verificar fluxo completo

---

## Resultado Esperado

1. **Novos usuarios** - Experiencia guiada de onboarding profissional
2. **Usuarios existentes** - Podem acessar /configuracoes e preencher dados
3. **Dados completos** - Sistema tem informacoes para personalizar PDFs, petitions, etc
4. **UX Premium** - Wizard bonito e progressivo como apps modernos
