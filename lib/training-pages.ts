import { slugify } from './utils'

export interface SidebarHeading {
  text: string
  level: number
  id: string
  children: SidebarHeading[]
}

export interface TrainingPageHeading {
  text: string
  group: string | null
  subHeadings: SidebarHeading[]
}

/** A group of pages in the sidebar. Pages without a group get their own single-item group. */
export interface SidebarGroup {
  label: string | null
  pages: { text: string; pageIndex: number }[]
}

export interface TrainingPage {
  pageIndex: number
  heading: string
  group: string | null
  source: string
  requiredIds: string[]
  subHeadings: SidebarHeading[]
}

/**
 * Extract raw IDs from FreeResponse and SubmissionBox components in MDX source.
 * These are the components whose completion gates the Next button.
 */
export function extractRequiredIds(pageSource: string): string[] {
  const ids: string[] = []
  const regex = /<(?:FreeResponse|SubmissionBox)\s+[^>]*?id=["']([^"']+)["'][^>]*?\/?>/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(pageSource)) !== null) {
    ids.push(match[1]!)
  }
  return ids
}

/**
 * Extract H2, H3, H4 headings from page source and build a tree.
 */
export function extractPageSubHeadings(pageSource: string): SidebarHeading[] {
  const headings: SidebarHeading[] = []
  // Match lines starting with ##, ###, or #### followed by space and text
  const regex = /^(#{2,4})\s+(.+)$/gm
  let match: RegExpExecArray | null
  
  while ((match = regex.exec(pageSource)) !== null) {
    const level = match[1]!.length
    const text = match[2]!.trim()
    const id = slugify(text)
    
    headings.push({ text, level, id, children: [] })
  }

  // Build tree
  const root: SidebarHeading[] = []
  const stack: SidebarHeading[] = []

  for (const heading of headings) {
    while (stack.length > 0 && stack[stack.length - 1]!.level >= heading.level) {
      stack.pop()
    }
    
    if (stack.length === 0) {
      root.push(heading)
    } else {
      stack[stack.length - 1]!.children.push(heading)
    }
    stack.push(heading)
  }

  return root
}

/**
 * Extract a group name from an HTML comment like <!-- group: Setup -->
 * that appears in the content before the H1 heading.
 */
function extractGroupFromContent(content: string): string | null {
  const match = content.match(/<!--\s*group:\s*(.+?)\s*-->/)
  return match ? match[1]!.trim() : null
}

/**
 * Split raw MDX source into pages, one per H1 heading.
 * Frontmatter is prepended to each page so compileMDX can parse it.
 */
export function splitIntoPages(rawSource: string): TrainingPage[] {
  // Extract frontmatter block
  const frontmatterMatch = rawSource.match(/^---\n[\s\S]*?\n---/)
  const frontmatter = frontmatterMatch ? frontmatterMatch[0] : ''

  // Remove frontmatter from content
  const content = frontmatterMatch
    ? rawSource.slice(frontmatterMatch[0].length).trimStart()
    : rawSource

  // Split on H1 headings outside fenced code blocks.
  // Replace each character in fenced blocks with a space so `# ` inside them
  // isn't detected as H1, while preserving string length for index alignment.
  const masked = content.replace(/^```[\s\S]*?^```/gm, (m) => m.replace(/[^\n]/g, ' '))
  const splitIndices: number[] = []
  const h1Re = /^# /gm
  let h1Match: RegExpExecArray | null
  while ((h1Match = h1Re.exec(masked)) !== null) {
    splitIndices.push(h1Match.index)
  }

  const parts: string[] = []
  if (splitIndices.length === 0) {
    parts.push(content)
  } else {
    if (splitIndices[0]! > 0) parts.push(content.slice(0, splitIndices[0]!))
    for (let si = 0; si < splitIndices.length; si++) {
      const start = splitIndices[si]!
      const end = si + 1 < splitIndices.length ? splitIndices[si + 1]! : content.length
      parts.push(content.slice(start, end))
    }
  }

  const pages: TrainingPage[] = []
  let pageIndex = 0
  // Track content between pages (where group comments live)
  let precedingContent = ''

  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue

    // Content before the first H1 (or between pages) may contain group comments
    if (!trimmed.startsWith('# ')) {
      precedingContent = trimmed
      continue
    }

    // Check for group comment in the part itself (comment is on the line before `# `)
    // or in preceding content between the `---` separator and the H1
    const group = extractGroupFromContent(part) ?? extractGroupFromContent(precedingContent)

    // Extract H1 heading text (strip duration suffix so sidebar stays clean)
    const headingMatch = trimmed.match(/^# (.+)$/m)
    const rawHeading = headingMatch ? headingMatch[1]!.trim() : `Page ${pageIndex + 1}`
    const heading = rawHeading.replace(/\s*\(\d+\s*min\)\s*$/, '')

    // Strip group comment from the page source before compiling MDX
    const cleanedPart = part.replace(/<!--\s*group:\s*.+?\s*-->\n?/, '')

    // Prepend frontmatter so compileMDX has access to it
    const source = frontmatter ? `${frontmatter}\n\n${cleanedPart}` : cleanedPart

    pages.push({
      pageIndex,
      heading,
      group,
      source,
      requiredIds: extractRequiredIds(source),
      subHeadings: extractPageSubHeadings(cleanedPart),
    })

    precedingContent = ''
    pageIndex++
  }

  return pages
}

export function getPageHeadings(pages: TrainingPage[]): TrainingPageHeading[] {
  return pages.map((p) => ({
    text: p.heading,
    group: p.group,
    subHeadings: p.subHeadings,
  }))
}

/** Build grouped sidebar structure from page headings. */
export function getSidebarGroups(headings: TrainingPageHeading[]): SidebarGroup[] {
  const groups: SidebarGroup[] = []

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i]!
    const groupLabel = heading.group

    // Find or create the group
    if (groupLabel) {
      const existing = groups.find((g) => g.label === groupLabel)
      if (existing) {
        existing.pages.push({ text: heading.text, pageIndex: i })
      } else {
        groups.push({
          label: groupLabel,
          pages: [{ text: heading.text, pageIndex: i }],
        })
      }
    } else {
      // Ungrouped page gets its own entry
      groups.push({
        label: null,
        pages: [{ text: heading.text, pageIndex: i }],
      })
    }
  }

  return groups
}
