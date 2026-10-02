# Colunas da Tela de Vendas

Documentação dos campos exibidos na tabela de vendas (`VendasTable.tsx`), com origem dos dados e observações.

> [!NOTE]
> A listagem consulta `/api/supabase/vendas`; a rota adapta o cache ao contrato Omie e `mapOrderToFlatVendas` faz o flatten — cada linha representa **um produto** dentro de um pedido. A tabela abaixo inclui campos do modelo plano disponíveis também nos detalhes; nem todos são colunas visíveis da lista.

---

## Legenda de Origem

| Símbolo | Significado |
|---------|-------------|
| ✅ API | Valor vem diretamente da API Omie |
| ⚠️ Aproximado | Valor usa campo da API que não corresponde exatamente ao dado desejado |
| ❌ Hardcoded | Valor fixo definido no código, não consultado em nenhuma API |

---

## Mapeamento das Colunas

| # | Coluna | Campo no Store | Origem | Fonte na API Omie | Observações |
|---|--------|----------------|--------|--------------------|-------------|
| 1 | 📅 Data | `data` | ✅ API | `infoCadastro.dInc` | Data de inclusão; fallback para `cabecalho.data_previsao` ou `--`. Faturamento é um campo separado |
| 2 | 👥 Cliente | `cliente` | ✅ API | `cabecalho.codigo_cliente` | Usa `getClienteNome` para exibir a **razão social**. Cache alimentado via NFs |
| 3 | 👤 Vendedor | `vendedor` | ✅ API | `informacoes_adicionais.codVend` | Usa `getVendedorNome` para exibir o **nome do vendedor** |
| 4 | 📦 Pedido | `pedido` | ✅ API | `cabecalho.numero_pedido` | Número do pedido de venda |
| 5 | 📄 NF | `nf` | ✅ API | `infoCadastro.numero_nfe` | Número da nota fiscal eletrônica associada |
| 6 | 🛒 Produto | `produto` | ✅ API | `det[].produto.descricao` | Descrição do produto no item do pedido |
| 7 | 📦 Und | `und` | ✅ API | `det[].produto.unidade` | Unidade de medida (ex: UN, CX, KG) |
| 8 | 💰 Valor Venda | `valorVenda` | ✅ API | `det[].produto.valor_unitario` | Valor unitário do produto |
| 9 | 💳 Cond. Pagto. | `condPagto` | ✅ API | `cabecalho.codigo_parcela` | Código da condição de pagamento |
| 10 | 🚚 Frete | `frete` | ✅ API | `frete.valor_frete` | Valor do frete do pedido |
| 11 | 📈 Coms. % | `percComissao` | ✅ API | `informacoes_adicionais.perc_comissao` | A rota interna adapta `pedidos_venda.comissao_vendedor`; ausência resulta em zero |
| 12 | 🎯 Valor Total | `valorTotal` | ✅ API | `det[].produto.valor_total` | Valor total do item (quantidade × valor unitário) |
| 13 | 🏦 Forma Pg | `formaPg` | ✅ API | `cabecalho.meio_pagamento` | Campo adaptado pela rota interna a partir da forma de pagamento cadastrada |
| 14 | 🏛️ Banco | `banco` | ✅ API | `informacoes_adicionais.codigo_conta_corrente` | Usa o nome adaptado pela rota ou o código da conta para resolver o cadastro |
| 15 | 💰 Parcela 1 | `parcela1.valor` | ✅ API | `lista_parcelas.parcela[0].valor` | Valor da 1ª parcela |
| 16 | 📅 Venc. 1 | `parcela1.vencimento` | ✅ API | `lista_parcelas.parcela[0].data_vencimento` | Data de vencimento da 1ª parcela |
| 17 | 🚦 Status Venc. | `vencimentoStatus` | ⚠️ Aproximado | `infoCadastro.faturado`, primeira parcela e `cabecalho.etapa` | `S` gera Faturado; pedido não faturado com primeira parcela vencida gera Atrasado; caso contrário usa a etapa. Etapa 50 é Faturar |
| 18 | 💰 Parcela 2 | `parcela2.valor` | ✅ API | `lista_parcelas.parcela[1].valor` | Valor da 2ª parcela |
| 19 | 📅 Venc. 2 | `parcela2.vencimento` | ✅ API | `lista_parcelas.parcela[1].data_vencimento` | Data de vencimento da 2ª parcela |
| 20 | 💰 Parcela 3 | `parcela3.valor` | ✅ API | `lista_parcelas.parcela[2].valor` | Valor da 3ª parcela |
| 21 | 📅 Venc. 3 | `parcela3.vencimento` | ✅ API | `lista_parcelas.parcela[2].data_vencimento` | Data de vencimento da 3ª parcela |
| 22 | 🎗️ Status Comissão | `statusComissao` | ⚠️ Aproximado | `infoCadastro.autorizado` | `S` gera DISPONIVEL; demais valores geram PENDENTE. É uma heurística, não comprovação do pagamento da comissão |

---

## Campos que Precisam de Atenção

### Comissão

`statusComissao` usa a autorização da NF como heurística. O sistema não acompanha a quitação real da comissão. `percComissao` usa o campo adaptado pela rota interna e não o desconto do produto.

### Vencimento e etapas

`vencimentoStatus` considera apenas a primeira parcela para indicar atraso. A etapa representa a coluna do processo de faturamento e não comprova pagamento. As descrições das colunas 10 a 40 podem ser configuradas no Omie; os rótulos atuais da interface continuam fixos e exigem validação contra a configuração da empresa antes de uma futura refatoração de tabelas.

---

## Arquivos Relevantes

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/store/useVendasStore.ts` | Estado da UI e cache; usa o mapper centralizado |
| `src/lib/vendas-mapper.ts` | Flatten do contrato de pedidos |
| `src/components/VendasTable.tsx` | Renderização da tabela, formatação visual |
| `src/components/Pagination.tsx` | Componente de paginação |

---

*Revisada durante a consolidação na develop em 01/10/2026.*
