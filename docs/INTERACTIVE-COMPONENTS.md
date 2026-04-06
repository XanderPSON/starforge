# Interactive Components Documentation

Complete guide to using the Interactive Component Library in your MDX codelabs.

## Overview

The Interactive Component Library provides 5 specialized React components that enable learners to interact with content through text responses, quizzes, sentiment ratings, and task tracking. All components automatically persist user progress to browser localStorage with cross-tab synchronization.

**Available Components**:
1. **FreeResponse** - Multi-line text input with auto-save
2. **MultipleChoice** - Quiz with immediate correctness feedback
3. **TemperatureCheck** - 5-emoji sentiment selector
4. **Scale** - Volume-bar style rating (1-N)
5. **Checklist** - Task list with checkbox persistence

### Quips

A **Quip** is a single-question `MultipleChoice` wrapper component used as a lightweight section-completion signal. Quips are placed at the end of conceptual sections to confirm the learner absorbed the key idea before moving on.

**Characteristics:**
- Exactly **one question** per component (no multi-question quizzes)
- Wrong answers should be **plausible but slightly funny** — humor helps it feel like a checkpoint, not an exam
- Named `Quip<TopicName>` (e.g., `QuipOracleProblem`, `QuipMulticall`)
- Legacy quips use the `Quiz` prefix (e.g., `QuizGas`) — both conventions are supported

**Creating a new Quip:**
```tsx
// components/mdx/QuipMyTopic.tsx
'use client'
import { MultipleChoice } from './MultipleChoice'

export function QuipMyTopic({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="What's the key insight about this topic?"
      options={[
        "A plausible-sounding wrong answer",
        "The correct answer, stated clearly",
        "A funny but obviously wrong answer",
        "Another plausible distractor"
      ]}
      correctAnswer="The correct answer, stated clearly"
    />
  )
}
```

Then register in `mdx-components.ts` and use in MDX:
```mdx
<QuipMyTopic id="section-topic-check" />
```

**Key Features**:
- ✅ Auto-save with 500ms debounce
- ✅ Cross-tab real-time synchronization
- ✅ Client-only hydration (no SSR mismatches)
- ✅ 50KB size limit per component
- ✅ WCAG 2.1 AA accessibility compliant
- ✅ Coinbase interstellar design theme

---

## Quick Start

All components are available in MDX files without imports. Just use them directly:

```mdx
<FreeResponse id="my-response" label="Your thoughts?" />
```

**Important**: Each component requires a unique `id` prop within the codelab for localStorage isolation.

---

## Component Reference

### 1. FreeResponse

Multi-line textarea with auto-resize and auto-save functionality.

**Props**:
```typescript
interface FreeResponseProps {
  id: string              // Required: Unique identifier
  label?: string          // Optional: Question text above textarea
  placeholder?: string    // Optional: Placeholder text
  className?: string      // Optional: Additional CSS classes
}
```

**Usage in MDX**:
```mdx
<FreeResponse
  id="intro-reflection"
  label="What did you learn today?"
  placeholder="Type your answer here..."
/>
```

**Usage in TSX**:
```tsx
import { FreeResponse } from '@/components/mdx/FreeResponse'

<FreeResponse
  id="intro-reflection"
  label="What did you learn today?"
  placeholder="Type your answer here..."
/>
```

**Features**:
- Auto-resizing textarea (grows with content)
- "Saved" indicator appears 1s after typing stops
- Character count (optional)
- Persists across page reloads
- Cross-tab synchronization

**Best Practices**:
- Use descriptive IDs like `"section-2-reflection"` not `"q1"`
- Keep labels concise (1-2 sentences)
- Use placeholders to guide response format

---

### 2. MultipleChoice

Self-assessment quiz with immediate visual feedback on correctness.

**Props**:
```typescript
interface MultipleChoiceProps {
  id: string              // Required: Unique identifier
  question: string        // Required: Question text
  options: string[]       // Required: Array of answer choices
  correctAnswer: string   // Required: The correct answer
  className?: string      // Optional: Additional CSS classes
}
```

**Usage in TSX** (recommended):
```tsx
import { MultipleChoice } from '@/components/mdx/MultipleChoice'

<MultipleChoice
  id="quiz-capital"
  question="What is the capital of France?"
  options={["London", "Berlin", "Paris", "Madrid"]}
  correctAnswer="Paris"
/>
```

**Usage in MDX** (requires workaround - see MDX Limitations section):
Due to MDX limitations with array props, you have two options:

**Option A: Create a wrapper component**
```tsx
// components/mdx/QuizFranceCapital.tsx
'use client'
import { MultipleChoice } from './MultipleChoice'

export function QuizFranceCapital({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="What is the capital of France?"
      options={["London", "Berlin", "Paris", "Madrid"]}
      correctAnswer="Paris"
    />
  )
}
```

Then in MDX:
```mdx
<QuizFranceCapital id="quiz-capital" />
```

**Option B: Use a JSON string prop** (requires component modification)

**Features**:
- Green border/background on correct selection
- Red border/background on incorrect selection
- Selection persists across page reloads
- Can change answer after submitting
- Radio button semantics for accessibility

**Best Practices**:
- Provide 2-5 answer options (4 is optimal)
- Make incorrect options plausible
- Use consistent answer order (e.g., alphabetical, numerical)
- Provide clear, unambiguous question text

---

### 3. TemperatureCheck

Quick sentiment feedback using emoji buttons.

**Props**:
```typescript
interface TemperatureCheckProps {
  id: string          // Required: Unique identifier
  className?: string  // Optional: Additional CSS classes
}
```

**Usage in MDX**:
```mdx
<TemperatureCheck id="confusion-check" />
```

**Usage in TSX**:
```tsx
import { TemperatureCheck } from '@/components/mdx/TemperatureCheck'

<TemperatureCheck id="confusion-check" />
```

**Features**:
- 5 emoji options: 😕 (Confused) → 🤔 → 😐 → 😊 → 🤩 (Starstruck)
- Selected emoji scales up (1.25x)
- Smooth 300ms animation
- Selection persists across page reloads
- Keyboard accessible

**Best Practices**:
- Use after teaching complex concepts
- Place before and after explanations to measure clarity
- Don't overuse (1-2 per codelab section)

---

### 4. Scale

Numeric rating with volume-bar highlighting effect.

**Props**:
```typescript
interface ScaleProps {
  id: string          // Required: Unique identifier
  max?: number        // Optional: Maximum value (default: 5)
  label?: string      // Optional: Label text
  className?: string  // Optional: Additional CSS classes
}
```

**Usage in MDX**:
```mdx
<Scale
  id="confidence-scale"
  max={5}
  label="How confident do you feel?"
/>
```

**Usage in TSX**:
```tsx
import { Scale } from '@/components/mdx/Scale'

<Scale
  id="confidence-scale"
  max={5}
  label="How confident do you feel?"
/>
```

**Features**:
- Renders `max` circles (default: 5, range: 1-10)
- Highlights all circles up to selected value (●●●○○)
- Instant visual feedback (<100ms)
- Selection persists across page reloads
- Shows "N / max" indicator when selected

**Best Practices**:
- Use 5-point scale for confidence/understanding
- Use 10-point scale for satisfaction/quality ratings
- Provide clear label explaining what's being rated
- Use at end of sections for self-assessment

---

### 5. Checklist

Task tracking with checkboxes and completion counter.

**Props**:
```typescript
interface ChecklistProps {
  id: string          // Required: Unique identifier
  items: string[]     // Required: Array of task descriptions
  className?: string  // Optional: Additional CSS classes
}
```

**Usage in TSX** (recommended):
```tsx
import { Checklist } from '@/components/mdx/Checklist'

<Checklist
  id="setup-tasks"
  items={[
    "Install Node.js",
    "Clone the repository",
    "Run npm install",
    "Start the dev server",
    "Open localhost:3000"
  ]}
/>
```

**Usage in MDX** (requires workaround - see MDX Limitations section):
Same as MultipleChoice - create wrapper components or modify to accept JSON string.

**Features**:
- Native checkbox inputs (inherits keyboard accessibility)
- Progress counter ("3 of 5 completed")
- "All done!" message when complete
- Line-through styling for checked items
- Green background highlight for completed items
- Each checkbox state persists independently

**Best Practices**:
- Use for multi-step tutorials or setup instructions
- Keep items short (1 line each)
- Order items logically (sequential steps)
- Use 3-10 items per checklist (not too long)

---

## MDX Limitations & Workarounds

### The Problem

MDX cannot parse JavaScript array literals in JSX props:

```mdx
<!-- ❌ This does NOT work in MDX -->
<MultipleChoice
  options={["A", "B", "C"]}
  correctAnswer="B"
/>
```

MDX interprets `{[` as malformed JSX, not a JavaScript array.

### Solutions

#### Solution 1: Create Wrapper Components (Recommended)

For each quiz or checklist, create a dedicated wrapper component:

```tsx
// components/mdx/QuizReactBasics.tsx
'use client'
import { MultipleChoice } from './MultipleChoice'

export function QuizReactBasics({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="What hook is used for state management?"
      options={["useEffect", "useState", "useContext", "useRef"]}
      correctAnswer="useState"
    />
  )
}
```

Then register in `components/mdx/mdx-components.ts`:

```tsx
import { QuizReactBasics } from './QuizReactBasics'

export const mdxComponents: MDXComponents = {
  // ... existing components
  QuizReactBasics,
}
```

Use in MDX:

```mdx
<QuizReactBasics id="quiz-1" />
```

**Pros**: Clean MDX, reusable, fully typed
**Cons**: Requires creating a file per unique quiz

#### Solution 2: Use Regular .tsx Pages

Instead of MDX, write codelabs in pure React:

```tsx
// app/codelab/react-basics/page.tsx
import { MultipleChoice } from '@/components/mdx/MultipleChoice'

export default function ReactBasicsPage() {
  return (
    <article>
      <h1>React Basics</h1>
      <MultipleChoice
        id="quiz-1"
        question="What hook is used for state management?"
        options={["useEffect", "useState", "useContext", "useRef"]}
        correctAnswer="useState"
      />
    </article>
  )
}
```

**Pros**: Full TypeScript, all props work, better IDE support
**Cons**: Lose Markdown simplicity, more verbose

#### Solution 3: JSON String Props (Requires Modification)

Modify components to accept JSON strings:

```mdx
<MultipleChoice
  id="quiz-1"
  question="What is 2+2?"
  optionsJson='["3", "4", "5", "6"]'
  correctAnswer="4"
/>
```

**Pros**: Works in MDX without wrappers
**Cons**: Ugly syntax, error-prone, loses type safety

---

## Storage Pattern

All components use the same localStorage key pattern:

```
codelab:{slug}:{componentId}
```

**Examples**:
- FreeResponse with `id="q1"` in codelab "intro" → `codelab:intro:q1`
- Scale with `id="confidence"` in codelab "react-hooks" → `codelab:react-hooks:confidence`

This ensures:
- Components in different codelabs don't interfere
- Multiple components in same codelab are isolated
- Easy to clear all data for a codelab: `localStorage.clear()` or remove keys with matching prefix

---

## Error Handling

All components handle common edge cases gracefully:

### localStorage Disabled (Private Browsing)
**Behavior**: Components render and function normally but data doesn't persist
**User Impact**: No error shown, degrades gracefully to in-memory state

### Quota Exceeded (5-10MB limit)
**Behavior**: Console warning at 80% (40KB per component), error at 100% (50KB)
**User Impact**: Save fails silently, last successful state preserved

### Corrupted Data
**Behavior**: Console warning logged, component resets to default value
**User Impact**: Seamless recovery, no user-facing errors

### Duplicate IDs
**Behavior**: Console error logged, second component throws error
**User Impact**: First component works, second shows error UI
**Prevention**: Use descriptive, unique IDs per codelab

### Missing Required Props
**Behavior**: Component renders inline error message
**User Impact**: Clear error showing which props are missing
**Example**: `❌ MultipleChoice Error: Missing required props: options, correctAnswer`

---

## Accessibility

All components meet WCAG 2.1 AA standards:

### Keyboard Navigation
| Component | Keys |
|-----------|------|
| FreeResponse | Tab (focus), Type (edit) |
| MultipleChoice | Tab (navigate), Enter/Space (select) |
| TemperatureCheck | Tab (navigate), Enter/Space (select) |
| Scale | Tab (navigate), Enter/Space (select) |
| Checklist | Tab (navigate), Space (toggle) |

### Screen Reader Support
- **FreeResponse**: `aria-label` with question context
- **MultipleChoice**: `role="radiogroup"`, `role="radio"`, `aria-checked`
- **TemperatureCheck**: `aria-label` for each emoji, `aria-pressed`
- **Scale**: `aria-current` for selected value, descriptive labels
- **Checklist**: Native checkbox semantics (automatically accessible)

### Visual Indicators
- High contrast ratios (WCAG AA compliant)
- Color is never the only indicator (icons + borders + text)
- Focus rings on all interactive elements

---

## Performance

### Auto-save Debouncing
- **Delay**: 500ms after last change
- **Why**: Reduces localStorage writes from ~100/sec to ~2/sec
- **Impact**: No perceived lag, prevents performance issues

### Bundle Size
- **useInteractive hook**: ~2KB
- **Each component**: ~1-3KB
- **Total**: ~10KB for all 5 components

### Hydration
- **Pattern**: Client-only rendering with skeleton states
- **Why**: Prevents SSR/client mismatch (localStorage only exists on client)
- **Impact**: <100ms delay before components hydrate, smooth transition

---

## Cross-Tab Synchronization

All components sync state across browser tabs in real-time using localStorage `storage` events.

### How It Works
1. User changes value in Tab A
2. useInteractive hook saves to localStorage
3. localStorage fires `storage` event
4. Tab B's useInteractive hook receives event
5. Tab B updates component state
6. **Result**: Both tabs show same value within ~100ms

### Testing
1. Open same codelab in two tabs side-by-side
2. Type in FreeResponse in Tab A
3. Watch text appear in Tab B automatically
4. Select MultipleChoice answer in Tab B
5. See selection update in Tab A

---

## Examples

See the live demo at `/codelab/components-demo` for interactive examples of:
- FreeResponse with auto-save indicator
- TemperatureCheck with emoji selection
- Edge case testing (localStorage disabled, rapid input, corrupted data)
- Keyboard navigation demonstration
- Cross-tab synchronization testing

---

## Best Practices Summary

### DO:
✅ Use descriptive, unique IDs (`"section-2-confidence"` not `"s2"`)
✅ Provide clear labels for context
✅ Test with localStorage disabled (private browsing)
✅ Use wrapper components for MDX array props
✅ Keep FreeResponse questions concise
✅ Provide 2-5 options for MultipleChoice
✅ Use TemperatureCheck sparingly (1-2 per section)
✅ Order Checklist items logically

### DON'T:
❌ Reuse IDs across different questions in same codelab
❌ Use array literals directly in MDX props
❌ Forget labels on Scale components (user won't know what they're rating)
❌ Make Checklist items too long (keep to 1 line)
❌ Overuse interactive components (every 3-5 paragraphs max)
❌ Rely on color alone for feedback (use icons + text)

---

## Troubleshooting

### Component shows error UI
**Cause**: Missing required props
**Fix**: Check error message, add missing props

### State doesn't persist
**Cause**: Private browsing or localStorage disabled
**Fix**: This is expected behavior, components still function with in-memory state

### "Duplicate component ID" error
**Cause**: Two components in same codelab have same `id`
**Fix**: Use unique IDs for each component

### MDX compilation error with arrays
**Cause**: MDX can't parse JavaScript array literals in props
**Fix**: Use wrapper components (see MDX Limitations section)

### Component doesn't appear
**Cause**: Not registered in mdx-components.ts
**Fix**: Add import and registration in `components/mdx/mdx-components.ts`

---

## Technical Details

### Storage Format
```typescript
interface InteractiveState<T> {
  id: string
  value: T
  updatedAt: number
  version: string
}
```

### Type Safety
All components use TypeScript strict mode with full type inference:
```typescript
const [value, setValue, isSaved] = useInteractive<string>(id, defaultValue)
//     ^string  ^(value: string) => void  ^boolean
```

### Size Limits
- **Per component**: 50KB (40KB warning threshold)
- **Total localStorage**: ~5-10MB (browser dependent)
- **Recommendation**: Keep responses under 10KB

---

## Migration Guide

### From Legacy useLocalStorage Hook

Old pattern:
```tsx
const [value, setValue] = useLocalStorage(id, defaultValue)
```

New pattern:
```tsx
const [value, setValue, isSaved] = useInteractive(id, defaultValue)
```

Changes:
- ✅ Returns `isSaved` boolean as third value
- ✅ Includes duplicate ID detection
- ✅ Automatic size checking
- ✅ Cross-tab sync built-in
- ✅ Client-only hydration handling

---

## Support

For issues or questions:
1. Check this documentation first
2. Review `/codelab/components-demo` for live examples
3. Check browser console for error messages
4. Review component source in `components/mdx/`

---

**Last Updated**: 2026-01-06
**Version**: 1.0.0
