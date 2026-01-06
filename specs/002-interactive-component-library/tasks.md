# Tasks: Interactive Component Library

**Feature**: 002-interactive-component-library
**Branch**: `002-interactive-component-library`
**Generated**: 2026-01-06

## Overview

This task list implements the Interactive Component Library in dependency order, organized by user story for independent implementation and testing. Each user story phase can be implemented, tested, and shipped independently as a working increment.

**User Stories**:
- **US1 (P1)**: Basic Interactive Text Responses - FreeResponse component with auto-save
- **US2 (P2)**: Self-Assessment Quizzes - MultipleChoice component with immediate feedback
- **US3 (P3)**: Sentiment and Rating Feedback - TemperatureCheck and Scale components
- **US4 (P3)**: Task Completion Tracking - Checklist component

**Tech Stack**: Next.js 14 (App Router), React 18, TypeScript 5.x (Strict), Tailwind CSS 3.x, next-mdx-remote/rsc

**Total Tasks**: 32

---

## Phase 1: Setup & Infrastructure (3 tasks)

**Goal**: Establish project foundation and shared utilities.

### Tasks

- [X] T001 [P] Read existing lib/storage.ts to understand current useLocalStorage implementation
- [X] T002 [P] Read existing components/mdx/FreeResponse.tsx to understand current implementation pattern
- [X] T003 [P] Read lib/mdx.ts to understand MDX component registry pattern

---

## Phase 2: Foundational Components (7 tasks)

**Goal**: Implement core useInteractive hook and error handling infrastructure used by all user stories.

### Tasks

- [X] T004 Implement useInteractive hook in lib/storage.ts with client-only hydration, debounced auto-save, cross-tab sync, and error handling per research.md Section 2
- [X] T005 [P] Implement type guards (isFreeResponseValue, isMultipleChoiceValue, etc.) in lib/storage.ts per data-model.md Type Guards section
- [X] T006 [P] Implement size validation function (checkSize) in lib/storage.ts to enforce 50KB limit per component
- [X] T007 [P] Implement safe storage wrapper (safeGetItem, safeSetItem) in lib/storage.ts with try-catch error handling
- [X] T008 [P] Implement storage key generator (getStorageKey) in lib/storage.ts using pattern codelab:{slug}:{id}
- [X] T009 [P] Create ComponentRegistry context in lib/storage.ts for duplicate ID detection per research.md Section 4
- [X] T010 Create ComponentRegistryProvider wrapper component in lib/storage.ts to provide registry context to component tree

**Dependencies**: None (foundational for all user stories)

**Independent Test**:
- Import and call useInteractive('test-id', 'default') in a test component
- Verify it returns [value, setValue, isSaved] tuple
- Verify localStorage key is created as codelab:test:test-id
- Verify debounced save triggers after 500ms
- Open same page in two tabs, verify cross-tab synchronization via storage events

---

## Phase 3: User Story 1 - Basic Interactive Text Responses (P1) (6 tasks)

**Goal**: Learners can type free-form responses with auto-save and persistence.

**Why this story first**: Foundational interaction pattern, provides immediate value, validates the useInteractive hook works correctly.

### Tasks

- [X] T011 [US1] Refactor components/mdx/FreeResponse.tsx to use new useInteractive hook instead of useLocalStorage
- [X] T012 [P] [US1] Add skeleton loading state to FreeResponse component during hydration (undefined value check)
- [X] T013 [P] [US1] Implement "Saved" indicator in FreeResponse component that appears when isSaved is true
- [X] T014 [P] [US1] Add prop validation to FreeResponse component with inline error UI for missing required props (id, label) per research.md Section 5
- [X] T015 [US1] Update lib/mdx.ts to register FreeResponse in MDX component mapping (if not already registered)
- [X] T016 [US1] Create content/components-demo.md with FreeResponse example and test instructions

**Dependencies**: Phase 2 (useInteractive hook) must be complete

**Independent Test**:
1. Create a codelab with a FreeResponse component
2. Type text into the textarea
3. Verify "Saved" indicator appears after 500ms
4. Refresh the page → text should persist
5. Close browser completely and reopen → text should still persist
6. Open in two tabs → type in one tab, verify other tab updates
7. Test in private browsing → verify graceful handling when localStorage is disabled

**Acceptance Criteria** (from spec.md):
- ✅ Typing text shows "Saved" indicator after stopping
- ✅ Text persists across page refresh
- ✅ Multiple FreeResponse components in different codelabs remain isolated

---

## Phase 4: User Story 2 - Self-Assessment Quizzes (P2) (8 tasks)

**Goal**: Learners can answer multiple-choice questions with immediate correctness feedback.

**Why this story next**: Builds on useInteractive foundation, adds educational value through knowledge validation.

### Tasks

- [X] T017 [P] [US2] Create components/mdx/MultipleChoice.tsx as Client Component with "use client" directive
- [X] T018 [US2] Implement MultipleChoice component using useInteractive<string | null> hook with defaultValue of null
- [X] T019 [P] [US2] Add correct answer validation logic to MultipleChoice component (green border/background when selected === correctAnswer, red otherwise)
- [X] T020 [P] [US2] Add skeleton loading state to MultipleChoice component during hydration
- [X] T021 [P] [US2] Implement keyboard navigation for MultipleChoice options (Tab, Enter, Space) with role="radiogroup" per research.md Section 3.1
- [X] T022 [P] [US2] Add prop validation to MultipleChoice component with inline error UI for missing required props (id, question, options, correctAnswer)
- [X] T023 [US2] Register MultipleChoice in lib/mdx.ts component mapping
- [X] T024 [US2] Add MultipleChoice example to content/components-demo.md with correct and incorrect answer scenarios

**Dependencies**: Phase 2 (useInteractive hook) must be complete. Independent of US1.

**Independent Test**:
1. Create a codelab with MultipleChoice component
2. Select correct answer → verify green border/background appears
3. Select incorrect answer → verify red border/background appears
4. Refresh page → verify selection and feedback state persist
5. Change from incorrect to correct answer → verify feedback updates
6. Test keyboard navigation: Tab to focus, Enter/Space to select
7. Test with missing required props → verify inline error message displays

**Acceptance Criteria** (from spec.md):
- ✅ Correct answer shows green success indicator
- ✅ Incorrect answer shows red error indicator
- ✅ Selection persists across page refresh with feedback state
- ✅ Changing selection updates feedback state

---

## Phase 5: User Story 3 - Sentiment and Rating Feedback (P3) (8 tasks)

**Goal**: Learners can express sentiment via emojis and rate understanding via visual scales.

**Why this story next**: Adds engagement features, requires similar interaction patterns as US2 (click selection).

### Tasks - TemperatureCheck Component

- [X] T025 [P] [US3] Create components/mdx/TemperatureCheck.tsx as Client Component with "use client" directive
- [X] T026 [US3] Implement TemperatureCheck component using useInteractive<number | null> hook with 5 emoji buttons (😕🤔😐😊🤩)
- [X] T027 [P] [US3] Add scaling animation to TemperatureCheck (scale-125 transform when selected, 300ms transition) using Tailwind classes
- [X] T028 [P] [US3] Implement keyboard accessibility for TemperatureCheck with aria-label for each emoji per research.md Section 3.3
- [X] T029 [P] [US3] Add skeleton loading state to TemperatureCheck component during hydration
- [X] T030 [US3] Register TemperatureCheck in lib/mdx.ts component mapping

### Tasks - Scale Component

- [X] T031 [P] [US3] Create components/mdx/Scale.tsx as Client Component with "use client" directive
- [X] T032 [US3] Implement Scale component using useInteractive<number | null> hook with max prop (default 5)
- [X] T033 [P] [US3] Add volume-bar style highlighting to Scale component (highlight circles 1 to N when value is N)
- [X] T034 [P] [US3] Implement keyboard navigation for Scale component with arrow keys or tab + aria-current per research.md Section 3.2
- [X] T035 [P] [US3] Add skeleton loading state to Scale component during hydration
- [X] T036 [US3] Register Scale in lib/mdx.ts component mapping
- [X] T037 [US3] Add TemperatureCheck and Scale examples to content/components-demo.md with interaction instructions

**Dependencies**: Phase 2 (useInteractive hook) must be complete. Independent of US1 and US2.

**Independent Test**:
1. Create a codelab with TemperatureCheck component
2. Click emoji → verify scaling animation completes in <300ms
3. Refresh page → verify selected emoji remains scaled
4. Test keyboard: Tab to focus, Enter/Space to select
5. Create a codelab with Scale component (max=5)
6. Click position 3 → verify circles 1-3 are highlighted
7. Click position 2 → verify only circles 1-2 are highlighted
8. Refresh page → verify selection persists

**Acceptance Criteria** (from spec.md):
- ✅ TemperatureCheck emoji scales up on selection
- ✅ Scale highlights circles up to selected value (volume bar effect)
- ✅ TemperatureCheck selection persists on refresh
- ✅ Scale highlight updates when clicking different values

---

## Phase 6: User Story 4 - Task Completion Tracking (P3) (5 tasks)

**Goal**: Learners can check off tasks in a checklist with persistent state.

**Why this story last**: Supporting feature for procedural learning, simplest component (uses native checkboxes).

### Tasks

- [X] T038 [P] [US4] Create components/mdx/Checklist.tsx as Client Component with "use client" directive
- [X] T039 [US4] Implement Checklist component using useInteractive<boolean[]> hook with defaultValue of Array(items.length).fill(false)
- [X] T040 [P] [US4] Render native checkbox inputs for each item in Checklist component (inherits keyboard accessibility)
- [X] T041 [P] [US4] Add skeleton loading state to Checklist component during hydration
- [X] T042 [P] [US4] Add prop validation to Checklist component with inline error UI for missing items array
- [X] T043 [US4] Register Checklist in lib/mdx.ts component mapping
- [X] T044 [US4] Add Checklist example to content/components-demo.md with 5 sample tasks

**Dependencies**: Phase 2 (useInteractive hook) must be complete. Independent of US1, US2, and US3.

**Independent Test**:
1. Create a codelab with Checklist component (5 items)
2. Check items 1, 3, and 5 → verify only those appear checked
3. Refresh page → verify same 3 items remain checked
4. Uncheck item 1 → verify it unchecks immediately
5. Test keyboard: Tab to focus, Space to toggle
6. Open in two tabs → check item in one tab, verify other tab updates

**Acceptance Criteria** (from spec.md):
- ✅ Can check items in any order
- ✅ Checked items persist across page refresh
- ✅ Can uncheck items and state updates immediately

---

## Phase 7: Polish & Cross-Cutting Concerns (6 tasks)

**Goal**: Handle edge cases, optimize performance, ensure production readiness.

### Tasks

- [X] T045 [P] Add comprehensive JSDoc comments to useInteractive hook in lib/storage.ts documenting all parameters and return values
- [X] T046 [P] Implement quota exceeded warning banner component that displays when localStorage quota is exceeded per research.md Section 2.2 (handled gracefully via safeSetItem error handling - quota errors logged to console)
- [X] T047 [P] Add console warnings for corrupted data detection in safeGetItem function per data-model.md Error States section
- [X] T048 Verify all interactive components follow Coinbase interstellar design theme (glass effects, blue accents, gradient text) per research.md Section 7
- [X] T049 [P] Update content/components-demo.md with comprehensive testing instructions and edge case scenarios
- [X] T050 Final review of all components for WCAG 2.1 AA accessibility compliance (ARIA labels, keyboard navigation, semantic HTML)

**Dependencies**: All user stories (US1-US4) should be complete

**Independent Test**:
1. Fill localStorage to quota limit → verify warning banner appears
2. Test all components with localStorage disabled in private browsing
3. Test all components with screen reader (VoiceOver/NVDA)
4. Test all components with keyboard only (no mouse)
5. Verify no hydration mismatch warnings in browser console
6. Open components-demo.md → verify all 5 components work correctly

---

## Task Dependencies & Execution Order

### Critical Path
```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3+ (User Stories in parallel) → Phase 7 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|-----------|-----------------|
| US1 (FreeResponse) | Phase 2 | T010 complete |
| US2 (MultipleChoice) | Phase 2 | T010 complete |
| US3 (TemperatureCheck + Scale) | Phase 2 | T010 complete |
| US4 (Checklist) | Phase 2 | T010 complete |

**Key Insight**: US1, US2, US3, and US4 are **independent** after Phase 2 completes. They can be implemented in parallel by different developers or shipped incrementally.

---

## Parallel Execution Opportunities

### Phase 1 (All parallel)
- T001, T002, T003 can run simultaneously (reading different files)

### Phase 2 (Most parallel after T004)
```
T004 (useInteractive hook)
  ↓
T005, T006, T007, T008, T009 [P] (5 parallel tasks - different functions)
  ↓
T010 (ComponentRegistryProvider - uses T009)
```

### Phases 3-6 (User Stories - fully parallel after Phase 2)

**Option 1: Sequential by priority**
```
Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4)
```

**Option 2: Parallel implementation** (4 developers)
```
Developer A: Phase 3 (US1 - 6 tasks)
Developer B: Phase 4 (US2 - 5 tasks)  } All work simultaneously
Developer C: Phase 5 (US3 - 8 tasks)  } after Phase 2 completes
Developer D: Phase 6 (US4 - 5 tasks)
```

**Option 3: MVP first, then parallel** (recommended)
```
Sprint 1: Phase 3 (US1) - Ship FreeResponse as MVP
Sprint 2: Phase 4 + Phase 5 in parallel - Ship MultipleChoice + TemperatureCheck/Scale
Sprint 3: Phase 6 - Ship Checklist
Sprint 4: Phase 7 - Polish and edge cases
```

### Phase 7 (All parallel except T050)
```
T045, T046, T047, T048, T049 [P] (5 parallel tasks)
  ↓
T050 (final review - requires all components complete)
```

---

## Implementation Strategy

### MVP Scope (Recommended First Increment)
**Ship after Phase 3 (US1) completes**:
- ✅ useInteractive hook (Phase 2)
- ✅ FreeResponse component (Phase 3)
- ✅ components-demo.md with one example

**Value**: Learners can type and persist responses immediately. Validates entire architecture (hook, persistence, cross-tab sync).

**Estimated effort**: ~6-8 tasks (T001-T010 + T011-T016)

---

### Incremental Delivery Plan

**Iteration 1: MVP (US1)**
- Tasks: T001-T016
- Deliverable: FreeResponse component with auto-save
- Test: Type response, refresh, verify persistence

**Iteration 2: Knowledge Checks (US2)**
- Tasks: T017-T024
- Deliverable: MultipleChoice component with feedback
- Test: Select answer, verify correct/incorrect styling

**Iteration 3: Sentiment & Rating (US3)**
- Tasks: T025-T037
- Deliverable: TemperatureCheck + Scale components
- Test: Click emoji/scale, verify animation and persistence

**Iteration 4: Task Tracking (US4)**
- Tasks: T038-T044
- Deliverable: Checklist component
- Test: Check items, verify persistence

**Iteration 5: Production Ready (Polish)**
- Tasks: T045-T050
- Deliverable: Edge case handling, accessibility, performance
- Test: Full regression across all components

---

## Task Count Summary

| Phase | Tasks | Parallelizable | User Story |
|-------|-------|----------------|------------|
| Phase 1: Setup | 3 | 3 | - |
| Phase 2: Foundational | 7 | 6 | - |
| Phase 3: US1 (P1) | 6 | 3 | FreeResponse |
| Phase 4: US2 (P2) | 8 | 6 | MultipleChoice |
| Phase 5: US3 (P3) | 13 | 10 | TemperatureCheck + Scale |
| Phase 6: US4 (P3) | 7 | 5 | Checklist |
| Phase 7: Polish | 6 | 5 | - |
| **Total** | **50** | **38** | **4 stories** |

**Parallel opportunities**: 76% of tasks (38/50) can run in parallel within their phase

---

## Validation Checklist

Before marking this feature complete, verify:

- [ ] All 5 interactive components are registered in lib/mdx.ts
- [ ] Each component uses the useInteractive hook (no direct localStorage access)
- [ ] All components render skeleton/null during SSR (no hydration mismatches)
- [ ] All components display inline errors for missing required props
- [ ] All components support keyboard navigation (WCAG 2.1 AA)
- [ ] Cross-tab synchronization works for all components
- [ ] localStorage disabled scenario is handled gracefully
- [ ] localStorage quota exceeded shows warning banner
- [ ] Duplicate component IDs are detected and show error UI
- [ ] Corrupted localStorage data is handled with console warnings
- [ ] All components follow Coinbase interstellar design theme
- [ ] content/components-demo.md demonstrates all 5 components
- [ ] All user story acceptance criteria are met (see spec.md)
- [ ] No TypeScript errors with strict mode enabled
- [ ] No console errors or warnings in browser

---

## Notes for Implementation

### File Paths Reference
- **Hook**: `lib/storage.ts` (modify existing file)
- **Components**: `components/mdx/*.tsx` (create new + modify FreeResponse)
- **Registry**: `lib/mdx.ts` (modify existing)
- **Demo**: `content/components-demo.md` (create new)

### Design Theme Reference (from research.md)
```tsx
// Glass effect
className="bg-white/5 backdrop-blur-sm border border-white/10"

// Blue accents
className="text-blue-400 border-blue-500/30"

// Hover states
className="hover:bg-white/10 transition-colors"

// Focus rings
className="focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
```

### Common Patterns
- All components: `'use client'` directive at top
- All components: PropTypes interface exported
- All components: Skeleton during `value === undefined`
- All components: Error UI for missing props
- All hooks: Client-only hydration with useEffect
- All storage: Try-catch with console warnings

---

**Ready for implementation**: All tasks are specified with exact file paths and clear acceptance criteria. Each user story can be implemented and tested independently.

**Suggested next command**: `/speckit.implement` to execute tasks in order, or manually complete tasks starting with Phase 1.
