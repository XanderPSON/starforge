# Tasks: Local MDX Codelab Viewer

**Input**: Design documents from `/specs/001-mdx-codelab-viewer/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL for this MVP - focusing on rapid implementation without TDD.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project** (Next.js 14 App Router): `app/`, `components/`, `lib/`, `content/` at repository root
- Paths shown below follow Next.js 14 structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Next.js 14 project with TypeScript, Tailwind CSS, and App Router using create-next-app
- [X] T002 Install core dependencies: next-mdx-remote@5, remark-gfm@4, clsx, tailwind-merge, @tailwindcss/typography
- [X] T003 [P] Configure TypeScript strict mode in tsconfig.json
- [X] T004 [P] Configure Tailwind CSS with custom typography theme in tailwind.config.ts
- [X] T005 [P] Create content/ directory at repository root for Markdown files
- [X] T006 [P] Create lib/ directory for utility functions
- [X] T007 [P] Create components/mdx/ directory for MDX component implementations
- [X] T008 [P] Create components/ui/ directory for reusable UI primitives

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create utility helper function cn() in lib/utils.ts for class name merging
- [ ] T010 [P] Create MDX compilation utility getCodelab() in lib/mdx.ts for file system reads and MDX parsing
- [ ] T011 [P] Create custom useLocalStorage hook in lib/storage.ts with debounced auto-save (500ms delay)
- [ ] T012 [P] Create MDX components mapping object in components/mdx/mdx-components.ts
- [ ] T013 Create root layout in app/layout.tsx with Inter font and metadata
- [ ] T014 [P] Create landing page placeholder in app/page.tsx
- [ ] T015 Create dynamic route directory structure app/codelab/[slug]/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Local Markdown as Interactive Codelab (Priority: P1) 🎯 MVP

**Goal**: Transform static Markdown files into professionally-styled, interactive codelabs with hot reload support

**Independent Test**: Create content/demo.md, navigate to /codelab/demo, verify rendering with custom styles, edit file and confirm auto-refresh

### Implementation for User Story 1

- [ ] T016 [P] [US1] Create Heading component in components/mdx/Heading.tsx for h1-h6 elements with Tailwind typography
- [ ] T017 [P] [US1] Create Paragraph component in components/mdx/Paragraph.tsx with max-width and line-height styling
- [ ] T018 [P] [US1] Create List component in components/mdx/List.tsx for ul/ol/li elements
- [ ] T019 [P] [US1] Create CodeBlock component in components/mdx/CodeBlock.tsx with monospace font, dark background, and CSS-only styling
- [ ] T020 [P] [US1] Create Blockquote component in components/mdx/Blockquote.tsx with left border and italics
- [ ] T021 [US1] Register all standard Markdown components (h1-h6, p, ul, ol, code, pre, blockquote) in components/mdx/mdx-components.ts
- [ ] T022 [US1] Implement dynamic codelab page in app/codelab/[slug]/page.tsx with getCodelab() call and error handling
- [ ] T023 [US1] Create not-found page in app/codelab/[slug]/not-found.tsx for missing file error handling (FR-011)
- [ ] T024 [US1] Create error page in app/codelab/[slug]/error.tsx for invalid MDX syntax handling
- [ ] T025 [US1] Create sample codelab file in content/demo.md with headings, paragraphs, code blocks, and lists
- [ ] T026 [US1] Verify hot reload functionality by editing content/demo.md and observing browser auto-refresh (SC-002: <2s)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can view local Markdown files as styled codelabs with hot reload

---

## Phase 4: User Story 2 - Persist User Responses Across Sessions (Priority: P2)

**Goal**: Enable users to type answers into FreeResponse components with automatic persistence to localStorage

**Independent Test**: Add `<FreeResponse id="q1" />` to demo.md, type answer, refresh page, verify persistence, clear browser data and verify reset

### Implementation for User Story 2

- [ ] T027 [US2] Create FreeResponse Client Component in components/mdx/FreeResponse.tsx with "use client" directive
- [ ] T028 [US2] Implement multi-line textarea with auto-resize functionality using useRef and scrollHeight calculation in FreeResponse component
- [ ] T029 [US2] Integrate useLocalStorage hook in FreeResponse with composite key pattern (codelab:{slug}:{id}) for per-codelab isolation
- [ ] T030 [US2] Implement debounced auto-save (500ms-1s delay) in FreeResponse using useLocalStorage hook (FR-005)
- [ ] T031 [US2] Add localStorage availability check with warning banner for disabled storage in FreeResponse component
- [ ] T032 [US2] Implement duplicate ID detection with console warning in FreeResponse using useEffect
- [ ] T033 [US2] Register FreeResponse component in components/mdx/mdx-components.ts mapping
- [ ] T034 [US2] Update content/demo.md to include multiple FreeResponse components with unique IDs (q1, q2, q3)
- [ ] T035 [US2] Test localStorage persistence by typing answers, refreshing page, and verifying data retention (SC-003: 100% reliability)
- [ ] T036 [US2] Test per-codelab isolation by creating content/intro.md with same FreeResponse IDs and verifying separate storage

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can view codelabs and persist answers

---

## Phase 5: User Story 3 - Professional Code Block Styling (Priority: P3)

**Goal**: Enhance code block presentation with professional CSS-only styling (no syntax highlighting library)

**Independent Test**: Add JavaScript code block to demo.md, verify monospace font, dark background, padding, rounded corners, and horizontal scroll for long lines

### Implementation for User Story 3

- [ ] T037 [US3] Enhance CodeBlock component in components/mdx/CodeBlock.tsx to distinguish between inline code and code blocks
- [ ] T038 [US3] Add CSS-only styling to code blocks: bg-gray-900, text-gray-100, p-4, rounded-lg, overflow-x-auto (FR-010)
- [ ] T039 [US3] Style inline code with bg-gray-900, text-gray-100, px-1.5, py-0.5, rounded, text-sm
- [ ] T040 [US3] Ensure code blocks handle long lines (>100 characters) with horizontal scrollbar instead of line breaking
- [ ] T041 [US3] Update Tailwind typography configuration in tailwind.config.ts for code block contrast and readability
- [ ] T042 [US3] Add example code blocks to content/demo.md with JavaScript, TypeScript, and long-line examples
- [ ] T043 [US3] Verify accessibility contrast ratios meet WCAG AA standards for code block text/background (SC-004)

**Checkpoint**: All user stories should now be independently functional - users can view codelabs, persist answers, and read well-styled code

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T044 [P] Add ARIA labels to FreeResponse textarea for accessibility (aria-label="Free response answer for {id}")
- [ ] T045 [P] Implement semantic HTML structure in codelab page (article, section elements)
- [ ] T046 [P] Add frontmatter support in lib/mdx.ts for title, description, duration metadata (optional MVP feature)
- [ ] T047 [P] Create ErrorMessage UI component in components/ui/ErrorMessage.tsx for reusable error display
- [ ] T048 Add comprehensive sample codelab in content/demo.md demonstrating all features (headings, code, lists, FreeResponse)
- [ ] T049 Test all edge cases: missing file (FR-011), invalid MDX syntax, localStorage disabled, duplicate IDs, large files (>10,000 lines)
- [ ] T050 Verify performance goals: <5s initial render (SC-001), <2s hot reload (SC-002), <1s debounced save

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 with FreeResponse component (independent testable)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances CodeBlock from US1 (independent testable)

### Within Each User Story

- **US1**: MDX components (T016-T020) can run in parallel → Register components (T021) → Implement page (T022-T024) → Test (T025-T026)
- **US2**: Create FreeResponse (T027) → Add features (T028-T032) sequentially → Register (T033) → Test (T034-T036)
- **US3**: Enhance CodeBlock (T037-T040) sequentially → Update config (T041) → Test (T042-T043)

### Parallel Opportunities

- **Setup tasks** (T003-T008): All can run in parallel
- **Foundational tasks** (T009-T012, T014): Can run in parallel after T009 completes
- **US1 MDX components** (T016-T020): All can run in parallel
- **US2 testing** (T034-T036): Can run in parallel
- **Polish tasks** (T044-T047, T049): Most can run in parallel

---

## Parallel Example: User Story 1 MDX Components

```bash
# Launch all MDX component tasks together:
Task T016: "Create Heading component in components/mdx/Heading.tsx"
Task T017: "Create Paragraph component in components/mdx/Paragraph.tsx"
Task T018: "Create List component in components/mdx/List.tsx"
Task T019: "Create CodeBlock component in components/mdx/CodeBlock.tsx"
Task T020: "Create Blockquote component in components/mdx/Blockquote.tsx"

# Then sequentially:
Task T021: "Register all components in mdx-components.ts"
Task T022: "Implement dynamic page"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T015) - CRITICAL
3. Complete Phase 3: User Story 1 (T016-T026)
4. **STOP and VALIDATE**: Test US1 independently
5. Demo if ready (basic codelab viewer with hot reload)

**Total MVP Tasks**: 26 tasks
**Estimated Time**: 2-3 hours (based on quickstart guide)

### Incremental Delivery

1. Complete Setup + Foundational (T001-T015) → Foundation ready
2. Add User Story 1 (T016-T026) → Test independently → Demo (MVP! ✅)
3. Add User Story 2 (T027-T036) → Test independently → Demo (persistence added)
4. Add User Story 3 (T037-T043) → Test independently → Demo (enhanced styling)
5. Add Polish (T044-T050) → Final QA → Release

**Total Tasks**: 50 tasks
**Estimated Time**: 4-5 hours for full implementation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T015)
2. Once Foundational is done:
   - Developer A: User Story 1 (T016-T026) - Core rendering
   - Developer B: User Story 2 (T027-T036) - Persistence
   - Developer C: User Story 3 (T037-T043) - Styling enhancements
3. Stories complete and integrate independently
4. Team reviews Polish tasks together (T044-T050)

---

## Notes

- **[P] tasks** = different files, no dependencies - can run in parallel
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **No tests included**: Focus on rapid MVP implementation without TDD (tests can be added post-MVP if requested)
- Avoid cross-story dependencies that break independence
- File paths are absolute from repository root

---

## Success Criteria Verification

After completing all tasks, verify:

- ✅ **SC-001**: New Markdown file renders in browser within 5 seconds
- ✅ **SC-002**: Browser auto-refreshes within 2 seconds after file edit
- ✅ **SC-003**: FreeResponse answers persist with 100% reliability (localStorage available)
- ✅ **SC-004**: All Markdown elements render with professional Tailwind styling, pass WCAG AA contrast
- ✅ **SC-005**: System handles edge cases gracefully (missing files, invalid syntax, disabled storage)

## User Story Completion Checklist

- [ ] **US1 Complete**: Markdown files render as styled codelabs with hot reload
- [ ] **US2 Complete**: FreeResponse components persist answers across sessions
- [ ] **US3 Complete**: Code blocks display with professional CSS-only styling
- [ ] **Polish Complete**: Accessibility, error handling, performance verified

---

## Task Count Summary

- **Setup**: 8 tasks (T001-T008)
- **Foundational**: 7 tasks (T009-T015) - BLOCKING
- **User Story 1**: 11 tasks (T016-T026) - MVP
- **User Story 2**: 10 tasks (T027-T036)
- **User Story 3**: 7 tasks (T037-T043)
- **Polish**: 7 tasks (T044-T050)

**Total**: 50 tasks
**MVP Scope**: 26 tasks (Setup + Foundational + US1)
**Parallel Opportunities**: 15+ tasks can run in parallel across phases
