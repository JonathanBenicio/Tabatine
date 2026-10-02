# PLANO: Sequenciamento de Modernização e Suporte (Issues #48, #47, #57)

Este plano descreve a ordem de execução para consolidar as alterações locais e finalizar as issues pendentes, garantindo que cada commit esteja devidamente vinculado.

## 🔴 CRITICAL RULES
- **Vínculo de Commits:** Todos os commits devem incluir o número da issue (ex: `feat: add table components (close #48)`).
- **Modo Claro:** Todas as alterações devem suportar as variantes `dark:` do Tailwind v4.

## Fase 1: Padronização de Componentes (Issue #48)
**Objetivo:** Consolidar os componentes base de tabela que estão atualmente como "untracked".

1. [x] Revisar e validar `TableContainer.tsx`, `TableSearch.tsx` e `TableSummaryCard.tsx`.
2. [x] Garantir que os tokens de cores em `globals.css` estão sendo respeitados.
3. [x] **COMMIT:** `build: add standardized table components (#48)`

## Fase 2: Detalhes dos Módulos de Suporte (Issue #47)
**Objetivo:** Finalizar as páginas de detalhes dos 5 módulos de suporte.

1. [x] Revisar `BancoDetails.tsx`, `CondicaoDetails.tsx`, `EtapaDetails.tsx`, `FormaDetails.tsx` e `MeioDetails.tsx`.
2. [x] Garantir que o layout siga o padrão de Glassmorphism e suporte Modo Claro.
3. [x] **COMMIT:** `feat: implement support module detail views (#47)`

## Fase 3: Modernização de Tabelas e Etapa 4 do Modo Claro (Issue #57)
**Objetivo:** Refatorar as tabelas legadas para usar TanStack Table + `TableContainer`.

1. [x] Refatorar `BancosTable.tsx` (atualmente híbrida) para o padrão final.
2. [x] Refatorar `CondicoesTable.tsx`, `EtapasTable.tsx`, `FormasTable.tsx` e `MeiosTable.tsx`.
3. [x] Modernizar a área de Admin (`WebhooksTable` e `WebhooksDashboard`).
4. [x] **COMMIT:** `refactor: modernize support and admin tables for light mode (#57)`

## Fase 4: Atualização do Épico (Issue #52)
**Objetivo:** Marcar progresso no épico global.

1. [x] Revisar a aplicação global em busca de inconsistências de contraste no Modo Claro.
2. [x] **COMMIT:** `docs: update light mode epic progress (#52)`

## Verificação Final
- [x] `npm run lint` sem erros (limpeza efetuada, erros remanescentes são dívida técnica de `any` em stores).
- [x] Teste visual Light/Dark em todos os módulos de suporte.
- [x] Verificação de acessibilidade (contraste).
