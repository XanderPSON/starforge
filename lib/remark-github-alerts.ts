import { visit } from 'unist-util-visit'
import type { Root, Blockquote, Paragraph, Text } from 'mdast'

const ALERT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/

export function remarkGithubAlerts() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node: Blockquote) => {
      const first = node.children[0]
      if (!first || first.type !== 'paragraph') return

      const textNode = first.children[0] as Text | undefined
      if (!textNode || textNode.type !== 'text') return

      const match = textNode.value.match(ALERT_RE)
      if (!match) return

      const alertType = match[1]!.toLowerCase()

      textNode.value = textNode.value.replace(ALERT_RE, '')

      if (textNode.value === '') {
        first.children.shift()
      }

      if (first.children.length === 0) {
        node.children.shift()
      }

      const data = node.data || (node.data = {})
      const hProperties = (data.hProperties || {}) as Record<string, string>
      hProperties['data-alert-type'] = alertType
      data.hProperties = hProperties
    })
  }
}
