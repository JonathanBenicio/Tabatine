# Roteiro Universal de Testes E2E para Data Tables

Este documento define os 5 pilares de testes que devem ser implementados para qualquer módulo do sistema que utilize tabelas de dados (Data Tables) com busca, paginação e detalhes.

## 1. Renderização e Estado Inicial
- **Objetivo**: Garantir que a página monta corretamente e exibe os elementos estruturais.
- **Checklist**:
    - [ ] Banner e Título da página estão visíveis.
    - [ ] Summary Cards (estatísticas) mostram valores reais após o carregamento.
    - [ ] Tabela substitui os skeletons (`.animate-pulse`) pelo conteúdo real.
    - [ ] Cabeçalhos das colunas (`<th>`) correspondem à especificação do módulo.

## 2. Busca e Filtros Gerais
- **Objetivo**: Validar a funcionalidade de pesquisa e os estados de retorno.
- **Checklist**:
    - [ ] **Debounce**: Ao digitar, o sistema deve aguardar um curto período antes de disparar a requisição.
    - [ ] **Empty State**: Deve exibir uma mensagem clara (ex: "Nenhum registro encontrado") se a busca não tiver resultados.
    - [ ] **Limpeza**: Ao limpar o campo de busca, a lista original deve ser restaurada.

## 3. Paginação e Navegação
- **Objetivo**: Garantir que o usuário possa navegar por grandes volumes de dados de forma estável.
- **Checklist**:
    - [ ] **Botão Anterior**: Deve estar desabilitado na primeira página.
    - [ ] **Troca de Página**: Ao clicar em "Próximo", novos dados devem ser carregados (IDs diferentes dos da pg anterior).
    - [ ] **Persistência de Estado**: Se uma busca estiver ativa, ela deve ser mantida ao trocar de página (URL params ou estado interno).
    - [ ] **Page Size**: Se houver seletor de quantidade de linhas, a tabela deve atualizar o volume de registros exibidos.

## 4. Ordenação (Sorting)
- **Objetivo**: Assegurar que os dados podem ser classificados por colunas-chave.
- **Checklist**:
    - [ ] Clicar no cabeçalho de uma coluna ordenável deve disparar a ordenação (ASC/DESC).
    - [ ] O ícone de ordenação (seta) deve aparecer no cabeçalho clicado.
    - [ ] A tabela deve permanecer funcional após múltiplas trocas de ordenação.

## 5. Drill-down e Detalhes
- **Objetivo**: Validar o fluxo de mergulho nos dados para visualização detalhada.
- **Checklist**:
    - [ ] **Clique em Linha/Ação**: Deve navegar para a rota de detalhes (ex: `/clientes/[id]`).
    - [ ] **Integridade do Detalhe**: A página de destino deve exibir informações coerentes com o item clicado.
    - [ ] **Botão Voltar**: Deve retornar o usuário exatamente para a listagem original.
