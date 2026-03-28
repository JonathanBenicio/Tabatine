# Módulo de Vendas: Inteligência e Polimento

Este documento detalha as lógicas de negócio, transformações de dados (Mapper) e refinamentos de interface (UI) implementados no módulo de Vendas da Tabatine.

## 🧠 1. Inteligência de Dados (Mapper)
O arquivo `src/lib/vendas-mapper.ts` centraliza a "inteligência" do módulo, transformando o JSON complexo e aninhado do Omie em uma estrutura plana (`VendaPlana`) pronta para o frontend.

### Achatamento (Flattening)
- **Granularidade por Item**: Diferente do Omie (um pedido com lista de itens), o mapper explode o pedido em linhas individuais. Cada linha representa um produto vendido, facilitando filtros por produto, NCM e comissão.
- **Estruturas Consolidadas**: Reúne dados de `cabecalho`, `det` (produto), `frete`, `infoCadastro` (NF) e `lista_parcelas` em um único objeto plano.

### Lógicas de Status (Heurísticas Sugeridas)
- **🚦 Status de Vencimento**: 
  - Se a etapa for '90' (Faturado), o status é **Faturado**.
  - Se não estiver faturado e a data da 1ª parcela for menor que hoje, o status é **Atrasado**.
  - Caso contrário, exibe o nome da **Etapa do Pedido**.
- **💰 Status de Comissão**: 
  - Implementada uma heurística inicial: se a Nota Fiscal estiver Autorizada (`autorizado === 'S'`), o status é **DISPONÍVEL**, caso contrário, **PENDENTE**.
- **📄 Status de NF**: 
  - Mapeia as flags binárias do Omie para labels humanizadas: `CANCELADA`, `DENEGADA`, `AUTORIZADA`, `EMITIDA` ou `PENDENTE`.

### Consolidação de Impostos (Multi-Source)
- O mapper lida com a inconsistência de nomes de campos da API Omie (ex: `aliquota` vs `pICMS` vs `aliq_icms`) usando o operador de coalescência nula (`??`). Isso garante que o valor seja capturado independente da versão do retorno da API.

---

## ✨ 2. Polimento e Interface (VendasTable)
A `VendasTable.tsx` utiliza **TanStack Table v8** e **Tailwind CSS** para entregar uma experiência premium e performática.

### Recursos de Tabela Moderna
- **Fixação de Colunas (Pinning)**: Colunas críticas como "Data" e "Ações" podem ser fixadas lateralmente para facilitar o scroll em telas menores.
- **Redimensionamento Dinâmico**: O usuário pode ajustar a largura das colunas.
- **Visibilidade Customizada**: Menu de configurações para ocultar/exibir colunas conforme a necessidade do usuário.
- **Filtros por Coluna**: Além da busca global, cada coluna possui seu próprio campo de filtro (`showColumnFilters`).

### Design & UX
- **Estética Dark Premium**: Uso de paletas Zinc e Charcoal com acentos em Laranja (primário), Esmeralda (sucesso) e Índigo (comissões).
- **Indicadores Visuais**:
  - Crachás (badges) coloridos para status de etapa com efeitos de brilho suave (`shadow-[0_0_10px_...]`).
  - Formatação monetária (BRL) e de datas (PT-BR) consistente em toda a grade.
- **Cards de Resumo**:
  - **Pedidos Encontrados**: Contagem total do filtro.
  - **Volume (Pág. Atual)**: Soma dinâmica do valor total dos itens visíveis.
  - **Ticket Médio (Item)**: Média aritmética do valor por linha.

### Filtros Avançados & Exportação
- **Presets de Data**: Botões rápidos para "Hoje", "Últimos 7 dias", "Este Mês" e "Este Ano".
- **Filtros por ID**: Campos específicos para filtrar por IDs internos do Omie (Cliente, Vendedor, Banco).
- **Exportação Inteligente**: O botão de exportação gera um CSV já processado, com nomes de clientes e vendedores resolvidos (em vez de apenas IDs).

---

## 🛠️ 3. Ferramentas e Tecnologias
- **TanStack Table**: Motor de gerenciamento de estado da tabela.
- **Lucide React**: Biblioteca de ícones consistente.
- **Date-fns**: Manipulação de datas e períodos.
- **Next.js (App Router)**: Navegação e rotas dinâmicas para detalhes de venda.
- **SWR / React Query**: Gerenciamento de cache e refetch de dados.
