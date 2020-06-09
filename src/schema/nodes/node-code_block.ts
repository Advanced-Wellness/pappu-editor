import { NodeSpec } from 'prosemirror-model'
import * as block from './block'
import { getAttribsType } from '../../interfaces/schemaHelp'

export const code_block: NodeSpec = {
  content: 'text*',
  marks: '',
  group: 'block',
  attrs: block.attrs,
  code: true,
  defining: true,
  parseDOM: [
    {
      tag: 'pre',
      preserveWhitespace: 'full',
      getAttrs: block.getAttrs as getAttribsType
    }
  ],
  toDOM(node) {
    return ['pre', { ...block.style(node) }, ['code', 0]]
  }
}
