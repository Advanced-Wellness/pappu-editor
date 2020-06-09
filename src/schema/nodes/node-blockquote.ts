import { NodeSpec } from 'prosemirror-model'
import * as block from './block'
import { getAttribsType } from '../../interfaces/schemaHelp'

export const blockquote: NodeSpec = {
  content: 'block+',
  group: 'block',
  attrs: block.attrs,
  defining: true,
  parseDOM: [{ tag: 'blockquote', getAttrs: block.getAttrs as getAttribsType }],
  toDOM(node) {
    return ['blockquote', { ...block.style(node) }, 0]
  }
}
