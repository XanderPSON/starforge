# Research: Local MDX Codelab Viewer

**Phase 0 Output** | **Date**: 2026-01-05 | **Plan**: [plan.md](./plan.md)

## Overview

This document captures design decisions, technology choices, and best practices research for implementing a local MDX codelab viewer using Next.js 14 App Router.

## Key Design Decisions

### 1. MDX Processing Library

**Decision**: Use `next-mdx-remote/rsc` (React Server Components version)

**Rationale**:
- Native RSC support keeps client bundle small (parsing happens server-side)
- Compatible with Next.js 14 App Router architecture
- Allows custom component mapping without client-side overhead
- Actively maintained by Vercel team
- Spec requirement FR-002 explicitly requires `next-mdx-remote`

**Alternatives Considered**:
- `@next/mdx` (Next.js official plugin) - Rejected: Requires MDX files at build time, doesn't support dynamic file reading from `content/` directory
- `mdx-bundler` - Rejected: Client-side bundle overhead, unnecessary complexity for localhost-only tool
- Raw `@mdx-js/mdx` - Rejected: Too low-level, requires manual React integration

**Implementation Pattern**:
```typescript
// lib/mdx.ts
import { compileMDX } from 'next-mdx-remote/rsc'
import { readFile } from 'fs/promises'
import path from 'path'

export async function getCodelab(slug: string) {
  const filePath = path.join(process.cwd(), 'content', `${slug}.md`)
  const source = await readFile(filePath, 'utf-8')

  const { content, frontmatter } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      }
    }
  })

  return { content, frontmatter }
}
```

### 2. Remark/Rehype Plugins

**Decision**: Use `remark-gfm` only (no syntax highlighting library per clarification)

**Rationale**:
- `remark-gfm` adds GitHub Flavored Markdown support (tables, task lists, strikethrough)
- Clarification #5 confirmed CSS-only code styling (no `rehype-pretty-code` or Prism.js)
- Minimizes dependencies and bundle size
- Aligns with constitution Principle IV (no unnecessary complexity)

**Alternatives Considered**:
- `rehype-pretty-code` - **Rejected per spec clarification**: User chose CSS-only styling (Option B in clarification Q5)
- `rehype-highlight` / `rehype-prism` - Rejected: Same reason, adds dependency
- `remark-math` + `rehype-katex` - Deferred: Not required for MVP, can add later if needed

**Implementation**: Install and configure in MDX options:
```bash
npm install remark-gfm
```

### 3. Dynamic Routing Strategy

**Decision**: Use Next.js App Router dynamic segment `app/codelab/[slug]/page.tsx`

**Rationale**:
- Clarification #2 confirmed route-based navigation (`/codelab/[filename]`)
- App Router best practice for dynamic content
- Server Component by default (file reading happens server-side)
- Automatic route generation, no manual routing needed
- Slug parameter maps directly to filename in `content/` directory

**Alternatives Considered**:
- Query params (`/codelab?file=demo`) - Rejected: Less clean URLs, worse SEO/bookmarking
- File picker UI - Rejected per clarification #2
- Index page with links - Deferred to post-MVP

**Implementation**:
```typescript
// app/codelab/[slug]/page.tsx
export default async function CodelabPage({ params }: { params: { slug: string } }) {
  const { content, frontmatter } = await getCodelab(params.slug)
  return <article>{content}</article>
}
```

### 4. localStorage Hook Design

**Decision**: Custom `useLocalStorage` hook with debounced auto-save (500ms-1s delay)

**Rationale**:
- Clarification #4 confirmed debounced auto-save strategy
- Prevents performance issues from saving on every keystroke
- Composite key pattern (`codelab:${slug}:${id}`) ensures per-codelab isolation (clarification #3)
- TypeScript generics for type-safe storage

**Alternatives Considered**:
- Save on every keystroke - Rejected per clarification #4 (performance concerns)
- Manual save button - Rejected: Poor UX, users forget to save
- Save on blur only - Rejected: Loses data if user closes tab while focused

**Implementation Pattern**:
```typescript
// lib/storage.ts
import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T, debounceMs = 500) {
  const [value, setValue] = useState<T>(initialValue)

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    const stored = localStorage.getItem(key)
    if (stored) setValue(JSON.parse(stored) as T)
  }, [key])

  // Debounced save
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(value))
    }, debounceMs)
    return () => clearTimeout(timeout)
  }, [key, value, debounceMs])

  return [value, setValue] as const
}
```

### 5. Component Mapping Architecture

**Decision**: Export typed MDX components object from `components/mdx/mdx-components.ts`

**Rationale**:
- Constitution Principle III mandates custom component mapping
- Centralized configuration makes styling consistent
- TypeScript ensures correct props for each component
- Easy to extend with new custom components (e.g., `<MultipleChoice>` in future)

**Component Responsibilities**:
- **Server Components** (Heading, Paragraph, List, CodeBlock, Blockquote): Static rendering, Tailwind styling, semantic HTML
- **Client Components** (FreeResponse): State management, localStorage integration, event handlers

**Implementation Pattern**:
```typescript
// components/mdx/mdx-components.ts
import { Heading } from './Heading'
import { Paragraph } from './Paragraph'
import { CodeBlock } from './CodeBlock'
import { FreeResponse } from './FreeResponse'
import type { MDXComponents } from 'mdx/types'

export const mdxComponents: MDXComponents = {
  h1: (props) => <Heading level={1} {...props} />,
  h2: (props) => <Heading level={2} {...props} />,
  h3: (props) => <Heading level={3} {...props} />,
  h4: (props) => <Heading level={4} {...props} />,
  h5: (props) => <Heading level={5} {...props} />,
  h6: (props) => <Heading level={6} {...props} />,
  p: Paragraph,
  pre: CodeBlock,
  ul: (props) => <List type="unordered" {...props} />,
  ol: (props) => <List type="ordered" {...props} />,
  FreeResponse, // Custom component
}
```

### 6. Error Handling Strategy

**Decision**: Use Next.js error boundaries + graceful fallback UI

**Rationale**:
- Spec requirement FR-011: Handle missing files gracefully
- Edge cases identified: missing files, invalid MDX syntax, large files
- Next.js provides `error.tsx` and `not-found.tsx` conventions
- Server-side error handling prevents client crashes

**Error Categories**:
1. **File Not Found**: Show `not-found.tsx` with friendly message
2. **Invalid MDX Syntax**: Catch compilation errors, display syntax error message
3. **localStorage Disabled**: FreeResponse shows warning banner, still allows typing
4. **Duplicate IDs**: Console warning via `useEffect` check

**Implementation Pattern**:
```typescript
// app/codelab/[slug]/page.tsx
export default async function CodelabPage({ params }: { params: { slug: string } }) {
  try {
    const { content } = await getCodelab(params.slug)
    return <article>{content}</article>
  } catch (error) {
    if (error.code === 'ENOENT') notFound() // Triggers not-found.tsx
    throw error // Triggers error.tsx
  }
}

// app/codelab/[slug]/not-found.tsx
export default function NotFound() {
  return <ErrorMessage message="Codelab not found. Check the filename and try again." />
}
```

### 7. Tailwind Styling Strategy

**Decision**: Define custom typography scale in `tailwind.config.ts`, use utility classes in components

**Rationale**:
- Constitution Principle III: All elements styled with Tailwind
- Centralized theme configuration ensures consistency
- Responsive design with mobile-first approach
- Accessibility: Sufficient color contrast, readable line heights

**Key Styling Decisions**:
- **Headings**: `prose` typography plugin for consistent sizes (h1: 2.25rem, h2: 1.875rem, etc.)
- **Code Blocks**: Monospace font (`font-mono`), dark background (`bg-gray-900`), light text (`text-gray-100`), rounded corners (`rounded-lg`), padding (`p-4`)
- **Paragraphs**: Max width for readability (`max-w-prose`), comfortable line height (`leading-7`)
- **FreeResponse**: Auto-resize textarea using `resize-none` + dynamic height calculation

**Implementation**:
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#374151',
            h1: { fontSize: '2.25rem', fontWeight: '700' },
            h2: { fontSize: '1.875rem', fontWeight: '600' },
            code: {
              backgroundColor: '#1f2937',
              color: '#f9fafb',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
            },
          }
        }
      }
    }
  }
}
```

### 8. Auto-Resize Textarea Implementation

**Decision**: Use controlled component with dynamic height calculation based on `scrollHeight`

**Rationale**:
- Clarification #1 confirmed multi-line textarea with auto-resize
- Better UX than fixed-height textarea (no manual resizing needed)
- CSS-only solutions (e.g., `contenteditable`) have accessibility issues
- Controlled input integrates cleanly with `useLocalStorage` hook

**Implementation Pattern**:
```typescript
// components/mdx/FreeResponse.tsx
'use client'
import { useRef, useEffect } from 'react'
import { useLocalStorage } from '@/lib/storage'

export function FreeResponse({ id }: { id: string }) {
  const slug = useSlug() // Custom hook to get current codelab slug
  const storageKey = `codelab:${slug}:${id}`
  const [value, setValue] = useLocalStorage(storageKey, '', 500)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full p-3 border rounded-lg resize-none"
      rows={3}
    />
  )
}
```

## Best Practices Applied

### Next.js 14 App Router
- Use Server Components by default (only `FreeResponse` is Client Component)
- Leverage file-system routing for dynamic segments
- Use TypeScript for all files with strict mode enabled
- Follow Next.js metadata API for SEO (optional for MVP)

### React Patterns
- Controlled components for form inputs
- Custom hooks for reusable logic (`useLocalStorage`, `useSlug`)
- Proper `useEffect` cleanup for debounce timers
- `useRef` for DOM manipulation (textarea auto-resize)

### TypeScript
- Explicit return types for async functions
- Interface for component props (not inline types)
- Generic types for reusable hooks (`useLocalStorage<T>`)
- Type guards for error handling (e.g., `error.code === 'ENOENT'`)

### Accessibility
- Semantic HTML elements (`<article>`, `<section>`, `<nav>`)
- ARIA labels for interactive elements (`aria-label="Free response answer"`)
- Keyboard navigation support (textareas natively support Tab/Shift+Tab)
- Sufficient color contrast ratios (WCAG AA standard)

### Performance
- Server-side MDX compilation (no client bundle bloat)
- Debounced localStorage writes (reduce I/O operations)
- Minimal client JavaScript (only FreeResponse component)
- No external API calls (all data from file system)

## Dependencies

### Core
- `next@14.x` - App Router framework
- `react@18.x` - UI library
- `react-dom@18.x` - DOM renderer
- `typescript@5.x` - Type safety

### MDX Processing
- `next-mdx-remote@5.x` - RSC-compatible MDX compiler
- `remark-gfm@4.x` - GitHub Flavored Markdown support

### Styling
- `tailwindcss@3.x` - Utility-first CSS framework
- `@tailwindcss/typography` - Prose styling plugin
- `clsx@2.x` - Conditional class names
- `tailwind-merge@2.x` - Merge Tailwind classes without conflicts

### Utilities
- `@types/node` - Node.js type definitions
- `@types/react` - React type definitions
- `@types/react-dom` - React DOM type definitions

### Development (Optional for MVP)
- `eslint` - Code linting
- `prettier` - Code formatting
- `jest` + `@testing-library/react` - Unit tests
- `playwright` - E2E tests

## Open Questions / Future Enhancements

### Deferred to Post-MVP
1. **Syntax Highlighting**: User chose CSS-only for MVP, but could add `rehype-pretty-code` later if requested
2. **Index Page**: List of all codelabs with links (currently requires manual URL entry)
3. **Progress Tracking**: Visual indicator of completed FreeResponse questions
4. **Export Answers**: Download all responses as JSON or PDF
5. **Dark Mode**: Toggle between light/dark themes
6. **Frontmatter Support**: Extract metadata (title, author, duration) from Markdown frontmatter
7. **Nested Directories**: Support `content/tutorials/intro.md` structure
8. **Copy Button**: Add copy-to-clipboard button on code blocks
9. **Multiple Custom Components**: `<MultipleChoice>`, `<CodeEditor>`, `<Quiz>`

### Resolved in Clarifications
- ✅ Input type (multi-line textarea)
- ✅ Navigation strategy (route-based)
- ✅ localStorage scope (per-codelab isolation)
- ✅ Save timing (debounced auto-save)
- ✅ Code block styling (CSS-only, no library)

## References

- [Next.js 14 App Router Docs](https://nextjs.org/docs/app)
- [next-mdx-remote RSC Guide](https://github.com/hashicorp/next-mdx-remote)
- [remark-gfm Plugin](https://github.com/remarkjs/remark-gfm)
- [Tailwind CSS Typography Plugin](https://tailwindcss.com/docs/typography-plugin)
- [React Hook Patterns](https://react.dev/reference/react/hooks)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
