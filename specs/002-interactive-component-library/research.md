# Research: Interactive Component Library

**Feature**: 002-interactive-component-library
**Date**: 2026-01-06
**Status**: Phase 0 Complete

## Research Questions

This document resolves all "NEEDS CLARIFICATION" items from the Technical Context and explores best practices for implementing the interactive component library.

---

## 1. Testing Framework Selection

**Question**: Which testing framework should we use for React components in a Next.js 14 App Router environment?

**Decision**: **Vitest + React Testing Library**

**Rationale**:
- **Vitest** is the modern successor to Jest, built for Vite/modern tooling with:
  - Native ESM support (no transform complexity)
  - Faster execution (uses esbuild)
  - Better TypeScript integration
  - Jest-compatible API (easy migration path)
- **React Testing Library** aligns with testing best practices:
  - Tests user behavior, not implementation details
  - Encourages accessibility-first testing (findByRole, getByLabelText)
  - Official recommendation from React team
- **Next.js 14 compatibility**: Next.js supports both Jest and Vitest; Vitest has cleaner App Router integration

**Alternatives Considered**:
- **Jest + React Testing Library**: More mature ecosystem, but slower and requires complex transform configuration for ESM/App Router
- **Playwright Component Testing**: Excellent for integration tests but overkill for unit testing individual components
- **Cypress Component Testing**: Similar trade-offs to Playwright; better suited for E2E

**Implementation Notes**:
```typescript
// vitest.config.ts example
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

---

## 2. localStorage Best Practices for React Hooks

**Question**: What are the best practices for implementing a custom React hook that manages localStorage with TypeScript safety and performance?

**Research Findings**:

### 2.1 Client-Only Rendering (Hydration Safety)

**Pattern**: Use `useState` with `undefined` initial value, hydrate in `useEffect`

```typescript
function useInteractive<T>(id: string, defaultValue: T) {
  const [value, setValue] = useState<T | undefined>(undefined)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Only runs on client
    const stored = localStorage.getItem(id)
    setValue(stored ? JSON.parse(stored) : defaultValue)
    setIsHydrated(true)
  }, [])

  return [value, setValue, isHydrated]
}
```

**Rationale**: Prevents hydration mismatch by deferring localStorage reads until after React hydration completes.

### 2.2 Error Handling (localStorage disabled, quota exceeded)

**Pattern**: Try-catch with graceful fallback

```typescript
function safeSetItem(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded')
      // Trigger quota warning banner
    }
    return false
  }
}
```

**Rationale**: `localStorage` can throw for multiple reasons (disabled, quota, private browsing). Silent failures with logging prevent crashes.

### 2.3 Cross-Tab Synchronization

**Pattern**: Listen to `storage` events

```typescript
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === storageKey && e.newValue) {
      setValue(JSON.parse(e.newValue))
    }
  }

  window.addEventListener('storage', handleStorageChange)
  return () => window.removeEventListener('storage', handleStorageChange)
}, [storageKey])
```

**Rationale**: `storage` events fire when another tab modifies localStorage, enabling real-time sync (FR-024).

### 2.4 Debouncing for Auto-Save

**Pattern**: Use `useDebouncedCallback` or custom debounce

```typescript
import { useDebouncedCallback } from 'use-debounce'

const debouncedSave = useDebouncedCallback(
  (value: T) => {
    safeSetItem(id, value)
    setIsSaved(true)
  },
  500 // 500ms delay
)
```

**Rationale**: Prevents excessive writes on rapid input (e.g., typing in FreeResponse).

---

## 3. Component Accessibility Patterns

**Question**: How should interactive components implement keyboard navigation and ARIA attributes?

**Research Findings**:

### 3.1 Custom Radio Button Group (MultipleChoice)

**Pattern**: Use `role="radiogroup"` with `role="radio"`

```tsx
<div role="radiogroup" aria-labelledby="question-id">
  {options.map((option, index) => (
    <button
      key={option}
      role="radio"
      aria-checked={selected === option}
      onClick={() => handleSelect(option)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleSelect(option)
      }}
    >
      {option}
    </button>
  ))}
</div>
```

**Standards**: WCAG 2.1 AA requires all interactive elements to be keyboard-operable.

### 3.2 Scale Component (Rating Input)

**Pattern**: Use `role="slider"` or individual buttons with `aria-current`

```tsx
<div role="group" aria-label="Rating scale">
  {[...Array(max)].map((_, i) => (
    <button
      aria-current={value >= i + 1}
      onClick={() => setValue(i + 1)}
    >
      <span aria-label={`Rate ${i + 1} out of ${max}`}>○</span>
    </button>
  ))}
</div>
```

### 3.3 TemperatureCheck (Emoji Selector)

**Pattern**: Button group with descriptive labels

```tsx
const emojis = [
  { value: 1, emoji: '😕', label: 'Confused' },
  { value: 2, emoji: '🤔', label: 'Thinking' },
  // ...
]

{emojis.map(({ value, emoji, label }) => (
  <button
    aria-label={label}
    onClick={() => setValue(value)}
  >
    <span aria-hidden="true">{emoji}</span>
  </button>
))}
```

**Rationale**: `aria-hidden` on emoji prevents screen readers from announcing Unicode character names; descriptive label ensures clarity.

---

## 4. Component ID Conflict Detection

**Question**: How should we detect duplicate component IDs at runtime?

**Decision**: **Global registry in React Context**

**Pattern**:
```typescript
const ComponentRegistry = createContext<Set<string>>(new Set())

function useInteractive(id: string, defaultValue: T) {
  const registry = useContext(ComponentRegistry)

  useEffect(() => {
    if (registry.has(id)) {
      console.error(`Duplicate component ID detected: ${id}`)
      throw new Error(`Component ID "${id}" is already in use`)
    }
    registry.add(id)
    return () => registry.delete(id)
  }, [id])

  // ... rest of hook
}
```

**Rationale**: Context-based registry ensures IDs are unique within a codelab page without global pollution. Cleanup on unmount prevents false positives on navigation.

**Alternative Considered**: Global `window` object storage rejected due to potential conflicts across multiple codelab pages.

---

## 5. Data Corruption Handling

**Question**: How should we detect and recover from corrupted localStorage data?

**Decision**: **Validate with TypeScript type guards, fall back to default**

**Pattern**:
```typescript
function isValidData<T>(data: unknown, validator: (d: unknown) => d is T): data is T {
  return validator(data)
}

function safeGetItem<T>(key: string, defaultValue: T, validator: (d: unknown) => d is T): T {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return defaultValue

    const parsed = JSON.parse(stored)
    if (isValidData(parsed, validator)) {
      return parsed
    } else {
      console.warn(`Invalid data for key ${key}, using default`)
      return defaultValue
    }
  } catch (error) {
    console.warn(`Failed to parse localStorage for key ${key}`, error)
    return defaultValue
  }
}
```

**Rationale**: Type guards provide runtime validation without external libraries. Aligns with FR-026 (silent discard + console warning).

---

## 6. 50KB Size Limit Enforcement

**Question**: Should we validate component state size before saving to localStorage?

**Decision**: **Warn on approach, block on exceed**

**Pattern**:
```typescript
const MAX_SIZE_BYTES = 50 * 1024 // 50KB

function checkSize(value: unknown): { ok: boolean; size: number } {
  const json = JSON.stringify(value)
  const size = new Blob([json]).size

  if (size > MAX_SIZE_BYTES) {
    console.error(`Value exceeds 50KB limit: ${size} bytes`)
    return { ok: false, size }
  }

  if (size > MAX_SIZE_BYTES * 0.8) {
    console.warn(`Value approaching 50KB limit: ${size} bytes`)
  }

  return { ok: true, size }
}
```

**Rationale**: Proactive warning at 80% threshold allows users to adjust before hitting hard limit. FR-029 requires reliable handling up to 50KB.

---

## 7. Coinbase Interstellar Design Theme Application

**Question**: How should we apply the existing Coinbase design theme to interactive components?

**Research Findings**:

Based on the existing codebase established in feature 001, the theme uses:

**Design Tokens**:
- **Glass effect**: `bg-white/5 backdrop-blur-sm border border-white/10`
- **Blue accents**: `text-blue-400`, `border-blue-500/30`
- **Gradient text**: `bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent`
- **Hover states**: `hover:bg-white/10 transition-colors`
- **Focus rings**: `focus:ring-2 focus:ring-blue-500/50 focus:outline-none`

**Component Styling Examples**:

```tsx
// MultipleChoice option button
className={cn(
  "px-4 py-3 rounded-lg border transition-all",
  "bg-white/5 backdrop-blur-sm border-white/10",
  "hover:bg-white/10 hover:border-blue-500/30",
  selected === option && correct
    ? "border-green-500/50 bg-green-500/10"
    : selected === option
    ? "border-red-500/50 bg-red-500/10"
    : "border-white/10"
)}

// TemperatureCheck emoji scaling
className={cn(
  "text-4xl transition-transform duration-300",
  value === emojiValue && "scale-125"
)}

// Scale circle highlighting
className={cn(
  "w-8 h-8 rounded-full border-2 transition-all",
  i < value
    ? "bg-blue-500/30 border-blue-500"
    : "bg-white/5 border-white/20"
)}
```

---

## 8. Demo File Structure

**Question**: What should the `components-demo.md` file contain?

**Decision**: **Complete reference implementation showcasing all components with annotations**

**Structure**:
```markdown
# Interactive Components Demo

This codelab demonstrates all five interactive components available in the MDX viewer.

## 1. FreeResponse

Use this component for open-ended text input:

<FreeResponse id="demo-free-1" label="What did you learn today?" placeholder="Type your answer..." />

## 2. MultipleChoice

Test knowledge with immediate feedback:

<MultipleChoice
  id="demo-mc-1"
  question="What is 2 + 2?"
  options={["3", "4", "5", "6"]}
  correctAnswer="4"
/>

## 3. TemperatureCheck

Quick sentiment feedback:

<TemperatureCheck id="demo-temp-1" />

## 4. Scale

Rate understanding 1-5:

<Scale id="demo-scale-1" max={5} label="How confident are you?" />

## 5. Checklist

Track progress through steps:

<Checklist
  id="demo-checklist-1"
  items={[
    "Read the documentation",
    "Try the interactive components",
    "Build your own codelab"
  ]}
/>
```

**Rationale**: Serves dual purpose as both test fixture (SC-008) and developer documentation.

---

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Testing** | Vitest + React Testing Library | Modern, fast, Jest-compatible, ESM-native |
| **localStorage Pattern** | Client-only hydration with useEffect | Prevents SSR hydration mismatches |
| **Error Handling** | Try-catch with graceful fallback | Handles disabled storage, quota exceeded |
| **Cross-Tab Sync** | storage event listeners | Native browser API for real-time sync |
| **Debouncing** | 500ms delay via useDebouncedCallback | Reduces write frequency for text input |
| **Accessibility** | ARIA roles + keyboard handlers | WCAG 2.1 AA compliance |
| **ID Conflicts** | React Context registry | Scoped detection without global pollution |
| **Data Validation** | TypeScript type guards | Runtime safety without external deps |
| **Size Limits** | Warn at 80%, block at 100% | Proactive UX before hard failures |
| **Design Theme** | Glass effects + blue accents | Consistency with existing Coinbase theme |

---

## Open Questions for Implementation

1. **Testing Strategy**: Should we test localStorage mocking, or use real browser storage in tests?
   - **Recommendation**: Mock localStorage for unit tests, use real storage in integration tests with Playwright

2. **Component Export Pattern**: Should components be exported individually or as a registry object?
   - **Recommendation**: Individual named exports for tree-shaking, plus a registry object for MDX mapping

3. **Storage Key Namespacing**: Should we include codelab slug in storage keys to prevent cross-codelab conflicts?
   - **Recommendation**: Yes, use pattern `codelab:{slug}:{componentId}` per existing implementation

---

**Phase 0 Complete**: All "NEEDS CLARIFICATION" items resolved. Ready to proceed to Phase 1 (Data Model & Contracts).
