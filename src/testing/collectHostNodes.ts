import type { JsonElement } from 'test-renderer'

/** Every rendered host node of the given type (e.g. 'Text', 'RNSVGPath'), depth-first. */
export function collectHostNodes(tree: JsonElement | null, type: string): JsonElement[] {
  if (tree === null) return []

  const children = tree.children.filter((child): child is JsonElement => typeof child !== 'string')
  return [...(tree.type === type ? [tree] : []), ...children.flatMap((child) => collectHostNodes(child, type))]
}
