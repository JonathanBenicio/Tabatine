# Implementação do Modo Claro (Light Mode - Glassmorphism)

O objetivo é adaptar o projeto Tabatine (um ERP Financeiro) para ter suporte estruturado e elegante ao modo claro, adotando o estilo **Glassmorphism (vidro fosco translúcido)**.
A implementação será feita de forma iterativa, dividida por módulos, para permitirmos ajustes finos na intensidade de cores, tons e blur (desfoque) dependendo do contexto de cada módulo.

## Estratégia de Implementação e Módulos

### 1. Setup Global e Core UI (Theme Switcher)
- Configurar as propriedades básicas em `src/app/globals.css`.
- Integrar `next-themes` para prevenir Fallback Flash (FOUC).
- Criar o componente `ThemeToggle`.

### 2. Módulo Dashboard (Visão Geral)
- Ajustar os fundos radiais para tons pastel suaves.
- Refinar os cartões e gráficos do Recharts para terem fundo translúcido (ex: `bg-white/60`, `backdrop-blur-md`).

### 3. Módulo Financeiro & Vendas
- (Contas a Pagar/Receber, Conciliação, Pedidos de Venda).
- Ajustes específicos de tonalidade nas tabelas de listagem (TanStack Table) para garantir constraste > 4.5:1 nas fontes.

### 4. Módulos de Suporte & Configurações
- (Bancos, Condições de Pagamento, Formas de Pagamento).
- Ajustes de formulários, modais de confirmação e skeleton loaders.

## Verificação
- A cada módulo finalizado, passaremos pelas validações dos `web-design-guidelines` e revisaremos as escolhas de tom e opacidade.
- A visualização estática do Glassmorphism foi gerada no StitchMCP para referência inicial.
