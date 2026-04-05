import { compileMDX } from 'next-mdx-remote/rsc'
import { readFile, readdir } from 'fs/promises'
import path from 'path'
import remarkGfm from 'remark-gfm'
import { remarkGithubAlerts } from './remark-github-alerts'
import { remarkRewriteAssets } from './remark-rewrite-assets'
import { mdxComponents } from '@/components/mdx/mdx-components'
import { listTrainingDirectories, fetchTrainingMarkdown } from '@/lib/github'
import { isNeoEnabled } from '@/lib/features'
import { splitIntoPages, getPageHeadings, getSidebarGroups, type TrainingPageHeading, type SidebarGroup } from '@/lib/training-pages'

const NEO_CONTENT_DIR = path.join(process.cwd(), 'neo', 'workshop-curriculum')

export interface TrainingFrontmatter {
  title?: string
  description?: string
  duration?: number
  author?: string
  tags?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

// Alias for backward compatibility
export type CodelabFrontmatter = TrainingFrontmatter

async function compileMdxSource(source: string) {
  return compileMDX<TrainingFrontmatter>({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkGithubAlerts, remarkRewriteAssets],
      },
    },
  })
}

function parseFrontmatterFromSource(source: string): TrainingFrontmatter {
  const frontmatter: TrainingFrontmatter = {}
  const frontmatterMatch = source.match(/^---\n([\s\S]*?)\n---/)

  if (frontmatterMatch) {
    const raw = frontmatterMatch[1] ?? ''
    for (const line of raw.split('\n')) {
      const colonIdx = line.indexOf(':')
      if (colonIdx === -1) continue
      const k = line.slice(0, colonIdx).trim()
      const value = line.slice(colonIdx + 1).trim()
      if (k === 'title') frontmatter.title = value
      if (k === 'description') frontmatter.description = value
      if (k === 'duration') frontmatter.duration = parseInt(value, 10)
      if (k === 'author') frontmatter.author = value
      if (k === 'difficulty' && ['beginner', 'intermediate', 'advanced'].includes(value)) {
        frontmatter.difficulty = value as TrainingFrontmatter['difficulty']
      }
      if (k === 'tags') {
        const tagMatch = value.match(/\[(.*)\]/)
        frontmatter.tags = tagMatch ? tagMatch[1]!.split(',').map((t) => t.trim()) : []
      }
    }
  }

  if (!frontmatter.title) {
    const h1Match = source.match(/^# (.+)$/m)
    if (h1Match) {
      frontmatter.title = h1Match[1]!.trim()
    }
  }

  return frontmatter
}

// ─── Training functions (GitHub → local dir structure → legacy flat files) ────

export async function getTraining(slug: string) {
  let source: string | null = null

  if (isNeoEnabled()) {
    const filePath = path.join(NEO_CONTENT_DIR, `${slug}.md`)
    source = await readFile(filePath, 'utf-8')
  } else if (process.env.TRAINING_REPO_URL) {
    source = await fetchTrainingMarkdown(slug)
  } else if (process.env.TRAININGS_LOCAL_PATH) {
    const filePath = path.join(process.env.TRAININGS_LOCAL_PATH, slug, 'index.md')
    source = await readFile(filePath, 'utf-8')
  } else {
    const filePath = path.join(process.cwd(), 'content', `${slug}.md`)
    source = await readFile(filePath, 'utf-8')
  }

  if (source === null) return null

  const { content, frontmatter } = await compileMdxSource(source)
  return { slug, content, frontmatter: frontmatter || null }
}

export async function listTrainings() {
  if (isNeoEnabled()) {
    const files = await readdir(NEO_CONTENT_DIR)
    const mdFiles = files.filter((f) => f.endsWith('.md') && f.toLowerCase() !== 'readme.md')

    return Promise.all(
      mdFiles.map(async (file) => {
        const slug = file.replace(/\.md$/, '')
        const source = await readFile(path.join(NEO_CONTENT_DIR, file), 'utf-8')
        return { slug, frontmatter: parseFrontmatterFromSource(source) }
      })
    )
  }

  if (process.env.TRAINING_REPO_URL) {
    const slugs = await listTrainingDirectories()
    const trainings = await Promise.all(
      slugs.map(async (slug) => {
        const source = await fetchTrainingMarkdown(slug)
        if (!source) return null
        return { slug, frontmatter: parseFrontmatterFromSource(source) }
      })
    )
    return trainings.filter((t): t is { slug: string; frontmatter: TrainingFrontmatter } => t !== null)
  }

  if (process.env.TRAININGS_LOCAL_PATH) {
    const baseDir = process.env.TRAININGS_LOCAL_PATH
    const entries = await readdir(baseDir, { withFileTypes: true })
    const dirs = entries.filter((e) => e.isDirectory())

    const trainings = await Promise.all(
      dirs.map(async (dir) => {
        const indexPath = path.join(baseDir, dir.name, 'index.md')
        try {
          const source = await readFile(indexPath, 'utf-8')
          return { slug: dir.name, frontmatter: parseFrontmatterFromSource(source) }
        } catch {
          return null
        }
      })
    )
    return trainings.filter((t): t is { slug: string; frontmatter: TrainingFrontmatter } => t !== null)
  }

  const contentDir = path.join(process.cwd(), 'content')
  const files = await readdir(contentDir)
  const mdFiles = files.filter((f) => f.endsWith('.md'))

  return Promise.all(
    mdFiles.map(async (file) => {
      const slug = file.replace(/\.md$/, '')
      const source = await readFile(path.join(contentDir, file), 'utf-8')
      return { slug, frontmatter: parseFrontmatterFromSource(source) }
    })
  )
}

// ─── Paginated training functions ─────────────────────────────────────────────

export interface TrainingPageResult {
  slug: string
  content: React.ReactElement
  frontmatter: TrainingFrontmatter | null
  pageIndex: number
  totalPages: number
  pageHeading: string
  pageHeadings: TrainingPageHeading[]
  sidebarGroups: SidebarGroup[]
  requiredIds: string[]
}

export async function getTrainingPage(
  slug: string,
  pageIndex: number
): Promise<TrainingPageResult | null> {
  let rawSource: string | null = null

  if (isNeoEnabled()) {
    const filePath = path.join(NEO_CONTENT_DIR, `${slug}.md`)
    rawSource = await readFile(filePath, 'utf-8')
  } else if (process.env.TRAINING_REPO_URL) {
    rawSource = await fetchTrainingMarkdown(slug)
  } else if (process.env.TRAININGS_LOCAL_PATH) {
    const filePath = path.join(process.env.TRAININGS_LOCAL_PATH, slug, 'index.md')
    rawSource = await readFile(filePath, 'utf-8')
  } else {
    const filePath = path.join(process.cwd(), 'content', `${slug}.md`)
    rawSource = await readFile(filePath, 'utf-8')
  }

  if (rawSource === null) return null

  const pages = splitIntoPages(rawSource)
  if (pageIndex >= pages.length || pageIndex < 0) return null

  const page = pages[pageIndex]!
  const { content, frontmatter } = await compileMdxSource(page.source)

  const pageHeadings = getPageHeadings(pages)

  return {
    slug,
    content,
    frontmatter: frontmatter || null,
    pageIndex,
    totalPages: pages.length,
    pageHeading: page.heading,
    pageHeadings,
    sidebarGroups: getSidebarGroups(pageHeadings),
    requiredIds: page.requiredIds,
  }
}

// ─── Legacy codelab functions (kept for backward compat) ─────────────────────

export async function getCodelab(slug: string) {
  const filePath = path.join(process.cwd(), 'content', `${slug}.md`)
  const source = await readFile(filePath, 'utf-8')
  const { content, frontmatter } = await compileMdxSource(source)
  return { slug, content, frontmatter: frontmatter || null }
}

export async function listCodelabs() {
  const contentDir = path.join(process.cwd(), 'content')
  const files = await readdir(contentDir)
  const mdFiles = files.filter((f) => f.endsWith('.md'))

  return Promise.all(
    mdFiles.map(async (file) => {
      const slug = file.replace(/\.md$/, '')
      const source = await readFile(path.join(contentDir, file), 'utf-8')
      return { slug, frontmatter: parseFrontmatterFromSource(source) }
    })
  )
}
