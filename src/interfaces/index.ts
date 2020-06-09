import { Plugin as BasePlugin, EditorState as BaseEditorState, Transaction as BaseTransaction } from 'prosemirror-state'

export interface ITimelineEditorProps {}

export interface ProseMirrorInstance {
  view: EditorView
  initialState: EditorState
  subscribe: (callback: () => any) => () => any
  applyCommand: ApplyCommand
}

export type EditorView = BaseEditorView<Schema>
export type EditorState = BaseEditorState<Schema>
export type Transaction = BaseTransaction<Schema>
export type Dispatch = (tr: Transaction) => void

export type getAttribsType = (p: string | Node) => false | { [key: string]: any } | null | undefined
