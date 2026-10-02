# DataTable: validação da refatoração

A branch antiga foi adaptada às sete tabelas atuais: Clientes, Contas Correntes, Financeiro, Notas Fiscais, Produtos, Vendedores e Vendas. O componente compartilhado recebe a instância do TanStack Table e apenas renderiza cabeçalhos e células. Colunas, mappers, filtros, endpoints, paginação, estado e ações de detalhes permanecem nos módulos.

## Contrato e tela

- Colunas e formatações são as mesmas definidas nos módulos; dados financeiros desconhecidos continuam desconhecidos, conforme a consolidação anterior.
- Ordenação continua controlada pela instância do TanStack, incluindo paginação/ordenação no servidor. Os cabeçalhos ordenáveis oferecem botões operáveis por teclado e `aria-sort`, respeitando o ciclo padrão ascendente/descendente/sem ordenação da biblioteca.
- As colunas fixas de Vendas usam `getStart/getAfter` da própria tabela. Os filtros por coluna mantêm a transição e o estado existentes. No modo compacto, a largura fixa acompanha os tamanhos do modelo da tabela; nomes longos de clientes têm truncamento e título completo no hover, evitando que a coluna fixada cubra cabeçalhos de outras colunas.
- O estado vazio e a ação de limpar filtros de Produtos foram preservados. Os skeletons respeitam as colunas visíveis; o TableContainer continua cuidando de loading, estado vazio e paginação dos demais módulos.
- Temas claro/escuro seguem os tokens e componentes atuais, sem recuperar o visual antigo exclusivamente escuro da branch.

Foi encontrado um erro visual preexistente nas colunas fixas de Vendas: `rgb(var(--card))` era inválido porque `--card` já contém um valor rgba completo. A refatoração usa `var(--background)` para um fundo opaco e válido nos dois temas, evitando sobreposição ilegível durante a rolagem.

Também foi corrigida a recriação do array vazio a cada render enquanto a consulta carregava. A referência estável com `useMemo` evita ciclos de render ao alterar o estado da tabela antes dos dados chegarem, conforme a [FAQ oficial](https://tanstack.com/table/v8/docs/faq). Os botões de ordenação aguardam o primeiro carregamento.

Os testes de interação deixam de forçar cliques através do overlay de carregamento e passam a aguardar que o elemento possa receber o clique. Isso corrigiu uma falha intermitente no drill-down de Contas Correntes.

## Fontes e critérios

O contrato da biblioteca é a [documentação oficial de TanStack Table](https://tanstack.com/table/v8/docs/guide/column-pinning) e os modelos/colunas atuais do projeto. Os campos Omie continuam validados pelas referências e limites registrados em [branch-consolidation.md](branch-consolidation.md), [profile-integration.md](profile-integration.md) e na documentação de vendas em `doc/venda/`.

A validação de navegador deve cobrir os cinco pilares de [test-roadmap.md](test-roadmap.md): renderização, busca, paginação, ordenação e detalhes. Foram acrescentados cenários específicos de ordenação por teclado e fundo das colunas fixas em ambos os temas.
