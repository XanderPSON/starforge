# Quickstart: Interactive Component Library

**Feature**: 002-interactive-component-library
**Audience**: Developers implementing or using the interactive components
**Time to Complete**: 15 minutes

---

## Overview

The Interactive Component Library adds five specialized React components to the MDX Codelab Viewer, enabling learners to interact with content through text responses, quizzes, sentiment ratings, and task tracking. All components automatically persist user progress to browser localStorage.

**Components**:
1. **FreeResponse** - Multi-line text input with auto-save
2. **MultipleChoice** - Quiz with immediate correctness feedback
3. **TemperatureCheck** - 5-emoji sentiment selector
4. **Scale** - Volume-bar style rating (1-N)
5. **Checklist** - Task list with checkbox persistence

**Core Hook**: `useInteractive(id, defaultValue)` - Unified state management

---

## Quick Start (For Content Authors)

### 1. FreeResponse - Open-Ended Questions

```mdx
<FreeResponse
  id="intro-response"
  label="What did you learn today?"
  placeholder="Type your answer here..."
/>
```

**Features**:
- Auto-resizing textarea
- "Saved" indicator appears 1s after typing stops
- Persists across page reloads

---

### 2. MultipleChoice - Knowledge Checks

```mdx
<MultipleChoice
  id="quiz-1"
  question="What is the capital of France?"
  options={["London", "Berlin", "Paris", "Madrid"]}
  correctAnswer="Paris"
/>
```

**Features**:
- Green border/background on correct selection
- Red border/background on incorrect selection
- Selection persists across page reloads
- Can change answer after submitting

---

### 3. TemperatureCheck - Sentiment Feedback

```mdx
<TemperatureCheck id="confusion-check" />
```

**Features**:
- 5 emoji options: 😕 (Confused) → 🤩 (Starstruck)
- Selected emoji scales up (1.25x)
- Smooth 300ms animation
- Selection persists across page reloads

---

### 4. Scale - Numeric Ratings

```mdx
<Scale
  id="confidence-scale"
  max={5}
  label="How confident do you feel?"
/>
```

**Features**:
- Renders `max` circles (default: 5)
- Highlights all circles up to selected value (●●●○○)
- Instant visual feedback (<100ms)
- Selection persists across page reloads

---

### 5. Checklist - Task Tracking

```mdx
<Checklist
  id="setup-checklist"
  items={[
    "Install Node.js",
    "Clone the repository",
    "Run npm install",
    "Start the dev server"
  ]}
/>
```

**Features**:
- Native checkbox inputs (keyboard accessible)
- Individual item persistence
- Check/uncheck items in any order
- State persists across page reloads

---

## Implementation Quickstart (For Developers)

### Step 1: Implement the `useInteractive` Hook

**File**: `lib/storage.ts`

```typescript
import { useState, useEffect } from 'react'

export function useInteractive<T>(
  id: string,
  defaultValue: T
): [T | undefined, (value: T) => void, boolean] {
  const [value, setValue] = useState<T | undefined>(undefined)
  const [isSaved, setIsSaved] = useState(true)

  // Client-only hydration (prevents SSR mismatch)
  useEffect(() => {
    const stored = localStorage.getItem(`codelab:${id}`)
    setValue(stored ? JSON.parse(stored) : defaultValue)
  }, [id, defaultValue])

  // Save to localStorage with debounce
  useEffect(() => {
    if (value === undefined) return // Skip during hydration

    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(`codelab:${id}`, JSON.stringify(value))
        setIsSaved(true)
      } catch (error) {
        console.error('Failed to save to localStorage', error)
        setIsSaved(false)
      }
    }, 500) // 500ms debounce

    setIsSaved(false)
    return () => clearTimeout(timeout)
  }, [value, id])

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `codelab:${id}` && e.newValue) {
        setValue(JSON.parse(e.newValue))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [id])

  return [value, setValue, isSaved]
}
```

---

### Step 2: Implement a Component (Example: FreeResponse)

**File**: `components/mdx/FreeResponse.tsx`

```typescript
'use client'

import { useInteractive } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface FreeResponseProps {
  id: string
  label: string
  placeholder?: string
  className?: string
}

export function FreeResponse({
  id,
  label,
  placeholder = '',
  className
}: FreeResponseProps) {
  const [value, setValue, isSaved] = useInteractive<string>(id, '')

  if (value === undefined) {
    // Show skeleton during hydration
    return <div className="h-32 bg-white/5 animate-pulse rounded-lg" />
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>

      <textarea
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full min-h-[128px] px-4 py-3 rounded-lg',
          'bg-white/5 backdrop-blur-sm border border-white/10',
          'text-white placeholder:text-white/40',
          'focus:ring-2 focus:ring-blue-500/50 focus:outline-none',
          'resize-none transition-colors'
        )}
      />

      {isSaved && (
        <p className="text-xs text-green-400">✓ Saved</p>
      )}
    </div>
  )
}
```

---

### Step 3: Register Components in MDX Mapping

**File**: `lib/mdx.ts`

```typescript
import { FreeResponse } from '@/components/mdx/FreeResponse'
import { MultipleChoice } from '@/components/mdx/MultipleChoice'
import { TemperatureCheck } from '@/components/mdx/TemperatureCheck'
import { Scale } from '@/components/mdx/Scale'
import { Checklist } from '@/components/mdx/Checklist'

export const components = {
  // ... existing components (h1, h2, p, etc.)
  FreeResponse,
  MultipleChoice,
  TemperatureCheck,
  Scale,
  Checklist,
}
```

---

### Step 4: Use in MDX Files

**File**: `content/components-demo.md`

```mdx
# Interactive Components Demo

## Free Response

<FreeResponse id="demo-1" label="What did you learn?" placeholder="Type here..." />

## Multiple Choice Quiz

<MultipleChoice
  id="demo-2"
  question="What is 2 + 2?"
  options={["3", "4", "5"]}
  correctAnswer="4"
/>

## Temperature Check

<TemperatureCheck id="demo-3" />

## Scale Rating

<Scale id="demo-4" max={5} label="Rate your understanding" />

## Checklist

<Checklist
  id="demo-5"
  items={["Read docs", "Try components", "Build codelab"]}
/>
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│ MDX File (content/demo.md)                          │
│   - Contains component tags with props              │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│ Server Component (app/codelab/[slug]/page.tsx)     │
│   - Reads MDX file from disk                        │
│   - Parses with next-mdx-remote/rsc                 │
│   - Maps components to React instances              │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│ Client Components (components/mdx/*.tsx)            │
│   - FreeResponse, MultipleChoice, etc.              │
│   - Each uses useInteractive() hook                 │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│ useInteractive Hook (lib/storage.ts)                │
│   - Hydrates from localStorage on mount             │
│   - Debounces writes (500ms)                        │
│   - Listens for storage events (cross-tab sync)    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│ localStorage (browser)                              │
│   Key: codelab:{slug}:{componentId}                 │
│   Value: { id, value, updatedAt, version }          │
└─────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### 1. Client-Only Rendering (Hydration Safety)

**Why**: Prevents React hydration mismatch errors when localStorage value differs from SSR output.

**How**: Components return `undefined` during SSR, then hydrate with localStorage value in `useEffect`.

---

### 2. Debounced Auto-Save (500ms)

**Why**: Reduces localStorage write frequency for text input (performance).

**How**: `setTimeout` with 500ms delay, cleared on each keystroke. Only writes after user stops typing.

---

### 3. Cross-Tab Synchronization

**Why**: FR-024 requires real-time state sync across browser tabs.

**How**: Listen to `storage` events, which fire when another tab modifies localStorage.

---

### 4. Graceful Error Handling

**Why**: localStorage can be disabled (private browsing, security policies) or full (quota exceeded).

**How**: Try-catch around all localStorage operations, console warnings, component remains functional with in-memory state.

---

### 5. Component ID Conflicts

**Why**: Duplicate IDs cause state corruption (components overwrite each other).

**How**: Runtime detection via React Context registry, throw error and render error UI when duplicates detected (FR-027).

---

## Testing Checklist

- [ ] Component persists value across page reload (F5)
- [ ] Component persists value across browser close/reopen
- [ ] Component syncs state when same codelab is open in 2 tabs
- [ ] Component shows "Saved" indicator after debounce delay
- [ ] Component handles localStorage disabled (private browsing)
- [ ] Component handles localStorage quota exceeded
- [ ] Component is keyboard accessible (Tab, Enter, Space)
- [ ] Component has ARIA labels for screen readers
- [ ] Component shows error UI when required props are missing
- [ ] Component shows error UI when duplicate ID is detected

---

## Common Pitfalls

### ❌ Don't: Use SSR-rendered initial values

```typescript
// BAD: Causes hydration mismatch
const [value, setValue] = useState(localStorage.getItem('key'))
```

```typescript
// GOOD: Client-only hydration
const [value, setValue] = useState(undefined)
useEffect(() => {
  setValue(localStorage.getItem('key'))
}, [])
```

---

### ❌ Don't: Write to localStorage on every keystroke

```typescript
// BAD: Performance issue
onChange={(e) => {
  setValue(e.target.value)
  localStorage.setItem('key', e.target.value) // Too frequent!
}}
```

```typescript
// GOOD: Debounced writes in hook
onChange={(e) => setValue(e.target.value)}
// Hook handles debounced localStorage.setItem
```

---

### ❌ Don't: Forget to namespace storage keys

```typescript
// BAD: Conflicts across codelabs
localStorage.setItem('question-1', value)
```

```typescript
// GOOD: Namespaced by codelab
localStorage.setItem(`codelab:${slug}:question-1`, value)
```

---

## Next Steps

1. **Implement remaining components** (MultipleChoice, TemperatureCheck, Scale, Checklist) following the FreeResponse pattern
2. **Add error boundaries** to catch component-level errors
3. **Create demo codelab** (`content/components-demo.md`) showcasing all 5 components
4. **Write tests** using Vitest + React Testing Library
5. **Run accessibility audit** with axe-core or Lighthouse

---

## Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [MDX Custom Components](https://mdxjs.com/table-of-components/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Storage Event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event)

---

**Phase 1 Complete**: Ready to proceed to task generation (`/speckit.tasks`).
