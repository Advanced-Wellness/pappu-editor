import { NodeSpec } from 'prosemirror-model'
import OrderedMap from 'orderedmap'

import { blockquote } from './node-blockquote'
import { code_block } from './node-code_block'
import { doc } from './node-doc'
import { hard_break } from './node-hard_break'
import { heading } from './node-heading'
import { horizontal_rule } from './node-horizontal_rule'
import { iframe } from './node-iframe'
import { image } from './node-image'
import { paragraph } from './node-paragraph'
import { text } from './node-text'

export { Attrs } from './base'

export type NodeName =
  | 'doc'
  | 'paragraph'
  | 'blockquote'
  | 'code_block'
  | 'hard_break'
  | 'heading'
  | 'horizontal_rule'
  | 'iframe'
  | 'image'
  | 'text'

export const nodes = OrderedMap.from<NodeSpec>({
  doc
})
  // paragraph must be first block node
  .append({
    paragraph
  })
  .append({
    blockquote,
    code_block,
    hard_break,
    heading,
    horizontal_rule,
    iframe,
    image,
    text
  })
