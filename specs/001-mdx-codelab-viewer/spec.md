# Feature Specification: Local MDX Codelab Viewer

**Feature Branch**: `001-mdx-codelab-viewer`
**Created**: 2026-01-05
**Status**: Draft
**Input**: User description: "Build a "Local MDX Codelab Viewer" using Next.js. The goal is to create a high-performance engine that reads a local Markdown file and renders it as an interactive React application on localhost."

## Clarifications

### Session 2026-01-05

- Q: Should `<FreeResponse>` render as a single-line input or multi-line textarea? → A: Multi-line textarea with auto-resize
- Q: How do users navigate between different codelab files? → A: Route-based via URL (`/codelab/[filename]`)
- Q: Should localStorage responses be isolated per codelab or shared globally? → A: Isolated per codelab file (storage key includes filename)
- Q: When should the system save user input to localStorage? → A: Debounced auto-save after typing stops (e.g., 500ms-1s delay)
- Q: Should code blocks use syntax highlighting library or CSS-only styling? → A: CSS-based styling only (monospace, backgrounds, no color highlighting)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Local Markdown as Interactive Codelab (Priority: P1)

A developer creates a Markdown file in the `content/` directory (e.g., `content/demo.md`) and wants to view it as a professionally styled, interactive codelab in their browser. The system should automatically detect file changes and hot-reload the browser to show updates immediately.

**Why this priority**: This is the core value proposition—transforming static Markdown into a live, interactive experience. Without this, the tool has no purpose.

**Independent Test**: Create a new `.md` file in the `content/` folder, navigate to the codelab viewer route, and verify that the Markdown renders with custom styling. Edit the file and confirm the browser auto-refreshes.

**Acceptance Scenarios**:

1. **Given** a Markdown file exists at `content/demo.md`, **When** the user navigates to `/codelab/demo`, **Then** the Markdown content appears as styled HTML with professional typography and layout
2. **Given** the codelab viewer is open in a browser, **When** the user edits `content/demo.md` and saves, **Then** the browser automatically reloads within 2 seconds to show the updated content
3. **Given** the Markdown file contains standard elements (headings, paragraphs, code blocks, lists), **When** rendered, **Then** each element displays with custom Tailwind CSS styling for readability

---

### User Story 2 - Persist User Responses Across Sessions (Priority: P2)

A developer working through an interactive codelab wants to type free-form answers into custom `<FreeResponse>` components embedded in the Markdown. When they refresh the page or return later, their previous answers should still be visible, allowing them to continue where they left off.

**Why this priority**: Persistence transforms the viewer from a one-time read to a reusable learning tool. Users can take breaks and return without losing progress.

**Independent Test**: Add a `<FreeResponse id="q1" />` component to a Markdown file, type an answer, refresh the page, and verify the answer persists. Clear browser storage and confirm the answer resets.

**Acceptance Scenarios**:

1. **Given** a `<FreeResponse id="q1" />` component exists in the Markdown, **When** the user types "My answer here" and waits 1 second, **Then** the answer is automatically saved and persists when returning to the page
2. **Given** multiple `<FreeResponse>` components with unique IDs (`q1`, `q2`, `q3`) in a codelab, **When** the user fills in all responses, **Then** each response is saved independently per codelab and persists across page reloads
3. **Given** the user has saved responses in localStorage, **When** they clear browser data, **Then** all responses reset to empty on the next page load

---

### User Story 3 - Professional Code Block Styling (Priority: P3)

A developer authoring a codelab wants to include code snippets (using standard Markdown code fences like triple backticks). The viewer should render these with professional styling, including proper indentation, monospace fonts, distinct background colors, and visual distinction from body text.

**Why this priority**: Code blocks are essential for technical codelabs. Poor code presentation frustrates users and reduces credibility.

**Independent Test**: Add a code block with JavaScript to the Markdown file and verify it renders with monospace font, background color, padding, and horizontal scrolling for long lines.

**Acceptance Scenarios**:

1. **Given** a Markdown file contains a fenced code block (triple backticks), **When** rendered, **Then** the code displays in a monospace font with a distinct background color and padding
2. **Given** a code block contains a long line (>100 characters), **When** rendered, **Then** the block shows a horizontal scrollbar instead of breaking the line awkwardly
3. **Given** inline code (single backticks), **When** rendered within a paragraph, **Then** it displays with a subtle background and monospace font distinct from surrounding text

---

### Edge Cases

- What happens when the `content/demo.md` file is deleted while the viewer is open? (Should show a graceful error message instead of crashing)
- What happens when the Markdown file contains invalid MDX syntax? (Should display a clear syntax error message to the developer)
- How does the system handle very large Markdown files (e.g., >10,000 lines)? (Should still render but may have slower initial load—acceptable for MVP)
- What happens if localStorage is disabled or unavailable in the browser? (FreeResponse components should still allow typing but show a warning that answers won't persist)
- What happens when two `<FreeResponse>` components share the same ID within one codelab? (Should show a console warning and only save the last one to avoid data corruption)
- What happens when different codelabs use the same FreeResponse IDs? (Responses are isolated per codelab file, so no conflict occurs)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST read Markdown files from a local directory (e.g., `content/demo.md`) using file system APIs based on the filename parameter in the URL route (`/codelab/[filename]`)
- **FR-002**: System MUST use `next-mdx-remote` library to parse Markdown into React Server Components
- **FR-003**: System MUST map standard Markdown elements (h1, h2, h3, p, ul, ol, pre, code, blockquote) to custom React components styled with Tailwind CSS
- **FR-004**: System MUST implement a `<FreeResponse id="string" />` custom component that renders a multi-line textarea with auto-resize capability
- **FR-005**: System MUST save user input from `<FreeResponse>` components to browser localStorage using a composite key that includes both the codelab filename and the component's `id` prop (e.g., `codelab:demo:q1`), with debounced auto-save triggered 500ms-1s after the user stops typing
- **FR-006**: System MUST retrieve saved responses from localStorage on page load using the composite key (filename + id) and populate `<FreeResponse>` fields automatically
- **FR-007**: System MUST support Next.js hot module replacement so file changes trigger automatic browser refresh
- **FR-008**: System MUST display headings (h1-h6) with distinct font sizes, weights, and spacing
- **FR-009**: System MUST display paragraphs with comfortable line height and maximum width for readability
- **FR-010**: System MUST display code blocks with monospace font, distinct background color, padding, rounded corners, and horizontal scrolling for overflow (CSS-based styling only, no syntax highlighting library required for MVP)
- **FR-011**: System MUST handle missing Markdown files gracefully with a user-friendly error message (e.g., when navigating to `/codelab/nonexistent`)
- **FR-012**: System MUST validate that each `<FreeResponse>` component has a unique `id` prop (console warning for duplicates)

### Key Entities *(include if feature involves data)*

- **Markdown File**: A local `.md` or `.mdx` file containing structured content with headings, paragraphs, code blocks, and custom components
- **FreeResponse Answer**: A user-provided multi-line text string associated with a unique question ID, stored in browser localStorage
- **Custom MDX Component**: React component (like `<FreeResponse>`) that can be embedded in Markdown for interactivity
- **Component Mapping**: A configuration object that maps Markdown element types (e.g., `h1`, `code`) to custom React components

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new Markdown file and see it rendered in the browser within 5 seconds of saving the file
- **SC-002**: Browser automatically refreshes within 2 seconds when a Markdown file is edited and saved (hot reload)
- **SC-003**: Users can type an answer into a FreeResponse field, refresh the page, and see their answer persist with 100% reliability (when localStorage is available)
- **SC-004**: All standard Markdown elements (headings, paragraphs, lists, code blocks) render with professional Tailwind CSS styling that passes accessibility contrast checks (code blocks use CSS-only styling without syntax highlighting)
- **SC-005**: System gracefully handles edge cases (missing files, invalid syntax, disabled localStorage) with clear user feedback instead of crashes

### Assumptions

1. **Development Environment**: This tool is designed for local development only (localhost). Production deployment is out of scope for MVP.
2. **Single User**: The tool assumes a single developer working on their local machine. Multi-user collaboration is not supported.
3. **Browser Support**: Modern browsers with localStorage support (Chrome, Firefox, Safari, Edge). Legacy browsers (IE11) are not supported.
4. **File Format**: Markdown files use standard syntax with optional MDX extensions for custom components. Advanced MDX features (imports, exports) are out of scope for MVP.
5. **File Location**: Markdown files are located in a single directory (`content/` or similar). Nested directories are not required for MVP.
6. **Styling Approach**: Tailwind CSS is available and configured in the Next.js project. Custom CSS is minimized.
7. **Hot Reload**: Next.js development server is running with default HMR (Hot Module Replacement) settings.
