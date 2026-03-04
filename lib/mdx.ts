import { compileMDX } from 'next-mdx-remote/rsc'
import { readFile, readdir } from 'fs/promises'
import path from 'path'
import remarkGfm from 'remark-gfm'
import { mdxComponents } from '@/components/mdx/mdx-components'
import { listTrainingDirectories, fetchTrainingMarkdown } from '@/lib/github'

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
        remarkPlugins: [remarkGfm],
      },
    },
  })
}

function parseFrontmatterFromSource(source: string): TrainingFrontmatter {
  const frontmatter: TrainingFrontmatter = {}
  const frontmatterMatch = source.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch) return frontmatter

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
  return frontmatter
}

// ─── Training functions (GitHub → local dir structure → legacy flat files) ────

export async function getTraining(slug: string) {
  let source: string | null = null

  if (process.env.TRAINING_REPO_URL) {
    // Mode 1: GitHub API
    source = await fetchTrainingMarkdown(slug)
  } else if (process.env.TRAININGS_LOCAL_PATH) {
    // Mode 2: Local directory with slug/index.md structure
    const filePath = path.join(process.env.TRAININGS_LOCAL_PATH, slug, 'index.md')
    source = await readFile(filePath, 'utf-8')
  } else {
    // Mode 3: Legacy flat .md files in content/
    const filePath = path.join(process.cwd(), 'content', `${slug}.md`)
    source = await readFile(filePath, 'utf-8')
  }

  if (source === null) return null

  const { content, frontmatter } = await compileMdxSource(source)
  return { slug, content, frontmatter: frontmatter || null }
}

export async function listTrainings() {
  if (process.env.TRAINING_REPO_URL) {
    // Mode 1: GitHub API
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
    // Mode 2: Local directory with slug/index.md structure
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

  // Mode 3: Legacy flat .md files in content/
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
