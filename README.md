# Tabatine - Omie Connect

Plataforma de gestão integrada com o **Omie ERP**, desenvolvida para visualização de relatórios, sincronização de dados e acompanhamento de processos financeiros e de vendas.

## 🚀 Tecnologias Utilizadas

A aplicação utiliza as tecnologias mais modernas do ecossistema React/Next.js:

- **Framework**: [Next.js 16.1.6](https://nextjs.org/) (App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Gerenciamento de Estado**: [Zustand](https://zustand-demo.pmnd.rs/) (Stores modulares e leves)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
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

1. **Proxy API**: As chamadas para a API do Omie são feitas através de rotas internas do Next.js (`src/app/api/omie`), protegendo as credenciais no servidor.
2. **State Management**: Utiliza **Zustand** para persistência e compartilhamento de estado global.
3. **Mappers Centralizados**: Transformação de dados brutos da API para interfaces limpas via `src/lib/*-mapper.ts`.
4. **Resiliency**: Sistema de monitoramento de Webhooks com fila de erro (DLQ) para garantir que nenhuma notificação do ERP seja perdida.

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

### 📊 Cobertura e Relatórios
Os testes E2E geram relatórios automáticos de cobertura de código (V8 Coverage) utilizando o `monocart-reporter`.
- **Relatório HTML**: Disponível em `playwright-report/index.html` após a execução.
- **Cobertura**: Detalhes em `coverage/html/index.html`.
- **E2E Roadmap**: Documentado em [docs/test-roadmap.md](file:///c:/Users/Jonathan/Documents/Developer/GitHub/Tabatine/docs/test-roadmap.md).

## 📮 Postman

Uma coleção do Postman para testar os endpoints da API Omie diretamente está disponível na raiz:
`Tabatine_Omie_API.postman_collection.json`
