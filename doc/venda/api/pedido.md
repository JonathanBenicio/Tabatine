# Documentação da API de Pedidos de Venda (Omie)

**Endpoint Original:** `https://app.omie.com.br/api/v1/produtos/pedido/`  
**Rota Interna (Proxy):** `/api/omie/vendas`
**Rota usada pela listagem:** `/api/supabase/vendas`

Este documento descreve os campos consumidos pelo mapper `src/lib/vendas-mapper.ts`. A listagem consulta o cache do Supabase, cuja rota adapta os registros ao contrato de pedidos do Omie.

## Estrutura Principal do Retorno

A API retorna uma lista de pedidos dentro do array principal `pedido_venda_produto`. Cada objeto deste array representa um **Pedido de Venda**, subdividido em vários nós principais (objetos e arrays de informações).

### 1. `cabecalho` (Informações Gerais do Pedido)
Contém os dados principais que identificam o pedido, cliente e vendedor.

- **`numero_pedido`** (string/number): Número de identificação do pedido.
- **`data_previsao`** (string): Data prevista de faturamento ou de entrega.
- A data de inclusão é retornada em **`infoCadastro.dInc`**, não em `cabecalho.data_pedido`.
- **`codigo_cliente`** (number): Identificador único do cliente no Omie. *(Nota: Pode requerer consulta adicional na API de Clientes ou associação no front para obter a Razão Social).*
- O vendedor é identificado por **`informacoes_adicionais.codVend`**.
- **`codigo_parcela`** (string): Código correspondente à condição de pagamento (Ex: 30/60/90).
- **`meio_pagamento`** (string): Campo adaptado pela rota interna para a descrição da forma de pagamento. No contrato original, consulte `informacoes_adicionais.meio_pagamento` e as parcelas.
- A conta corrente é identificada por **`informacoes_adicionais.codigo_conta_corrente`**.
- **`etapa`** (string): Coluna do processo de faturamento. A etapa '50' significa **Faturar**. As descrições das demais colunas podem ser configuradas no Omie e devem ser consultadas em `ListarEtapasFaturamento`. O faturamento efetivo é informado por `infoCadastro.faturado`.

### 2. `det` (Array de Itens/Produtos do Pedido)
Lista de produtos vendidos no documento. O frontend geralmente faz um mapa planificado (*flatten*) deste array. Exemplo: 1 pedido que consta 3 itens distintos gera 3 linhas independentes na tabela do sistema.

Para cada item da lista (`det[i]`), o nó interno de dados principal é o `produto`:
- **`descricao` (ou `xProd`)** (string): Nome completo do produto.
- **`unidade` (ou `uCom`)** (string): Unidade de Comercialização/Medida (Ex: UN, PC, KG).
- **`valor_unitario` (ou `vUnCom`)** (number): Preço unitário praticado na venda deste produto.
- **`percentual_desconto`** (number): Percentual de desconto do item; não representa comissão.
- **`valor_mercadoria` (ou `vProd`)** (number): Valor financeiro total correspondente apenas ao item (Quantidade x Valor Unitário – Descontos).

### 3. `frete` (Informações de Transporte)
- **`valor_frete`** (number): Custo de envio ou despesa de transporte cobrado no total do pedido.

### 4. `infoCadastro` (Faturamento e NFe)
Contém dados atualizados diretamente após processo de fechamento, como dados e datas de faturamento.

- **`dInc`** (string): Data de inclusão do pedido.
- **`dFat`** (string): Data em que ocorreu o faturamento; exibida separadamente nos detalhes.
- **`faturado`** (string): Flag `S`/`N` que indica se o pedido está faturado.
- **`numero_nfe`** (string): Número da Nota Fiscal (NFe) gerada, exibido caso o pedido já tenha passado pela etapa de emissão de NF.

### 5. `lista_parcelas` (Dados Financeiros)
Nó que contém `parcela`, que se apresenta na forma de um array contendo os desdobramentos financeiros (vencimentos em que a nota/pedido deverá ser paga).

Para cada item de recebimento (`parcela[i]`):
- **`valor`** (number): Valor monetário bruto exigido especificamente para esta parcela.
- **`data_vencimento`** (string): Data na qual a parcela expira, para acompanhamento de cobrança.

---

## Detalhes de Mapeamento Front-End

O mapper `mapOrderToFlatVendas` converte o pedido em uma linha por item. O store e os hooks reutilizam esse mapeamento.

A chave gerada para cada linha respeita o formato: `[codigo_pedido]-[index_do_item_no_det]`.

**Resolução da Data Base do Sistema:**
A coluna Data representa a inclusão do pedido:
1. `infoCadastro.dInc`.
2. `cabecalho.data_previsao`, quando a inclusão estiver ausente.
3. `--`, quando ambas estiverem ausentes.

O campo `dataPedido` usa apenas `dInc`, com `--` quando ausente. A origem oficial dos campos é a [documentação de pedidos do Omie](https://app.omie.com.br/api/v1/produtos/pedido/).
