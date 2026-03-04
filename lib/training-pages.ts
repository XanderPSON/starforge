export interface TrainingPage {
  pageIndex: number
  heading: string
  source: string
  requiredIds: string[]
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
    })

    pageIndex++
  }

  return pages
}

export function getPageHeadings(pages: TrainingPage[]): string[] {
  return pages.map((p) => p.heading)
}
