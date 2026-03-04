// Parse "https://github.com/org/repo" → { owner: "org", repo: "repo" }
function parseRepoUrl(url: string): { owner: string; repo: string } {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/)
  if (!match) {
    throw new Error(`Invalid GitHub repo URL: ${url}`)
  }
  return { owner: match[1]!, repo: match[2]! }
}

// Authenticated fetch wrapper
async function githubFetch(path: string): Promise<unknown> {
  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`https://api.github.com${path}`, {
    headers,
    next: { revalidate: 300 },
  })

  const remaining = res.headers.get('x-ratelimit-remaining')
  if (remaining && parseInt(remaining, 10) < 10) {
    console.warn(`GitHub API rate limit low: ${remaining} requests remaining`)
  }

  if (res.status === 401) {
    throw new Error('Invalid GITHUB_TOKEN — authentication failed')
  }

  if (res.status === 404) {
    return null
  }

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

interface GitHubContentItem {
  name: string
  type: 'file' | 'dir'
  path: string
}

interface GitHubFileContent {
  type: 'file'
  content: string
  encoding: string
}

// List all top-level directories that contain an index.md
export async function listTrainingDirectories(): Promise<string[]> {
  const repoUrl = process.env.TRAINING_REPO_URL!
  const { owner, repo } = parseRepoUrl(repoUrl)

  const contents = await githubFetch(`/repos/${owner}/${repo}/contents/`)
  if (!Array.isArray(contents)) return []

  const dirs = (contents as GitHubContentItem[]).filter((item) => item.type === 'dir')

  // Check which dirs have an index.md
  const results = await Promise.all(
    dirs.map(async (dir) => {
      const file = await githubFetch(`/repos/${owner}/${repo}/contents/${dir.name}/index.md`)
      return file !== null ? dir.name : null
    })
  )

  return results.filter((slug): slug is string => slug !== null)
}

// Fetch raw markdown for a given slug's index.md
export async function fetchTrainingMarkdown(slug: string): Promise<string | null> {
  const repoUrl = process.env.TRAINING_REPO_URL!
  const { owner, repo } = parseRepoUrl(repoUrl)

  const file = await githubFetch(`/repos/${owner}/${repo}/contents/${slug}/index.md`)
  if (file === null) return null

  const { content, encoding } = file as GitHubFileContent
  if (encoding === 'base64') {
    return Buffer.from(content.replace(/\n/g, ''), 'base64').toString('utf-8')
  }
  return content
}
