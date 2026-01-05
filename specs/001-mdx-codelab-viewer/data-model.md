# Data Model: Local MDX Codelab Viewer

**Phase 1 Output** | **Date**: 2026-01-05 | **Plan**: [plan.md](./plan.md)

## Overview

This document defines the data structures, entities, and their relationships for the Local MDX Codelab Viewer. Since this is a client-side application with no backend, data flows through three primary layers:

1. **File System** (source of truth for content)
2. **Runtime Memory** (parsed MDX components)
3. **Browser Storage** (persistent user state)

## Core Entities

### 1. Codelab

Represents a single Markdown file that contains tutorial/lab content.

**Source**: File system (`content/*.md`)

**Attributes**:
- `slug` (string, required): URL-safe identifier derived from filename (e.g., `"demo"` from `demo.md`)
- `content` (React Element, computed): Compiled MDX content as React Server Component tree
- `frontmatter` (object, optional): Metadata extracted from YAML frontmatter

**Frontmatter Schema** (optional for MVP):
```typescript
interface CodelabFrontmatter {
  title?: string        // Display title
  description?: string  // Short description
  duration?: number     // Estimated minutes to complete
  author?: string       // Author name
  tags?: string[]       // Category tags
}
```

**Validation Rules**:
- Slug must match filename pattern: `[a-z0-9-]+` (lowercase alphanumeric with hyphens)
- File must exist at `content/${slug}.md`
- File must be valid Markdown/MDX (will throw compilation error if malformed)

**State Transitions**: None (read-only entity)

**Example**:
```markdown
---
title: "Introduction to React Hooks"
duration: 30
author: "Jane Doe"
tags: ["react", "hooks", "tutorial"]
---

# Introduction to React Hooks

This codelab teaches you about React Hooks.

## useState

...
```

### 2. FreeResponse

Represents a single user-input question/answer pair within a codelab.

**Source**: Custom MDX component (`<FreeResponse id="q1" />`)

**Attributes**:
- `id` (string, required): Unique identifier within the codelab scope
- `value` (string): User's typed answer (multi-line text)
- `slug` (string, computed): Current codelab slug from route params
- `storageKey` (string, computed): Composite key for localStorage (`codelab:${slug}:${id}`)

**Validation Rules**:
- ID must be unique within a single codelab (console warning if duplicates detected)
- ID should be alphanumeric + hyphens/underscores: `[a-zA-Z0-9_-]+`
- Value can be empty string (no minimum length requirement)
- Storage key must follow pattern: `codelab:{slug}:{id}`

**State Transitions**:
```
┌──────────┐
│  Empty   │ (initial state, no localStorage entry)
└─────┬────┘
      │ User types
      ▼
┌──────────┐
│  Typing  │ (value changes, debounce timer running)
└─────┬────┘
      │ 500ms-1s delay
      ▼
┌──────────┐
│  Saved   │ (persisted to localStorage)
└─────┬────┘
      │ User clears browser data
      ▼
┌──────────┐
│  Empty   │ (back to initial state)
└──────────┘
```

**Relationships**:
- Many FreeResponses belong to one Codelab (1:N)
- FreeResponses are isolated per codelab (same ID in different codelabs = different storage keys)

**Example**:
```typescript
// In MDX file: content/demo.md
<FreeResponse id="q1" />
<FreeResponse id="q2" />

// Resulting storage keys when viewing /codelab/demo:
// "codelab:demo:q1" → "User's answer to question 1"
// "codelab:demo:q2" → "User's answer to question 2"
```

### 3. MDX Component

Represents a custom React component used for rendering Markdown elements.

**Source**: Component map (`components/mdx/mdx-components.ts`)

**Attributes**:
- `type` (string): Markdown element type (e.g., `"h1"`, `"p"`, `"pre"`)
- `component` (React Component): Corresponding custom component
- `renderMode` ("server" | "client"): Indicates if component is Server or Client Component

**Component Registry**:
```typescript
interface MDXComponentMap {
  h1: ServerComponent        // Heading level 1
  h2: ServerComponent        // Heading level 2
  h3: ServerComponent        // Heading level 3
  h4: ServerComponent        // Heading level 4
  h5: ServerComponent        // Heading level 5
  h6: ServerComponent        // Heading level 6
  p: ServerComponent         // Paragraph
  ul: ServerComponent        // Unordered list
  ol: ServerComponent        // Ordered list
  li: ServerComponent        // List item
  pre: ServerComponent       // Code block container
  code: ServerComponent      // Inline code / code block content
  blockquote: ServerComponent // Blockquote
  FreeResponse: ClientComponent // Custom interactive component
}
```

**Validation Rules**:
- All standard Markdown elements must have a mapped component
- Custom components must be explicitly registered
- Client Components must use `"use client"` directive
- Server Components must NOT use client-side hooks (`useState`, `useEffect`, etc.)

**State Transitions**: None (static configuration)

## Data Flow

### 1. Codelab Rendering Flow

```
User navigates to /codelab/demo
    │
    ▼
Next.js dynamic route captures slug="demo"
    │
    ▼
Server Component calls getCodelab("demo")
    │
    ├─► Read file: content/demo.md (Node.js fs/promises)
    │
    ├─► Parse frontmatter (YAML)
    │
    ├─► Compile MDX (next-mdx-remote/rsc)
    │       │
    │       ├─► Apply remark-gfm plugin
    │       │
    │       └─► Map elements to custom components
    │
    └─► Return { content, frontmatter }
    │
    ▼
Render content as React Server Component tree
    │
    ▼
Client Components hydrate on browser
    │
    └─► FreeResponse loads from localStorage
```

### 2. FreeResponse Persistence Flow

```
FreeResponse component mounts
    │
    ▼
useLocalStorage hook initializes
    │
    ├─► Check localStorage for key "codelab:demo:q1"
    │       │
    │       ├─► If found: Load value into state
    │       │
    │       └─► If not found: Use empty string
    │
    ▼
User types in textarea
    │
    ├─► onChange event fires
    │
    ├─► Update local state
    │
    └─► Trigger debounced save (500ms timer)
    │
    ▼
Timer expires (no new keystrokes for 500ms)
    │
    └─► Write to localStorage.setItem("codelab:demo:q1", value)
```

### 3. Error Handling Flow

```
User navigates to /codelab/nonexistent
    │
    ▼
getCodelab("nonexistent") attempts file read
    │
    └─► fs.readFile throws ENOENT error
    │
    ▼
Catch error in page component
    │
    └─► Call notFound() helper
    │
    ▼
Next.js renders not-found.tsx
    │
    └─► Display "Codelab not found" message
```

## Storage Schema

### localStorage Keys

Pattern: `codelab:{slug}:{id}`

**Examples**:
```
codelab:demo:q1 → "React hooks are..."
codelab:demo:q2 → "The three main hooks are..."
codelab:intro:q1 → "My favorite framework is..."
```

**Key Properties**:
- Namespaced with `codelab:` prefix to avoid conflicts with other apps
- Slug ensures isolation between different codelabs
- ID uniquely identifies question within a codelab

**Data Type**: String (JSON serialized by `useLocalStorage` hook)

**Size Constraints**:
- localStorage limit: ~5-10MB per origin (browser-dependent)
- Expected usage: <1KB per answer, <100KB total per codelab
- No explicit quota management needed for MVP

### File System Structure

```
content/
├── demo.md              # Example codelab
├── intro.md             # Another codelab
└── advanced.md          # Advanced codelab
```

**Naming Convention**:
- Lowercase alphanumeric + hyphens only
- No spaces, underscores, or special characters
- Extension: `.md` or `.mdx`

**File Format**: UTF-8 encoded Markdown with optional YAML frontmatter

## Type Definitions

### TypeScript Interfaces

```typescript
// lib/types.ts

export interface CodelabFrontmatter {
  title?: string
  description?: string
  duration?: number
  author?: string
  tags?: string[]
}

export interface Codelab {
  slug: string
  content: React.ReactElement
  frontmatter: CodelabFrontmatter | null
}

export interface FreeResponseProps {
  id: string
  placeholder?: string
}

export interface MDXComponents {
  [key: string]: React.ComponentType<any>
}

// Utility types
export type StorageKey = `codelab:${string}:${string}`

export interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: T) => void
  clear: () => void
}
```

## Validation Rules Summary

### Codelab
- ✅ Slug must be URL-safe (alphanumeric + hyphens)
- ✅ File must exist in `content/` directory
- ✅ Must be valid Markdown/MDX syntax
- ❌ No validation for frontmatter structure (optional fields)

### FreeResponse
- ✅ ID must be unique within codelab scope (warning if duplicate)
- ✅ ID should be alphanumeric + hyphens/underscores
- ✅ Storage key must follow `codelab:{slug}:{id}` pattern
- ❌ No minimum/maximum length for answer text

### localStorage
- ✅ Keys must be strings
- ✅ Values must be JSON-serializable
- ❌ No quota enforcement (rely on browser limits)
- ❌ No data migration strategy (clear storage if format changes)

## Edge Cases

### 1. Missing File
**Trigger**: User navigates to `/codelab/nonexistent`
**Behavior**: Render `not-found.tsx` with friendly error message
**Data Impact**: None (no state mutation)

### 2. Invalid MDX Syntax
**Trigger**: Codelab file contains malformed MDX (e.g., unclosed JSX tag)
**Behavior**: Compilation error caught by `error.tsx` boundary
**Data Impact**: None (no partial rendering)

### 3. localStorage Disabled
**Trigger**: Browser privacy settings or incognito mode
**Behavior**: FreeResponse still renders, but shows warning banner
**Data Impact**: User can type but answers won't persist

### 4. Duplicate FreeResponse IDs
**Trigger**: Two `<FreeResponse id="q1" />` in same codelab
**Behavior**: Console warning logged, last component "wins" (overwrites previous)
**Data Impact**: First component's answer is lost

### 5. Large File (>10,000 lines)
**Trigger**: User opens very large codelab file
**Behavior**: Slower initial render (<5s), but still functional
**Data Impact**: None (acceptable performance degradation for edge case)

### 6. Concurrent Edits (Multiple Tabs)
**Trigger**: User opens same codelab in two tabs, types in both
**Behavior**: Last tab to save overwrites other (no conflict resolution)
**Data Impact**: Potential data loss if tabs race to save
**Mitigation**: Document as known limitation (single-user tool assumption)

## Future Enhancements

### Deferred to Post-MVP
1. **Progress Tracking**: Add `completed: boolean` field to FreeResponse entity
2. **Timestamps**: Record `lastModified: Date` for each answer
3. **Export/Import**: Serialize all answers to JSON for backup
4. **Versioning**: Track codelab file hash to detect content changes
5. **Nested Directories**: Support `content/tutorials/intro.md` with slug `tutorials-intro`
6. **Frontmatter Validation**: Enforce required fields (e.g., `title` must exist)
7. **localStorage Quotas**: Implement quota monitoring and cleanup

## References

- [localStorage API Spec](https://html.spec.whatwg.org/multipage/webstorage.html)
- [MDX Specification](https://mdxjs.com/docs/what-is-mdx/)
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [TypeScript Handbook: Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)
