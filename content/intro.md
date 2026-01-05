---
title: Introduction to Codelabs
description: Learn the basics of using the MDX Codelab Viewer
duration: 10
---

# Introduction to Codelabs

Welcome to the MDX Codelab Viewer! This is a separate codelab to demonstrate per-codelab response isolation.

## What are Codelabs?

Codelabs are interactive, self-paced tutorials that guide you through a specific topic or technology. They combine:

- Clear, step-by-step instructions
- Code examples and explanations
- Interactive elements for engagement
- Persistent state across sessions

## Your Learning Journey

### Checkpoint 1: Understanding the Basics

What do you already know about Markdown?

<FreeResponse id="q1" placeholder="Share your Markdown experience..." />

### Checkpoint 2: Goals and Expectations

What do you hope to achieve with this codelab viewer?

<FreeResponse id="q2" placeholder="Describe your goals..." />

### Checkpoint 3: Next Steps

Which topics would you like to learn about next?

<FreeResponse id="q3" placeholder="List topics that interest you..." />

## Key Features

- **Local-First**: All content is stored locally on your machine
- **Privacy**: Your responses are saved only in your browser's localStorage
- **Isolation**: Each codelab maintains its own separate responses
- **Auto-Save**: Responses are automatically saved as you type (with 500ms debounce)

> **Note:** These FreeResponse components use the same IDs (q1, q2, q3) as the demo codelab, but they maintain separate storage thanks to per-codelab isolation!

## Continue Exploring

Check out the demo codelab at `/codelab/demo` to see more advanced examples and features.
