import { Schema as BaseSchema } from 'prosemirror-model'

import { nodes, NodeName } from './nodes'
import { marks, MarkName } from './marks'

export { Attrs } from './nodes'

const schema = new BaseSchema<NodeName, MarkName>({ nodes, marks })
export default schema

export type Schema = typeof schema
