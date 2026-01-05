# Implementation Plan: Local MDX Codelab Viewer

**Branch**: `001-mdx-codelab-viewer` | **Date**: 2026-01-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-mdx-codelab-viewer/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a high-performance Next.js application that reads local Markdown files from the file system and renders them as interactive, professionally-styled codelabs with persistent user responses. The system uses Server Components for MDX parsing and Client Components for interactivity (`<FreeResponse>` textarea), with all user progress stored in browser localStorage scoped per codelab.

Technical approach: Next.js 14 App Router with dynamic routes (`/codelab/[filename]`), `next-mdx-remote/rsc` for server-side MDX compilation, custom Tailwind-styled components for all Markdown elements, and a custom `useLocalStorage` hook with debounced auto-save for persistence.

## Technical Context

**Language/Version**: TypeScript 5.x (Strict Mode), Node.js 18+
**Primary Dependencies**: Next.js 14+ (App Router), React 18+, next-mdx-remote/rsc, Tailwind CSS 3.x, remark-gfm, clsx, tailwind-merge
**Storage**: Browser localStorage (client-side only), file system (`fs/promises` for reading `.md` files)
**Testing**: Jest + React Testing Library (unit tests), Playwright (E2E tests) - optional for MVP
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge) on localhost development server
**Project Type**: Web application (frontend-only, no backend API)
**Performance Goals**: <5s initial render, <2s hot reload, <1s debounced save to localStorage
**Constraints**: Localhost-only (no production deployment), single user, no database, CSS-only code styling (no syntax highlighting library)
**Scale/Scope**: Small (1-10 codelab files), optimized for developer productivity, <1000 lines per file recommended

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Local-First Input
**Compliance**: PASS - Uses Node.js `fs/promises` to read Markdown files from `content/` directory. No remote APIs or databases.

### ✅ Principle II: Server vs. Client Split
**Compliance**: PASS - File I/O and MDX parsing in Server Components (`app/codelab/[slug]/page.tsx`). `<FreeResponse>` is Client Component with `"use client"` directive for localStorage integration.

### ✅ Principle III: Custom Component Mapping
**Compliance**: PASS - All Markdown elements (h1-h6, p, ul, ol, pre, code, blockquote) mapped to custom Tailwind-styled components via MDX components object.

### ✅ Principle IV: No Database or External Auth
**Compliance**: PASS - Uses browser localStorage only. No Prisma, PostgreSQL, or external auth providers.

### ✅ Principle V: Type Safety (Non-Negotiable)
**Compliance**: PASS - TypeScript Strict Mode enabled. All props, state, and hooks explicitly typed. No `any` usage.

### ✅ Principle VI: Performance First
**Compliance**: PASS - Server Components for static content, dynamic rendering only for file reads. Client JS minimized (only FreeResponse component).

### ✅ Principle VII: Accessibility & Semantic HTML
**Compliance**: PASS - Custom MDX components use semantic HTML (`<article>`, `<section>`, `<h1>`-`<h6>`). Textarea has proper labels and ARIA attributes.

### ✅ Principle VIII: Component Composition
**Compliance**: PASS - Small, focused components (Heading, Paragraph, CodeBlock, FreeResponse). Each does one thing well.

**Gate Result**: ✅ **PASS** - No constitution violations. Proceed to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/001-mdx-codelab-viewer/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── components.ts    # TypeScript interfaces for custom MDX components
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Next.js 14 App Router structure
app/
├── layout.tsx                 # Root layout (Server Component)
├── page.tsx                   # Landing page (Server Component)
├── codelab/
│   └── [slug]/
│       └── page.tsx           # Dynamic codelab viewer (Server Component)
└── globals.css                # Tailwind imports

components/
├── mdx/
│   ├── Heading.tsx            # h1-h6 components (Server)
│   ├── Paragraph.tsx          # p component (Server)
│   ├── List.tsx               # ul/ol/li components (Server)
│   ├── CodeBlock.tsx          # pre/code components (Server)
│   ├── Blockquote.tsx         # blockquote component (Server)
│   ├── FreeResponse.tsx       # Client Component with localStorage
│   └── mdx-components.ts      # Component mapping export
└── ui/
    └── ErrorMessage.tsx       # Reusable error display (Server)

lib/
├── mdx.ts                     # MDX compilation utilities (compileMDX, getCodelab)
├── storage.ts                 # useLocalStorage hook (Client)
└── utils.ts                   # cn() helper (clsx + tailwind-merge)

content/
└── demo.md                    # Example codelab file

public/
└── (static assets if needed)

# Configuration files
tailwind.config.ts
tsconfig.json
next.config.mjs
package.json
```

**Structure Decision**: Using Next.js 14 App Router with file-based routing. All MDX components live in `components/mdx/` to enforce separation between content renderers and UI primitives. Codelab content stored in `content/` directory at repository root for easy access. No backend or API directory needed (localhost-only, file system reads).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All design decisions comply with constitution principles.
