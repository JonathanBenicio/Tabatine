# Sistema de Design Tabatine

> **Visão Geral**: Tabatine é um ecossistema de gestão financeira premium, focado em alta performance e estética moderna (Glassmorphism). Este documento serve como a "Fonte da Verdade" para o desenvolvimento do Frontend.

---

## 🎨 Fundações de Design

### Temas Adaptativos
O projeto suporta **Modo Escuro (Dark)** e **Modo Claro (Light)**. A interface deve se adaptar automaticamente ou via alternância de estado.

| Elemento | Modo Escuro (Zinc/Dark) | Modo Claro (Slate/Light) |
| :--- | :--- | :--- |
| **Fundo Principal** | `bg-black` ou `bg-zinc-950` | `bg-white` ou `bg-zinc-50` |
| **Texto Primário** | `text-zinc-100` | `text-zinc-900` |
| **Texto Secundário** | `text-zinc-400` | `text-zinc-500` |
| **Bordas** | `border-zinc-800/50` | `border-zinc-200` |

### Paleta de Cores (Marcas)
Usamos cores vibrantes para ações e estados, mantendo o contraste necessário.

- **Primária**: `amber-500` (#F59E0B) — Confiança e clareza.
- **Secundária**: `amber-400` (#FBBF24) — Destaques e alertas suaves.
- **Ação/CTA**: `violet-500` (#8B5CF6) — Interatividade e distinção.

### Status e Semântica
- **Sucesso**: `emerald-400` (Texto) / `emerald-500/10` (Fundo).
- **Alerta**: `amber-400` (Texto) / `amber-500/10` (Fundo).
- **Erro**: `rose-400` (Texto) / `rose-500/10` (Fundo).
- **Info**: `blue-400` (Texto) / `blue-500/10` (Fundo).

---

## ✨ Sistema de Glassmorphism

O efeito de "vidro fosco" é a assinatura visual do Tabatine. Deve ser usado em cartões e modais.

### Tokens de Glassmorphism
- **Dark Mode Card**:
  ```tailwind
  bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-xl
  ```
- **Light Mode Card**:
  ```tailwind
  bg-white/60 border border-zinc-200/50 backdrop-blur-xl shadow-sm
  ```

---

## 📦 Componentes Padronizados

### SectionCard
Utilizado para agrupar informações relacionadas com título e ícone.
- **Dark**: Fundo `zinc-900/30`.
- **Light**: Fundo `white/60`.

### StatCard
Métricas principais com ícones coloridos.
- **Dica**: O fundo do ícone deve usar `opacity-20` da cor de status.

### DataField
Pares chave-valor limpos.
- Use `text-[10px]` para o label em Caps Lock com `tracking-wider`.

---

## 📊 Componentes de Tabela (Padrão)

Para novas telas de listagem, utilize obrigatoriamente os componentes em `src/components/ui`:

### TableContainer
O wrapper principal para tabelas que gerencia estados de carregamento e vazio.
- **Props**: `isLoading`, `isEmpty`, `emptyMessage`, `emptyIcon`, `pagination`.
- **Estilo**: Glassmorphism avançado com bordas arredondadas `rounded-3xl`.

### TableSearch
Componente de busca padronizado com feedback de carregamento.
- **Props**: `value`, `onChange`, `isLoading`.
- **Estilo**: Foco em `orange-500` para manter consistência visual.

### TableSummaryCard
Cards de resumo localizados acima das tabelas para métricas rápidas.
- **Props**: `label`, `value`, `sublabel`, `variant`, `isCurrency`, `isLoading`.
- **Variantes**: `blue`, `emerald`, `orange`, `purple`, `rose`, `amber`, `pink`.

---

## 📐 Tipografia e Espaçamento

- **Fonte**: **Inter** (via Google Fonts).
- **Escala de Texto**:
  - `text-xl/2xl` + `font-black` para valores numéricos.
  - `text-sm/base` para corpo de texto.
  - `text-[10px]` para metadados e labels.
- **Espaçamento**: Siga rigorosamente a escala do Tailwind (p-2, p-4, p-6). Evite valores arbitrários.

---

## 🚥 Regras de Ouro (Premium UX)

1.  **Transições**: `transition-all duration-200 ease-in-out` em todos os elementos interativos.
2.  **Hovers**: Elementos clicáveis devem ter `cursor-pointer` e um feedback visual claro (ex: `hover:bg-zinc-800/50` no dark).
3.  **Ícones**: Use exclusivamente **Lucide React**. Mantenha o tamanho padrão `w-5 h-5`.
4.  **Emojis**: ❌ **Proibido** o uso de emojis como ícones de UI. Use SVGs.
5.  **Contraste**: Mínimo de **4.5:1** para acessibilidade em ambos os temas.
6.  **Responsividade**: Teste sempre em `375px` (Mobile) e `1440px` (Desktop).

---

## 🏁 Checklist Pré-Entrega

- [ ] Suporta Dark e Light mode sem quebras visuais?
- [ ] O contraste de texto está legível?
- [ ] Todos os elementos clicáveis possuem `cursor-pointer`?
- [ ] Os ícones são consistentes (Lucide)?
- [ ] As animações são suaves (150-300ms)?
