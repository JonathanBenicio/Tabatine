# Roteiro Universal de Testes E2E para Data Tables

Este documento define os 5 pilares de testes que devem ser implementados para qualquer módulo do sistema que utilize tabelas de dados (Data Tables) com busca, paginação e detalhes.

## 1. Renderização e Estado Inicial
- **Objetivo**: Garantir que a página monta corretamente e exibe os elementos estruturais.
- **Checklist**:
    - [x] Banner e Título da página estão visíveis.
    - [x] Summary Cards (estatísticas) mostram valores reais após o carregamento.
    - [x] Tabela substitui os skeletons (`.animate-pulse`) pelo conteúdo real.
    - [x] Cabeçalhos das colunas (`<th>`) correspondem à especificação do módulo.

## 2. Busca e Filtros Gerais
- **Objetivo**: Validar a funcionalidade de pesquisa e os estados de retorno.
- **Checklist**:
    - [x] **Debounce**: Ao digitar, o sistema deve aguardar um curto período antes de disparar a requisição.
    - [x] **Empty State**: Deve exibir uma mensagem clara (ex: "Nenhum registro encontrado") se a busca não tiver resultados.
    - [x] **Limpeza**: Ao limpar o campo de busca, a lista original deve ser restaurada.

## 3. Paginação e Navegação
- **Objetivo**: Garantir que o usuário possa navegar por grandes volumes de dados de forma estável.
- **Checklist**:
    - [x] **Botão Anterior**: Deve estar desabilitado na primeira página.
    - [x] **Troca de Página**: Ao clicar em "Próximo", novos dados devem ser carregados (IDs diferentes dos da pg anterior).
    - [x] **Persistência de Estado**: Se uma busca estiver ativa, ela deve ser mantida ao trocar de página (URL params ou estado interno).
    - [x] **Page Size**: Se houver seletor de quantidade de linhas, a tabela deve atualizar o volume de registros exibidos.

## 4. Ordenação (Sorting)
- **Objetivo**: Assegurar que os dados podem ser classificados por colunas-chave.
- **Checklist**:
    - [x] Clicar no cabeçalho de uma coluna ordenável deve disparar a ordenação (ASC/DESC).
    - [x] O ícone de ordenação (seta) deve aparecer no cabeçalho clicado.
    - [x] A tabela deve permanecer funcional após múltiplas trocas de ordenação.

## 5. Drill-down e Detalhes
- **Objetivo**: Validar o fluxo de mergulho nos dados para visualização detalhada.
- **Checklist**:
    - [x] **Clique em Linha/Ação**: Deve navegar para a rota de detalhes (ex: `/clientes/[id]`).
    - [x] **Integridade do Detalhe**: A página de destino deve exibir informações coerentes com o item clicado.
    - [x] **Botão Voltar**: Deve retornar o usuário exatamente para a listagem original.

---

## Status de Conformidade por Módulo

Abaixo, a lista de módulos que já seguem integralmente o **Roteiro Universal (5 Pilares)**:

| Módulo | Renderização | Busca/Filtros | Paginação | Ordenação | Drill-down | Status Final |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Vendedores** | ✅ | ✅ | ✅ | ✅ | ✅ | **Completo** |
| **Produtos** | ✅ | ✅ | ✅ | ✅ | ✅ | **Completo** |
| **Vendas** | ✅ | ✅ | ✅ | ✅ | ✅ | **Completo** |
| **Clientes** | ✅ | ✅ | ✅ | ✅ | ✅ | **Completo** |
| **Notas Fiscais** | ✅ | ✅ | ✅ | ✅ | ✅ | **Completo** |
| **Contas Correntes** | ✅ | ✅ | ✅ | ✅ | ✅ | **Completo** |
| **Conciliação** | ✅ | ✅ | ✅ | ✅ | ✅ | **Completo** |

**Última verificação completa**: 13/04/2026.
