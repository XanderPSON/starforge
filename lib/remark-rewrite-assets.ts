import { visit } from 'unist-util-visit'
import type { Root, Image } from 'mdast'

export function remarkRewriteAssets() {
  return (tree: Root) => {
    visit(tree, 'image', (node: Image) => {
      if (node.url.startsWith('./assets/')) {
        node.url = node.url.replace('./assets/', '/images/training-assets/')
      }
    })
  }
}
