import { compileMDX } from 'next-mdx-remote/rsc'
import { readFile } from 'fs/promises'
import path from 'path'
import remarkGfm from 'remark-gfm'
import { mdxComponents } from '@/components/mdx/mdx-components'

interface CodelabFrontmatter {
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
