# MDX Codelab Viewer Documentation

Welcome to the documentation for the MDX Codelab Viewer with Interactive Components!

## 📚 Documentation Index

### For Content Authors
- **[Interactive Components Guide](./INTERACTIVE-COMPONENTS.md)** - Complete guide to using all 5 interactive components in your codelabs

### For Developers
- **[Interactive Components API](./INTERACTIVE-COMPONENTS.md)** - Full API reference, props, TypeScript interfaces, and technical details

## 🚀 Quick Links

- **Live Demo**: Visit `/codelab/components-demo` to see all components in action
- **Source Code**: Component implementations in `/components/mdx/`
- **Core Hook**: State management hook in `/lib/storage.ts`

## 📦 What's Included

### Interactive Components
1. **FreeResponse** - Auto-saving textarea for open-ended questions
2. **MultipleChoice** - Self-assessment quizzes with instant feedback
3. **TemperatureCheck** - Emoji-based sentiment feedback
4. **Scale** - Numeric rating with volume-bar effect
5. **Checklist** - Task tracking with progress counter

### Key Features
- ✅ Automatic localStorage persistence (500ms debounce)
- ✅ Cross-tab real-time synchronization
- ✅ Client-only hydration (no SSR mismatches)
- ✅ 50KB size limit per component
- ✅ WCAG 2.1 AA accessibility compliant
- ✅ Coinbase interstellar design theme
- ✅ Graceful error handling

## 🎯 Getting Started

### Creating Your First Interactive Codelab

1. **Create a new MDX file** in `/content/`:
   ```bash
   touch content/my-codelab.md
   ```

2. **Add frontmatter and content**:
   ```mdx
   ---
   title: My Interactive Codelab
   description: Learn with hands-on exercises
   duration: 10
   ---

   # My Interactive Codelab

   Let's practice what we learned!

   <FreeResponse
     id="reflection"
     label="What's the most important concept?"
   />
   ```

3. **View your codelab**:
   ```
   http://localhost:3000/codelab/my-codelab
   ```

That's it! The component will auto-save responses and persist across page reloads.

## 📖 Documentation Structure

### INTERACTIVE-COMPONENTS.md
Complete guide covering:
- Component API reference (all props with TypeScript types)
- Usage examples (MDX and TSX)
- MDX limitations and workarounds
- Storage pattern and error handling
- Accessibility features (keyboard navigation, ARIA labels)
- Performance optimization (debouncing, bundle size)
- Cross-tab synchronization
- Best practices and troubleshooting

## 🛠️ Technical Architecture

### Component Structure
```
components/
├── mdx/                          # All MDX components
│   ├── FreeResponse.tsx          # Text input component
│   ├── MultipleChoice.tsx        # Quiz component
│   ├── TemperatureCheck.tsx      # Emoji sentiment
│   ├── Scale.tsx                 # Rating component
│   ├── Checklist.tsx             # Task tracking
│   ├── QuizDemo.tsx              # Example wrappers
│   ├── ChecklistDemo.tsx         # Example wrappers
│   └── mdx-components.ts         # Component registry
└── ComponentRegistryProvider.tsx # Duplicate ID detection

lib/
├── storage.ts                    # useInteractive hook
└── mdx.ts                        # MDX compilation

content/
└── components-demo.md            # Live demo page
```

### State Management Flow
```
User Input → Component → useInteractive Hook → Debounce (500ms) → localStorage
                                    ↓
                            storage event listener
                                    ↓
                          Other Tabs (sync instantly)
```

## 🔍 Common Tasks

### Add a New Quiz Question
```tsx
// components/mdx/QuizMyTopic.tsx
'use client'
import { MultipleChoice } from './MultipleChoice'

export function QuizMyTopic({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="Your question here?"
      options={["Option A", "Option B", "Option C", "Option D"]}
      correctAnswer="Option B"
    />
  )
}
```

Register in `mdx-components.ts`:
```tsx
import { QuizMyTopic } from './QuizMyTopic'

export const mdxComponents: MDXComponents = {
  // ... existing
  QuizMyTopic,
}
```

Use in MDX:
```mdx
<QuizMyTopic id="quiz-1" />
```

### Clear Component State
```javascript
// Clear single component
localStorage.removeItem('codelab:my-slug:component-id')

// Clear entire codelab
Object.keys(localStorage)
  .filter(key => key.startsWith('codelab:my-slug:'))
  .forEach(key => localStorage.removeItem(key))
```

### Debug Component State
```javascript
// View all stored states
Object.keys(localStorage)
  .filter(key => key.startsWith('codelab:'))
  .forEach(key => {
    console.log(key, JSON.parse(localStorage.getItem(key)))
  })
```

## 🐛 Troubleshooting

### Component not appearing?
1. Check it's registered in `components/mdx/mdx-components.ts`
2. Verify the dev server is running (`npm run dev`)
3. Check browser console for errors

### State not persisting?
1. Check localStorage is enabled (not in private browsing)
2. Verify unique `id` prop is provided
3. Check browser console for quota warnings

### MDX compilation error?
1. Avoid `<` characters in text (use "less than" instead)
2. Don't use JavaScript arrays in props (create wrapper components)
3. Check all JSX tags are properly closed

## 📞 Support

- **Documentation**: See [INTERACTIVE-COMPONENTS.md](./INTERACTIVE-COMPONENTS.md)
- **Live Demo**: Visit `/codelab/components-demo`
- **Source Code**: Check `/components/mdx/` for implementations
- **Issues**: Check browser console for error messages

## 🎨 Design System

All components use the **Coinbase Interstellar** design theme:
- Glass effect backgrounds: `bg-white/5 backdrop-blur-sm`
- Blue accents: `border-blue-500/30 text-blue-400`
- Gradient text: `bg-gradient-to-r from-white via-blue-100 to-cyan-200`
- Hover states: `hover:bg-white/10 transition-colors`
- Focus rings: `focus:ring-2 focus:ring-blue-500/50`

## 🚀 What's Next?

- Explore all components at `/codelab/components-demo`
- Read the full documentation in [INTERACTIVE-COMPONENTS.md](./INTERACTIVE-COMPONENTS.md)
- Create your first interactive codelab!

---

**Version**: 1.0.0
**Last Updated**: 2026-01-06
