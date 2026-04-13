# AGENTS.md - Tabatine Development Guide

## Project Overview
Tabatine is a Next.js 16.1.6 application integrating with Omie ERP for financial management, sales reporting, and invoice tracking. Uses App Router, React 19, TypeScript strict mode, Tailwind CSS 4, Zustand, and TanStack Query.

## Build/Lint/Test Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Production
npm run build        # Create production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint (eslint-config-next with TypeScript rules)

# Testing (Node.js built-in test runner)
npm test                              # Run all unit tests
node --experimental-strip-types --test src/lib/ofxParser.test.ts  # Single test file

# Testing (Playwright E2E)
npm run test:e2e                      # Run E2E tests in headless mode
npm run test:e2e:ui                   # Run E2E tests with UI runner
```

### Testing Conventions
- **Unit Tests**: `*.test.ts` suffix in same directory as source. Use `node:test`.
- **E2E Tests**: Found in `/tests` directory. Suffix `*.spec.ts`.
- **E2E Auth**: Tests requiring login should depend on the `setup` project.
- **Coverage**: E2E tests track V8 coverage via `monocart-reporter`.
- Structure: `describe()` blocks with `test()` cases inside.
- Assertions: Use `assert.strictEqual()` for unit, `expect()` for Playwright.

## Code Style Guidelines

### TypeScript
- **Strict Mode**: Enabled in `tsconfig.json` - no implicit any, strict null checks
- **Explicit Types**: Always annotate function parameters and return types
- **Interfaces**: Use `interface` for object shapes, `type` for unions/primitives
- **Path Alias**: Use `@/` to reference `src/` directory (e.g., `@/lib/nf-mapper`)

### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `LayoutWrapper.tsx` |
| Hooks | camelCase with `use` prefix | `useNfQuery.ts` |
| Stores | camelCase with `use` prefix | `useNfStore.ts` |
| Types/Interfaces | PascalCase | `NfCadastroFlat` |
| Constants | PascalCase or SCREAMING_SNAKE | `CATEGORY_MAP` or `MAX_RETRIES` |
| Functions | camelCase | `parseOfx()`, `mapSupabaseToNf()` |
| Files | kebab-case | `nf-mapper.ts`, `filter-utils.ts` |

### Import Organization
```typescript
// 1. React/Next.js core
'use client';
import React from 'react';
import { usePathname } from 'next/navigation';

// 2. Third-party libraries (grouped)
import { useQuery } from '@tanstack/react-query';
import { Building2, LayoutDashboard } from 'lucide-react';

// 3. Internal imports with @/ alias
import { NotificationCenter } from '@/components/NotificationCenter';
import { useNfStore } from '@/store/useNfStore';
import { mapSupabaseToNfs } from '@/lib/nf-mapper';
```

### Component Patterns
- Client components: `'use client'` directive at top
- Default exports for page components: `export default function Page()`
- Named exports for reusable components: `export function Pagination()`
- Props interfaces defined above component when complex

### Error Handling
```typescript
// API Routes - return structured errors with status codes
try {
  // ...
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch')
  }
} catch (error: any) {
  console.error('API Error:', error);
  return NextResponse.json({ error: error.message }, { status: 500 });
}

// Stores - set error state
} catch (error: any) {
  set({ error: error.message, loading: false });
}
```

### Zod Validation
When adding new API routes or form handlers, use Zod for schema validation:
```typescript
import { z } from 'zod';
const MySchema = z.object({ field: z.string() });
```

## Project Architecture

### Database & Supabase Usage
- **SERVER-SIDE ONLY**: As chamadas ao banco de dados e ao Supabase DEVEM ocorrer exclusivamente no Backend (Server Components, API Routes ou Server Actions).
- **Proibido no Client**: NUNCA utilize o `@/utils/supabase/client` ou faça queries de banco (como `.select()`, `.update()`) dentro de Client Components (`'use client'`).
- **RLS**: O acesso via `PUBLISHABLE_KEY` respeita o RLS. Para operações administrativas ou sincronização, use o `createAdminClient` que utiliza a `SERVICE_ROLE_KEY` (apenas em contextos server-side seguros).

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (supabase/, omie/, webhooks/)
│   ├── [page]/            # Page components (dashboard/, clientes/, etc.)
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
├── hooks/                 # Custom React hooks (TanStack Query wrappers)
├── lib/                   # Business logic, parsers, mappers
├── store/                 # Zustand state stores
├── types/                 # Global TypeScript type definitions
└── utils/                 # Pure utility functions
    └── supabase/          # Supabase client and helpers
```

### State Management (Zustand)
- Stores in `src/store/use*Store.ts`
- Use `create<StoreInterface>()` with explicit state interface
- Dedup fetching with promise maps when needed (see `useNfStore.ts:80`)
- Loading/error state managed in store

### Data Fetching (TanStack Query)
- Hooks in `src/hooks/use*Query.ts`
- Query keys: `['resource', page, search, filters]`
- Use `placeholderData: (previousData) => previousData` for smooth pagination
- Pass `enabled` option to conditionally run queries

### API Routes
- Omie proxy: `/api/omie/[resource]/route.ts` - handles credentials
- Supabase: `/api/supabase/[resource]/route.ts` - database operations
- Webhooks: `/api/webhooks/[provider]/route.ts` - incoming webhooks

## UI/Component Guidelines

### Tailwind CSS 4
- Use dark mode variants: `dark:` prefix for dark theme styles
- Use color palette: `slate-` for light, `zinc-` for dark mode backgrounds
- Tailwind arbitrary values allowed for fine-tuning
- Use `backdrop-blur-xl` for glassmorphism effects

### Reusable UI Components
Always prioritize using standardized components from `src/components/ui/` or the following base components:
- **TableContainer**: Main wrapper for data tables with consistent padding and theme.
- **TableSearch**: Standardized search input with debouncing and icons.
- **TableSummaryCard**: Stat cards for data overview (e.g., Total Count, Sum).
- **PageHeader**: Standardized header with breadcrumbs and actions.

### Lucide React Icons
- Import from `lucide-react`
- Standard size: `w-5 h-5` or `w-6 h-6`
- Use consistent stroke width via Tailwind

### Tables (TanStack Table)
- Column definitions in same file or separate `columns.tsx`
- Server-side pagination/sorting preferred
- Use `placeholderData: (previousData) => previousData` from TanStack Query for smooth transitions.

## Environment Variables
```
# Omie API
APP_KEY=          # Omie API key
APP_SECRET=       # Omie API secret
OMIE_API_URL=    # Omie API endpoint (default: https://app.omie.com.br/api/v1/)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=             # Supabase Project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY= # Supabase Anon/Publishable Key
SUPABASE_SERVICE_ROLE_KEY=            # Supabase Service Role (Server-side ONLY)
```
Required for: `/api/omie/*` and `/api/supabase/*` routes to work.

## Working with the Codebase

### Adding a New Page
1. Create route in `src/app/[page-name]/page.tsx`
2. Add navigation link in `src/components/LayoutWrapper.tsx`
3. Create store if needed in `src/store/use*Store.ts`
4. Create query hook if needed in `src/hooks/use*Query.ts`
5. Add API routes if needed in `src/app/api/`

### Adding a New Test
1. Create `src/[path]/[file].test.ts` next to source file
2. Use Node test runner pattern:
```typescript
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { myFunction } from './my-file';

describe('myFunction', () => {
  test('should do something', () => {
    assert.strictEqual(myFunction(input), expected);
  });
});
```

### Running Specific Tests
```bash
# Single file
node --experimental-strip-types --test src/lib/ofxParser.test.ts

# Multiple files with glob
node --experimental-strip-types --test src/**/*.test.ts
```

## ESLint Configuration
- Uses `eslint-config-next/core-web-vitals` + TypeScript rules
- Ignores: `.next/**`, `out/**`, `build/**`
- Run `npm run lint` before committing
