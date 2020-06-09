import { NodeSpec } from 'prosemirror-model'
import * as block from './block'
import { getAttribsType } from '../../interfaces/schemaHelp'

export const paragraph: NodeSpec = {
  content: 'inline*',
  group: 'block',
  attrs: block.attrs,
  marks:
    'link code em s strong u font_size font_color font_family background_color',
  parseDOM: [
    {
      tag: 'p',
      getAttrs: block.getAttrs as getAttribsType
    }
  ],
  toDOM(node) {
    return ['p', { ...block.style(node) }, 0]
  }
}
