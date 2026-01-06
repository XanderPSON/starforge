# Data Model: Interactive Component Library

**Feature**: 002-interactive-component-library
**Date**: 2026-01-06
**Status**: Phase 1

## Overview

This document defines the data structures for the interactive component library's state management system. All entities are stored in browser localStorage with TypeScript type safety.

---

## Core Entities

### 1. InteractiveState<T>

Represents the persisted state of a single interactive component.

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier for the component instance within a codelab |
| `value` | `T` | ✅ | The current state value (type varies by component) |
| `updatedAt` | `number` | ✅ | Unix timestamp (milliseconds) of last update |
| `version` | `string` | ✅ | Schema version for migration compatibility (default: "1.0") |

**Type Definition**:
```typescript
interface InteractiveState<T> {
  id: string
  value: T
  updatedAt: number
  version: string
}
```

**Storage Key Pattern**: `codelab:{slug}:{componentId}`

**Example** (FreeResponse):
```json
{
  "id": "intro-question-1",
  "value": "I learned about MDX components today",
  "updatedAt": 1704556800000,
  "version": "1.0"
}
```

**Validation Rules**:
- `id` must be non-empty string
- `value` must match component-specific type constraints
- `updatedAt` must be positive integer
- `version` must follow semver pattern (major.minor)
- Total serialized size ≤ 50KB (enforced at write time)

**State Transitions**:
```
[New Component] → Initialize with defaultValue → [Hydrated]
[Hydrated] → User Interaction → [Modified (unsaved)]
[Modified] → Debounce Delay → [Saving]
[Saving] → localStorage.setItem → [Saved]
[Saved] → Storage Event (other tab) → [Synchronized]
```

---

### 2. Component-Specific Value Types

Each interactive component has its own value type stored in `InteractiveState<T>`.

#### 2.1 FreeResponse Value

**Type**: `string`

**Constraints**:
- Max length: ~50,000 characters (to fit within 50KB limit with JSON overhead)
- No validation on content (free-form text)

**Example**:
```typescript
type FreeResponseValue = string

// Stored as:
InteractiveState<string> = {
  id: "response-1",
  value: "This is my answer to the question.",
  updatedAt: 1704556800000,
  version: "1.0"
}
```

---

#### 2.2 MultipleChoice Value

**Type**: `string | null`

**Constraints**:
- Must match one of the `options` array values
- `null` indicates no selection yet
- Case-sensitive string matching

**Example**:
```typescript
type MultipleChoiceValue = string | null

// Component props:
options = ["React", "Vue", "Angular", "Svelte"]
correctAnswer = "React"

// Stored as:
InteractiveState<string | null> = {
  id: "quiz-1",
  value: "React",
  updatedAt: 1704556800000,
  version: "1.0"
}
```

**Derived State** (not persisted):
- `isCorrect: boolean = value === correctAnswer`
- `isAnswered: boolean = value !== null`

---

#### 2.3 TemperatureCheck Value

**Type**: `number | null`

**Constraints**:
- Range: 1-5 (inclusive)
- `null` indicates no selection yet
- Integer only

**Semantic Mapping**:
```typescript
type TemperatureValue = 1 | 2 | 3 | 4 | 5 | null

const temperatureLabels = {
  1: { emoji: '😕', label: 'Confused' },
  2: { emoji: '🤔', label: 'Thinking' },
  3: { emoji: '😐', label: 'Okay' },
  4: { emoji: '😊', label: 'Happy' },
  5: { emoji: '🤩', label: 'Starstruck' }
}
```

**Example**:
```typescript
InteractiveState<number | null> = {
  id: "temp-check-1",
  value: 4,
  updatedAt: 1704556800000,
  version: "1.0"
}
```

---

#### 2.4 Scale Value

**Type**: `number | null`

**Constraints**:
- Range: 1 to `max` (component prop, default 5)
- `null` indicates no selection yet
- Integer only

**Example**:
```typescript
type ScaleValue = number | null

// Component props: max = 5

// Stored as:
InteractiveState<number | null> = {
  id: "scale-1",
  value: 3,
  updatedAt: 1704556800000,
  version: "1.0"
}
```

**Visual Representation**:
- Value `3` with `max=5` displays: `●●●○○` (3 filled circles, 2 empty)

---

#### 2.5 Checklist Value

**Type**: `boolean[]`

**Constraints**:
- Array length must match `items` array length
- Each element represents checked state of corresponding item
- Default: all `false` (unchecked)

**Example**:
```typescript
type ChecklistValue = boolean[]

// Component props:
items = ["Read docs", "Try demo", "Build codelab"]

// Stored as:
InteractiveState<boolean[]> = {
  id: "checklist-1",
  value: [true, true, false], // First two checked
  updatedAt: 1704556800000,
  version: "1.0"
}
```

**Derived State** (not persisted):
- `completionRate: number = value.filter(Boolean).length / value.length`
- `allComplete: boolean = value.every(Boolean)`

---

## 3. ComponentRegistry

Runtime registry tracking active component IDs to detect conflicts.

**Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `activeIds` | `Set<string>` | Set of currently mounted component IDs |

**Type Definition**:
```typescript
interface ComponentRegistry {
  activeIds: Set<string>
}
```

**Lifecycle**:
- Component mounts → Add ID to registry
- Duplicate detected → Throw error, render error UI
- Component unmounts → Remove ID from registry

**Storage**: React Context (not persisted to localStorage)

**Example**:
```typescript
// On mount:
if (registry.activeIds.has('question-1')) {
  throw new Error('Duplicate component ID: question-1')
}
registry.activeIds.add('question-1')

// On unmount:
registry.activeIds.delete('question-1')
```

---

## 4. CodelabSession

Virtual entity representing the collection of all interactive state for a single codelab.

**Not explicitly stored** - composed from individual component states sharing the same slug prefix.

**Fields** (conceptual):
| Field | Type | Description |
|-------|------|-------------|
| `slug` | `string` | Codelab identifier from URL |
| `componentStates` | `Map<string, InteractiveState<unknown>>` | All components in this codelab |
| `lastActivity` | `number` | Timestamp of most recent interaction |

**Isolation**:
- Components in `codelab:intro:*` cannot access `codelab:advanced:*` keys
- Storage keys prefixed with codelab slug ensure isolation

**Query Pattern**:
```typescript
function getCodelabStates(slug: string): InteractiveState<unknown>[] {
  const prefix = `codelab:${slug}:`
  const states: InteractiveState<unknown>[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(prefix)) {
      const value = localStorage.getItem(key)
      if (value) states.push(JSON.parse(value))
    }
  }

  return states
}
```

---

## Relationships

```
CodelabSession (virtual)
  │
  ├─ has many → InteractiveState<string> (FreeResponse)
  ├─ has many → InteractiveState<string | null> (MultipleChoice)
  ├─ has many → InteractiveState<number | null> (TemperatureCheck)
  ├─ has many → InteractiveState<number | null> (Scale)
  └─ has many → InteractiveState<boolean[]> (Checklist)

ComponentRegistry (in-memory)
  └─ tracks → Component IDs (for conflict detection)
```

**Cardinality**:
- One codelab → 0..N interactive components
- One component → exactly 1 InteractiveState
- One registry → 0..N active component IDs

---

## Storage Schema

### localStorage Key-Value Mapping

| Key Pattern | Value Type | Example |
|-------------|------------|---------|
| `codelab:{slug}:{id}` | `InteractiveState<T>` (JSON) | `codelab:intro:q1` → `{"id":"q1","value":"answer","updatedAt":1704556800000,"version":"1.0"}` |

### Size Constraints

**Per-Component Limit**: 50KB (JSON-serialized)

**Calculation**:
```typescript
const size = new Blob([JSON.stringify(state)]).size
if (size > 50 * 1024) {
  throw new Error('Component state exceeds 50KB limit')
}
```

**Typical Sizes**:
- FreeResponse (5000 chars): ~10KB
- MultipleChoice: ~200 bytes
- TemperatureCheck: ~150 bytes
- Scale: ~150 bytes
- Checklist (10 items): ~300 bytes

---

## Error States

### Invalid Data Detection

**Triggers**:
- Malformed JSON in localStorage
- Wrong type for component (e.g., `string` in `number` field)
- Missing required fields (`id`, `value`, `updatedAt`, `version`)
- Version incompatibility (future: schema migrations)

**Recovery Strategy** (per FR-026):
1. Log warning to console with error details
2. Discard invalid data
3. Initialize with component's `defaultValue`
4. Continue rendering normally

**Example**:
```typescript
try {
  const stored = localStorage.getItem(key)
  const parsed = JSON.parse(stored)
  if (!isValidState(parsed)) {
    console.warn(`Invalid state for ${key}, using default`)
    return defaultValue
  }
  return parsed.value
} catch (error) {
  console.warn(`Failed to load state for ${key}`, error)
  return defaultValue
}
```

---

## Migration Strategy (Future)

**Current Version**: 1.0

**Migration Pattern** (when schema changes occur):
```typescript
function migrateState(state: InteractiveState<unknown>): InteractiveState<unknown> {
  switch (state.version) {
    case '1.0':
      return state // Current version
    case '0.9':
      // Hypothetical: migrate old format
      return { ...state, version: '1.0' }
    default:
      console.warn(`Unknown version ${state.version}, resetting`)
      return createDefaultState()
  }
}
```

**Versioning Policy**:
- **Breaking change** (e.g., rename field): Increment major version, write migration
- **Additive change** (e.g., add optional field): Increment minor version, no migration needed
- **Current status**: No migrations needed; all components use v1.0

---

## Type Guards for Runtime Validation

```typescript
function isInteractiveState<T>(data: unknown, valueValidator: (v: unknown) => v is T): data is InteractiveState<T> {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>

  return (
    typeof obj.id === 'string' &&
    obj.id.length > 0 &&
    valueValidator(obj.value) &&
    typeof obj.updatedAt === 'number' &&
    obj.updatedAt > 0 &&
    typeof obj.version === 'string' &&
    /^\d+\.\d+$/.test(obj.version)
  )
}

function isFreeResponseValue(v: unknown): v is string {
  return typeof v === 'string'
}

function isMultipleChoiceValue(v: unknown): v is string | null {
  return typeof v === 'string' || v === null
}

function isTemperatureValue(v: unknown): v is number | null {
  return (typeof v === 'number' && v >= 1 && v <= 5) || v === null
}

function isScaleValue(v: unknown, max: number): v is number | null {
  return (typeof v === 'number' && v >= 1 && v <= max) || v === null
}

function isChecklistValue(v: unknown): v is boolean[] {
  return Array.isArray(v) && v.every(item => typeof item === 'boolean')
}
```

---

## Summary

This data model provides:
- ✅ Type-safe storage with TypeScript interfaces
- ✅ Component-specific value types with clear constraints
- ✅ Version tracking for future schema migrations
- ✅ Size enforcement (50KB per component)
- ✅ Isolation between codelabs via namespaced keys
- ✅ Runtime validation with type guards
- ✅ Graceful error handling for corrupted data

All functional requirements (FR-001 through FR-029) are addressed by these data structures.
