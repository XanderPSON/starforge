import { compileMDX } from 'next-mdx-remote/rsc'
import { readFile, readdir } from 'fs/promises'
import path from 'path'
import remarkGfm from 'remark-gfm'
import { mdxComponents } from '@/components/mdx/mdx-components'

export interface CodelabFrontmatter {
  title?: string
  description?: string
  duration?: number
  author?: string
  tags?: string[]
}

export async function getCodelab(slug: string) {
  const filePath = path.join(process.cwd(), 'content', `${slug}.md`)

  const source = await readFile(filePath, 'utf-8')

  const { content, frontmatter } = await compileMDX<CodelabFrontmatter>({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  })

  return {
    slug,
    content,
    frontmatter: frontmatter || null,
  }
}

export async function listCodelabs() {
  const contentDir = path.join(process.cwd(), 'content')
  const files = await readdir(contentDir)
  const mdFiles = files.filter((f) => f.endsWith('.md'))

  const codelabs = await Promise.all(
    mdFiles.map(async (file) => {
      const slug = file.replace(/\.md$/, '')
      const source = await readFile(path.join(contentDir, file), 'utf-8')

      const frontmatterMatch = source.match(/^---\n([\s\S]*?)\n---/)
      if (!frontmatterMatch) return { slug, frontmatter: {} as CodelabFrontmatter }

      const raw = frontmatterMatch[1]
      const frontmatter: CodelabFrontmatter = {}
      for (const line of raw.split('\n')) {
        const [key, ...rest] = line.split(':')
        const value = rest.join(':').trim()
        if (key.trim() === 'title') frontmatter.title = value
        if (key.trim() === 'description') frontmatter.description = value
        if (key.trim() === 'duration') frontmatter.duration = parseInt(value, 10)
        if (key.trim() === 'author') frontmatter.author = value
        if (key.trim() === 'tags') {
          const tagMatch = value.match(/\[(.*)\]/)
          frontmatter.tags = tagMatch ? tagMatch[1].split(',').map((t) => t.trim()) : []
        }
      }

      return { slug, frontmatter }
    })
  )

  return codelabs
}
