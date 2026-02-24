
# Pagina de Integracoes BYOK (Bring Your Own Key)

## Por que comecar por aqui

Esta pagina e a **base obrigatoria** para qualquer integracao futura (D4Sign, DocuSign, PJe, certificado digital). Sem ela, nao existe onde o advogado cadastre suas credenciais. Implementar primeiro maximiza reuso e evita retrabalho.

## O que sera construido

Uma nova aba "Integracoes" dentro da pagina de Configuracoes (`/configuracoes`), onde o advogado pode:

1. Cadastrar API keys de provedores de assinatura digital (D4Sign, DocuSign, Clicksign)
2. Fazer upload do certificado digital A1 (.pfx) para uso futuro com tribunais
3. Ver status de cada integracao (conectado/desconectado)
4. Testar a conexao antes de salvar

## Escopo Tecnico

### 1. Banco de Dados

**Nova tabela: `user_integrations`**
- `id` (uuid, PK)
- `user_id` (uuid, NOT NULL) -- referencia ao usuario logado
- `provider` (text, NOT NULL) -- ex: 'd4sign', 'docusign', 'clicksign'
- `api_key_encrypted` (text) -- API key criptografada via pgcrypto
- `api_secret_encrypted` (text) -- secret criptografado (quando aplicavel)
- `environment` (text, default 'sandbox') -- 'sandbox' ou 'production'
- `is_active` (boolean, default true)
- `last_tested_at` (timestamptz) -- ultima vez que conexao foi testada
- `test_status` (text) -- 'success', 'failed', null
- `created_at` / `updated_at` (timestamptz)
- Constraint UNIQUE em (user_id, provider)

**RLS**: Todas as operacoes (SELECT, INSERT, UPDATE, DELETE) restritas a `auth.uid() = user_id`.

**Criptografia**: Usar `pgp_sym_encrypt` / `pgp_sym_decrypt` com uma chave armazenada como secret do projeto (INTEGRATIONS_ENCRYPTION_KEY). A API key nunca e armazenada em texto plano.

**Novo bucket de storage: `user-certificates`**
- Privado (public = false)
- RLS: somente o dono pode fazer upload/download
- Aceita apenas arquivos `.pfx` e `.p12`

### 2. Edge Function: `test-integration`

Nova edge function que recebe `{ provider, api_key, api_secret?, environment }` e testa a conexao com a API do provedor:
- **D4Sign**: chama `GET /api/v1/safes` com o token
- **DocuSign**: chama endpoint de userinfo
- **Clicksign**: chama endpoint de health

Retorna `{ success: boolean, message: string }`.

### 3. Frontend: Nova aba em Settings

**Arquivo modificado: `src/pages/Settings.tsx`**
- Adicionar 6a aba "Integracoes" com icone `Plug` (lucide)
- Ajustar `grid-cols-5` para `grid-cols-6` no TabsList

**Novo componente: `src/components/settings/IntegrationsTab.tsx`**

Conteudo da aba:
- Card para cada provedor (D4Sign, DocuSign, Clicksign) com:
  - Campo de API Key (mascarado por padrao, toggle para revelar)
  - Campo de API Secret (quando aplicavel)
  - Select de ambiente (Sandbox / Producao)
  - Botao "Testar Conexao" que chama a edge function
  - Indicador visual de status (verde/vermelho/cinza)
  - Botao Salvar

- Card separado "Certificado Digital A1":
  - Zona de upload drag-and-drop (.pfx/.p12)
  - Campo de senha do certificado (criptografado)
  - Indicador de arquivo atual (nome, data de upload)
  - Botao para remover certificado

### 4. Arquivos Criados/Modificados

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| Migracao SQL | Criar | Tabela `user_integrations`, bucket `user-certificates`, habilitar pgcrypto |
| `supabase/functions/test-integration/index.ts` | Criar | Edge function para testar conexao com provedores |
| `src/components/settings/IntegrationsTab.tsx` | Criar | Componente da aba de integracoes |
| `src/pages/Settings.tsx` | Modificar | Adicionar aba "Integracoes" ao TabsList |
| `supabase/config.toml` | Modificar | Registrar nova edge function |

### 5. Seguranca

- API keys criptografadas no banco com pgcrypto (nunca em texto plano)
- Certificados .pfx em bucket privado com RLS por user_id
- Edge function valida JWT antes de processar
- A chave de criptografia e um secret do projeto (INTEGRATIONS_ENCRYPTION_KEY) -- sera solicitada ao usuario
- Nenhuma credencial e exposta no frontend apos salvar (apenas mascarada)

### 6. Sequencia de Implementacao

1. Solicitar ao usuario o secret INTEGRATIONS_ENCRYPTION_KEY
2. Criar migracao SQL (tabela + bucket + RLS + pgcrypto)
3. Criar edge function `test-integration`
4. Criar componente `IntegrationsTab.tsx`
5. Modificar `Settings.tsx` para incluir a nova aba
6. Deploy da edge function
