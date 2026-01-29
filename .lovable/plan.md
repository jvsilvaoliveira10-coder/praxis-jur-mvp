
# Plano: Sistema de Acompanhamento Processual via DataJud

## Objetivo
Implementar uma ferramenta para advogados acompanharem processos judiciais de forma centralizada, recebendo notificacoes automaticas quando houver novas movimentacoes.

---

## Visao Geral do Sistema

O advogado cadastra manualmente os numeros dos processos que deseja acompanhar. O sistema busca dados na API publica do DataJud (CNJ) e armazena as movimentacoes no banco de dados. Um job diario verifica novas movimentacoes e notifica o usuario.

---

## Estrutura de Dados

### Tabelas a Criar

**1. tracked_processes** - Processos monitorados pelo usuario
| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid | Chave primaria |
| user_id | uuid | Referencia ao usuario |
| case_id | uuid (opcional) | Vinculo com processo interno |
| process_number | text | Numero CNJ (ex: 1234567-89.2024.8.26.0100) |
| tribunal | text | Sigla do tribunal (TJSP, TRF3, etc) |
| classe | text | Classe processual |
| assuntos | text[] | Lista de assuntos |
| orgao_julgador | text | Vara/Camara |
| data_ajuizamento | timestamp | Data de ajuizamento |
| ultimo_movimento | text | Descricao da ultima movimentacao |
| ultimo_movimento_data | timestamp | Data da ultima movimentacao |
| last_checked_at | timestamp | Ultima verificacao na API |
| active | boolean | Se esta ativo para monitoramento |
| created_at | timestamp | Data de criacao |
| updated_at | timestamp | Data de atualizacao |

**2. process_movements** - Historico de movimentacoes
| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid | Chave primaria |
| tracked_process_id | uuid | Referencia ao processo |
| codigo | integer | Codigo TPU da movimentacao |
| nome | text | Descricao da movimentacao |
| data_hora | timestamp | Data/hora da movimentacao |
| orgao_julgador | text | Vara onde ocorreu |
| complementos | jsonb | Complementos tabelados |
| notified | boolean | Se ja notificou o usuario |
| created_at | timestamp | Data de criacao |

---

## Arquitetura Tecnica

```text
+------------------+     +-------------------+     +------------------+
|    Frontend      |     |   Edge Function   |     |  DataJud API     |
|  (React/Vite)    | --> | search-datajud    | --> |  (CNJ Publica)   |
+------------------+     +-------------------+     +------------------+
                               |
                               v
                         +------------------+
                         |  Lovable Cloud   |
                         |    Database      |
                         +------------------+
                               ^
                               |
                         +-------------------+
                         |   Edge Function   |  <- Cron Job Diario
                         | check-movements   |
                         +-------------------+
```

---

## Componentes a Implementar

### 1. Backend (Edge Functions)

**search-datajud** - Consultar API DataJud
- Recebe numero do processo e tribunal
- Consulta endpoint correto baseado no tribunal
- Retorna dados do processo e movimentacoes
- Autenticacao via header `Authorization: APIKey [chave]`

Exemplo de requisicao a API:
```text
POST https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search
Headers:
  Authorization: APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV...
  Content-Type: application/json
Body:
  {
    "query": {
      "match": {
        "numeroProcesso": "00123456720248260100"
      }
    }
  }
```

**check-movements** - Verificar novas movimentacoes (cron diario)
- Busca processos ativos com `last_checked_at` > 24h
- Consulta DataJud para cada processo
- Compara movimentacoes novas com as armazenadas
- Insere novas movimentacoes e cria notificacoes
- Atualiza `last_checked_at`

### 2. Frontend (Paginas e Componentes)

**Nova rota /tracking** - Pagina principal de acompanhamento
- Lista de processos monitorados com status
- Indicador visual de novas movimentacoes
- Filtros por tribunal e status
- Botao para adicionar novo processo

**Componente AddProcessDialog** - Modal para adicionar processo
- Campo para numero CNJ com mascara (NNNNNNN-NN.NNNN.N.NN.NNNN)
- Selector de tribunal (dropdown com todos os tribunais)
- Validacao do formato do numero
- Preview dos dados antes de confirmar

**Componente ProcessCard** - Card de processo monitorado
- Numero e classe do processo
- Ultimo movimento com data
- Badge de status (ativo/inativo)
- Botao para ver todas movimentacoes

**Componente MovementTimeline** - Timeline de movimentacoes
- Exibicao cronologica das movimentacoes
- Destaque para movimentacoes nao lidas
- Filtro por periodo

### 3. Integracao com Sistema Atual

**Vinculo opcional com processos internos**
- Ao cadastrar um processo para acompanhamento, o usuario pode vincular a um processo ja cadastrado no sistema
- Permite sincronizar o numero do processo entre as telas
- Movimentacoes podem ser acessadas pela tela de detalhes do processo

**Notificacoes integradas**
- Usa a tabela `notifications` existente
- Aproveita o `NotificationBell` ja implementado
- Notificacoes de novas movimentacoes aparecem junto com prazos

---

## API do DataJud - Detalhes Tecnicos

### Autenticacao
A API publica do DataJud requer uma chave de API gratuita obtida no portal do CNJ.
- Header: `Authorization: APIKey [chave]`
- Chave sera armazenada como secret no Lovable Cloud

### Tribunais Suportados (principais)
- TJSP, TJRJ, TJMG, TJRS, TJPR, TJSC (Justica Estadual)
- TRF1 a TRF6 (Justica Federal)
- TRT1 a TRT24 (Justica do Trabalho)
- STJ, TST, TSE, STM (Tribunais Superiores)

### Estrutura de Resposta
```text
{
  "hits": {
    "hits": [{
      "_source": {
        "numeroProcesso": "00123456720248260100",
        "tribunal": "TJSP",
        "dataAjuizamento": "2024-01-15",
        "classe": { "codigo": 123, "nome": "Procedimento Comum" },
        "assuntos": [{ "codigo": 456, "nome": "Indenizacao" }],
        "orgaoJulgador": { "codigo": 789, "nome": "1a Vara Civel" },
        "movimentos": [
          { "codigo": 60, "nome": "Expedido", "dataHora": "2024-01-20T10:30:00" },
          { "codigo": 22, "nome": "Distribuido", "dataHora": "2024-01-15T09:00:00" }
        ]
      }
    }]
  }
}
```

---

## Sidebar Atualizada

Nova entrada no menu de navegacao:
- Icone: `Radar` ou `Activity` (lucide-react)
- Label: "Acompanhamento"
- Rota: `/tracking`

---

## Tarefas de Implementacao

### Fase 1: Infraestrutura
1. Criar tabelas `tracked_processes` e `process_movements` com RLS
2. Solicitar/configurar API Key do DataJud como secret
3. Criar edge function `search-datajud`

### Fase 2: Interface de Cadastro
4. Criar pagina `/tracking` com listagem vazia
5. Implementar `AddProcessDialog` com validacao
6. Integrar busca na API via edge function
7. Salvar processo monitorado no banco

### Fase 3: Visualizacao
8. Implementar `ProcessCard` com dados do processo
9. Criar `MovementTimeline` para historico
10. Adicionar rota no sidebar

### Fase 4: Automacao
11. Criar edge function `check-movements`
12. Configurar cron job diario
13. Integrar notificacoes de novas movimentacoes

### Fase 5: Integracao
14. Permitir vincular com processo interno (cases)
15. Mostrar movimentacoes na tela de detalhes do processo

---

## Consideracoes de Seguranca

- RLS nas tabelas para isolamento por usuario
- API Key armazenada como secret (nao exposta no frontend)
- Validacao de formato do numero CNJ antes de consultar
- Rate limiting nas edge functions para evitar bloqueio

---

## Limitacoes Conhecidas

1. **Dados do DataJud**: Contem metadados e movimentacoes, mas nao o texto completo de decisoes/despachos
2. **Atraso**: Dados podem ter delay de 24-48h em relacao ao tribunal
3. **Cobertura**: Nem todos os tribunais enviam dados completos
4. **API Key**: Necessario solicitar chave no portal do CNJ (processo simples e gratuito)

