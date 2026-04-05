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
import { ChecklistSetupEnv } from './ChecklistSetupEnv'
import { ChecklistWorkshopActivity } from './ChecklistWorkshopActivity'
import { SuggestedAnswer } from './SuggestedAnswer'
import { SubmissionBox } from './SubmissionBox'
import { Reveal } from './Reveal'
import { FlavorText } from './FlavorText'
import { AIPrompt } from './AIPrompt'
import { HumanStep } from './HumanStep'
import { HybridStep } from './HybridStep'
import { ChecklistReviewContract } from './ChecklistReviewContract'
import { QuizSmartContractBasics } from './QuizSmartContractBasics'
import { QuizCEIPattern } from './QuizCEIPattern'
import { QuizGas } from './QuizGas'
import { QuizTokenStandards } from './QuizTokenStandards'
import { QuizAllowancePattern } from './QuizAllowancePattern'
import { QuizABI } from './QuizABI'
import { QuizTransactionFlow } from './QuizTransactionFlow'
import { GasFeeCalculator } from './GasFeeCalculator'

import { createElement } from 'react'

function HorizontalRule() {
  return createElement('hr', { className: 'my-10 border-t border-gray-200 dark:border-gray-700/50' })
}

const ACTION_COLORS: Record<string, string> = {
  'CLICK':    'dark:text-gray-400',     // 🖱️ pointer — subtle UI action
  'CALL':     'dark:text-violet-400',   // ⚙️ gear — invoke a function
  'CONSIDER': 'dark:text-yellow-300',   // 🧠 brain — think/reason
  'FIND':     'dark:text-emerald-400',  // 🔎 magnifying glass — search/inspect
  'ACT':      'dark:text-orange-400',   // ✍️ writing hand — submit/do
  'CHECK':    'dark:text-green-400',    // ✅ checkmark — verify
  'LOCATE':   'dark:text-cyan-400',     // 🧭 compass — navigate
}

function Details({ children }: { children?: React.ReactNode }) {
  return createElement('details', {
    className: [
      'my-6 rounded-xl overflow-hidden',
      'border border-gray-200 dark:border-white/10',
      'bg-gray-50 dark:bg-white/[0.04]',
      'group/details',
      'shadow-sm dark:shadow-md dark:shadow-black/20',
    ].join(' ')
  }, children)
}

function Summary({ children }: { children?: React.ReactNode }) {
  return createElement('summary', {
    className: [
      'px-5 py-4',
      'text-lg font-semibold text-gray-900 dark:text-gray-100',
      'cursor-pointer select-none list-none',
      'flex items-center gap-3',
      'bg-gray-100/80 dark:bg-white/[0.06]',
      'hover:bg-gray-200/80 dark:hover:bg-white/[0.10]',
      'transition-colors duration-150',
      '[&::-webkit-details-marker]:hidden',
      'group-open/details:border-b group-open/details:border-gray-200 group-open/details:dark:border-white/10',
    ].join(' ')
  },
    createElement('span', {
      className: [
        'flex items-center justify-center w-6 h-6 rounded-md shrink-0',
        'bg-coinbase-blue/10 dark:bg-coinbase-blue/20',
        'text-coinbase-blue dark:text-coinbase-cyan',
        'transition-transform duration-200 group-open/details:rotate-90',
        'text-xs',
      ].join(' ')
    }, '▶'),
    children
  )
}

function Strong({ children }: { children?: React.ReactNode }) {
  const text = typeof children === 'string' ? children : ''
  const match = text.match(/^.{0,3}(CLICK|CALL|CONSIDER|FIND|ACT|CHECK|LOCATE):/)
  const color = match?.[1] ? ACTION_COLORS[match[1]] : 'dark:text-gray-200'
  return createElement('strong', { className: `font-bold text-gray-900 ${color}` }, children)
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
  strong: Strong,
  details: Details,
  summary: Summary,
  FreeResponse,
  MultipleChoice,
  TemperatureCheck,
  Scale,
  Checklist,
  QuizMath,
  QuizPlanet,
  ChecklistDemo,
  ChecklistSetup,
  ChecklistSetupEnv,
  ChecklistReviewContract,
  ChecklistWorkshopActivity,
  SuggestedAnswer,
  SubmissionBox,
  Reveal,
  FlavorText,
  AIPrompt,
  HumanStep,
  HybridStep,
  QuizSmartContractBasics,
  QuizCEIPattern,
  QuizGas,
  QuizTokenStandards,
  QuizAllowancePattern,
  QuizABI,
  QuizTransactionFlow,
  GasFeeCalculator,
}
