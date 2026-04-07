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
import { ChecklistReviewERC20 } from './ChecklistReviewERC20'
import { ChecklistUpgradedMarket } from './ChecklistUpgradedMarket'
import { QuizSmartContractBasics } from './QuizSmartContractBasics'
import { QuizGas } from './QuizGas'
import { QuizTokenStandards } from './QuizTokenStandards'
import { QuizAllowancePattern } from './QuizAllowancePattern'
import { QuizABI } from './QuizABI'
import { QuizTransactionFlow } from './QuizTransactionFlow'
import { QuizPariMutuel } from './QuizPariMutuel'
import { QuizOracleProblem } from './QuizOracleProblem'
import { QuizBlockExplorer } from './QuizBlockExplorer'
import { QuizTokenMentalModel } from './QuizTokenMentalModel'
import { QuizERCProcess } from './QuizERCProcess'
import { QuizMulticall } from './QuizMulticall'
import { QuizAsyncUX } from './QuizAsyncUX'
import { QuizBlockchainAsDB } from './QuizBlockchainAsDB'
import { QuizReadsVsWrites } from './QuizReadsVsWrites'
import { QuizGasMechanics } from './QuizGasMechanics'
import { QuizWalletSigning } from './QuizWalletSigning'
import { QuizOnchainErrors } from './QuizOnchainErrors'
import { GasFeeCalculator } from './GasFeeCalculator'
import { Icon } from './Icon'
import { QuipOracleProblem } from './QuipOracleProblem'
import { QuipPariMutuel } from './QuipPariMutuel'
import { QuipBlockExplorer } from './QuipBlockExplorer'
import { QuipTokenSpreadsheet } from './QuipTokenSpreadsheet'
import { QuipERCProcess } from './QuipERCProcess'
import { QuipProxyPattern } from './QuipProxyPattern'
import { QuipBlockchainAsDB } from './QuipBlockchainAsDB'
import { QuipMulticall } from './QuipMulticall'
import { QuipJSONRPC } from './QuipJSONRPC'
import { QuipAPIKeyTypes } from './QuipAPIKeyTypes'

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

function Details({ children, className, class: classAttr }: { children?: React.ReactNode; className?: string; class?: string }) {
  const cls = className ?? classAttr ?? ''
  const isSpoiler = cls.includes('spoiler')

  if (isSpoiler) {
    return createElement('details', {
      className: [
        'my-6 rounded-xl overflow-hidden group',
        'border border-amber-300/60 dark:border-amber-500/30',
        'border-l-4 !border-l-amber-400 dark:!border-l-amber-500',
        'bg-amber-50/50 dark:bg-amber-500/[0.06]',
        'shadow-sm',
      ].join(' '),
      'data-variant': 'spoiler',
    }, children)
  }

  return createElement('details', {
    className: [
      'my-6 rounded-xl overflow-hidden group',
      'border border-gray-200 dark:border-white/[0.14]',
      'border-l-4 !border-l-coinbase-blue dark:!border-l-coinbase-cyan',
      'bg-gray-50 dark:bg-white/[0.03]',
      'shadow-sm dark:shadow-lg dark:shadow-black/30',
    ].join(' '),
    'data-variant': 'section',
  }, children)
}

function Summary({ children }: { children?: React.ReactNode }) {
  return createElement('summary', {
    className: [
      'px-5 py-4',
      'cursor-pointer select-none list-none',
      'flex items-center gap-3',
      'transition-colors duration-150',
      '[&::-webkit-details-marker]:hidden',

      'group-data-[variant=section]:text-lg group-data-[variant=section]:font-semibold group-data-[variant=section]:tracking-tight',
      'group-data-[variant=section]:text-gray-900 dark:group-data-[variant=section]:text-white',
      'group-data-[variant=section]:bg-gradient-to-r group-data-[variant=section]:from-gray-100 group-data-[variant=section]:to-gray-50',
      'dark:group-data-[variant=section]:from-white/[0.08] dark:group-data-[variant=section]:to-white/[0.04]',
      'group-data-[variant=section]:hover:from-gray-200 group-data-[variant=section]:hover:to-gray-100',
      'dark:group-data-[variant=section]:hover:from-white/[0.14] dark:group-data-[variant=section]:hover:to-white/[0.08]',
      'group-open:group-data-[variant=section]:border-b group-open:group-data-[variant=section]:border-gray-200 dark:group-open:group-data-[variant=section]:border-white/[0.08]',

      'group-data-[variant=spoiler]:text-base group-data-[variant=spoiler]:font-semibold',
      'group-data-[variant=spoiler]:text-amber-700 dark:group-data-[variant=spoiler]:text-amber-400',
      'group-data-[variant=spoiler]:hover:text-amber-900 dark:group-data-[variant=spoiler]:hover:text-amber-300',
      'group-data-[variant=spoiler]:py-3 group-data-[variant=spoiler]:px-4',
    ].join(' ')
  },
    createElement('span', {
      className: [
        'shrink-0 text-xs transition-transform duration-200 group-open:rotate-90',

        'group-data-[variant=section]:flex group-data-[variant=section]:items-center group-data-[variant=section]:justify-center',
        'group-data-[variant=section]:w-7 group-data-[variant=section]:h-7 group-data-[variant=section]:rounded-lg',
        'group-data-[variant=section]:bg-coinbase-blue/15 dark:group-data-[variant=section]:bg-coinbase-blue/25',
        'group-data-[variant=section]:text-coinbase-blue dark:group-data-[variant=section]:text-coinbase-cyan',
        'group-data-[variant=section]:shadow-sm dark:group-data-[variant=section]:shadow-coinbase-blue/10',

        'group-data-[variant=spoiler]:text-amber-500 dark:group-data-[variant=spoiler]:text-amber-400',
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
  ChecklistReviewERC20,
  ChecklistUpgradedMarket,
  ChecklistWorkshopActivity,
  SuggestedAnswer,
  SubmissionBox,
  Reveal,
  FlavorText,
  AIPrompt,
  HumanStep,
  HybridStep,
  QuizSmartContractBasics,
  QuizGas,
  QuizTokenStandards,
  QuizAllowancePattern,
  QuizABI,
  QuizTransactionFlow,
  QuizPariMutuel,
  QuizOracleProblem,
  QuizBlockExplorer,
  QuizTokenMentalModel,
  QuizERCProcess,
  QuizMulticall,
  QuizAsyncUX,
  QuizBlockchainAsDB,
  QuizReadsVsWrites,
  QuizGasMechanics,
  QuizWalletSigning,
  QuizOnchainErrors,
  GasFeeCalculator,
  Icon,
  QuipOracleProblem,
  QuipPariMutuel,
  QuipBlockExplorer,
  QuipTokenSpreadsheet,
  QuipERCProcess,
  QuipProxyPattern,
  QuipBlockchainAsDB,
  QuipMulticall,
  QuipJSONRPC,
  QuipAPIKeyTypes,
}
