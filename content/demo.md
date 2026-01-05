---
title: Demo Codelab
description: A sample codelab demonstrating all Markdown features
duration: 15
author: MDX Codelab Viewer
tags: [demo, tutorial]
---

# Welcome to the Demo Codelab

This is a demonstration of the MDX Codelab Viewer with all supported Markdown elements.

## Headings

You can use headings from H1 to H6 to structure your content.

### This is an H3 Heading

#### This is an H4 Heading

##### This is an H5 Heading

###### This is an H6 Heading

## Paragraphs

Regular paragraphs are automatically styled with proper spacing and line height. This makes your content easy to read and professionally formatted.

Multiple paragraphs are separated by blank lines, creating a clean reading experience.

## Lists

### Unordered Lists

- First item in the list
- Second item with more content
- Third item
  - Nested item 1
  - Nested item 2
- Fourth item

### Ordered Lists

1. First step
2. Second step
3. Third step
   1. Nested step A
   2. Nested step B
4. Fourth step

## Code

You can include `inline code` using backticks.

### Code Blocks

```javascript
// JavaScript code block example
function greet(name) {
  console.log(`Hello, ${name}!`)
  return true
}

const result = greet('World')
```

```typescript
// TypeScript code block example
interface User {
  id: number
  name: string
  email: string
}

function createUser(name: string, email: string): User {
  return {
    id: Math.random(),
    name,
    email,
  }
}
```

### Long Lines

Code blocks handle long lines with horizontal scrolling:

```bash
npm install next@latest react@latest react-dom@latest typescript @types/react @types/node @types/react-dom tailwindcss postcss autoprefixer
```

## Blockquotes

> This is a blockquote. It's great for highlighting important information or including quotes from other sources.
>
> Blockquotes can span multiple paragraphs and are styled with a left border and italic text.

## Combining Elements

You can combine different elements:

1. Start with an ordered list
2. Include some `inline code`
3. Add a code block:

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

4. And finish with more content

> **Tip:** This codelab supports hot reload. Try editing this file and watch the browser update automatically!

## Interactive Components

The codelab viewer supports interactive components that persist your responses across sessions using localStorage.

### Question 1: What did you learn?

<FreeResponse id="q1" placeholder="Share your key takeaways from this codelab..." />

### Question 2: What would you like to explore next?

<FreeResponse id="q2" placeholder="Tell us what topics interest you..." />

### Question 3: Additional feedback

<FreeResponse id="q3" placeholder="Any other comments or suggestions?" />

## What's Next?

This codelab viewer supports:

- ✅ All standard Markdown elements
- ✅ GitHub Flavored Markdown (via remark-gfm)
- ✅ Professional Tailwind CSS styling
- ✅ Hot reload for instant updates
- ✅ Custom MDX components with localStorage persistence
- ✅ Auto-resize textareas
- ✅ Per-codelab response isolation

Explore the code to see how it all works together!
