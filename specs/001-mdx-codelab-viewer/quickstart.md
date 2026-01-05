# Quickstart Guide: Local MDX Codelab Viewer

**Phase 1 Output** | **Date**: 2026-01-05 | **Plan**: [plan.md](./plan.md)

## Overview

This guide provides step-by-step instructions for implementing the Local MDX Codelab Viewer from scratch. Follow these steps in order to build a functional MVP.

## Prerequisites

- **Node.js**: 18.x or higher
- **Package Manager**: npm, yarn, or pnpm
- **Editor**: VS Code recommended (with TypeScript support)
- **Git**: For version control (optional)

## Project Setup (15 minutes)

### Step 1: Initialize Next.js Project

```bash
# Create new Next.js 14 project with TypeScript and Tailwind
npx create-next-app@latest mdparser --typescript --tailwind --app --no-src-dir

cd mdparser
```

**Configuration choices** (when prompted):
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes
- Import alias: `@/*` (default)

### Step 2: Install Dependencies

```bash
npm install next-mdx-remote@5 remark-gfm@4 clsx tailwind-merge
npm install -D @types/node @types/react @types/react-dom
```

**Dependencies breakdown**:
- `next-mdx-remote@5`: MDX compilation with RSC support
- `remark-gfm@4`: GitHub Flavored Markdown (tables, task lists, strikethrough)
- `clsx`: Conditional class names utility
- `tailwind-merge`: Merge Tailwind classes without conflicts

### Step 3: Configure TypeScript

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Step 4: Configure Tailwind CSS

Update `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#374151',
            a: {
              color: '#3b82f6',
              '&:hover': {
                color: '#2563eb',
              },
            },
            h1: {
              fontSize: '2.25rem',
              fontWeight: '700',
              marginTop: '0',
              marginBottom: '1rem',
            },
            h2: {
              fontSize: '1.875rem',
              fontWeight: '600',
              marginTop: '2rem',
              marginBottom: '0.75rem',
            },
            h3: {
              fontSize: '1.5rem',
              fontWeight: '600',
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
            },
            code: {
              backgroundColor: '#1f2937',
              color: '#f9fafb',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
```

Install typography plugin:

```bash
npm install -D @tailwindcss/typography
```

## Core Implementation (90 minutes)

### Step 5: Create Utility Functions

Create `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Step 6: Create localStorage Hook

Create `lib/storage.ts`:

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  debounceMs: number = 500
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        setValue(JSON.parse(stored) as T)
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error)
    } finally {
      setIsLoading(false)
    }
  }, [key])

  // Debounced save to localStorage
  useEffect(() => {
    if (isLoading) return // Don't save during initial load

    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error(`Error saving to localStorage key "${key}":`, error)
      }
    }, debounceMs)

    return () => clearTimeout(timeout)
  }, [key, value, debounceMs, isLoading])

  return [value, setValue]
}
```

### Step 7: Create MDX Utilities

Create `lib/mdx.ts`:

```typescript
import { compileMDX } from 'next-mdx-remote/rsc'
import { readFile } from 'fs/promises'
import path from 'path'
import remarkGfm from 'remark-gfm'
import type { CodelabFrontmatter } from '@/specs/001-mdx-codelab-viewer/contracts/components'
import { mdxComponents } from '@/components/mdx/mdx-components'

export async function getCodelab(slug: string) {
  const filePath = path.join(process.cwd(), 'content', `${slug}.md`)

  const source = await readFile(filePath, 'utf-8')

  const { content, frontmatter } = await compileMDX<CodelabFrontmatter>({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  })

  return {
    slug,
    content,
    frontmatter: frontmatter || null,
  }
}
```

### Step 8: Create MDX Components

Create `components/mdx/Heading.tsx`:

```typescript
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: ReactNode
  className?: string
}

const levelStyles = {
  1: 'text-4xl font-bold mb-4 mt-0',
  2: 'text-3xl font-semibold mb-3 mt-8',
  3: 'text-2xl font-semibold mb-2 mt-6',
  4: 'text-xl font-semibold mb-2 mt-4',
  5: 'text-lg font-semibold mb-2 mt-4',
  6: 'text-base font-semibold mb-2 mt-4',
}

export function Heading({ level, children, className }: HeadingProps) {
  const Tag = `h${level}` as const
  return (
    <Tag className={cn(levelStyles[level], className)}>
      {children}
    </Tag>
  )
}
```

Create `components/mdx/Paragraph.tsx`:

```typescript
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ParagraphProps {
  children: ReactNode
  className?: string
}

export function Paragraph({ children, className }: ParagraphProps) {
  return (
    <p className={cn('mb-4 leading-7 max-w-prose', className)}>
      {children}
    </p>
  )
}
```

Create `components/mdx/CodeBlock.tsx`:

```typescript
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  children: ReactNode
  className?: string
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  // Inline code
  if (typeof children === 'string') {
    return (
      <code className={cn('bg-gray-900 text-gray-100 px-1.5 py-0.5 rounded text-sm font-mono', className)}>
        {children}
      </code>
    )
  }

  // Code block
  return (
    <pre className={cn('bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm', className)}>
      {children}
    </pre>
  )
}
```

Create `components/mdx/FreeResponse.tsx`:

```typescript
'use client'

import { useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useLocalStorage } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface FreeResponseProps {
  id: string
  placeholder?: string
  rows?: number
  className?: string
}

export function FreeResponse({
  id,
  placeholder = 'Type your answer here...',
  rows = 3,
  className,
}: FreeResponseProps) {
  const pathname = usePathname()
  const slug = pathname?.split('/').pop() || 'unknown'
  const storageKey = `codelab:${slug}:${id}`

  const [value, setValue] = useLocalStorage(storageKey, '', 500)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  return (
    <div className="my-6">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          'w-full p-3 border border-gray-300 rounded-lg resize-none',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'placeholder:text-gray-400',
          className
        )}
        aria-label={`Free response answer for ${id}`}
      />
    </div>
  )
}
```

Create `components/mdx/mdx-components.ts`:

```typescript
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
  code: CodeBlock,
  pre: ({ children }) => <>{children}</>, // Wrapper handled by CodeBlock
  FreeResponse,
}
```

### Step 9: Create Dynamic Route

Create `app/codelab/[slug]/page.tsx`:

```typescript
import { getCodelab } from '@/lib/mdx'
import { notFound } from 'next/navigation'

interface CodelabPageProps {
  params: {
    slug: string
  }
}

export default async function CodelabPage({ params }: CodelabPageProps) {
  try {
    const { content, frontmatter } = await getCodelab(params.slug)

    return (
      <article className="max-w-4xl mx-auto px-6 py-12">
        {frontmatter?.title && (
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{frontmatter.title}</h1>
            {frontmatter.description && (
              <p className="text-gray-600">{frontmatter.description}</p>
            )}
          </header>
        )}
        <div className="prose prose-lg">{content}</div>
      </article>
    )
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      notFound()
    }
    throw error
  }
}
```

Create `app/codelab/[slug]/not-found.tsx`:

```typescript
export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-center">
      <h1 className="text-3xl font-bold mb-4">Codelab Not Found</h1>
      <p className="text-gray-600 mb-6">
        The codelab you're looking for doesn't exist. Check the filename and try again.
      </p>
      <a href="/" className="text-blue-500 hover:underline">
        Return Home
      </a>
    </div>
  )
}
```

### Step 10: Create Sample Codelab

Create `content/demo.md`:

```markdown
---
title: "Demo Codelab: React Hooks"
description: "Learn the basics of React hooks"
duration: 15
author: "Your Name"
tags: ["react", "hooks", "tutorial"]
---

# Introduction to React Hooks

Welcome to this interactive codelab! Let's learn about React hooks.

## What are hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from function components.

### Question 1

What is your favorite React hook and why?

<FreeResponse id="q1" />

## Common Hooks

The three most common hooks are:

1. **useState** - Manage component state
2. **useEffect** - Perform side effects
3. **useContext** - Access React context

```javascript
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
```

### Question 2

Describe a scenario where you would use `useEffect` instead of `useState`.

<FreeResponse id="q2" placeholder="Think about side effects like data fetching..." />

## Summary

You've learned the basics of React hooks! Keep practicing and experimenting.
```

### Step 11: Update Root Layout

Update `app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MDX Codelab Viewer',
  description: 'Interactive codelabs powered by MDX',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

## Testing & Verification (15 minutes)

### Step 12: Run Development Server

```bash
npm run dev
```

Open browser to: http://localhost:3000/codelab/demo

### Step 13: Verify Core Functionality

**Checklist**:
- [ ] Codelab renders with professional styling
- [ ] Headings have distinct sizes and spacing
- [ ] Code blocks display with monospace font and dark background
- [ ] FreeResponse textareas are visible and editable
- [ ] Typing in textarea triggers debounced save (wait 1 second)
- [ ] Refresh page → answers persist
- [ ] Clear browser data → answers reset to empty
- [ ] Navigate to `/codelab/nonexistent` → shows 404 page
- [ ] Edit `content/demo.md` → browser auto-refreshes within 2 seconds

### Step 14: Test Edge Cases

1. **localStorage disabled**: Open incognito mode, verify textarea still works
2. **Long code lines**: Add 200-character line to code block, verify horizontal scroll
3. **Multiple textareas**: Verify each saves independently
4. **Invalid MDX**: Add unclosed JSX tag (`<FreeResponse id="bad"`), verify error page

## Next Steps

### Post-MVP Enhancements
1. Add index page listing all codelabs
2. Implement syntax highlighting with `rehype-pretty-code`
3. Add progress indicator showing completed questions
4. Create export feature to download answers as JSON
5. Add copy button to code blocks
6. Implement dark mode toggle

### Deployment (Optional)
This tool is designed for localhost only. For production deployment:
- Remove file system reads (move to build-time generation)
- Add authentication if needed
- Set up CI/CD pipeline
- Configure environment variables

## Troubleshooting

### "Module not found: Can't resolve 'fs'"
**Cause**: Trying to use `fs` in Client Component
**Fix**: Ensure `getCodelab()` is only called in Server Components

### "localStorage is not defined"
**Cause**: Accessing localStorage during server-side render
**Fix**: Wrap localStorage access in `useEffect` hook

### "MDX syntax error"
**Cause**: Invalid MDX in content file
**Fix**: Check for unclosed JSX tags, mismatched braces

### Answers not persisting
**Cause**: localStorage quota exceeded or disabled
**Fix**: Check browser dev tools → Application → Local Storage

## References

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [next-mdx-remote Guide](https://github.com/hashicorp/next-mdx-remote)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Hooks Reference](https://react.dev/reference/react/hooks)
