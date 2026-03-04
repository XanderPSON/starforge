---
title: Interactive Components Demo
description: Complete showcase of all five interactive components
duration: 15
author: MDX Codelab Viewer
---

# Interactive Components Demo

Welcome to the Interactive Component Library! This codelab demonstrates all five interactive components with live examples and testing instructions.

> 📘 **For Developers**: See `/docs/INTERACTIVE-COMPONENTS.md` for complete API documentation, props reference, and usage guidelines.

---

## 1. FreeResponse - Open-Ended Text Input

Multi-line textarea with auto-save and persistence. Perfect for reflections, answers, and feedback.

<FreeResponse id="demo-free-1" label="What did you learn today?" placeholder="Type your answer..." />

![Test image](/images/basethreads/jacket-1.png)

### Features

- ✅ Auto-resizing textarea (grows with content)
- ✅ Auto-save with "Saved" indicator (appears after 1 second)
- ✅ Persists across page refreshes
- ✅ Cross-tab synchronization

### Testing Instructions

1. Type text into the textarea above
2. Stop typing and wait ~1 second → "✓ Saved" indicator appears
3. Refresh the page → your text persists
4. Open this page in another tab → type in one tab, watch it sync to the other

### Props Reference

```typescript
<FreeResponse
  id="string"           // Required: Unique identifier
  label="string"        // Optional: Question text
  placeholder="string"  // Optional: Placeholder text
/>
```

---

## 2. MultipleChoice - Self-Assessment Quizzes

Interactive quizzes with immediate visual feedback on correctness. Great for knowledge checks!

<QuizMath id="demo-mc-1" />

<QuizPlanet id="demo-mc-2" />

### Features

- ✅ Green border/background on correct answer
- ✅ Red border/background on incorrect answer
- ✅ Selection persists across page refreshes
- ✅ Can change answer after submitting

### Testing Instructions

1. Select the correct answer (4 for the math question)
2. Notice the green "✓ Correct!" message
3. Select an incorrect answer
4. Notice the red "✗ Incorrect" message
5. Refresh the page → selection and feedback persist
6. Change from incorrect to correct → feedback updates

### Props Reference

```typescript
<MultipleChoice
  id="string"              // Required: Unique identifier
  question="string"        // Required: Question text
  options={["A", "B"]}     // Required: Array of choices
  correctAnswer="string"   // Required: Correct answer
/>
```

**MDX Note**: Due to MDX limitations with array props, this demo uses wrapper components (`QuizMath`, `QuizPlanet`). See docs for workarounds.

---

## 3. TemperatureCheck - Sentiment Feedback

Quick emoji-based sentiment feedback. Perfect for gauging understanding or confusion!

<TemperatureCheck id="demo-temp-1" />

### Features

- ✅ 5 emoji levels: 😕 (Confused) → 🤔 → 😐 → 😊 → 🤩 (Starstruck)
- ✅ Selected emoji scales up (1.25x)
- ✅ Smooth 300ms animation
- ✅ Selection persists across page refreshes

### Testing Instructions

1. Click an emoji to select it
2. Notice the scaling animation (under 300ms)
3. Selected emoji appears larger
4. Refresh the page → selection persists
5. Click a different emoji → selection updates smoothly

### Props Reference

```typescript
<TemperatureCheck
  id="string"  // Required: Unique identifier
/>
```

---

## 4. Scale - Numeric Rating

Volume-bar style rating component. Ideal for confidence levels and satisfaction ratings!

<Scale id="demo-scale-1" max={5} label="How confident do you feel?" />

<Scale id="demo-scale-2" max={10} label="Rate this content (1-10)" />

### Features

- ✅ Configurable max value (1-10)
- ✅ Volume-bar effect (highlights circles 1 to N)
- ✅ Instant visual feedback (under 100ms)
- ✅ Shows "N / max" indicator when selected
- ✅ Selection persists across page refreshes

### Testing Instructions

1. Click on position 3 (third circle) in the first scale
2. Circles 1-3 highlight immediately
3. Click on position 1 → only first circle highlights
4. Try the 10-point scale below
5. Refresh the page → ratings persist

### Props Reference

```typescript
<Scale
  id="string"     // Required: Unique identifier
  max={number}    // Optional: Maximum value (default: 5)
  label="string"  // Optional: Label text
/>
```

---

## 5. Checklist - Task Completion Tracking

Track progress through multi-step exercises with checkboxes and progress counter.

<ChecklistDemo id="demo-checklist-1" />

### Features

- ✅ Native checkbox inputs (full keyboard support)
- ✅ Progress counter ("3 of 5 completed")
- ✅ "All done!" message when complete
- ✅ Line-through styling for checked items
- ✅ Each checkbox persists independently

### Testing Instructions

1. Check items 1, 3, and 5
2. Progress counter shows "3 of 5 completed"
3. Checkboxes appear with green background
4. Refresh the page → same items remain checked
5. Uncheck item 1 → it unchecks immediately
6. Complete all items → "All done!" message appears

### Props Reference

```typescript
<Checklist
  id="string"              // Required: Unique identifier
  items={["Task 1", ...]}  // Required: Array of tasks
/>
```

**MDX Note**: This demo uses a wrapper component (`ChecklistDemo`). See docs for using with custom task lists.

---

## Component Development Status

✅ **Phase 1**: Setup Complete
✅ **Phase 2**: Foundational Hook (useInteractive) Complete
✅ **Phase 3**: FreeResponse Component Complete
✅ **Phase 4**: MultipleChoice Component Complete
✅ **Phase 5**: TemperatureCheck & Scale Components Complete
✅ **Phase 6**: Checklist Component Complete
✅ **Phase 7**: Polish & Edge Cases Complete

🎉 **All 5 Interactive Components Production Ready!**

---

## Edge Case Testing

### 1. localStorage Disabled Test

**Scenario**: Browser has disabled localStorage (private browsing, security policy)

**Steps**:
1. Open browser in private/incognito mode
2. Navigate to this page
3. Components render and function normally
4. Changes won't persist across page reloads
5. No errors appear in console

**Expected**: Components remain functional with in-memory state only

---

### 2. Cross-Tab Synchronization Test

**Scenario**: Same codelab open in multiple browser tabs

**Steps**:
1. Open this page in two browser tabs side-by-side
2. Type in the FreeResponse in Tab A
3. Watch text appear in Tab B automatically (within 1 second)
4. Select a MultipleChoice answer in Tab A → syncs to Tab B
5. Check a Checklist item in Tab B → syncs to Tab A

**Expected**: All component state synchronizes in real-time across tabs

---

### 3. Rapid Input Test (Debouncing)

**Scenario**: User types very quickly

**Steps**:
1. Type rapidly in the FreeResponse component
2. "Saved" indicator should NOT appear until you stop typing
3. Wait 500ms → "Saved" indicator appears
4. Type one more character → indicator disappears immediately
5. Stop typing → indicator reappears after 500ms

**Expected**: Debounced saves reduce localStorage writes (better performance)

---

### 4. Hydration Test (SSR vs Client)

**Scenario**: Server-side rendering doesn't match client localStorage

**Steps**:
1. Have saved state in localStorage (interact with components above)
2. Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)
3. Components show skeleton loaders briefly
4. Then hydrate with your saved values
5. Check console → should be NO hydration mismatch warnings

**Expected**: Smooth hydration with no React errors

---

## Technical Implementation

| Feature | Implementation |
|---------|----------------|
| **Storage Pattern** | `codelab:{slug}:{componentId}` |
| **Auto-Save Delay** | 500ms debounce after typing stops |
| **Size Limit** | 50KB per component (40KB warning) |
| **Cross-Tab Sync** | Real-time via localStorage storage events |
| **Hydration** | Client-only to prevent SSR mismatches |
| **Error Handling** | Graceful degradation with console warnings |
| **Accessibility** | WCAG 2.1 AA compliant (keyboard + screen reader) |
| **Design Theme** | Coinbase interstellar (glass effects, blue accents) |

---

## Keyboard Navigation Reference

| Component | Keyboard Support |
|-----------|------------------|
| **FreeResponse** | Tab (focus), Type (edit), Enter (new line) |
| **MultipleChoice** | Tab (navigate options), Enter/Space (select) |
| **TemperatureCheck** | Tab (navigate emojis), Enter/Space (select) |
| **Scale** | Tab (navigate circles), Enter/Space (select) |
| **Checklist** | Tab (navigate items), Space (toggle checkbox) |

All components have visible focus indicators and follow standard web accessibility patterns.

---

## ARIA Labels & Screen Reader Support

All components include proper ARIA attributes for screen reader accessibility:

- **FreeResponse**: `aria-label` with question context
- **MultipleChoice**: `role="radiogroup"`, `role="radio"`, `aria-checked`
- **TemperatureCheck**: `aria-label` for each emoji, `aria-pressed` for selection
- **Scale**: `aria-current` for selected value, descriptive `aria-label` for ratings
- **Checklist**: Native checkbox semantics (automatically accessible)

Tested with VoiceOver (macOS) and NVDA (Windows).

---

## MDX Usage Guide

### Components That Work Directly in MDX

These components have simple props and work without modifications:

```mdx
<FreeResponse id="q1" label="Question?" />
<TemperatureCheck id="temp1" />
<Scale id="scale1" max={5} label="Rating" />
```

### Components That Need Wrapper Components

These components require array props, which MDX cannot parse:

```mdx
<!-- ❌ Does NOT work in MDX -->
<MultipleChoice
  options={["A", "B", "C"]}
  correctAnswer="B"
/>

<!-- ✅ Works with wrapper component -->
<QuizMath id="quiz1" />
```

**Solution**: Create wrapper components like `QuizMath.tsx` that include the array props. See `/docs/INTERACTIVE-COMPONENTS.md` for detailed instructions.

---

## Developer Resources

- 📘 **Full Documentation**: `/docs/INTERACTIVE-COMPONENTS.md`
- 🎨 **Component Source**: `/components/mdx/`
- 🔧 **Core Hook**: `/lib/storage.ts` (useInteractive)
- 📝 **Type Definitions**: See each component file for TypeScript interfaces

---

## Best Practices

### DO:
✅ Use descriptive, unique IDs (`"section-2-confidence"` not `"q1"`)
✅ Provide clear labels for context
✅ Test with localStorage disabled (private browsing)
✅ Use wrapper components for array props in MDX
✅ Keep questions concise (1-2 sentences)

### DON'T:
❌ Reuse IDs across different components in same codelab
❌ Use JavaScript array literals directly in MDX
❌ Forget labels on Scale components
❌ Overuse interactive components (every 3-5 paragraphs max)
❌ Make Checklist items too long (1 line each)

---

**Feature Complete!** All 5 interactive components are production-ready with comprehensive error handling, accessibility, and cross-browser support.

Ready to build your own interactive codelab? Check out the documentation at `/docs/INTERACTIVE-COMPONENTS.md` for complete API reference and usage examples!
