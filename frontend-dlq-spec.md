# Spec Técnica — Módulo Admin de Webhooks (DLQ)

> **Versão:** 1.0  
> **Data:** Abril 2026  
> **Para:** Time de Frontend (Next.js)  
> **Status:** `Aguardando Implementação Backend` → depois `Pronto para Integrar`

---

## Contexto

O Tabatine Engine recebe notificações em tempo real do **Omie ERP** via Webhooks (HTTP POST em `/webhook/omie`). Quando um webhook falha no processamento (ex: banco de dados indisponível, erro de mapeamento, timeout), o evento é salvo em uma **Dead-Letter Queue (DLQ)** no banco de dados.

O time de frontend é responsável por criar a **interface administrativa** que permite gerenciar esses eventos falhos: visualizar, reprocessar e descartar.

---

## Modelo de Dados — O que o Backend Entrega

Cada evento de webhook é representado pelo objeto `WebhookEventDto`:

```typescript
interface WebhookEventDto {
  id: string;                    // UUID - identificador único
  appKey: string;                // Chave do app Omie (ex: "1234567890")
  event: string;                 // Nome do evento (ex: "ClienteUpsertado", "PedidoAlterado")
  status: WebhookStatus;         // Ver enum abaixo
  retryCount: number;            // Quantas vezes tentou processar (0 a MaxRetries)
  maxRetries: number;            // Limite configurado no backend (padrão: 5)
  createdAt: string;             // ISO 8601 UTC - quando o webhook foi recebido
  processedAt: string | null;    // ISO 8601 UTC - quando foi processado com sucesso
  lastAttemptAt: string | null;  // ISO 8601 UTC - última tentativa (falha ou sucesso)
  nextRetryAt: string | null;    // ISO 8601 UTC - quando o backend vai tentar novamente
  lastErrorDetail: string | null; // Mensagem de erro da última tentativa
  messageId: string | null;      // ID de idempotência do Omie Connect 2.0
}

type WebhookStatus =
  | "Pending"      // Aguardando processamento (na fila, não tentou ainda)
  | "Processing"   // Sendo processado agora (bloquear re-trigger na UI)
  | "Completed"    // Processado com sucesso
  | "Failed"       // Falhou, mas ainda tem tentativas restantes
  | "DeadLetter";  // Esgotou todas as tentativas — requer intervenção manual
```

### Ciclo de Vida Visual

```
Recebido
    │
    ▼
[Pending] ──► [Processing] ──► [Completed] ✅
                   │
                   ▼ (falha)
              [Failed] ◄──────────────┐
                   │                  │
                   │ (backoff exp.)   │ (retry automático)
                   ▼                  │
             nextRetryAt ────────────►┘
                   │
                   │ (após MaxRetries tentativas)
                   ▼
            [DeadLetter] ⛔  ← Requer ação manual do usuário
```

---

## API REST — Endpoints Disponíveis

**Base URL:** `{TABATINE_ENGINE_URL}/admin/webhooks`

> Todos os endpoints requerem autenticação via **Bearer Token** (JWT do Supabase).  
> Header: `Authorization: Bearer {supabase_jwt}`

---

### 1. Listar Eventos

```
GET /admin/webhooks
```

**Query Params:**

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `status` | string | `null` | Filtrar por status. Aceita: `Pending`, `Failed`, `DeadLetter`, `Completed` |
| `event` | string | `null` | Filtrar por nome do evento Omie |
| `page` | number | `1` | Página (paginação offset) |
| `pageSize` | number | `20` | Itens por página (máx: 100) |
| `from` | string ISO | `null` | Data início (`createdAt >= from`) |
| `to` | string ISO | `null` | Data fim (`createdAt <= to`) |

**Resposta `200 OK`:**

```json
{
  "items": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "appKey": "1234567890",
      "event": "PedidoAlterado",
      "status": "DeadLetter",
      "retryCount": 5,
      "maxRetries": 5,
      "createdAt": "2026-04-04T18:00:00Z",
      "processedAt": null,
      "lastAttemptAt": "2026-04-04T19:30:00Z",
      "nextRetryAt": null,
      "lastErrorDetail": "connection timeout after 30s",
      "messageId": "msg_abc123"
    }
  ],
  "total": 47,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

---

### 2. Buscar Evento por ID (com Payload Completo)

```
GET /admin/webhooks/{id}
```

**Resposta `200 OK`:**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "appKey": "1234567890",
  "event": "PedidoAlterado",
  "status": "DeadLetter",
  "retryCount": 5,
  "maxRetries": 5,
  "payload": "{\"topic\":\"PedidoVenda\",\"action\":\"Alterado\",\"codigo_pedido\":12345}",
  "createdAt": "2026-04-04T18:00:00Z",
  "processedAt": null,
  "lastAttemptAt": "2026-04-04T19:30:00Z",
  "nextRetryAt": null,
  "lastErrorDetail": "Npgsql.NpgsqlException: connection timeout after 30s\n  at ...",
  "messageId": "msg_abc123"
}
```

> O campo `payload` só vem no endpoint de detalhe (por ID) para evitar tráfego excessivo na listagem.

---

### 3. Re-processar Evento (Retry Manual)

```
POST /admin/webhooks/{id}/retry
```

**Body:** vazio

**Respostas:**

| Status HTTP | Cenário |
|-------------|---------|
| `202 Accepted` | Evento enfileirado para reprocessamento |
| `404 Not Found` | Evento não existe |
| `409 Conflict` | Evento com status `Processing` — já está sendo processado |
| `422 Unprocessable Entity` | Evento com status `Completed` — não faz sentido re-executar |

**Resposta `202`:**
```json
{
  "id": "3fa85f64-...",
  "message": "Evento enfileirado para reprocessamento",
  "newStatus": "Pending",
  "retryCount": 0
}
```

> Após chamar este endpoint, o `retryCount` é **zerado** e o evento volta para `Pending`. Isso permite N novas tentativas.

---

### 4. Descartar Evento (Dismiss DLQ)

```
DELETE /admin/webhooks/{id}
```

**Respostas:**

| Status HTTP | Cenário |
|-------------|---------|
| `204 No Content` | Evento descartado (soft delete — status vira `Dismissed`) |
| `404 Not Found` | Evento não existe |
| `409 Conflict` | Evento com status `Processing` — não pode descartar durante processamento |

---

### 5. Retry em Lote (Bulk Retry)

```
POST /admin/webhooks/bulk-retry
```

**Body:**
```json
{
  "ids": ["3fa85f64-...", "7bc91e23-..."]
}
```

**Resposta `202`:**
```json
{
  "enqueued": 2,
  "skipped": 0,
  "message": "2 eventos enfileirados"
}
```

---

### 6. Estatísticas (Para Dashboard Cards)

```
GET /admin/webhooks/stats
```

**Resposta `200`:**
```json
{
  "pending": 3,
  "processing": 1,
  "failed": 12,
  "deadLetter": 5,
  "completedToday": 847,
  "lastEventAt": "2026-04-04T22:15:30Z"
}
```

---

## Comportamento de Retry Automático (Backend)

O backend executa um **job periódico** que verifica e reprocessa automaticamente os eventos `Failed`. O frontend **não precisa implementar** essa lógica, mas deve refletir o estado atualizado.

### Algoritmo de Backoff Exponencial

| Tentativa | Espera antes de re-tentar |
|-----------|--------------------------|
| 1ª falha  | 2 minutos |
| 2ª falha  | 4 minutos |
| 3ª falha  | 8 minutos |
| 4ª falha  | 16 minutos |
| 5ª falha  | 32 minutos → vira `DeadLetter` |

O campo `nextRetryAt` indica exatamente quando o backend vai tentar novamente. Use-o para mostrar um countdown ou tooltip na UI.

---

## Requisitos de UX

### Tela Principal — Tabela de Webhooks

**Colunas obrigatórias:**

| Coluna | Formato |
|--------|---------|
| Status | Badge colorido (ver paleta abaixo) |
| Evento | Nome do evento Omie (ex: `PedidoAlterado`) |
| Tentativas | `3 / 5` (retryCount / maxRetries) |
| Recebido em | Data relativa (ex: `há 2 horas`) |
| Próxima tentativa | Timestamp ou `—` se DeadLetter/Completed |
| Ações | Botões: Detalhes, Re-tentar, Descartar |

**Paleta de Status (Badge):**

```
Pending    → Cinza/Neutro    #64748B  text: white
Processing → Azul/Ativo      #3B82F6  text: white  (com spinner animado)
Completed  → Verde           #22C55E  text: white
Failed     → Laranja         #F97316  text: white
DeadLetter → Vermelho        #EF4444  text: white  (destacado, com ícone ⚠️)
```

### Filtros (Header da Tabela)

- **Status** (select múltiplo): Por padrão, mostrar `Failed` + `DeadLetter` selecionados
- **Evento** (select com search): Listar eventos únicos encontrados
- **Período** (date range picker)
- **Busca** (full-text pelo `messageId` ou `lastErrorDetail`)

### Modal de Detalhe

Abrir ao clicar em "Detalhes" de um evento. Exibir:
1. Informações gerais (status, datas, tentativas)
2. **Payload** Omie em bloco `<code>` com syntax highlight JSON
3. **Stacktrace** do erro em `<pre>` (campo `lastErrorDetail`)
4. Botões de ação: Re-tentar / Descartar

### Regras de Interação

| Ação | Status que permite | Comportamento |
|------|--------------------|---------------|
| Re-tentar | `Failed`, `DeadLetter` | Confirmar com dialog (ex: "Isto zerará o contador de tentativas") |
| Descartar | `Failed`, `DeadLetter` | Confirmar com dialog destrutivo |
| Visualizar Detalhe | Qualquer status | Sempre disponível |
| Bulk retry | `Failed`, `DeadLetter` | Checkbox + barra de ação em lote |

> Quando `status === "Processing"`, **desabilitar** os botões de ação e mostrar tooltip explicativo.

---

## Atualização em Tempo Real (Supabase Realtime)

O frontend pode escutar mudanças na tabela `webhook_events` para atualizar a tabela sem polling manual.

```typescript
// Usar o cliente Supabase já configurado no projeto
supabase
  .channel('webhook_events_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'webhook_events',
    filter: 'status=in.(Failed,DeadLetter,Processing)'
  }, (payload) => {
    // Invalidar query do TanStack Query para refetch
    queryClient.invalidateQueries({ queryKey: ['webhooks'] })
  })
  .subscribe()
```

---

## Permissões por Role

| Role | Pode Visualizar | Pode Re-tentar | Pode Descartar |
|------|----------------|----------------|----------------|
| `Admin` | ✅ Todos | ✅ | ✅ |
| `Financeiro` | ✅ Apenas eventos financeiros | ✅ | ❌ |
| `Vendedor` | ❌ | ❌ | ❌ |

> Para o papel `Financeiro`, filtrar eventos que contenham `Titulo`, `Conta`, `Financ` no nome do evento.

---

## Checklist de Entrega (Frontend)

- [ ] Página `/admin/webhooks` com tabela paginada
- [ ] Filtros por status, evento e período
- [ ] Badge de status com paleta definida acima
- [ ] Cards de estatísticas no topo (via `GET /stats`)
- [ ] Modal de detalhe com payload JSON formatado + stacktrace
- [ ] Botão de retry individual + dialog de confirmação
- [ ] Botão de descarte individual + dialog destrutivo
- [ ] Seleção múltipla + bulk retry
- [ ] Atualização em tempo real via Supabase Realtime
- [ ] Proteção de rota por role `Admin`
- [ ] Loading states e error states (TanStack Query)

---

## Perguntas Abertas para o Frontend

1. **Navegação:** A tela de webhooks fica em `/admin/webhooks` ou dentro de uma seção de configurações (`/settings/webhooks`)?
2. **Realtime:** Já existe integração com Supabase Realtime no projeto? Se não, queremos implementar neste módulo ou usar polling simples (ex: 30s)?
3. **Exportação:** É necessário exportar eventos para CSV/Excel no MVP?
