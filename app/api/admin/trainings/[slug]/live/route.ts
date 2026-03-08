import { readFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getLiveBirdEyeData } from '@/lib/admin-queries'
import { isAdmin, requireAdmin } from '@/lib/roles'
import { splitIntoPages, getPageHeadings } from '@/lib/training-pages'

async function getAuthorizedSession() {
  const session = await auth()

  if (!session?.user) {
    return { session: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  if (!isAdmin(session)) {
    return { session: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  requireAdmin(session)
  return { session, response: null }
}

async function getTrainingPages(slug: string) {
  try {
    let source: string

    if (process.env.TRAININGS_LOCAL_PATH) {
      source = await readFile(path.join(process.env.TRAININGS_LOCAL_PATH, slug, 'index.md'), 'utf-8')
    } else {
      source = await readFile(path.join(process.cwd(), 'content', `${slug}.md`), 'utf-8')
    }

    return splitIntoPages(source)
  } catch {
    return []
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { response } = await getAuthorizedSession()
  if (response) return response

  const { slug } = await params
  const [students, pages] = await Promise.all([
    getLiveBirdEyeData(slug),
    getTrainingPages(slug),
  ])

  const sections = getPageHeadings(pages)
  const pageByComponentId = new Map<string, number>()

  for (const page of pages) {
    for (const requiredId of page.requiredIds) {
      pageByComponentId.set(requiredId, page.pageIndex)
    }
  }

  const studentsWithResponsePages = students.map((student) => {
    const mappedPages = new Set<number>()

    for (const componentId of student.responseComponentIds) {
      const pageIndex = pageByComponentId.get(componentId)
      if (typeof pageIndex === 'number') {
        mappedPages.add(pageIndex)
      }
    }

    const responsePages = mappedPages.size > 0
      ? Array.from(mappedPages).sort((a, b) => a - b)
      : student.responsePages

    return {
      userId: student.userId,
      name: student.name,
      email: student.email,
      lastPageIndex: student.lastPageIndex,
      visitedPages: student.visitedPages,
      responsePages,
      firstInteraction: student.firstInteraction,
      lastInteraction: student.lastInteraction,
      isActive: student.isActive,
    }
  })

  return NextResponse.json({
    slug,
    sections,
    students: studentsWithResponsePages,
    refreshedAt: new Date().toISOString(),
  })
}
