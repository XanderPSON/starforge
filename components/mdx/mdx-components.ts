import type { MDXComponents } from 'mdx/types'
import { H1, H2, H3, H4, H5, H6 } from './Heading'
import { Paragraph } from './Paragraph'
import { UnorderedList, OrderedList, ListItem } from './List'
import { Code, Pre } from './CodeBlock'
import { Blockquote } from './Blockquote'
import { FreeResponse } from './FreeResponse'
import { MultipleChoice } from './MultipleChoice'
import { TemperatureCheck } from './TemperatureCheck'
import { Scale } from './Scale'
import { Checklist } from './Checklist'
import { QuizMath, QuizPlanet } from './QuizDemo'
import { ChecklistDemo } from './ChecklistDemo'
import { SuggestedAnswer } from './SuggestedAnswer'
import { SubmissionBox } from './SubmissionBox'

import { createElement } from 'react'

function HorizontalRule() {
  return createElement('hr', { className: 'my-12 border-t border-coinbase-blue/30' })
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
  hr: HorizontalRule,
  FreeResponse,
  MultipleChoice,
  TemperatureCheck,
  Scale,
  Checklist,
  QuizMath,
  QuizPlanet,
  ChecklistDemo,
  SuggestedAnswer,
  SubmissionBox,
}
