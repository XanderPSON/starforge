import { slugify } from './utils'

export interface SidebarHeading {
  text: string
  level: number
  id: string
  children: SidebarHeading[]
}

export interface TrainingPageHeading {
  text: string
  subHeadings: SidebarHeading[]
}

export interface TrainingPage {
  pageIndex: number
  heading: string
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

  // Split on H1 headings (lines starting with "# " — not "## ")
  const parts = content.split(/(?=^# )/m)

  const pages: TrainingPage[] = []
  let pageIndex = 0

  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue

    // Skip any content before the first H1
    if (!trimmed.startsWith('# ')) continue

    // Extract H1 heading text
    const headingMatch = trimmed.match(/^# (.+)$/m)
    const heading = headingMatch ? headingMatch[1]!.trim() : `Page ${pageIndex + 1}`

    // Prepend frontmatter so compileMDX has access to it
    const source = frontmatter ? `${frontmatter}\n\n${part}` : part

    pages.push({
      pageIndex,
      heading,
      source,
      requiredIds: extractRequiredIds(source),
      subHeadings: extractPageSubHeadings(part),
    })

    pageIndex++
  }

  return pages
}

export function getPageHeadings(pages: TrainingPage[]): TrainingPageHeading[] {
  return pages.map((p) => ({
    text: p.heading,
    subHeadings: p.subHeadings
  }))
}
