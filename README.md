# MDX Codelab Viewer

A local-first, interactive codelab viewer built with Next.js 14 and MDX.

## Features

✅ **View Local Markdown as Interactive Codelabs**
- Read Markdown files from the `content/` directory
- Professional Tailwind CSS styling with typography plugin
- Hot reload support for instant updates (<2s)
- Support for all standard Markdown elements + GitHub Flavored Markdown

✅ **Persistent User Responses**
- `<FreeResponse>` components with localStorage persistence
- Auto-resize textareas that grow with content
- Debounced auto-save (500ms delay) for performance
- Per-codelab isolation using composite storage keys

✅ **Professional Code Block Styling**
- Distinct styling for inline code vs. code blocks
- Horizontal scrolling for long lines
- WCAG AA compliant contrast ratios (~15:1)
- CSS-only styling (no syntax highlighting library)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

### Viewing a Codelab

Navigate to `/codelab/[filename]` to view a codelab. For example:

- `/codelab/demo` - Comprehensive demo of all features
- `/codelab/intro` - Introduction to codelabs

### Creating Your Own Codelabs

1. Create a new `.md` file in the `content/` directory
2. Add optional frontmatter:

```yaml
---
title: Your Codelab Title
description: A brief description
duration: 15
author: Your Name
tags: [tag1, tag2]
---
```

3. Write your content using standard Markdown
4. Add interactive elements with `<FreeResponse id="unique-id" />`
5. Navigate to `/codelab/your-filename` to view it

## Project Structure

```
mdparser/
├── app/
│   ├── layout.tsx           # Root layout with Inter font
│   ├── page.tsx             # Landing page
│   ├── globals.css          # Tailwind base styles
│   └── codelab/[slug]/
│       ├── page.tsx         # Dynamic codelab viewer
│       ├── not-found.tsx    # 404 handler
│       └── error.tsx        # Error handler
├── components/
│   ├── mdx/
│   │   ├── Heading.tsx      # H1-H6 components
│   │   ├── Paragraph.tsx    # Paragraph component
│   │   ├── List.tsx         # UL/OL/LI components
│   │   ├── CodeBlock.tsx    # Code/Pre components
│   │   ├── Blockquote.tsx   # Blockquote component
│   │   ├── FreeResponse.tsx # Interactive textarea with persistence
│   │   └── mdx-components.ts # MDX component mapping
│   └── ui/
│       └── ErrorMessage.tsx # Reusable error display
├── lib/
│   ├── mdx.ts               # MDX compilation utilities
│   ├── storage.ts           # localStorage hook
│   └── utils.ts             # Utility functions
├── content/
│   ├── demo.md              # Comprehensive demo codelab
│   └── intro.md             # Introduction codelab
└── specs/
    └── 001-mdx-codelab-viewer/  # Design documents
```

## Architecture

### Core Principles

1. **Local-First Input**: All content comes from local file system
2. **Server vs Client Split**: MDX parsing on server, interactivity on client
3. **Custom Component Mapping**: All Markdown elements use Tailwind-styled components
4. **No Database**: Everything persists in localStorage
5. **Type Safety**: TypeScript strict mode, no `any` usage
6. **Performance First**: Debounced saves, efficient re-renders
7. **Accessibility**: ARIA labels, semantic HTML, WCAG AA contrast
8. **Component Composition**: Modular, reusable components

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x (Strict Mode)
- **Styling**: Tailwind CSS 4.x + @tailwindcss/typography
- **MDX**: next-mdx-remote/rsc (Server Components)
- **Markdown**: remark-gfm (GitHub Flavored Markdown)
- **State**: React useState + custom localStorage hook

## Success Criteria

✅ **SC-001**: New Markdown files render in browser within 5 seconds
✅ **SC-002**: Browser auto-refreshes within 2 seconds after file edit
✅ **SC-003**: FreeResponse answers persist with 100% reliability
✅ **SC-004**: Professional styling with WCAG AA contrast
✅ **SC-005**: Graceful error handling (missing files, invalid syntax, disabled storage)

## Development

### Build

```bash
npm run build
```

### Production

```bash
npm run start
```

### Type Checking

```bash
npm run lint
```

## Edge Cases Handled

- Missing files → Custom 404 page
- Invalid MDX syntax → Error page with details
- localStorage disabled → Warning banner displayed
- Duplicate FreeResponse IDs → Console warning
- Long code lines → Horizontal scrollbar
- Large files → Efficient streaming with Server Components

## License

ISC
