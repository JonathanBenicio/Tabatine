# Documentação da API de Pedidos de Venda (Omie)

**Endpoint Original:** `https://app.omie.com.br/api/v1/produtos/pedido/`  
**Rota Interna (Proxy):** `/api/omie/vendas`

Este documento detalha os principais campos retornados pela chamada `ListarPedidos` (na chave de resposta `pedido_venda_produto`) da API Omie, com foco especial nos campos consumidos atualmente pelo painel de controle (mapeados no store `useVendasStore.ts`).

## Estrutura Principal do Retorno

A API retorna uma lista de pedidos dentro do array principal `pedido_venda_produto`. Cada objeto deste array representa um **Pedido de Venda**, subdividido em vários nós principais (objetos e arrays de informações).

### 1. `cabecalho` (Informações Gerais do Pedido)
Contém os dados principais que identificam o pedido, cliente e vendedor.

- **`numero_pedido`** (string/number): Número de identificação do pedido.
- **`data_previsao`** (string): Data prevista de faturamento ou de entrega.
- **`data_pedido`** (string): Data em que o pedido foi emitido/registrado.
- **`codigo_cliente`** (number): Identificador único do cliente no Omie. *(Nota: Pode requerer consulta adicional na API de Clientes ou associação no front para obter a Razão Social).*
- **`codigo_vendedor`** (number): Identificador único do vendedor originário.
- **`codigo_parcela`** (string): Código correspondente à condição de pagamento (Ex: 30/60/90).
- **`forma_pagamento`** (string): Código ou descrição padrão da forma de pagamento atrelada (em dinheiro, boleto, cartão, etc).
- **`conta_corrente`** (string/number): Identificação da conta bancária ou banco associado à venda para faturamento.
- **`etapa`** (string): Status/Etapa atual do pedido (Ex: '10' - Separar/Pedido, '20' - Separar para Faturamento, '50' - Faturado).

### 2. `det` (Array de Itens/Produtos do Pedido)
Lista de produtos vendidos no documento. O frontend geralmente faz um mapa planificado (*flatten*) deste array. Exemplo: 1 pedido que consta 3 itens distintos gera 3 linhas independentes na tabela do sistema.

Para cada item da lista (`det[i]`), o nó interno de dados principal é o `produto`:
- **`descricao` (ou `xProd`)** (string): Nome completo do produto.
- **`unidade` (ou `uCom`)** (string): Unidade de Comercialização/Medida (Ex: UN, PC, KG).
- **`valor_unitario` (ou `vUnCom`)** (number): Preço unitário praticado na venda deste produto.
- **`perc_desconto`** (number): Percentual de desconto ou de comissão associado ao item atual.
- **`valor_mercadoria` (ou `vProd`)** (number): Valor financeiro total correspondente apenas ao item (Quantidade x Valor Unitário – Descontos).

### 3. `frete` (Informações de Transporte)
- **`valor_frete`** (number): Custo de envio ou despesa de transporte cobrado no total do pedido.

### 4. `infoCadastro` (Faturamento e NFe)
Contém dados atualizados diretamente após processo de fechamento, como dados e datas de faturamento.

- **`dFat`** (string): Data exata em que ocorreu o faturamento do pedido.
- **`numero_nfe`** (string): Número da Nota Fiscal (NFe) gerada, exibido caso o pedido já tenha passado pela etapa de emissão de NF.

### 5. `lista_parcelas` (Dados Financeiros)
Nó que contém `parcela`, que se apresenta na forma de um array contendo os desdobramentos financeiros (vencimentos em que a nota/pedido deverá ser paga).

Para cada item de recebimento (`parcela[i]`):
- **`valor`** (number): Valor monetário bruto exigido especificamente para esta parcela.
- **`data_vencimento`** (string): Data na qual a parcela expira, para acompanhamento de cobrança.

---

## Detalhes de Mapeamento Front-End

No sistema local (`useVendasStore`), os dados em árvore listados acima são processados e convertidos para uma linha reta na UI para exibição tabulada (formato Planificado / *Flattened*).

A chave primária gerada para manter referência a cada linha planificada no sistema respeita o formato: `[numero_pedido]-[index_do_item_no_det]`.

**Resolução da Data Base do Sistema:**
Como o Omie traz registros baseados muitas vezes na data de emissão ou alteração, na tabela visual de Vendas no sistema a seguinte prioridade de chaves é feita para garantir que uma data oficial apareça:
1. `infoCadastro.dFat` *(Data da finalização formal no financeiro - Mais assertiva)*
2. `cabecalho.data_previsao` *(Fallback 1 - Utilizada quando não processado ainda)*
3. `cabecalho.data_pedido` *(Fallback 2 - Data efetiva de entrada)*
