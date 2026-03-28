---
trigger: model_decision
---

# Tabatine — Regras do Workspace (AI Instructions)

Você é um assistente de IA especializado em Next.js, TypeScript e integrações de ERP. Este arquivo define os padrões que devem ser seguidos ao sugerir ou escrever código para o projeto Tabatine.

## 🚀 Princípios Gerais
- **Padrões**: Use Next.js 15+ (App Router), React 19, TypeScript e Tailwind CSS v4.
- **Idiomas**: Comentários e documentação técnica em Português (Brasil). Variáveis e arquivos em Inglês (ou conforme o padrão existente).
- **Simplicidade**: Evite abstrações desnecessárias. Siga os padrões já estabelecidos no projeto.

## 🔌 Integração Omie (Proxy Pattern)
Todas as chamadas para a API Omie **DEVEM** passar por um Proxy Server-side em `src/app/api/omie/`.
- **Endpoint Pattern**: `src/app/api/omie/[modulo]/route.ts`.
- **Segurança**: Nunca exponha `APP_KEY` ou `APP_SECRET` no frontend. Elas são injetadas no proxy via `.env.local`.
- **Cache**: Implemente um cache simples (Map + TTL) no proxy para evitar chamadas redundantes e respeitar o Rate Limiting do Omie.
- **Tratamento de Erros**: Retorne `faultstring` da resposta do Omie em caso de erro.

## 📊 State Management & Data Fetching
- **Zustand**: Localizado em `src/store/`. Usado para persistência local e estados globais simples.
- **TanStack Query (React Query)**: Localizado em `src/hooks/`. Usado para todo o data fetching, paginação e sincronização com o servidor.
- **TanStack Table**: Use para todas as tabelas complexas, garantindo suporte a paginação e ordenação via query params.

## 🎨 UI & Design (Ver .agents/rules/front.md)
- **Tema**: Dark Mode por padrão (Zinc/Neutral palette).
- **Icons**: Lucide React.
- **Layout**: Use os componentes `SectionCard`, `StatCard` e `DataField` para consistência.
- **Feedback**: Sempre adicione estados de `loading` (Skeleton ou Spinner) e `empty states`.

## 📂 Estrutura de Pastas
- `src/app/`: Rotas e layouts.
- `src/components/`: Componentes React reutilizáveis.
- `src/hooks/`: Custom hooks (principalmente React Query).
- `src/store/`: Stores do Zustand.
- `src/lib/`: Utilitários e configurações.
- `.agents/`: Regras e Workflows para automação.

## 🔍 Regras de Resposta
- Sempre verifique `.agents/rules/geral.md` para detalhes técnicos da API Omie.
- Sempre verifique `.agents/rules/front.md` para padrões visuais.
- Se for criar uma nova funcionalidade, verifique se existe um workflow em `.agents/workflows/`.