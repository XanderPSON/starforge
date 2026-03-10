import type { MDXComponents } from 'mdx/types'
import { H1, H2, H3, H4, H5, H6 } from './Heading'
import { Paragraph } from './Paragraph'
import { UnorderedList, OrderedList, ListItem } from './List'
import { Code, Pre } from './CodeBlock'
import { Blockquote } from './Blockquote'
import { Link } from './Link'
import { Table, THead, TBody, TR, TH, TD } from './Table'
import { FreeResponse } from './FreeResponse'
import { MultipleChoice } from './MultipleChoice'
import { TemperatureCheck } from './TemperatureCheck'
import { Scale } from './Scale'
import { Checklist } from './Checklist'
import { QuizMath, QuizPlanet } from './QuizDemo'
import { ChecklistDemo } from './ChecklistDemo'
import { ChecklistSetup } from './ChecklistSetup'
import { ChecklistWorkshopActivity } from './ChecklistWorkshopActivity'
import { SuggestedAnswer } from './SuggestedAnswer'
import { SubmissionBox } from './SubmissionBox'
import { Reveal } from './Reveal'
import { FlavorText } from './FlavorText'
import { AIPrompt } from './AIPrompt'
import { HumanStep } from './HumanStep'
import { HybridStep } from './HybridStep'

import { createElement } from 'react'

function HorizontalRule() {
  return createElement('hr', { className: 'my-10 border-t border-gray-200 dark:border-gray-700/50' })
}

export const mdxComponents: MDXComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  p: Paragraph,
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  code: Code,
  pre: Pre,
  blockquote: Blockquote,
  a: Link,
  table: Table,
  thead: THead,
  tbody: TBody,
  tr: TR,
  th: TH,
  td: TD,
  hr: HorizontalRule,
  FreeResponse,
  MultipleChoice,
  TemperatureCheck,
  Scale,
  Checklist,
  QuizMath,
  QuizPlanet,
  ChecklistDemo,
  ChecklistSetup,
  ChecklistWorkshopActivity,
  SuggestedAnswer,
  SubmissionBox,
  Reveal,
  FlavorText,
  AIPrompt,
  HumanStep,
  HybridStep,
}
