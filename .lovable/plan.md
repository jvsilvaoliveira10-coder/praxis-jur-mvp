

# Plano: Fase 4 - Automacao de Verificacao de Movimentacoes

## Objetivo
Criar a edge function `check-movements` que verifica automaticamente novas movimentacoes nos processos monitorados e gera notificacoes para os usuarios. Configurar um cron job diario para executar essa verificacao.

---

## Arquitetura da Solucao

```text
+---------------------+
|   pg_cron (diario)  |
|   06:00 UTC-3       |
+----------+----------+
           |
           v
+---------------------+     +------------------+
|   check-movements   | --> |   DataJud API    |
|   Edge Function     |     |   (por tribunal) |
+----------+----------+     +------------------+
           |
           v
+---------------------+
|   Para cada processo|
|   ativo:            |
|   - Buscar API      |
|   - Comparar movim. |
|   - Inserir novos   |
|   - Criar notific.  |
+----------+----------+
           |
           v
+---------------------+     +------------------+
|  process_movements  |     |   notifications  |
|  (novos registros)  |     |  (alertas user)  |
+---------------------+     +------------------+
```

---

## Componentes a Implementar

### 1. Edge Function: check-movements

**Responsabilidades:**
- Buscar todos os processos ativos que precisam verificacao (last_checked_at > 24h ou nulo)
- Para cada processo, consultar a API DataJud
- Comparar movimentacoes retornadas com as ja armazenadas
- Inserir novas movimentacoes na tabela `process_movements`
- Criar notificacoes para movimentacoes novas
- Atualizar `last_checked_at` e `ultimo_movimento` do processo

**Logica de Deteccao de Novos Movimentos:**
- Buscar movimentacoes existentes do processo
- Comparar por `codigo` + `data_hora` (chave composta)
- Inserir apenas movimentacoes que nao existem

**Formato da Notificacao:**
- Titulo: "Nova Movimentacao Processual"
- Mensagem: "[Nome da movimentacao] - Processo [numero formatado]"

### 2. Cron Job Diario

**Configuracao:**
- Horario: 06:00 (horario de Brasilia / UTC-3)
- Frequencia: Diaria
- Usa extensoes `pg_cron` e `pg_net`

**SQL para Configuracao:**
```sql
SELECT cron.schedule(
  'check-movements-daily',
  '0 9 * * *',  -- 09:00 UTC = 06:00 BRT
  $$
  SELECT net.http_post(
    url := 'https://htxpsggxvbjqsojaabxu.supabase.co/functions/v1/check-movements',
    headers := '{"Authorization": "Bearer [ANON_KEY]"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

---

## Detalhes Tecnicos

### Estrutura da Edge Function

```text
supabase/functions/check-movements/index.ts
├── Imports (supabase-js)
├── CORS headers
├── Mapeamento tribunalEndpoints (reutilizado de search-datajud)
├── Funcao cleanProcessNumber
├── Interface DataJudResponse
├── Handler principal:
│   ├── Buscar processos ativos (last_checked_at > 24h)
│   ├── Para cada processo:
│   │   ├── Chamar API DataJud
│   │   ├── Buscar movimentacoes existentes
│   │   ├── Filtrar movimentacoes novas
│   │   ├── Inserir novas movimentacoes
│   │   ├── Criar notificacao
│   │   └── Atualizar tracked_process
│   └── Retornar estatisticas
```

### Tratamento de Erros

- Se API DataJud falhar para um processo, continuar com os demais
- Logar erros individuais sem interromper o loop
- Rate limiting: Aguardar 500ms entre requisicoes para evitar bloqueio

### Metricas de Retorno

```json
{
  "success": true,
  "processes_checked": 15,
  "new_movements_found": 7,
  "notifications_created": 7,
  "errors": 0,
  "timestamp": "2026-01-29T09:00:00Z"
}
```

---

## Integracao com Sistema de Notificacoes

A tabela `notifications` ja existe com a seguinte estrutura:
- `user_id`: UUID do usuario
- `title`: Titulo da notificacao
- `message`: Mensagem detalhada
- `read`: Boolean (default false)
- `deadline_id`: Opcional (nao usado para movimentacoes)

O `NotificationBell` ja esta configurado com realtime, entao as notificacoes aparecerao automaticamente para o usuario.

---

## Configuracao do supabase/config.toml

Adicionar a nova funcao:
```toml
[functions.check-movements]
verify_jwt = false
```

---

## Tarefas de Implementacao

1. **Criar edge function check-movements**
   - Arquivo: `supabase/functions/check-movements/index.ts`
   - Reutilizar logica de mapeamento de tribunais
   - Implementar loop de verificacao com tratamento de erros

2. **Atualizar supabase/config.toml**
   - Adicionar configuracao da nova funcao

3. **Habilitar extensoes pg_cron e pg_net**
   - Criar migration para habilitar extensoes

4. **Configurar cron job**
   - Executar SQL para agendar job diario

5. **Testar fluxo completo**
   - Chamar edge function manualmente
   - Verificar insercao de movimentacoes
   - Confirmar criacao de notificacoes

---

## Seguranca

- Edge function usa `SUPABASE_SERVICE_ROLE_KEY` para acesso administrativo
- `DATAJUD_API_KEY` ja configurada como secret
- RLS das tabelas continua ativo (service role bypassa RLS)
- Cron job autenticado com anon key (funcao tem verify_jwt = false)

---

## Limitacoes e Consideracoes

1. **Rate Limiting**: DataJud pode bloquear muitas requisicoes consecutivas
   - Solucao: Delay de 500ms entre requisicoes

2. **Timeout**: Edge functions tem limite de 150s
   - Se muitos processos, pode ser necessario processar em batches

3. **Duplicatas**: Usar chave composta (codigo + data_hora) evita duplicatas

4. **Processos inativos**: Processos com `active = false` nao sao verificados

