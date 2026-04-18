# Tabatine - Omie Connect

Plataforma de gestão integrada com o **Omie ERP**, desenvolvida para visualização de relatórios, sincronização de dados e acompanhamento de processos financeiros e de vendas.

## 🚀 Tecnologias Utilizadas

A aplicação utiliza as tecnologias mais modernas do ecossistema React/Next.js:

- **Framework**: [Next.js 16.1.6](https://nextjs.org/) (App Router) com [React 19.2](https://react.dev/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Banco de Dados & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, `@supabase/ssr`)
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Gerenciamento de Estado**: [Zustand](https://zustand-demo.pmnd.rs/) (Stores modulares e leves)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest) (com Suspense API)
- **Tabelas**: [TanStack Table v8](https://tanstack.com/table/latest) (Paginação e Sorting no Servidor)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Consumo de API**: [Axios](https://axios-http.com/)
- **Datas**: [date-fns](https://date-fns.org/)

## 📂 Estrutura de Páginas

A navegação está organizada por categorias lógicas no `LayoutWrapper`:

### 📊 Dashboard
- **Home** (`/`): Visão geral rápida e acesso às Notas Fiscais.
- **Dashboard** (`/dashboard`): Métricas detalhadas, gráficos de desempenho e análise de vendas.

### 💰 Vendas
- **Pedidos** (`/vendas`): Listagem e gestão de pedidos de venda sincronizados do Omie.
- **Notas Fiscais** (`/nf`): Acompanhamento e detalhes de NF-es emitidas.

### 🏦 Financeiro
- **Contas a Pagar/Receber**: Gestão de fluxo de caixa sincronizado, agora com páginas de detalhes completas para cada título.
- **Bancos** (`/contas-correntes`): Saldos e extratos das contas cadastradas.
- **Conciliação** (`/conciliacao`): Ferramenta para bater extratos bancários com o ERP.

### 📋 Cadastros
- **Clientes**, **Produtos** e **Vendedores**: Consulta e detalhes das entidades base do Omie.

### ⚙️ Configurações de Apoio
- Módulos auxiliares: **Bancos**, **Condições**, **Etapas**, **Formas** e **Meios de Pagamento**. Agora com páginas de detalhes completas para cada registro.

### 🔐 Administração
- **Webhooks DLQ** (`/admin/webhooks`): Monitoramento de falhas em webhooks com sistema de retry.
- **Notificações** (`/notificacoes`): Central de alertas do sistema.

## 🏗️ Padrões de Arquitetura

1. **Arquitetura Híbrida de Dados (Supabase + Omie)**: Os dados do Omie são sincronizados e armazenados em cache no **Supabase** (PostgreSQL). As listagens na interface consomem as rotas `/api/supabase/*` para garantir paginação, ordenação e filtros performáticos no servidor, enquanto a API do Omie é acessada sob demanda (ex: status em tempo real, geração de DANFE).
2. **Proxy API**: Chamadas diretas ao Omie passam por rotas internas (`src/app/api/omie`) para proteger credenciais e injetar chaves de acesso.
3. **State Management e Cache**: Utilização combinada de **Zustand** (estado global da UI) e **TanStack Query com React Suspense** (`useSuspenseQuery`) para cache e carregamento otimizado de dados.
4. **Mappers Centralizados**: Transformação de dados brutos do Supabase/Omie para interfaces de frontend padronizadas via `src/lib/*-mapper.ts`.
5. **Resiliência (DLQ)**: Sistema de monitoramento de Webhooks com fila de erro (Dead Letter Queue) para garantir processamento assíncrono e que nenhuma atualização do ERP seja perdida.

## 🛠️ Como Iniciar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure seu arquivo `.env.local` (solicite as chaves ao administrador).

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🧪 Testes e Qualidade

A aplicação possui uma suíte robusta de testes unitários e de ponta a ponta (E2E), orientada pelo **Roteiro Universal de Testes para Data Tables**, garantindo a qualidade em 5 pilares fundamentais: Renderização, Busca, Paginação, Ordenação e Drill-down.

```bash
# Testes Unitários (Node.js Test Runner)
npm test

# Testes E2E (Playwright)
npm run test:e2e        # Execução em modo headless
npm run test:e2e:ui     # Interface visual do Playwright
```

### 📊 Cobertura e Relatórios (GitHub Pages)
A suíte de testes E2E gera relatórios automáticos de cobertura de código (V8 Coverage) utilizando o `monocart-reporter`. Os resultados da branch `main` e `develop` são publicados automaticamente:
- **Relatório de Testes (Playwright)**: [https://jonathanbenicio.github.io/Tabatine/](https://jonathanbenicio.github.io/Tabatine/)
- **Relatório de Cobertura (Monocart)**: [https://jonathanbenicio.github.io/Tabatine/coverage/](https://jonathanbenicio.github.io/Tabatine/coverage/)
- **E2E Roadmap**: Documentado em [docs/test-roadmap.md](docs/test-roadmap.md).

## 📮 Postman

Uma coleção do Postman para testar os endpoints da API Omie diretamente está disponível na raiz:
`Tabatine_Omie_API.postman_collection.json`
