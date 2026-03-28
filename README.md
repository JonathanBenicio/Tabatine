# Tabatine - Omie Connect

Plataforma de gestão integrada com o **Omie ERP**, desenvolvida para visualização de relatórios, sincronização de dados e acompanhamento de processos financeiros e de vendas.

## 🚀 Tecnologias Utilizadas

A aplicação utiliza as tecnologias mais modernas do ecossistema React/Next.js:

- **Framework**: [Next.js 16.1.6](https://nextjs.org/) (App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Gerenciamento de Estado**: [Zustand](https://zustand-demo.pmnd.rs/) (Stores modulares e leves)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Consumo de API**: [Axios](https://axios-http.com/) e Fetch API
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

## 🏗️ Padrões de Arquitetura

1. **Proxy API**: As chamadas para a API do Omie são feitas através de rotas internas do Next.js (`src/app/api/omie`), protegendo as credenciais (`APP_KEY`, `APP_SECRET`) no servidor.
2. **State Management**: Utiliza **Zustand** para persistência e compartilhamento de estado global entre componentes, evitando *prop drilling* e facilitando a sincronização com o backend.
3. **Componentização**: Interface construída com componentes reutilizáveis em `src/components`, seguindo uma estética moderna de Glassmorphism e Dark Mode.
4. **Hooks Customizados**: Lógica de busca e paginação separada da interface para reaproveitamento nos stores.

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

2. Configure seu arquivo `.env.local` com as chaves do Omie:
   ```env
   APP_KEY=seu_app_key
   APP_SECRET=seu_app_secret
   OMIE_API_URL=https://app.omie.com.br/api/v1/
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
