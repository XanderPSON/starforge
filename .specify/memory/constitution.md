<!--
SYNC IMPACT REPORT
==================
Version Change: [NONE → 1.0.0 (Initial Constitution)]
Modified Principles: None (new constitution)
Added Sections:
  - Core Principles (all 8 principles)
  - Technology Stack
  - Architecture & Principles
  - Coding Standards
  - File Structure
  - Governance

Removed Sections: None

Templates Status:
  ✅ plan-template.md - Constitution Check section aligns with principles
  ✅ spec-template.md - No updates needed (technology-agnostic spec)
  ✅ tasks-template.md - No updates needed (supports component-based structure)
  ✅ agent-file-template.md - No updates needed (generic template)
  ✅ checklist-template.md - No updates needed (generic template)

Follow-up TODOs: None
-->

# Local MDX Codelab Viewer Constitution

## Core Principles

### I. Local-First Input
Content is sourced exclusively from the local file system using Node.js `fs/promises`. We do not fetch from remote APIs, databases, or external services for the MVP. This ensures the tool works offline and has zero dependencies on backend infrastructure.

**Rationale**: Developer tools should work reliably without network dependencies. Local-first architecture provides instant startup, predictable performance, and complete privacy for codelab content.

### II. Server vs. Client Split
Markdown parsing and file I/O MUST happen in React Server Components (RSC) to keep the client bundle small and leverage server-side performance. Interactive components (e.g., `<FreeResponse>`, `<MultipleChoice>`) MUST be Client Components with the `"use client"` directive and manage their own state.

**Rationale**: RSC architecture reduces JavaScript shipped to the browser, improves Time to Interactive, and leverages server-side caching. Client components are reserved exclusively for interactive elements that require state management.

### III. Custom Component Mapping
We do NOT use default HTML rendering from MDX. Every Markdown element (h1, h2, p, ul, ol, pre, code, etc.) MUST be mapped to a custom React component styled with Tailwind CSS. This ensures a consistent, professional design system across all codelabs.

**Rationale**: Default HTML output lacks visual polish and accessibility features. Custom components enforce design consistency, enable specialized behaviors (e.g., copy buttons on code blocks), and maintain full control over the user experience.

### IV. No Database or External Auth
Do not suggest Prisma, PostgreSQL, Supabase, Auth0, or any external authentication providers. All user progress is either transient (session-only) or stored in browser `localStorage` via custom React hooks.

**Rationale**: Adding a database or auth layer violates the local-first principle and introduces unnecessary complexity. This is a developer tool for personal use, not a multi-user SaaS application.

### V. Type Safety (Non-Negotiable)
TypeScript Strict Mode is enabled. No use of `any` type. All props, state, and function signatures MUST be explicitly typed. Use `unknown` or proper type guards when dealing with external data.

**Rationale**: Type safety prevents runtime errors, improves code maintainability, and provides excellent IDE autocomplete. The cost of typing is minimal compared to the benefit of catching bugs at compile time.

### VI. Performance First
Prefer static rendering where possible. Use dynamic rendering only when content truly changes per request (e.g., reading file system). Minimize client-side JavaScript by leveraging RSC. Images MUST use Next.js `<Image>` component with proper optimization.

**Rationale**: Fast load times are critical for developer tools. Users expect instant feedback. Static rendering provides the fastest possible experience and reduces server costs.

### VII. Accessibility & Semantic HTML
Custom MDX components MUST use semantic HTML elements (`<article>`, `<section>`, `<nav>`). Interactive elements must have proper ARIA attributes. All components must support keyboard navigation where applicable.

**Rationale**: Accessibility is not optional. Many developers use screen readers or keyboard-only navigation. Semantic HTML also improves SEO and content parsing by browser tools.

### VIII. Component Composition
Build small, focused components that do one thing well. Compose complex UI from simple primitives. Avoid "god components" with multiple responsibilities. Each component should be independently testable.

**Rationale**: Small components are easier to understand, test, and reuse. Composition enables flexibility without duplication. This follows React's core philosophy and improves long-term maintainability.

## Technology Stack

**Framework**: Next.js 14+ (App Router)
**Language**: TypeScript (Strict Mode)
**Styling**: Tailwind CSS (utility-first approach)
**Content Engine**: `next-mdx-remote/rsc` (RSC-compatible MDX rendering)
**Icons**: Lucide React (lightweight, tree-shakeable)
**State Persistence**: Browser `localStorage` (via custom hooks)
**File I/O**: Node.js `fs/promises` (server-side only)

## Architecture & Principles

### Content Flow
1. User navigates to route (e.g., `/codelab`)
2. Server Component reads Markdown file from file system
3. Server Component parses MDX using `next-mdx-remote/rsc`
4. Custom component map transforms MDX elements to styled React components
5. Client Components hydrate and handle interactivity
6. User progress saved to `localStorage` (if applicable)

### Server Component Responsibilities
- File system reads (import `fs/promises`, use `readFile`)
- MDX compilation and initial rendering
- Metadata extraction (title, description, duration)
- Layout and page structure

### Client Component Responsibilities
- Interactive widgets (forms, quizzes, expandable sections)
- State management (React hooks: `useState`, `useEffect`)
- `localStorage` persistence (via custom hooks)
- Event handlers (clicks, form submissions)

### Component Hierarchy
```
Page (Server Component)
  └─ MDX Content (Server rendered with custom components)
      ├─ Heading (Server Component)
      ├─ Paragraph (Server Component)
      ├─ CodeBlock (Server Component with copy button)
      └─ FreeResponse (Client Component with state)
```

## Coding Standards

### File Organization
```
app/                    # Next.js App Router pages
├── page.tsx           # Root page (Server Component)
├── codelab/
│   └── page.tsx       # Codelab viewer (Server Component)
└── layout.tsx         # Root layout

components/
├── mdx/               # Custom MDX components
│   ├── Heading.tsx    # h1-h6 components
│   ├── Paragraph.tsx  # p component
│   ├── CodeBlock.tsx  # pre/code components
│   └── Interactive.tsx # Client components
└── ui/                # Reusable UI primitives
    ├── Button.tsx
    └── Card.tsx

lib/
├── mdx.ts             # MDX compilation utilities
├── storage.ts         # localStorage hooks
└── utils.ts           # Helper functions

public/
└── codelabs/          # Markdown files (.md or .mdx)
    └── example.md
```

### TypeScript Conventions
- Use `interface` for public APIs, `type` for unions/intersections
- Export types alongside components: `export type HeadingProps = {...}`
- Prefer `const` over `let`, avoid `var` entirely
- Use functional components with TypeScript generics when needed

### Component Structure
```tsx
// 1. Imports (grouped: React, Next.js, third-party, local)
import { ReactNode } from "react"
import Image from "next/image"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

// 2. Type definitions
interface ComponentProps {
  children: ReactNode
  className?: string
}

// 3. Component implementation
export function Component({ children, className }: ComponentProps) {
  return (
    <div className={cn("base-classes", className)}>
      {children}
    </div>
  )
}
```

### Styling Conventions
- Use Tailwind utility classes (no custom CSS unless absolutely necessary)
- Use `cn()` helper from `clsx` + `tailwind-merge` to merge class names
- Define theme tokens in `tailwind.config.ts` (colors, spacing, typography)
- Mobile-first responsive design: base styles, then `md:`, `lg:` variants

### State Management
- Server state: Props passed from Server Components
- Client state: React hooks (`useState`, `useReducer`)
- Persistent state: Custom `localStorage` hooks with type safety
- No Redux, Zustand, or external state libraries for MVP

### Error Handling
- Use TypeScript's type guards for runtime checks
- Display user-friendly error messages (avoid stack traces in UI)
- Server Components: Show error boundaries for file read failures
- Client Components: Graceful degradation when `localStorage` unavailable

## File Structure

### Routes (App Router)
- `/` - Landing page (overview, link to codelabs)
- `/codelab` - Codelab viewer (reads from query param or default file)

### Component Categories
1. **MDX Components** (`components/mdx/`): Custom renderers for Markdown elements
2. **UI Primitives** (`components/ui/`): Reusable building blocks (buttons, cards)
3. **Layouts** (`app/layout.tsx`): Shared page structure (header, footer)

### Data Flow
- Markdown files stored in `public/codelabs/` or `content/codelabs/`
- Server Components read files at request time (no build-time generation)
- Parsed MDX passed to custom component map
- Client Components receive props from Server Components

## Governance

This constitution defines the non-negotiable technical standards for the Local MDX Codelab Viewer project. All code reviews, pull requests, and design decisions MUST verify compliance with these principles.

### Amendment Process
1. Propose change via GitHub issue with justification
2. Discuss trade-offs (performance, complexity, maintainability)
3. Requires consensus from project maintainers
4. Update constitution version (see versioning rules below)
5. Propagate changes to dependent templates and documentation

### Compliance Requirements
- All PRs must reference relevant principles (e.g., "adheres to Principle II: Server vs. Client Split")
- Complex architectural decisions must be justified in PR descriptions
- Violations of Non-Negotiable principles (III, V) will not be merged
- Flexibility allowed for experimental features in separate branches

### Versioning
- **MAJOR**: Breaking changes to core principles (e.g., switch from local-first to API-based)
- **MINOR**: New principles added or existing principles expanded
- **PATCH**: Clarifications, typo fixes, non-semantic edits

**Version**: 1.0.0 | **Ratified**: 2026-01-05 | **Last Amended**: 2026-01-05
