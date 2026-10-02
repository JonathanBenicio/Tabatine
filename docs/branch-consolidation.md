# Consolidação das branches na develop

Análise realizada em 01/10/2026. Fluxo adotado: branches de trabalho → `develop` → `master`.

## Integrações

| Origem | Decisão | Validação do contrato ou da tela |
| --- | --- | --- |
| `master` | Preservar o histórico na develop; produção permanece separada | A develop inicial estava no mesmo commit da master |
| `develop_antigravity` / PR #84 | Integrar a auditoria de segurança | Mantém a arquitetura existente; tratamento de erros não deve revelar detalhes internos |
| `fix/omie-mappings-dependency-security` / PR #86 | Integrar códigos Omie, datas, faturamento, valores financeiros e dependências corrigidas | Contratos e divergências detalhados abaixo |
| `fix-open-redirect-auth-7670618033295154648` / PR #19 | Integrar e reforçar a proteção contra caracteres normalizados pelo navegador | Apenas destinos internos; caminhos com query e fragmento preservados |

## Validação documental

- **Clientes:** `codigo_cliente_integracao` é um código para integração com sistemas legados, distinto do UUID interno. DDD e número são campos separados. O mapper separa o telefone armazenado no formato `(DDD) número`; telefones sem esse formato permanecem sem DDD inferido. Fonte: [ClientesCadastro](https://app.omie.com.br/api/v1/geral/clientes/).
- **Produtos:** o código de integração vem de `codigo_produto_integracao`, não do UUID do cache. Fonte: [ProdutosCadastro](https://app.omie.com.br/api/v1/geral/produtos/).
- **Vendas:** `infoCadastro.dInc` é inclusão e `infoCadastro.faturado` informa faturamento. Etapa 50 significa Faturar. Fontes: [PedidoVendaProduto](https://app.omie.com.br/api/v1/produtos/pedido/) e [ListarPedidos](https://api.omie.com.br/docs/operacoes/produtos/pedido:ListarPedidos).
- **Adaptação interna:** a rota do cache usa datas armazenadas no banco e adiciona campos de exibição, como descrição de pagamento e comissão. Essa representação interna não deve ser confundida com uma cópia integral do JSON original do Omie.
- **Financeiro:** ausência de saldo ou valor liquidado não comprova valor zero. O mapper preserva `null`; detalhes mostram “Não informado” e a lista mostra `---`. O card “Saldo Informado” soma os valores conhecidos da página e mostra “Não informado” quando nenhum título tem saldo conhecido. O teste E2E anterior ainda esperava “Total a Pagar/Receber”; foi alinhado ao novo significado.
- **Documentos antigos:** `doc/venda/api/pedido.md` e `doc/venda/colunas/README.md` ainda priorizavam faturamento na coluna Data e continham nomes de campos e heurísticas antigos. Foram atualizados conforme o mapper e a documentação oficial. A coluna Data agora representa inclusão, com previsão como fallback; faturamento fica nos detalhes.
- **Redirecionamentos:** a recomendação da [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) exige validar o destino controlado pelo usuário. A integração bloqueia URLs externas, barras duplas, barras invertidas e caracteres de controle. A query `next` do fluxo de recuperação é montada com `URLSearchParams`, preservando seus parâmetros.

## Limitações e trabalho separado

- **Etapas 10 a 40:** os nomes podem ser configurados no Omie. Os rótulos atuais da interface são fixos; a validação contra a configuração da empresa permanece pendente. Não foram redefinidos durante a consolidação.
- **Atraso:** a heurística de vendas considera a primeira parcela; não representa conciliação completa de pagamentos.
- **Comissão:** autorização da NF é uma heurística de disponibilidade, não comprovação de pagamento da comissão.
- **Perfil / [PR #12](https://github.com/JonathanBenicio/Tabatine/pull/12):** exige resolver conflitos em cinco arquivos, preservar a preferência atual de recebimento de logs, validar formulários e armazenamento de avatar e corrigir o cliente usado para exclusão da conta. Não integrado; PR direcionado à develop e mantido em rascunho.
- **DataTable / [PR #38](https://github.com/JonathanBenicio/Tabatine/pull/38):** exige resolver conflitos em sete tabelas e validar renderização, busca, paginação, ordenação e detalhes conforme [test-roadmap.md](test-roadmap.md). Não integrado; PR direcionado à develop e mantido em rascunho.
- **Scroll / PR #13:** a versão atual já isola a rolagem no conteúdo. A branch antiga remove mappers e módulos e tem conflitos em 31 arquivos; sua integração integral foi descartada.
- **Branches históricas:** tema, conciliação, testes e auditoria já integrados não exigem novo merge. O histórico foi preservado nos merges da develop; as referências de branches completamente integradas são removidas após a publicação.

## Checks

- `npm test`: 32 testes aprovados.
- `npm run lint`: zero erros e avisos.
- `npx tsc --noEmit`: aprovado.
- `npm run build`: aprovado com Next.js 16.3.8.
- `npm audit`: zero vulnerabilidades; dependências npm consistentes.
- Playwright: 58 testes aprovados nos módulos Clientes, Produtos, Vendas e Financeiro, incluindo autenticação e os cinco pilares das tabelas; mais dois testes aprovados nos detalhes financeiros. Foram usadas as credenciais de teste existentes e fixtures de respostas para os cenários de valores ausentes e zero.
- `git diff --check`: aprovado.

O navegador padrão estava indisponível no ambiente Ubuntu 26.04. A validação usou o Chromium 147 baixado pelo Playwright, bibliotecas extraídas em `/tmp` e uma configuração temporária com `executablePath`. Nenhuma configuração do projeto foi alterada para essa adaptação.

O bloco de orientações do Next.js em `AGENTS.md` foi gerado pelo próprio `next dev` da versão atual e foi mantido. A documentação descreve a comparação de contrato realizada; não equivale a uma certificação integral da sincronização do banco ou de todas as telas.
