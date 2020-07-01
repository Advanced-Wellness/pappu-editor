import { Socket } from 'socket.io-client'
import { doc } from 'prosemirror/schema/nodes/node-doc'

export { default as TimelineEditor, EditorProps } from './TimelineEditor'
export { default as PTimelineEditor } from './TimelineEditor/Preview'
export * from './prosemirror'
export { getAssetInfo } from './utils'
