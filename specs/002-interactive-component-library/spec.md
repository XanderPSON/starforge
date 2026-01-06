# Feature Specification: Interactive Component Library

**Feature Branch**: `002-interactive-component-library`
**Created**: 2026-01-05
**Status**: Draft
**Input**: User description: "Expand the Local MDX Viewer by creating an Interactive Component Library for the content with useInteractive hook, FreeResponse, MultipleChoice, TemperatureCheck, Scale, and Checklist components"

## User Scenarios & Testing

### User Story 1 - Basic Interactive Text Responses (Priority: P1)

As a codelab learner, I want to type free-form responses to questions and have them automatically saved, so that I can return to my learning session later without losing my progress.

**Why this priority**: This is the foundational interaction pattern. Text input with persistence is the most common learning interaction and provides immediate value. The existing FreeResponse component needs to be refactored to use the new unified persistence system.

**Independent Test**: Create a codelab with a FreeResponse component, type an answer, refresh the page, and verify the answer persists. Close the browser completely and reopen to verify persistence across sessions.

**Acceptance Scenarios**:

1. **Given** a codelab with a FreeResponse component, **When** I type text into the textarea, **Then** I see a "Saved" indicator appear after I stop typing
2. **Given** I have entered text into a FreeResponse, **When** I refresh the page, **Then** my previous text is still visible in the textarea
3. **Given** I have answered multiple FreeResponse components in different codelabs, **When** I view each codelab separately, **Then** each displays only its own saved responses (isolated by codelab)

---

### User Story 2 - Self-Assessment Quizzes (Priority: P2)

As a codelab learner, I want to answer multiple-choice questions and receive immediate feedback on my answers, so that I can verify my understanding as I progress through the material.

**Why this priority**: Quizzes provide immediate knowledge validation and are a standard learning pattern. This adds educational value beyond simple text responses.

**Independent Test**: Create a codelab with MultipleChoice components, select answers (both correct and incorrect), verify visual feedback appears, and confirm selections persist on page refresh.

**Acceptance Scenarios**:

1. **Given** a MultipleChoice question with 4 options, **When** I select the correct answer, **Then** I see a green success indicator
2. **Given** a MultipleChoice question, **When** I select an incorrect answer, **Then** I see a red error indicator
3. **Given** I have selected an answer to a multiple-choice question, **When** I refresh the page, **Then** my selection is preserved and the feedback state is restored
4. **Given** I have selected an incorrect answer, **When** I change my selection to the correct answer, **Then** the feedback updates from error to success state

---

### User Story 3 - Sentiment and Rating Feedback (Priority: P3)

As a codelab learner, I want to express my confusion level or rate my understanding using visual scales, so that I can track my confidence and provide feedback without typing.

**Why this priority**: Emotional feedback (TemperatureCheck) and ratings (Scale) provide quick, low-friction ways to gather learner sentiment. These are nice-to-have enhancements that improve engagement but aren't essential for core learning.

**Independent Test**: Create a codelab with TemperatureCheck and Scale components, interact with both by clicking different options, verify visual feedback (scaling animation, highlighting), and confirm selections persist.

**Acceptance Scenarios**:

1. **Given** a TemperatureCheck component, **When** I click an emoji (1-5), **Then** that emoji scales up to indicate selection
2. **Given** a Scale component with max=5, **When** I click on position 3, **Then** circles 1-3 are highlighted like a volume bar
3. **Given** I have selected a temperature check rating, **When** I refresh the page, **Then** my selected emoji remains scaled up
4. **Given** I have set a scale value to 4, **When** I click position 2, **Then** the highlight updates to show only positions 1-2

---

### User Story 4 - Task Completion Tracking (Priority: P3)

As a codelab learner, I want to check off tasks as I complete them in a checklist, so that I can track my progress through multi-step exercises.

**Why this priority**: Checklists are useful for procedural learning but less critical than core input/feedback mechanisms. They're a supporting feature for structured learning paths.

**Independent Test**: Create a codelab with a Checklist component containing 5 items, check off items in various orders, verify state persists on refresh, and confirm completion status is tracked per item.

**Acceptance Scenarios**:

1. **Given** a Checklist with 5 items, **When** I check items 1, 3, and 5, **Then** those checkboxes appear checked while 2 and 4 remain unchecked
2. **Given** I have checked 3 out of 5 checklist items, **When** I refresh the page, **Then** the same 3 items remain checked
3. **Given** all checklist items are checked, **When** I uncheck one item, **Then** that item's checkbox state updates immediately

---

### Edge Cases

- **Hydration Mismatch**: To prevent server/client state mismatches, interactive components use client-only rendering by initializing useState with no SSR value, rendering null or a skeleton placeholder during server-side rendering, and hydrating with the actual localStorage value only after client mount
- **Storage Quota Exceeded**: When localStorage is full or quota is exceeded, the system must display a persistent warning banner at the top of the page indicating storage is full, while allowing components to remain functional (unsaved state only in memory)
- **Concurrent Tabs**: When the same codelab is open in multiple browser tabs, changes in one tab must immediately reflect in other tabs using localStorage storage events for real-time synchronization
- **Invalid Stored Data**: When corrupted or incompatible localStorage data is detected (malformed JSON, wrong data type, incompatible version), the system silently discards the invalid data, reinitializes the component with its default value, and logs a warning to the browser console for developer debugging
- **Component ID Conflicts**: When two different component types share the same ID within a codelab, the system throws an error at runtime, logs the conflict to the console with details about the conflicting components, and renders an error message in both components indicating the duplicate ID must be resolved
- **Missing Required Props**: When a component is rendered without required props (e.g., MultipleChoice missing `options` array or `correctAnswer`), the component displays an inline error message in place of its normal UI, clearly indicating which required props are missing to help content authors debug the issue

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a `useInteractive` hook that accepts an `id` and `defaultValue` and returns `[value, setValue, isSaved]`
- **FR-002**: The `useInteractive` hook MUST persist state to localStorage using the key pattern `codelab_state_{id}`
- **FR-003**: The `useInteractive` hook MUST use client-only rendering by returning undefined/null during SSR and only hydrating with localStorage values after client mount, rendering a skeleton or null placeholder during server-side rendering to prevent hydration mismatches
- **FR-004**: The `useInteractive` hook MUST track save state and expose an `isSaved` boolean that indicates when persistence is complete
- **FR-005**: System MUST provide a FreeResponse component that accepts `id`, `label`, and `placeholder` props
- **FR-006**: FreeResponse component MUST display a "Saved" indicator when the user stops typing
- **FR-007**: System MUST provide a MultipleChoice component that accepts `id`, `question`, `options` (string[]), and `correctAnswer` props
- **FR-008**: MultipleChoice component MUST show a green success state when the selected answer matches `correctAnswer`
- **FR-009**: MultipleChoice component MUST show a red error state when the selected answer does not match `correctAnswer`
- **FR-010**: MultipleChoice component MUST persist the user's selection across page reloads
- **FR-011**: System MUST provide a TemperatureCheck component that accepts an `id` prop
- **FR-012**: TemperatureCheck component MUST display 5 clickable emojis representing sentiment levels (1=Confused 😕, 2=Thinking 🤔, 3=Okay 😐, 4=Happy 😊, 5=Starstruck 🤩)
- **FR-013**: TemperatureCheck component MUST scale up the selected emoji to indicate active state
- **FR-014**: System MUST provide a Scale component that accepts `id`, `max` (default 5), and `label` props
- **FR-015**: Scale component MUST render a row of clickable circles from 1 to `max`
- **FR-016**: Scale component MUST highlight all circles up to and including the selected value (volume bar effect)
- **FR-017**: System MUST provide a Checklist component that accepts `id` and `items` (string[]) props
- **FR-018**: Checklist component MUST render a checkbox for each item in the `items` array
- **FR-019**: Checklist component MUST persist an array of boolean states (one per item) across page reloads
- **FR-020**: All interactive components MUST be registered in the MDX components mapping to be usable in Markdown files
- **FR-021**: System MUST include a demonstration file (`content/components-demo.md`) showcasing all interactive components
- **FR-022**: All interactive components MUST follow the Coinbase-branded interstellar design theme (glass effects, blue accents, gradient text)
- **FR-023**: All interactive components MUST handle localStorage being disabled gracefully (show warning but remain functional)
- **FR-024**: The `useInteractive` hook MUST listen for localStorage storage events to synchronize state changes across multiple browser tabs in real-time
- **FR-025**: When localStorage quota is exceeded, the system MUST display a persistent warning banner at the top of the page indicating storage is full while allowing components to remain functional with unsaved state in memory only
- **FR-026**: The `useInteractive` hook MUST handle corrupted or incompatible localStorage data by silently discarding invalid data, reinitializing with the provided `defaultValue`, and logging a warning to the console
- **FR-027**: When multiple components within the same codelab use the same `id`, the system MUST detect the conflict at runtime, log an error to the console with details about the conflicting components, and render an error message in all components sharing that ID
- **FR-028**: All interactive components MUST validate required props at render time and display an inline error message indicating which props are missing when validation fails, rather than throwing errors that break page rendering
- **FR-029**: The system MUST reliably handle individual component state values up to 50KB in size (approximately 50,000 characters for text content)

### Key Entities

- **Interactive State**: Represents the saved state of a single interactive component, stored in localStorage with a unique ID, containing the component's current value and metadata
- **Component Registry**: The mapping of MDX component names to React components that makes interactive components available in Markdown
- **Codelab Session**: The collection of all interactive state for a single codelab, isolated by codelab slug to prevent cross-contamination

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can type a response and see the "Saved" indicator appear within 1 second of stopping
- **SC-002**: All component interactions persist with 100% reliability when localStorage is available
- **SC-003**: Components handle localStorage being disabled gracefully without crashing or blocking page render
- **SC-004**: TemperatureCheck emoji scaling animation completes in under 300ms for smooth visual feedback
- **SC-005**: Scale component highlights update instantly (<100ms) when clicking different values
- **SC-006**: MultipleChoice feedback (green/red state) appears immediately upon selection without delay
- **SC-007**: All components render without hydration mismatch errors on initial page load
- **SC-008**: Components demo file successfully demonstrates all 5 interactive component types in a single codelab

## Clarifications

### Session 2026-01-05

- Q: When a user has the same codelab open in multiple browser tabs and interacts with components in both tabs, how should the system handle state synchronization? → A: Real-time sync: Changes in one tab immediately reflect in other tabs using localStorage storage events
- Q: When localStorage is full or quota is exceeded while trying to save component state, what specific user-facing behavior should occur? → A: Warning banner: Show persistent warning banner at top of page indicating storage full, component remains functional but unsaved

### Session 2026-01-06

- Q: When the system detects corrupted or incompatible localStorage data (e.g., wrong data type, malformed JSON, or data from an incompatible version), what should happen? → A: Clear and reinitialize: Silently discard the invalid data, reinitialize with default value, log warning to console
- Q: When two different component types share the same ID within a single codelab (e.g., a FreeResponse with id="answer1" and a MultipleChoice with id="answer1"), how should the system handle this conflict? → A: Fail loudly: Throw error at runtime, log to console, render error message in both conflicting components
- Q: When a component like MultipleChoice is rendered without required props (e.g., missing `options` array or `correctAnswer`), what should happen? → A: Render error state: Display an inline error message where the component would render, showing which required props are missing
- Q: When server-rendered HTML doesn't match client-side localStorage state on initial load (e.g., server renders empty textarea, but localStorage contains saved text), what approach should the system use? → A: Client-only render: Use React's useState with no SSR value, render null/skeleton on server, hydrate with localStorage value on client mount
- Q: What is the maximum expected size per individual component state value that the system should reliably handle? → A: 50KB per component

## Assumptions

- The existing `FreeResponse` component in `components/mdx/FreeResponse.tsx` will be refactored to use the new `useInteractive` hook
- The existing `useLocalStorage` hook in `lib/storage.ts` will be replaced or enhanced to become `useInteractive`
- All components will follow the existing Coinbase design theme (dark backgrounds, blue accents, glass effects)
- Components will use the existing `cn()` utility for className merging
- The debounce delay for auto-save will be consistent with the existing pattern (500ms)
- MultipleChoice will use simple string matching for `correctAnswer` (case-sensitive)
- TemperatureCheck emoji Unicode will render consistently across modern browsers
- Scale component will use visual circles/dots rather than star icons
- Checklist will maintain item order as provided in the `items` array
- The demo file will be comprehensive enough to serve as both test fixture and documentation

## Future Considerations

- **Database Migration**: The localStorage-based persistence is a temporary solution for demo purposes. A more permanent database-backed solution will be implemented in the future to support features like cross-device synchronization, analytics, and data durability beyond browser storage limits
