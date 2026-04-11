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

A navegação está organizada de forma intuitiva no `LayoutWrapper`:

- **Dashboard** (`/dashboard`): Visão geral com métricas e gráficos de desempenho.
- **Relatório Vendas** (`/vendas`): Listagem detalhada de pedidos de venda sincronizados.
- **Notas Fiscais** (`/`): Gestão de NFs emitidas e recebidas (página inicial).
- **Clientes** (`/clientes`): Base de clientes cadastrados no Omie.
- **Vendedores** (`/vendedores`): Gestão da equipe de vendas e comissões.
- **Produtos** (`/produtos`): Catálogo de produtos, SKUs e preços.
- **Bancos** (`/contas-correntes`): Controle de contas correntes e movimentações bancárias.
- **Conciliação** (`/conciliacao`): Ferramentas para conciliação bancária e financeira.
- **Notificações** (`/notificacoes`): Central de alertas e webhooks recebidos em tempo real.
- **Módulos de Apoio**:
  - **Etapas** (`/etapas`): Gestão de etapas de pedidos.
  - **Formas de Pagamento** (`/formas-pagamento`): Lista de formas configuradas.
  - **Meios de Pagamento** (`/meios-pagamento`): Lista de meios de pagamento (cartões, etc).
  - **Condições de Pagamento** (`/condicoes-pagamento`): Prazos e parcelamentos.

## 🏗️ Padrões de Arquitetura

1. **Proxy API**: As chamadas para a API do Omie são feitas através de rotas internas do Next.js (`src/app/api/omie`), protegendo as credenciais (`APP_KEY`, `APP_SECRET`) no servidor.
2. **State Management**: Utiliza **Zustand** para persistência e compartilhamento de estado global entre componentes, evitando *prop drilling* e facilitando a sincronização com o backend.
3. **Data Fetching & Table Strategy**: Utiliza **TanStack Query** para sincronização de dados e **TanStack Table** para renderização de tabelas complexas com suporte a paginação, ordenação e filtros avançados.
4. **Hooks Customizados**: Lógica de busca, paginação e mutações separada da interface para reaproveitamento nos componentes e stores.
5. **Real-time Notifications**: Integração com Webhooks da Omie via backend para notificações instantâneas no dashboard.

## 📦 Dependências Principais

```json
"dependencies": {
  "axios": "^1.13.6",
  "lucide-react": "^0.577.0",
  "next": "16.1.6",
  "react": "19.2.3",
  "recharts": "^3.8.0",
  "zustand": "^5.0.11"
}
```

## 🛠️ Como Iniciar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure seu arquivo `.env.local` com as chaves do Omie e Supabase:
   ```env
   # Omie
   APP_KEY=seu_app_key
   APP_SECRET=seu_app_secret
   OMIE_API_URL=https://app.omie.com.br/api/v1/

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua_anon_key
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🧪 Testes

A aplicação utiliza o test runner nativo do Node.js para testes unitários e Playwright para E2E.

```bash
# Testes Unitários
npm test

# Testes E2E (Playwright)
npm run test:e2e
npm run test:e2e:ui # Com interface visual
```

## 📮 Postman

Uma coleção do Postman para testar os endpoints da API Omie diretamente está disponível na raiz do projeto:
`Tabatine_Omie_API.postman_collection.json`
