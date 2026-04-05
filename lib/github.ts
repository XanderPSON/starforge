// Parse "https://github.com/org/repo" or "https://ghe.example.com/org/repo"
// → { host: "github.com", owner: "org", repo: "repo" }
function parseRepoUrl(url: string): { host: string; owner: string; repo: string } {
  const match = url.match(/https?:\/\/([^/]+)\/([^/]+)\/([^/]+?)(?:\.git)?$/)
  if (!match) {
    throw new Error(`Invalid GitHub repo URL: ${url}`)
  }
  return { host: match[1]!, owner: match[2]!, repo: match[3]! }
}

// GitHub.com uses api.github.com; GHE instances use {host}/api/v3
function getApiBaseUrl(host: string): string {
  if (host === 'github.com') {
    return 'https://api.github.com'
  }
  return `https://${host}/api/v3`
}

async function githubFetch(path: string, host: string): Promise<unknown> {
  const token = process.env.GITHUB_TOKEN
  const baseUrl = getApiBaseUrl(host)
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${baseUrl}${path}`, {
    headers,
    next: { revalidate: 300 },
  })

  const remaining = res.headers.get('x-ratelimit-remaining')
  if (remaining && parseInt(remaining, 10) < 10) {
    console.warn(`GitHub API rate limit low: ${remaining} requests remaining`)
  }

  if (res.status === 401) {
    if (token) {
      throw new Error('Invalid GITHUB_TOKEN — authentication failed')
    } else {
      throw new Error('GitHub returned 401 — set GITHUB_TOKEN to access this repository')
    }
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

export async function listTrainingDirectories(): Promise<string[]> {
  const repoUrl = process.env.TRAINING_REPO_URL!
  const { host, owner, repo } = parseRepoUrl(repoUrl)

  const contents = await githubFetch(`/repos/${owner}/${repo}/contents/`, host)
  if (!Array.isArray(contents)) return []

  const items = contents as GitHubContentItem[]
  const dirs = items.filter((item) => item.type === 'dir')

  const dirResults = await Promise.all(
    dirs.map(async (dir) => {
      const file = await githubFetch(`/repos/${owner}/${repo}/contents/${dir.name}/index.md`, host)
      return file !== null ? dir.name : null
    })
  )

  const validDirs = dirResults.filter((slug): slug is string => slug !== null)
  if (validDirs.length > 0) return validDirs

  // Flat-file fallback: treat top-level .md files (excluding README) as trainings
  return items
    .filter((item) => item.type === 'file' && item.name.endsWith('.md') && item.name.toLowerCase() !== 'readme.md')
    .map((item) => item.name.replace(/\.md$/, ''))
}

export async function fetchTrainingMarkdown(slug: string): Promise<string | null> {
  const repoUrl = process.env.TRAINING_REPO_URL!
  const { host, owner, repo } = parseRepoUrl(repoUrl)

  // Try slug/index.md first (directory layout), then slug.md (flat layout)
  let file = await githubFetch(`/repos/${owner}/${repo}/contents/${slug}/index.md`, host)
  if (file === null) {
    file = await githubFetch(`/repos/${owner}/${repo}/contents/${slug}.md`, host)
  }
  if (file === null) return null

  const { content, encoding } = file as GitHubFileContent
  if (encoding === 'base64') {
    return Buffer.from(content.replace(/\n/g, ''), 'base64').toString('utf-8')
  }
  return content
}
