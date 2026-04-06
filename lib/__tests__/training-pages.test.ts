import { describe, expect, it } from 'vitest'
import { readFile, readdir } from 'fs/promises'
import path from 'path'
import {
  splitIntoPages,
  extractRequiredIds,
  extractAllComponentIds,
  extractPageSubHeadings,
  getSidebarGroups,
  getPageHeadings,
} from '@/lib/training-pages'

// ─── Unit tests: extractRequiredIds ──────────────────────────────────────────

describe('extractRequiredIds', () => {
  it('extracts FreeResponse ids', () => {
    const source = '<FreeResponse id="q1" label="test" />\n<FreeResponse id="q2" />'
    expect(extractRequiredIds(source)).toEqual(['q1', 'q2'])
  })

  it('extracts SubmissionBox ids', () => {
    const source = '<SubmissionBox id="sub-1" />'
    expect(extractRequiredIds(source)).toEqual(['sub-1'])
  })

  it('ignores non-gating components', () => {
    const source = '<Scale id="s1" />\n<FlavorText id="f1" />\n<QuizGas id="qg" />'
    expect(extractRequiredIds(source)).toEqual([])
  })

  it('returns empty for no matches', () => {
    expect(extractRequiredIds('# Hello\nSome text')).toEqual([])
  })
})

// ─── Unit tests: extractAllComponentIds ──────────────────────────────────────

describe('extractAllComponentIds', () => {
  it('extracts ids from all JSX components', () => {
    const source = [
      '<FreeResponse id="q1" />',
      '<Scale id="s1" max={5} />',
      '<QuizGas id="quiz-gas" />',
      '<FlavorText id="ft-1" emoji="🎉" text="Done" />',
    ].join('\n')

    const ids = extractAllComponentIds(source)
    expect(ids).toHaveLength(4)
    expect(ids.map((r) => r.id)).toEqual(['q1', 's1', 'quiz-gas', 'ft-1'])
  })

  it('returns component name and line number', () => {
    const source = 'some text\n<QuizPariMutuel id="pm-1" />\nmore text'
    const ids = extractAllComponentIds(source)
    expect(ids).toEqual([{ id: 'pm-1', component: 'QuizPariMutuel', line: 2 }])
  })

  it('ignores lowercase html elements', () => {
    const source = '<div id="root" />\n<span id="test" />'
    expect(extractAllComponentIds(source)).toEqual([])
  })

  it('detects duplicates when present', () => {
    const source = '<QuizA id="same" />\n<QuipA id="same" />'
    const ids = extractAllComponentIds(source)
    expect(ids).toHaveLength(2)
    const dupes = ids.filter((r) => r.id === 'same')
    expect(dupes).toHaveLength(2)
    expect(dupes[0]!.component).toBe('QuizA')
    expect(dupes[1]!.component).toBe('QuipA')
  })
})

// ─── Unit tests: splitIntoPages ──────────────────────────────────────────────

describe('splitIntoPages', () => {
  it('splits on H1 headings', () => {
    const source = '# Page One\ncontent 1\n# Page Two\ncontent 2'
    const pages = splitIntoPages(source)
    expect(pages).toHaveLength(2)
    expect(pages[0]!.heading).toBe('Page One')
    expect(pages[1]!.heading).toBe('Page Two')
  })

  it('strips duration from heading text', () => {
    const source = '# Getting Started (15 min)\nsetup stuff'
    const pages = splitIntoPages(source)
    expect(pages[0]!.heading).toBe('Getting Started')
  })

  it('preserves frontmatter in each page source', () => {
    const source = '---\ntitle: Test\n---\n# Page 1\nfoo\n# Page 2\nbar'
    const pages = splitIntoPages(source)
    expect(pages[0]!.source).toContain('---\ntitle: Test\n---')
    expect(pages[1]!.source).toContain('---\ntitle: Test\n---')
  })

  it('does not split on # inside fenced code blocks', () => {
    const source = [
      '# Real Page',
      '```solidity',
      '# This is a comment not a heading',
      '```',
      'still page 1',
    ].join('\n')
    const pages = splitIntoPages(source)
    expect(pages).toHaveLength(1)
    expect(pages[0]!.heading).toBe('Real Page')
  })

  it('handles group comments', () => {
    const source = '<!-- group: Setup -->\n# Step 1\ncontent\n# Step 2\nmore'
    const pages = splitIntoPages(source)
    expect(pages[0]!.group).toBe('Setup')
  })

  it('extracts requiredIds per page', () => {
    const source = '# Page 1\n<FreeResponse id="p1-q1" />\n# Page 2\n<FreeResponse id="p2-q1" />'
    const pages = splitIntoPages(source)
    expect(pages[0]!.requiredIds).toEqual(['p1-q1'])
    expect(pages[1]!.requiredIds).toEqual(['p2-q1'])
  })
})

// ─── Unit tests: extractPageSubHeadings ──────────────────────────────────────

describe('extractPageSubHeadings', () => {
  it('extracts H2 and H3 headings', () => {
    const source = '## Section A\n### Subsection A1\n## Section B'
    const headings = extractPageSubHeadings(source)
    expect(headings).toHaveLength(2)
    expect(headings[0]!.text).toBe('Section A')
    expect(headings[0]!.children).toHaveLength(1)
    expect(headings[0]!.children[0]!.text).toBe('Subsection A1')
    expect(headings[1]!.text).toBe('Section B')
  })

  it('returns empty array for no headings', () => {
    expect(extractPageSubHeadings('just text')).toEqual([])
  })
})

// ─── Unit tests: getSidebarGroups ────────────────────────────────────────────

describe('getSidebarGroups', () => {
  it('groups pages by label', () => {
    const headings = getPageHeadings([
      { pageIndex: 0, heading: 'Intro', group: 'Setup', source: '', requiredIds: [], subHeadings: [] },
      { pageIndex: 1, heading: 'Config', group: 'Setup', source: '', requiredIds: [], subHeadings: [] },
      { pageIndex: 2, heading: 'Build', group: null, source: '', requiredIds: [], subHeadings: [] },
    ])
    const groups = getSidebarGroups(headings)
    expect(groups).toHaveLength(2)
    expect(groups[0]!.label).toBe('Setup')
    expect(groups[0]!.pages).toHaveLength(2)
    expect(groups[1]!.label).toBeNull()
  })
})

// ─── Curriculum validation: catches the bug that shipped ─────────────────────

const CURRICULUM_DIR = path.join(process.cwd(), 'neo', 'workshop-curriculum')

describe('curriculum content validation', () => {
  it('has no duplicate component IDs within any single training file', async () => {
    const files = await readdir(CURRICULUM_DIR)
    const mdFiles = files.filter((f) => f.endsWith('.md') && f.toLowerCase() !== 'readme.md')
    const violations: string[] = []

    for (const file of mdFiles) {
      const source = await readFile(path.join(CURRICULUM_DIR, file), 'utf-8')
      const ids = extractAllComponentIds(source)
      const seen = new Map<string, { component: string; line: number }>()

      for (const entry of ids) {
        const existing = seen.get(entry.id)
        if (existing) {
          violations.push(
            `${file}: duplicate id="${entry.id}" — ` +
            `<${existing.component}> on line ${existing.line} and ` +
            `<${entry.component}> on line ${entry.line}`
          )
        }
        seen.set(entry.id, entry)
      }
    }

    expect(violations).toEqual([])
  })

  it('has no duplicate component IDs across all training files', async () => {
    const files = await readdir(CURRICULUM_DIR)
    const mdFiles = files.filter((f) => f.endsWith('.md') && f.toLowerCase() !== 'readme.md')
    const globalIds = new Map<string, string>()
    const violations: string[] = []

    for (const file of mdFiles) {
      const source = await readFile(path.join(CURRICULUM_DIR, file), 'utf-8')
      const ids = extractAllComponentIds(source)

      for (const entry of ids) {
        const existingFile = globalIds.get(entry.id)
        if (existingFile && existingFile !== file) {
          violations.push(
            `id="${entry.id}" used in both ${existingFile} and ${file}`
          )
        }
        globalIds.set(entry.id, file)
      }
    }

    expect(violations).toEqual([])
  })

  it('every training file can be split into pages without error', async () => {
    const files = await readdir(CURRICULUM_DIR)
    const mdFiles = files.filter((f) => f.endsWith('.md') && f.toLowerCase() !== 'readme.md')

    for (const file of mdFiles) {
      const source = await readFile(path.join(CURRICULUM_DIR, file), 'utf-8')
      const pages = splitIntoPages(source)
      expect(pages.length).toBeGreaterThan(0)

      for (const page of pages) {
        expect(page.heading).toBeTruthy()
        expect(page.source).toBeTruthy()
      }
    }
  })
})
